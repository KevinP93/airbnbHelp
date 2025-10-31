AirbnbHelp — Prototype SaaS d’accueil invités

Objectif
- Fournir une page d’accueil par logement accessible via QR code: Wi‑Fi, check‑in/out, règles, transports, recommandations locales, contacts d’urgence, emplacement des ustensiles.

Contenu du prototype
- `public/index.html`: page d’accueil (saisie du code logement)
- `public/property.html`: page invité alimentée par `data/<code>.json` avec design proche d’Airbnb (topbar, galerie, navigation collante par sections)
- `public/assets/styles.css`: thème moderne (palette proche Airbnb), cartes arrondies, galeries, pills
- `public/assets/app.js`: logique UI/chargement JSON/QR Wi‑Fi, rendu sections
- `public/assets/sticky.js`: activation des onglets de section au scroll
- `public/data/demo.json`: exemple de logement prêt à l’emploi

Lancer en local
1) Ouvrir un terminal dans `public/`.
2) Servir en local (au choix):
   - Python: `python -m http.server 8080`
   - PowerShell: `Start-Process http://localhost:8080` après avoir lancé le server ci‑dessus
3) Ouvrir `http://localhost:8080/index.html` et utiliser le code `demo`.
   - Ou avec Live Server (VS Code): clic droit sur `public/index.html` > Open with Live Server.

QR Code Wi‑Fi
- Généré côté client via un service d’image (api.qrserver.com) en encodant le format standard `WIFI:T:<type>;S:<ssid>;P:<password>;H:<hidden>;;`.
- Vous pourrez remplacer par une lib locale (QR SVG/Canvas) si vous préférez éviter l’appel externe.

Personnalisation / Multi‑logements
- Dupliquez `public/data/demo.json` en `public/data/<votre-code>.json`.
- Partagez aux invités l’URL: `https://votredomaine.tld/property.html?code=<votre-code>` et/ou imprimez un QR pointant vers cette URL.

Prochaine étape (roadmap rapide)
- Espace hôte (auth) pour éditer les fiches depuis le navigateur.
- Multi‑langue par logement (fr/en/es) avec bascule côté client.
- Analytics basiques (ou privacy‑first sans tracking, compteur anonyme).
- Mode offline (PWA) pour consulter sans réseau une fois chargée.

Sécurité / Données sensibles
- Évitez de publier un mot de passe Wi‑Fi réutilisé ailleurs.
- Si besoin, restreignez l’accès par code PIN simple côté client (à implémenter si requis).
