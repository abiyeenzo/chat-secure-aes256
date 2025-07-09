async function encryptMessage(message, key) {
  try {
    // Vérifier la taille de la clé.  AES-256 nécessite une clé de 32 octets.
    if (key.length !== 32) {
      throw new Error("La clé doit avoir une longueur de 32 octets.");
    }

    const messageUint8 = new TextEncoder().encode(message);
    const keyUint8 = new Uint8Array(key);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyUint8,
      { name: "AES-GCM", length: 256 },
      false, // extractable: false
      ["encrypt", "decrypt"]
    );

    const nonce = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: nonce, // Important : utiliser nonce
      },
      cryptoKey,
      messageUint8
    );
    const encryptedArray = new Uint8Array(encrypted);
    
    // Concaténer le nonce et les données chiffrées
    const combined = new Uint8Array(nonce.length + encryptedArray.length);
    combined.set(nonce);
    combined.set(encryptedArray, nonce.length);

    // Convertir en base64 pour le transport
    return base64url.fromUint8Array(combined);  // Important: utiliser base64url

  } catch (error) {
    console.error("Erreur de chiffrement :", error);
    return null; // Ou throw l'erreur, selon vos besoins
  }
}


async function decryptMessage(encryptedMessage, key) {
  try {
    const combined = base64url.toUint8Array(encryptedMessage); // convertir de base64url
    const nonce = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const keyUint8 = new Uint8Array(key);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyUint8,
      { name: "AES-GCM", length: 256 },
      false, // extractable: false
      ["encrypt", "decrypt"]
    );


    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: nonce, //Important: utiliser le nonce
      },
      cryptoKey,
      ciphertext
    );

    const decryptedArray = new Uint8Array(decrypted);
    return new TextDecoder().decode(decryptedArray);


  } catch (error) {
    console.error("Erreur de déchiffrement :", error);
    return null; // ou throw l'erreur
  }
}

//Exemple d'utilisation (important : clé doit être la même pour chiffrement et déchiffrement)
const key = "votre_cle_secrete_32_octets"; // Remplacez par une clé de 32 octets
const message = "Ceci est un message à chiffrer";

encryptMessage(message, key)
  .then(encrypted => {
    console.log("Message chiffré :", encrypted);
    decryptMessage(encrypted, key)
    .then(decrypted => console.log("Message déchiffré :", decrypted))
    .catch(err => console.error("Déchiffrement échoué:", err));
  })
  .catch(err => console.error("Chiffrement échoué:", err));

// Important : Inclure la librairie base64url (npm install base64-url)
// et l'importer dans votre fichier JS.