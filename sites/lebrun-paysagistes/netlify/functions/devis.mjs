// Reçoit le formulaire de devis du site et l'envoie par e-mail (HTML) via Resend.
//
// Variables d'environnement à définir dans Netlify (portée « Functions ») :
//   RESEND_API_KEY   clé d'API Resend (secrète)
//   DEVIS_TO_EMAIL   adresse(s) qui reçoivent les demandes, séparées par des virgules
//   DEVIS_FROM       (facultatif) expéditeur, ex. « Lebrun Paysagistes <devis@lebrun-paysagistes.fr> »

const SERVICES = ["Élagage", "Abattage", "Dessouchage", "Taille de haies", "Tonte", "Feuilles", "Plantation", "Autre"];
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const DEFAULT_FROM = "Site Lebrun Paysagistes <onboarding@resend.dev>";

const env = (name) => (typeof Netlify !== "undefined" ? Netlify.env.get(name) : process.env[name]);

const fail = (status, error, message) => Response.json({ ok: false, error, message }, { status });

const line = (value, max) =>
  String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const block = (value, max) =>
  String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);

const esc = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// 06 12 34 56 78 / +33 6 12 34 56 78 / 0033612345678 → affichage et lien tel:
function formatPhone(raw) {
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("0033")) digits = "+33" + digits.slice(4);
  if (digits.startsWith("+33")) digits = "0" + digits.slice(3).replace(/^0/, "");
  const national = digits.replace(/\D/g, "");
  if (/^0\d{9}$/.test(national)) {
    return { display: national.replace(/(\d{2})(?=\d)/g, "$1 "), href: "+33" + national.slice(1) };
  }
  return { display: raw, href: digits };
}

const EMAIL_RE = /^[^\s@<>"',;:()\[\]\\]+@[^\s@<>"',;:()\[\]\\]+\.[^\s@<>"',;:()\[\]\\]{2,}$/;

function readForm(form) {
  const data = {
    name: line(form.get("nom"), 100),
    phone: line(form.get("telephone"), 30),
    email: line(form.get("email"), 254),
    commune: line(form.get("commune"), 100),
    message: block(form.get("message"), 3000),
    services: form.getAll("prestation").map((v) => line(v, 40)).filter((v) => SERVICES.includes(v)),
    consent: form.get("consentement") === "on",
    photos: form.getAll("photos").filter((f) => typeof f === "object" && f && "size" in f && f.size > 0),
  };
  return data;
}

function validate(d) {
  if (d.name.length < 2) return ["nom", "Indiquez votre nom."];
  if (d.phone.replace(/\D/g, "").length < 10) return ["telephone", "Le numéro de téléphone semble incomplet."];
  if (d.email && !EMAIL_RE.test(d.email)) return ["email", "L’adresse e-mail semble incorrecte."];
  if (d.commune.length < 2) return ["commune", "Indiquez votre commune."];
  if (d.message.length < 5) return ["message", "Décrivez brièvement votre besoin."];
  if (!d.consent) return ["consentement", "Le consentement est nécessaire pour vous répondre."];
  if (d.photos.length > MAX_PHOTOS) return ["photos", `${MAX_PHOTOS} photos au maximum.`];
  let total = 0;
  for (const photo of d.photos) {
    if (!PHOTO_TYPES.has(photo.type)) return ["photos", "Seules les photos JPEG, PNG ou WebP sont acceptées."];
    if (photo.size > MAX_PHOTO_BYTES) return ["photos", "Une photo dépasse 2 Mo."];
    total += photo.size;
  }
  if (total > MAX_TOTAL_BYTES) return ["photos", "Les photos sont trop lourdes (4 Mo au total)."];
  return null;
}

const SERVICE_PLURAL = (n) => (n > 1 ? "s" : "");

