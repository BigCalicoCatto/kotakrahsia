// lib/crypto.ts
const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

// Helper to turn a password into a crypto key
async function getKey(password: string) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    ENCODER.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: ENCODER.encode("static-salt-for-demo"), // In production, use a unique salt
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptMessage(message: string, password: string) {
  const key = await getKey(password);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedMessage = ENCODER.encode(message);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedMessage
  );

  // Combine IV and Ciphertext so we can store them together
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined)); // Convert to string for storage
}

export async function decryptMessage(encryptedBase64: string, password: string) {
  try {
    const key = await getKey(password);
    const combined = new Uint8Array(
      atob(encryptedBase64).split("").map((c) => c.charCodeAt(0))
    );
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    return DECODER.decode(decrypted);
  } catch (e) {
    throw new Error("Invalid Key or Message Corrupted");
  }
}

// Function to create a "Locker ID" from the password
export async function hashPassword(password: string) {
  const msgUint8 = ENCODER.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
