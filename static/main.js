// ===================== Début =====================

const socket = io();
let nickname = '';
const chatWindow = document.getElementById('chatWindow');

let ecdhKeyPair = null;
let sharedSecretKey = null;

// Fonctions pour la cryptographie
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let b of bytes) binary += String.fromCharCode(b);
    return window.btoa(binary);
}
function base64ToArrayBuffer(base64) {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
}

// Génère une paire de clés ECDH
async function generateECDHKeyPair() {
    return await crypto.subtle.generateKey(
        { name: "ECDH", namedCurve: "P-256" },
        true,
        ["deriveKey"]
    );
}

// Exporte la clé publique pour l’envoyer
async function exportPublicKey(key) {
    const raw = await crypto.subtle.exportKey("raw", key);
    return arrayBufferToBase64(raw);
}

// Importer la clé publique reçue
async function importPublicKey(base64Key) {
    const raw = base64ToArrayBuffer(base64Key);
    return await crypto.subtle.importKey(
        "raw",
        raw,
        { name: "ECDH", namedCurve: "P-256" },
        true,
        []
    );
}

// Derive la clé secrète partagée à partir de la clé publique distante
async function deriveSharedSecret(remotePublicKeyBase64) {
    const remotePublicKey = await importPublicKey(remotePublicKeyBase64);
    sharedSecretKey = await crypto.subtle.deriveKey(
        { name: "ECDH", public: remotePublicKey },
        ecdhKeyPair.privateKey,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
    console.log('Clé partagée dérivée');
}

// Chiffrer un message
async function encryptMessage(plaintext) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        sharedSecretKey,
        data
    );
    const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.byteLength);
    return arrayBufferToBase64(combined.buffer);
}

// Déchiffrer un message
async function decryptMessage(encryptedBase64) {
    const combinedBuffer = base64ToArrayBuffer(encryptedBase64);
    const combined = new Uint8Array(combinedBuffer);
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        sharedSecretKey,
        ciphertext
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}

// Initialisation : générer clés et échanger
async function initKeyExchange() {
    ecdhKeyPair = await generateECDHKeyPair();
    const myPublicKeyBase64 = await exportPublicKey(ecdhKeyPair.publicKey);
    // Envoyer la clé publique au serveur
    socket.emit('public_key', { key: myPublicKeyBase64 });
}

// Lorsqu’on reçoit une clé publique
socket.on('public_key', async (data) => {
    await deriveSharedSecret(data.key);
});

// Lorsqu’on envoie un message
document.getElementById('btnSend').onclick = async () => {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (!message || !sharedSecretKey) return;

    // Chiffrer le message
    const encryptedMsg = await encryptMessage(message);
    socket.emit('send_message', {
        message: encryptedMsg,
        nickname: nickname
    });
    input.value = '';
};

// Lorsqu’on reçoit un message
socket.on('receive_message', async (data) => {
    if (!sharedSecretKey) {
        console.error('Clé partagée non encore dérivée');
        return;
    }
    const decryptedMsg = await decryptMessage(data.message);
    chatWindow.innerText += `[${data.nickname}] ${decryptedMsg}\n`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
});

// Lors de la connexion
document.getElementById('btnLogin').onclick = () => {
    nickname = document.getElementById('nickname').value.trim();
    if (!nickname) {
        alert('Choisis un pseudo valide !');
        return;
    }
    document.getElementById('login').classList.add('hidden');
    document.getElementById('chat').classList.remove('hidden');

    // Initier la génération et l’échange de clés
    initKeyExchange();
};

// ================ Fin ==================