function renderText(d, when, phone) {
  return [
    `NOUVELLE DEMANDE DE DEVIS — ${d.name}`,
    `Reçue le ${when}`,
    "",
    `Téléphone : ${phone.display}`,
    `Commune   : ${d.commune}`,
    d.email ? `E-mail    : ${d.email}` : null,
    d.services.length ? `Besoin    : ${d.services.join(", ")}` : null,
    "",
    "Message :",
    d.message,
    d.photos.length ? `\n${d.photos.length} photo${SERVICE_PLURAL(d.photos.length)} jointe${SERVICE_PLURAL(d.photos.length)}.` : null,
    "",
    d.email ? "Répondre à cet e-mail écrit directement au client." : "Pas d’e-mail renseigné : rappelez le client par téléphone.",
  ]
    .filter((l) => l !== null)
    .join("\n");
}

const FONT = "'Helvetica Neue',Helvetica,Arial,sans-serif";

function row(label, valueHtml) {
  return `<tr>
    <td style="padding:0 0 22px 0;">
      <div style="font:700 11px/1 ${FONT};letter-spacing:1.4px;text-transform:uppercase;color:#6c8b4f;padding-bottom:7px;">${label}</div>
      ${valueHtml}
    </td>
  </tr>`;
}

function button(href, label, filled) {
  const style = filled
    ? "background:#b8732a;color:#ffffff;border:2px solid #b8732a;"
    : "background:#ffffff;color:#1e3a2a;border:2px solid #1e3a2a;";
  return `<a href="${esc(href)}" style="display:inline-block;margin:0 10px 10px 0;padding:14px 26px;border-radius:999px;font:700 15px/1 ${FONT};text-decoration:none;${style}">${label}</a>`;
}

