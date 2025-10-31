Schéma JSON par logement

Fichier: `public/data/<code>.json`

Champs requis
- `code` (string): identifiant du logement (utilisé dans l’URL)
- `name` (string): nom affiché
- `address` (string): adresse

Champs recommandés
- `updated_at` (ISO string)
- `checkin` (string) • `checkout` (string)
- `arrival_notes` (string)
- `wifi` (object): `{ ssid, password, type("WPA"|"WEP"|"nopass"), hidden(boolean) }`
- `house_map` (array): `[{ name, location }]`
- `rules` (array<string>)
- `transports` (array): `[{ name, type, distance(m), address }]`
- `emergency` (array): `[{ label, phone }]`
- `recommendations` (object):
  - `food` (array): `[{ name, rating(0-5), category, distance(m), address }]`
  - `activities` (array): même structure

Exemple minimal
{
  "code": "demo",
  "name": "Mon Logement",
  "address": "1 Rue Exemple"
}

