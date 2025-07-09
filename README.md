# 🕶️ ChatSecure AES256

Un chat en temps réel avec Flask, Socket.IO et chiffrement AES-GCM.  
Interface responsive, sécurisé et pensé pour les hackers 💬🔐

### 📁 Arborescence du projet

```bash
.
├── app.py                 # Serveur Flask + Socket.IO
├── changelog.md           # Historique des mises à jour
├── requirements.txt       # Dépendances Python
├── static/                # Fichiers statiques (JS, CSS, images)
│   ├── logo.svg
│   ├── main.js
│   └── style.css
└── templates/             # Fichiers HTML (template Flask)
    └── index.html
```

> Total : **3 dossiers**, **7 fichiers**


## 🔧 Technologies
- Python 3 (Flask, Socket.IO)
- JavaScript (Web Crypto API)
- CSS Responsive
- AES-256-GCM

## 🚀 Objectif
Créer une appli de messagerie sécurisée avec chiffrement côté client et collaboration en équipe.

## 👨‍👩‍👧‍👦 Équipe
- Enzo (Lead dev 🧠)
- Kaploxic (frontend)
- Virus23Dan (crypto/dev)
- Nous (testeurs)

## 📦 Lancer le projet

```bash
pip install -r requirements.txt
python3 app.py
````

Accède à l’app sur : [http://localhost:5000](http://localhost:5000)

---

## 📌 À faire (TODO)

* [x] Base Flask + SocketIO
* [x] Interface responsive
* [ ] Chiffrement AES-GCM
* [ ] Ajout des rooms privées
* [ ] Support mobile amélioré
* [ ] Déploiement en ligne

---

# 🤝 Contribution

1. Fork le repo
2. Crée une branche : `git checkout -b nouvelle-fonctionnalite`
3. Fait tes modifs
4. Commit et push : `git push origin nouvelle-fonctionnalite`
5. Fait une Pull Request

Merci pour ta contribution 💚

