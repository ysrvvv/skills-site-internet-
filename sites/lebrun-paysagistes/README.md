# Démo — Lebrun Paysagistes (Saint-Germain-de-la-Grange, 78)

Maquette de site vitrine réalisée pour être proposée à **Lebrun Paysagistes**, entreprise d'élagage,
d'abattage et d'entretien de jardins qui **n'a aucun site internet** (fiche Google sans lien « Site Web »,
annuaires sans site).

Site statique (HTML/CSS/JS, sans dépendance ni build) : il suffit de publier ce dossier.

## Pages

| Page | Fichier |
| --- | --- |
| Accueil | `index.html` |
| Élagage & abattage | `elagage-abattage.html` |
| Entretien de jardin (formules, calendrier mois par mois) | `entretien-jardin.html` |
| Plantations & remise en état | `plantations.html` |
| L'entreprise (histoire 1975 → 2024, engagements, zone) | `entreprise.html` |
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
| Historique | Entreprise individuelle de Jean Lebrun immatriculée en 1990 (Plaisir), à Maurepas de 2002 à 2020, puis Saint-Germain-de-la-Grange ; apport du fonds à la SARL en 2024 | Societe.com |

## À valider avec le client avant la mise en ligne

- **Photos** : ce sont des photos libres de droits (CC0) d'illustration. Les remplacer par des photos de leurs chantiers est le meilleur argument de vente.
- **Avis clients** : le site affiche la note réelle (4,9/5, 41 avis) et renvoie vers Google. Avec l'accord du client, on peut y ajouter 3 ou 4 avis Google cités mot pour mot.
- **Prestations** : élagage, abattage et entretien sont confirmés par leurs fiches. *Démontage par sections, dessouchage, plantations, débroussaillage, bois laissé en bûches, évacuation des déchets verts, devis gratuit* sont des prestations courantes du métier, à confirmer.
- **Zone d'intervention** : communes voisines proposées par défaut, à ajuster.
- **Historique** : « 1975 » vient de leur fiche Google. Les dates 1990, 2002, 2020 et 2024 viennent du registre des entreprises.
- **E-mail** : aucune adresse trouvée en ligne. À demander pour brancher le formulaire.

## Mise en ligne officielle (après accord)

1. Supprimer la balise `<meta name="robots" content="noindex, nofollow">` de chaque page, l'en-tête `X-Robots-Tag` dans `netlify.toml` et remplacer `Disallow: /` par `Allow: /` dans `robots.txt`.
2. Retirer le bandeau « Maquette de démonstration » (`.demo-bar`) et la note du formulaire (`.demo-note`).
3. Formulaire : ajouter `name="devis" data-netlify="true"` sur la balise `<form>` de `contact.html` et retirer le `e.preventDefault()` de démo dans `js/main.js` (ou brancher un service d'envoi d'e-mail).
4. Brancher le nom de domaine (ex. `lebrun-paysagistes.fr`) et créer/compléter la fiche Google avec le lien du site.

## Arguments de vente

- Aucun site aujourd'hui : un prospect qui cherche « élagueur Plaisir » ou « élagage Yvelines » sur Google trouve des concurrents qui en ont un.
- 41 avis à 4,9/5 : une excellente réputation qui ne travaille pas encore pour eux en dehors de Google Maps.
- Tempête Austen (octobre 2026) : forte demande d'élagage et de mises en sécurité dans les Yvelines. La page élagage a un encart « Après un coup de vent ».
- Barre d'appel fixe sur mobile, formulaire avec envoi de photos, horaires « ouvert / fermé » en direct, données structurées pour le référencement local.
