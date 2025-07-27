document.addEventListener('DOMContentLoaded', () => {
  const sectionPseudo = document.getElementById('pseudo-form');
  const sectionChat = document.getElementById('chat');

  const btnLogin = document.getElementById('btnLogin');
  const btnSend = document.getElementById('btnSend');

  const pseudoInput = document.getElementById('nickname');
  const messageInput = document.getElementById('messageInput');

  const messagesDiv = document.getElementById('messages');

  let myKeyPair = null; // La paire de clés locale (pour future utilisation)
  let myPublicKeyStr = '';
  let allPublicKeys = []; // Liste de toutes les clés publiques avec nicknames
  let sharedSecrets = {}; // Clés secrètes partagées (pour future utilisation)
  let nickname = '';

  const socket = io();

  // Fonction pour générer une paire de clés (gardée pour compatibilité future)
  function generateKeyPair() {
    return nacl.box.keyPair();
  }

  // Encodage / décodage Base64 (gardé pour compatibilité future)
  function encodeBase64(bytes) {
    return nacl.util.encodeBase64(bytes);
  }

  function decodeBase64(str) {
    return nacl.util.decodeBase64(str);
  }

  // Gestion de la connexion
  document.getElementById('btnLogin').onclick = () => {
    const pseudoVal = pseudoInput.value.trim();
    if (pseudoVal === '') {
      alert('Veuillez entrer un pseudo');
      return;
    }
    nickname = pseudoVal;

    sectionPseudo.style.display = 'none';
    sectionChat.style.display = 'block';

    // Générer la paire de clés (pour compatibilité future)
    myKeyPair = generateKeyPair();
    myPublicKeyStr = encodeBase64(myKeyPair.publicKey);

    // Envoyer la clé publique au serveur
    socket.emit('public_key', { publicKey: myPublicKeyStr, nickname: nickname });
    // Demander l'historique
    socket.emit('new_user');
  };

  // Recevoir la liste de toutes les clés publiques (gardé pour compatibilité future)
  socket.on('update_keys', (keys) => {
    allPublicKeys = keys;
    console.log('Clés publiques mises à jour:', keys.length, 'utilisateurs connectés');
  });

  // Charger l'historique complet des messages
  socket.on('load_message_history', (history) => {
    console.log('Chargement de l\'historique:', history.length, 'messages');
    messagesDiv.innerHTML = '';
    
    history.forEach((msg) => {
      const timestamp = msg.timestamp ? `[${msg.timestamp}] ` : '';
      
      if (msg.nickname === nickname) {
        // Message envoyé par soi-même
        messagesDiv.innerHTML += `<div><em>${timestamp}[Moi]</em>: ${msg.message}</div>`;
      } else {
        // Message d'un autre utilisateur
        messagesDiv.innerHTML += `<div><strong>${timestamp}[${msg.nickname}]</strong>: ${msg.message}</div>`;
      }
    });
    
    // Faire défiler vers le bas
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

  // Recevoir un nouveau message en temps réel
  socket.on('receive_message', (data) => {
    const timestamp = data.timestamp ? `[${data.timestamp}] ` : '';
    
    console.log('Nouveau message reçu de:', data.nickname);
    
    // Afficher le message reçu
    messagesDiv.innerHTML += `<div><strong>${timestamp}[${data.nickname}]</strong>: ${data.message}</div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

  // Envoyer un message
  document.getElementById('btnSend').onclick = () => {
    const message = messageInput.value.trim();
    if (message === '') {
      alert('Message vide');
      return;
    }

    console.log('Envoi du message:', message);

    // Afficher localement le message
    const now = new Date();
    const timestamp = now.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    messagesDiv.innerHTML += `<div><em>[${timestamp}] [Moi]</em>: ${message}</div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    // Envoyer le message en clair au serveur
    socket.emit('send_message', {
      message: message,
      nickname: nickname
    });

    messageInput.value = '';
  };

  // Permettre d'envoyer avec Enter
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('btnSend').click();
    }
  });
});
