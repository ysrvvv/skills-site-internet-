# Démo — Lebrun Paysagistes (Saint-Germain-de-la-Grange, 78)

Maquette de site vitrine réalisée pour être proposée à **Lebrun Paysagistes**, entreprise d'élagage,
d'abattage et d'entretien de jardins qui **n'a aucun site internet** (fiche Google sans lien « Site Web »,
annuaires sans site).

Site statique (HTML/CSS/JS, sans dépendance ni build) dans `public/`, plus une fonction Netlify pour le formulaire
de devis (`netlify/functions/devis.mjs`). Seul `public/` est publié : ce README et le code de la fonction restent privés.

```
sites/lebrun-paysagistes/
├── public/                  ← le site (pages, css, js, img)
├── netlify/functions/devis.mjs   ← envoi des demandes par e-mail
├── netlify.toml
└── README.md                ← notes internes, non publiées
```

## Pages (dans `public/`)

| Page | Fichier |
| --- | --- |
| Accueil | `index.html` |
| Élagage & abattage | `elagage-abattage.html` |
| Entretien de jardin (formules, calendrier mois par mois) | `entretien-jardin.html` |
| Aménagements (plantations, clôtures, remise en état) | `plantations.html` |
| Réalisations (6 vrais chantiers issus de leur Instagram) | `realisations.html` |
| L'entreprise (de père en fils, histoire 1975 → 2024, engagements, zone) | `entreprise.html` |
| Contact & devis (formulaire, horaires « ouvert/fermé » en direct) | `contact.html` |
| Mentions légales | `mentions-legales.html` |
| Page 404 | `404.html` |

## Informations réelles utilisées (sources publiques)

| Donnée | Valeur | Source |
| --- | --- | --- |
| Nom commercial | LEBRUN PAYSAGISTES – Élagage, abattage, entretien de jardin depuis 1975 | Fiche Google Maps |
| Note Google | 4,9/5 — 41 avis | Fiche Google Maps (octobre 2026) |
| Adresse | 13 rue du Haut Boutron, 78640 Saint-Germain-de-la-Grange | Google, Pages Jaunes, registre |
| Téléphones | 06 59 92 74 97 (Google) · 01 30 50 14 52 (Pages Jaunes) | Google Maps, Pages Jaunes |
| Horaires | Lundi–vendredi 8 h–17 h | Paysagisteo / Google |
| Société | SARL, SIREN 937 605 046, créée le 1er juin 2024, gérant Jean-Michel Lebrun, APE 81.30Z, TVA FR32937605046 | recherche-entreprises.api.gouv.fr, Paysagisteo |
| Instagram | @lebrun.paysagistes : bio « Lebrun Paysagistes 78 - De père en fils depuis 1975 », 34 publications, 193 abonnés | Widget public d'intégration Instagram |
| Logo | Arbre + « LEBRUN PAYSAGISTES — DEPUIS 1975 » | Photo de profil Instagram, vectorisée (`img/logo-arbre.svg`) |
| Photos de chantiers | Élagage en nacelle (résidence, ~100 arbres tous les 2 ans), évacuation du gros bois, haie de thuyas, tonte et contrat annuel, clôture à la place d'une haie, olivier avant sa taille en boule | 6 dernières publications Instagram |
| Historique | Entreprise individuelle de Jean Lebrun immatriculée en 1990 (Plaisir), à Maurepas de 2002 à 2020, puis Saint-Germain-de-la-Grange ; apport du fonds à la SARL en 2024 | Societe.com |

## Réception des demandes de devis par e-mail

