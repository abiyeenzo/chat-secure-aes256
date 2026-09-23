document.addEventListener('DOMContentLoaded', () => {
  const sectionPseudo = document.getElementById('pseudo-form');
  const sectionChat = document.getElementById('chat');

  const pseudoInput = document.getElementById('nickname');
  const passphraseInput = document.getElementById('passphrase');
  const messageInput = document.getElementById('messageInput');

  const messagesDiv = document.getElementById('messages');

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Cle AES-256-GCM derivee localement de la phrase secrete du salon.
  // Elle n'est jamais envoyee au serveur : seul le texte chiffre transite.
  let roomKey = null;
  let nickname = '';

  const socket = io();

  async function deriveRoomKey(passphrase) {
    const passphraseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('chat-secure-aes256-room-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      passphraseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  function toBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  function fromBase64(str) {
    return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
  }

  async function encryptMessage(plainText) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      roomKey,
      encoder.encode(plainText)
    );
    return { ciphertext: toBase64(ciphertext), iv: toBase64(iv) };
  }

  async function decryptMessage(payload) {
    const ciphertext = fromBase64(payload.ciphertext);
    const iv = fromBase64(payload.iv);
    const plainBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      roomKey,
      ciphertext
    );
    return decoder.decode(plainBuffer);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  async function renderMessage(msg) {
    const timestamp = msg.timestamp ? `[${msg.timestamp}] ` : '';
    let text;
    try {
      text = await decryptMessage(msg);
    } catch (err) {
      text = '[message illisible : phrase secrete incorrecte]';
    }
    const who = msg.nickname === nickname ? '[Moi]' : `[${msg.nickname}]`;
    messagesDiv.innerHTML += `<div><strong>${timestamp}${who}</strong>: ${escapeHtml(text)}</div>`;
  }

  document.getElementById('btnLogin').onclick = async () => {
    const pseudoVal = pseudoInput.value.trim();
    const passVal = passphraseInput.value;

    if (pseudoVal === '') {
      alert('Veuillez entrer un pseudo');
      return;
    }
    if (passVal === '') {
      alert('Veuillez entrer la phrase secrete du salon');
      return;
    }

    nickname = pseudoVal;
    roomKey = await deriveRoomKey(passVal);

    sectionPseudo.style.display = 'none';
    sectionChat.style.display = 'block';

    socket.emit('new_user', { nickname });
  };

  socket.on('load_message_history', async (history) => {
    messagesDiv.innerHTML = '';
    for (const msg of history) {
      await renderMessage(msg);
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

  socket.on('receive_message', async (data) => {
    await renderMessage(data);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

  document.getElementById('btnSend').onclick = async () => {
    const message = messageInput.value.trim();
    if (message === '') {
      alert('Message vide');
      return;
    }

    const now = new Date();
    const timestamp = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const payload = await encryptMessage(message);

    // Affichage local immediat : le serveur ne renvoie pas son propre
    // message a l'emetteur (broadcast avec include_self=False).
    messagesDiv.innerHTML += `<div><em>[${timestamp}] [Moi]</em>: ${escapeHtml(message)}</div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    socket.emit('send_message', {
      ciphertext: payload.ciphertext,
      iv: payload.iv,
      nickname
    });

    messageInput.value = '';
  };

  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('btnSend').click();
    }
  });
});
