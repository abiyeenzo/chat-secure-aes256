document.addEventListener('DOMContentLoaded', () => {
  const sectionPseudo = document.getElementById('pseudo-form');
  const sectionChat = document.getElementById('chat');

  const btnLogin = document.getElementById('btnLogin');
  const btnSend = document.getElementById('btnSend');

  const pseudoInput = document.getElementById('nickname');
  const messageInput = document.getElementById('messageInput');

  const messagesDiv = document.getElementById('messages');

  let myKeyPair = null;
  let remotePublicKey = null;
  let sharedSecret = null;
  let nickname = '';

  const socket = io();

  // Fonction pour générer une paire de clés
  function generateKeyPair() {
    return nacl.box.keyPair();
  }

  // Encodage/décodage base64
  function encodeBase64(bytes) {
    return nacl.util.encodeBase64(bytes);
  }

  function decodeBase64(str) {
    return nacl.util.decodeBase64(str);
  }

  // Fonction pour dériver la clé secrète partagée
  function deriveSharedSecret() {
    if (myKeyPair && remotePublicKey) {
      sharedSecret = nacl.scalarMult(myKeyPair.secretKey, remotePublicKey);
      console.log('Clé partagée dérivée');
    }
  }

  // Fonction pour chiffrer un message
  function encryptMessage(message) {
    if (!sharedSecret) {
      alert('Clé partagée non encore dérivée');
      return null;
    }
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const messageBytes = nacl.util.decodeUTF8(message);
    const box = nacl.secretbox(messageBytes, nonce, sharedSecret);
    const combined = new Uint8Array(nonce.length + box.length);
    combined.set(nonce);
    combined.set(box, nonce.length);
    return nacl.util.encodeBase64(combined);
  }

  // Fonction pour déchiffrer un message
  function decryptMessage(encoded) {
    if (!sharedSecret) {
      alert('Clé partagée non encore dérivée');
      return null;
    }
    const combined = nacl.util.decodeBase64(encoded);
    const nonce = combined.slice(0, nacl.secretbox.nonceLength);
    const box = combined.slice(nacl.secretbox.nonceLength);
    const messageBytes = nacl.secretbox.open(box, nonce, sharedSecret);
    if (!messageBytes) {
      alert('Échec du déchiffrement');
      return null;
    }
    return nacl.util.encodeUTF8(messageBytes);
  }

  // Fonction pour initialiser les clés
  function initKeys() {
    myKeyPair = generateKeyPair();
    const pubBase64 = encodeBase64(myKeyPair.publicKey);
    socket.emit('public_key', { key: pubBase64 });
    console.log('Clé publique envoyée:', pubBase64);
  }

  // Fonction pour tenter de dériver la clé partagée si possible
  function tryDeriveSharedSecret() {
    if (myKeyPair && remotePublicKey) {
      deriveSharedSecret();
    }
  }

  // Lors du clic sur "Rejoindre"
  btnLogin.onclick = () => {
    const pseudoVal = pseudoInput.value.trim();
    if (pseudoVal === '') {
      alert('Veuillez entrer un pseudo');
      return;
    }
    nickname = pseudoVal;

    // Masquer le formulaire et afficher le chat
    sectionPseudo.style.display = 'none';
    sectionChat.style.display = 'block';

    // Générer ses clés et envoyer sa clé publique
    initKeys();
  };

  // Envoyer un message
  btnSend.onclick = () => {
    const message = messageInput.value.trim();
    if (!message || !sharedSecret) {
      alert('Clé non prête ou message vide');
      return;
    }
    const encrypted = encryptMessage(message);
    if (!encrypted) return;
    socket.emit('send_message', { message: encrypted, nickname: nickname });
    // Affichage local
    messagesDiv.innerHTML += `<div><em>Moi</em>: ${message}</div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    messageInput.value = '';
  };

  // Réception d'un message
  socket.on('receive_message', (data) => {
    const decrypted = decryptMessage(data.message);
    if (decrypted === null) return;
    messagesDiv.innerHTML += `<div><strong>[${data.nickname}]</strong>: ${decrypted}</div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

  // Réception de la clé publique distante
  socket.on('public_key', (data) => {
    try {
      remotePublicKey = decodeBase64(data.key);
      if (remotePublicKey.length !== nacl.box.publicKeyLength) {
        console.error('Clé publique invalide');
        return;
      }
      console.log('Clé publique reçue:', data.key);
      tryDeriveSharedSecret();
    } catch (e) {
      console.error('Erreur lors de la réception de la clé publique', e);
    }
  });
});
