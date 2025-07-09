// Génère une clé AES-GCM de 256 bits
async function generateAESKey() {
    return await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true, // Permet d'exporter la clé si besoin
        ["encrypt", "decrypt"]
    );
}

// Exporte la clé AES en base64 (pour la sauvegarder ou la partager en toute sécurité)
async function exportAESKey(key) {
    const rawKey = await window.crypto.subtle.exportKey("raw", key);
    return arrayBufferToBase64(rawKey);
}

// Importe une clé AES à partir d'une chaîne en base64
async function importAESKey(base64Key) {
    const rawKey = base64ToArrayBuffer(base64Key);
    return await window.crypto.subtle.importKey(
        "raw",
        rawKey,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
    );
}

// Chiffre un message en utilisant AES-GCM
async function encryptMessage(plaintext, key) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Génère un vecteur d'initialisation de 12 octets
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        data
    );
    // Regroupe le IV et le texte chiffré dans un seul buffer
    const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.byteLength);
    // Retourne le tout en base64
    return arrayBufferToBase64(combined.buffer);
}

// Déchiffre un message chiffré en AES-GCM
async function decryptMessage(encryptedBase64, key) {
    const combinedBuffer = base64ToArrayBuffer(encryptedBase64);
    const combined = new Uint8Array(combinedBuffer);
    const iv = combined.slice(0, 12); // Récupère le IV de 12 octets
    const ciphertext = combined.slice(12); // Le reste est le texte chiffré
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        ciphertext
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}

// Convertit un ArrayBuffer en chaîne en base64
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Convertit une chaîne en base64 en ArrayBuffer
function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

// Exemple d'utilisation
async function demo() {
    // 1. Génère une clé ou l'importe
    const key = await generateAESKey();

    // 2. Exporter la clé si besoin
    const exportedKey = await exportAESKey(key);
    console.log("Clé exportée (base64):", exportedKey);

    // 3. Importer la clé pour utiliser dans la suite
    const importedKey = await importAESKey(exportedKey);

    // 4. Chiffrer un message
    const message = "Hello, secure world!";
    const encrypted = await encryptMessage(message, importedKey);
    console.log("Message chiffré (base64):", encrypted);

    // 5. Déchiffrer le message
    const decrypted = await decryptMessage(encrypted, importedKey);
    console.log("Message déchiffré:", decrypted);
}

// Lancer la démonstration
demo();