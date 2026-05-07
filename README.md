# Koupat Hayechouot Rashbi — Site web

Site officiel de l'association caritative **Koupat Hayechouot Rashbi** (קופת הישועות).
*Nous prions afin qu'ils prient pour vous.*

## 📁 Pages

| URL | Fichier |
|---|---|
| `/` | `index.html` — landing page avec parallax, formulaire « Être rappelé(e) » |
| `/qui-sommes-nous.html` | Présentation de l'association |
| `/contact.html` | Coordonnées + formulaire de contact + carte |
| `/admin.html` | Tableau de bord interne (non référencé) |

## 🛠 Stack

- HTML statique
- [Tailwind CSS](https://tailwindcss.com/) (via CDN)
- JavaScript vanilla (pas de framework)
- Polices : Cormorant Garamond, Inter, Frank Ruhl Libre (Google Fonts)

Aucun build step. Le site s'ouvre directement dans n'importe quel navigateur ou hébergeur statique.

## 🚀 Développement local

```bash
python3 -m http.server 8080
```
Puis http://localhost:8080

## 🌐 Liens externes

- Plateforme de dons : <https://www.allodons.fr/koupat-hayeshouot-rashbi>
- Association : 2 rue Louis Lebrun, 95200 Sarcelles · 07 56 92 20 04

## 🔐 Espace admin

URL : `/admin.html` (non référencée). Mot de passe configurable dans la constante `ADMIN_PASSWORD` en haut du `<script>` du fichier.

> Mode actuel : leads stockés en `localStorage` du navigateur. Pour la production multi-appareils, brancher Formspree, Make.com, Firebase, ou un backend dédié.

## © Licence

Code propriétaire — Association Koupat Hayechouot Rashbi (loi 1901).
