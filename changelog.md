# Changelog

Toutes les modifications notables de ce projet sont documentées ici.

---

## [1.2.0] - 2026-09-23

### Ajoutées
- Chiffrement AES-256-GCM de bout en bout, entièrement côté client (Web Crypto API).
- Champ phrase secrète de salon : dérivation de la clé par PBKDF2 (100 000 itérations, SHA-256).

### Changements
- Le serveur ne stocke et ne relaie plus que du texte chiffré (ciphertext + IV), jamais le message en clair.
- Suppression de la dépendance NaCl côté client (non utilisée, remplacée par la Web Crypto API native).
- Suppression de la dépendance Python `cryptography` (chiffrement désormais géré côté navigateur, pas côté serveur).

---

## [1.1.0] - 2025-07-09

### Ajoutées
- Interface responsive adaptée aux écrans desktop, tablette et mobile.
- Structure HTML améliorée pour une meilleure séparation des blocs `login` et `chat`.
- Gestion dynamique de l'affichage : seule la zone de connexion est visible au lancement, la zone de chat s'affiche après connexion.
- Nouveau style CSS pour rendre le chat plus ergonomique sur tous types d’appareils.
- Conteneur `.input-group` pour aligner proprement le champ message et le bouton d'envoi avec adaptation en mobile (affichage en colonne).

### Changements
- Mise à jour du fichier `index.html` pour intégrer la nouvelle structure responsive.
- Mise à jour du fichier `style.css` avec règles CSS flexbox et media queries.

### Corrections
- Correction des marges et paddings pour un rendu visuel cohérent sur petits écrans.
