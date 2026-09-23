# ChatSecure AES256

Un chat en temps réel avec Flask, Socket.IO et chiffrement AES-256-GCM de bout en bout.
Interface responsive, pensée pour un usage privé et minimaliste.

### Comment fonctionne le chiffrement

Le chiffrement est entièrement côté client, via la Web Crypto API du navigateur :

1. Chaque participant saisit une phrase secrète de salon (en plus de son pseudo).
2. Cette phrase est transformée localement en clé AES-256 via PBKDF2 (100 000 itérations, SHA-256). Elle ne quitte jamais le navigateur.
3. Chaque message est chiffré en AES-256-GCM avant d'être envoyé au serveur (IV aléatoire par message).
4. Le serveur ne reçoit, ne stocke et ne relaie que du texte chiffré (ciphertext + IV). Il ne connaît jamais la phrase secrète et ne peut donc pas lire les messages.
5. À la réception, chaque client déchiffre localement avec sa propre clé dérivée. Si la phrase secrète est incorrecte, le message s'affiche comme illisible plutôt que d'être décodé faussement.

### Arborescence du projet

```bash
.
├── app.py                 # Serveur Flask + Socket.IO (relais de texte chiffré uniquement)
├── changelog.md            # Historique des mises à jour
├── requirements.txt        # Dépendances Python
├── static/                 # Fichiers statiques (JS, CSS, images)
│   ├── logo.svg
│   ├── main.js              # Chiffrement/déchiffrement AES-256-GCM (Web Crypto API)
│   └── style.css
└── templates/               # Fichiers HTML (template Flask)
    └── index.html
```

## Technologies
- Python 3 (Flask, Socket.IO)
- JavaScript (Web Crypto API)
- CSS responsive
- AES-256-GCM (chiffrement de bout en bout, côté client)

## Objectif
Une messagerie en temps réel où le serveur ne peut à aucun moment lire le contenu des messages échangés.

## Équipe
- Enzo (lead dev)
- Kaploxic (frontend)
- Virus23Dan (crypto/dev)
- Nous (testeurs)

## Lancer le projet

```bash
pip install -r requirements.txt
python3 app.py
```

Accède à l'app sur : [http://localhost:5000](http://localhost:5000)

Tous les participants d'un même salon doivent utiliser la même phrase secrète pour pouvoir se lire entre eux.

---

## À faire (TODO)

* [x] Base Flask + SocketIO
* [x] Interface responsive
* [x] Chiffrement AES-256-GCM de bout en bout (côté client, via Web Crypto API)
* [ ] Rooms privées multiples (actuellement un seul salon partagé)
* [ ] Support mobile amélioré
* [ ] Déploiement en ligne

---

## Contribution

Merci de vouloir contribuer à ce projet. Voici comment participer :

1. Fork le dépôt pour créer ta propre copie.
2. Crée une branche dédiée à ta modification :

   ```bash
   git checkout -b nom-de-ta-fonctionnalite
   ```
3. Fais tes changements (code, design, doc, etc.).
4. Commit et push ta branche vers ton fork :

   ```bash
   git commit -m "Ajout de [ta fonctionnalité]"
   git push origin nom-de-ta-fonctionnalite
   ```
5. Ouvre une Pull Request vers ce dépôt principal.
6. Associe ta contribution à une issue existante si possible, ou crée-en une.

Pense à faire un `git pull` régulièrement pour rester à jour, et vérifie dans les issues si un rôle ou une tâche t'est attribué.