Le formulaire (`public/contact.html`) envoie les demandes à `/api/devis` (fonction `devis.mjs`), qui envoie un e-mail HTML
aux couleurs de Lebrun via [Resend](https://resend.com) : nom, téléphone cliquable, commune, besoin, message, photos en
pièces jointes, boutons « Appeler » et « Répondre ». Si le client a donné son e-mail, il est en « répondre à ».
Photos réduites à 1600 px côté navigateur ; 3 photos maximum ; champ piège anti-robots ; 6 envois par minute et par IP.

**Configuration (une seule fois)** : dans Netlify, *Project configuration → Environment variables* (portée « Functions »),
puis redéployer :

| Variable | Valeur |
| --- | --- |
| `RESEND_API_KEY` | clé d'API créée sur resend.com (*API Keys*) — secrète |
| `DEVIS_TO_EMAIL` | adresse qui reçoit les demandes (plusieurs possibles, séparées par des virgules) |
| `DEVIS_FROM` | *facultatif* : expéditeur, par ex. `Lebrun Paysagistes <devis@lebrun-paysagistes.fr>` |

Sans domaine vérifié sur Resend, l'expéditeur est `onboarding@resend.dev` et **Resend n'accepte alors que l'adresse du
compte Resend comme destinataire** : pour la démo, `DEVIS_TO_EMAIL` doit être l'adresse d'inscription à Resend. Pour envoyer
à l'adresse de Lebrun, vérifier un domaine dans Resend (*Domains*) et renseigner `DEVIS_FROM`.

Tant que ces variables ne sont pas définies, le formulaire affiche « L'envoi des demandes n'est pas encore activé ».
Les erreurs d'envoi sont visibles dans Netlify → *Logs → Functions → devis*.

## À valider avec le client avant la mise en ligne

- **Photos et logo** : les 6 photos de chantiers (`img/chantier-*.jpg`) et le logo viennent de leur Instagram. Il reste 4 photos d'illustration libres de droits (`canopee-automne`, `feuilles-chene`, `feuilles-rateau`, `allee-jardin`) à remplacer par d'autres photos de chantiers. Seule une version 100 px du logo était accessible : il a été vectorisé, mais il faut demander le fichier original.
- **Avis clients** : le site affiche la note réelle (4,9/5, 41 avis) et renvoie vers Google. Avec l'accord du client, on peut y ajouter 3 ou 4 avis Google cités mot pour mot.
- **Prestations** : confirmées par leurs fiches et leur Instagram : élagage (dont en nacelle), abattage, évacuation du gros bois, taille de haies, tonte, contrats d'entretien annuels (particuliers et entreprises), clôture à la place d'une haie, taille d'olivier. À confirmer : *démontage par sections, dessouchage, plantations, débroussaillage, bois laissé en bûches, devis gratuit*.
- **Zone d'intervention** : communes voisines proposées par défaut, à ajuster.
- **Historique** : « 1975 » et « de père en fils » viennent de leur fiche Google et de leur bio Instagram. Les dates 1990, 2002, 2020 et 2024 viennent du registre des entreprises. Que Jean Lebrun soit le père et Jean-Michel le fils est une déduction (même nom, reprise du fonds, « de père en fils ») : à confirmer.
- **E-mail** : aucune adresse trouvée en ligne. À demander pour brancher le formulaire.

## Mise en ligne officielle (après accord)

1. Supprimer la balise `<meta name="robots" content="noindex, nofollow">` de chaque page, l'en-tête `X-Robots-Tag` dans `netlify.toml` et remplacer `Disallow: /` par `Allow: /` dans `public/robots.txt`.
2. Retirer le bandeau « Maquette de démonstration » (`.demo-bar`) et la note du formulaire (`.demo-note`).
3. Formulaire : faire pointer `DEVIS_TO_EMAIL` vers l'adresse de Lebrun (avec un domaine vérifié sur Resend, voir ci-dessus) et retirer la phrase « cette demande a été reçue par l'équipe qui réalise la maquette » du message de confirmation (`.demo-note` dans `public/contact.html`).
4. Brancher le nom de domaine (ex. `lebrun-paysagistes.fr`) et créer/compléter la fiche Google avec le lien du site.

## Arguments de vente

- Aucun site aujourd'hui : un prospect qui cherche « élagueur Plaisir » ou « élagage Yvelines » sur Google trouve des concurrents qui en ont un.
- 41 avis à 4,9/5 : une excellente réputation qui ne travaille pas encore pour eux en dehors de Google Maps.
- Ils publient déjà de belles photos de chantiers sur Instagram (34 publications) : le site les met en valeur et les rend trouvables sur Google.
- Tempête Austen (octobre 2026) : forte demande d'élagage et de mises en sécurité dans les Yvelines. La page élagage a un encart « Après un coup de vent ».
- Barre d'appel fixe sur mobile, formulaire avec envoi de photos, e-mail de devis soigné (téléphone cliquable, photos jointes), horaires « ouvert / fermé » en direct, données structurées pour le référencement local.