function renderHtml(d, when, phone, origin) {
  const chips = d.services
    .map(
      (s) =>
        `<span style="display:inline-block;margin:0 6px 6px 0;padding:8px 15px;border-radius:999px;background:#e7efdc;color:#1e3a2a;font:600 14px/1 ${FONT};">${esc(s)}</span>`
    )
    .join("");
  const message = esc(d.message).replace(/\n/g, "<br>");
  const photos = d.photos.length
    ? `<tr><td style="padding:0 0 22px 0;">
        <div style="padding:14px 18px;border-radius:12px;background:#f6f2ea;font:600 14px/1.4 ${FONT};color:#1e3a2a;">
          📎&nbsp; ${d.photos.length} photo${SERVICE_PLURAL(d.photos.length)} jointe${SERVICE_PLURAL(d.photos.length)} à cet e-mail
        </div>
      </td></tr>`
    : "";
  const preheader = `${d.name} · ${d.commune} · ${phone.display}`;
  const buttons =
    button("tel:" + phone.href, `Appeler le ${esc(phone.display)}`, true) +
    (d.email ? button("mailto:" + d.email, "Répondre par e-mail", false) : "");

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Nouvelle demande de devis</title>
</head>
<body style="margin:0;padding:0;background:#f6f2ea;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f6f2ea;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f6f2ea;">
<tr><td align="center" style="padding:28px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">

    <tr><td style="background:#1e3a2a;border-radius:20px 20px 0 0;padding:30px 34px 34px 34px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="padding-right:12px;"><img src="${esc(origin)}/img/logo-email.png" width="40" height="39" alt="" style="display:block;border:0;"></td>
        <td style="font:800 18px/1 ${FONT};letter-spacing:1.5px;color:#f6f2ea;">LEBRUN<br><span style="font:600 10px/1 ${FONT};letter-spacing:1.8px;color:#b9c7a5;">PAYSAGISTES · DEPUIS 1975</span></td>
      </tr></table>
      <div style="padding-top:34px;font:700 12px/1 ${FONT};letter-spacing:1.6px;text-transform:uppercase;color:#b9c7a5;">Nouvelle demande de devis</div>
      <div style="padding-top:12px;font:800 32px/1.1 ${FONT};letter-spacing:-0.8px;color:#ffffff;">${esc(d.name)}</div>
      <div style="padding-top:10px;font:400 15px/1.4 ${FONT};color:#d8e0cc;">souhaite être rappelé(e) · ${esc(d.commune)}</div>
    </td></tr>

    <tr><td style="background:#fffdf8;padding:34px 34px 14px 34px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${row("Téléphone", `<a href="tel:${esc(phone.href)}" style="font:800 28px/1.1 ${FONT};letter-spacing:-0.5px;color:#17231b;text-decoration:none;">${esc(phone.display)}</a>`)}
        ${row("Commune", `<div style="font:600 18px/1.3 ${FONT};color:#17231b;">${esc(d.commune)}</div>`)}
        ${d.email ? row("E-mail", `<a href="mailto:${esc(d.email)}" style="font:600 18px/1.3 ${FONT};color:#1e3a2a;">${esc(d.email)}</a>`) : ""}
        ${d.services.length ? row("Besoin", chips) : ""}
        ${row("Message", `<div style="padding:18px 20px;border-left:4px solid #b8732a;border-radius:4px 12px 12px 4px;background:#f6f2ea;font:400 16px/1.6 ${FONT};color:#17231b;">${message}</div>`)}
        ${photos}
        <tr><td style="padding:4px 0 24px 0;">${buttons}</td></tr>
      </table>
    </td></tr>

    <tr><td style="background:#fffdf8;border-radius:0 0 20px 20px;padding:0 34px 30px 34px;">
      <div style="border-top:1px solid #e4ddcf;padding-top:18px;font:400 13px/1.55 ${FONT};color:#78857b;">
        Demande reçue le ${esc(when)}.<br>
        ${d.email ? "Vous pouvez répondre directement à cet e-mail : votre réponse ira au client." : "Aucune adresse e-mail renseignée : rappelez le client par téléphone."}
      </div>
    </td></tr>

    <tr><td align="center" style="padding:20px 10px 4px 10px;font:400 12px/1.5 ${FONT};color:#78857b;">
      Envoyé depuis le site de démonstration · ${esc(origin.replace(/^https?:\/\//, ""))}
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

export default async (req) => {
  let form;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "bad_request", "Demande illisible.");
  }

  // Champ piège invisible pour les humains : un robot le remplit. On répond « ok » sans rien envoyer.
  if (line(form.get("website"), 200)) return Response.json({ ok: true });

  const data = readForm(form);
  const problem = validate(data);
  if (problem) return fail(422, "invalid", problem[1]);

  const apiKey = env("RESEND_API_KEY");
  const to = (env("DEVIS_TO_EMAIL") || "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
  if (!apiKey || !to.length) {
    console.error("devis: RESEND_API_KEY ou DEVIS_TO_EMAIL non défini");
    return fail(503, "not_configured", "L’envoi des demandes n’est pas encore activé.");
  }

  const origin = new URL(req.url).origin;
  const phone = formatPhone(data.phone);
  const when = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", dateStyle: "full", timeStyle: "short" }).format(new Date());

  const attachments = [];
  for (const [i, photo] of data.photos.entries()) {
    const ext = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
    attachments.push({
      filename: `photo-${i + 1}.${ext}`,
      content: Buffer.from(await photo.arrayBuffer()).toString("base64"),
    });
  }

  const payload = {
    from: env("DEVIS_FROM") || DEFAULT_FROM,
    to,
    subject: line(`Nouvelle demande de devis — ${data.name} (${data.commune})`, 150),
    html: renderHtml(data, when, phone, origin),
    text: renderText(data, when, phone),
    ...(data.email ? { reply_to: data.email } : {}),
    ...(attachments.length ? { attachments } : {}),
  };

  let res;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("devis: Resend injoignable", err?.message);
    return fail(502, "send_failed", "L’envoi a échoué.");
  }

  if (!res.ok) {
    // On journalise le motif renvoyé par Resend, jamais les données du client.
    const detail = await res.text().catch(() => "");
    console.error("devis: Resend a refusé l’envoi", res.status, detail.slice(0, 300));
    return fail(502, "send_failed", "L’envoi a échoué.");
  }

  return Response.json({ ok: true });
};

export const config = {
  path: "/api/devis",
  method: "POST",
  rateLimit: { windowLimit: 6, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
