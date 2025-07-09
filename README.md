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

## 🤝 Contribution

Merci de vouloir contribuer à ce projet ! Voici comment participer efficacement :

1. 🔀 **Fork** le dépôt pour créer ta propre copie.
2. 🌿 **Crée une branche** dédiée à ta modification :

   ```bash
   git checkout -b nom-de-ta-fonctionnalite  
   ```
3. 🛠️ **Fais tes changements** (code, design, doc, etc.).
4. ✅ **Commit et push** ta branche vers ton fork :

   ```bash
   git commit -m "Ajout de [ta fonctionnalité]"  
   git push origin nom-de-ta-fonctionnalite  
   ```
5. 📩 **Ouvre une Pull Request** vers ce dépôt principal.
6. 🧾 N'oublie pas d’associer ta contribution à une **issue existante** si possible, ou d’en créer une.

**💡 Bonus :**

* Pense à faire un `git pull` régulièrement pour rester à jour.
* Mets une ⭐ sur le projet si tu veux soutenir son évolution !
* Vérifie dans les **issues** si un rôle ou une tâche t’est attribué.

---
