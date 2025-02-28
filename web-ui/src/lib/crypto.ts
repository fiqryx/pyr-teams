import crypto from "crypto";

// Generates an AES key (for symmetric encryption)
export async function generateKey() {
    return crypto.randomBytes(32); // 256 bits for AES
}

// Generates ECDH key pair (Elliptic Curve Diffie-Hellman)
export function generateDHKeys() {
    const ecdh = crypto.createECDH("prime256v1"); // ECDH Curve P-256
    ecdh.generateKeys();
    return ecdh;
}

// Export public key (to send to peers)
export function exportPublicKey(ecdh: crypto.ECDH) {
    return ecdh.getPublicKey();
}

// Compute shared key using the local private key and remote public key
export function computeSharedKey(ecdh: crypto.ECDH, key: string | Buffer) {
    const sharedSecret = ecdh.computeSecret(
        typeof key === 'string' ? Buffer.from(key, 'base64') : key
    );
    return sharedSecret;
}

// Encrypt a message with AES-GCM
export async function encrypt(key: Buffer, message: string) {
    const iv = crypto.randomBytes(12); // Random initialization vector (12 bytes for AES-GCM)
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(message, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return { encrypted, iv, authTag };
}

// Decrypt a message with AES-GCM
export async function decrypt(key: Buffer, encryptedData: Buffer, iv: Buffer, authTag: Buffer) {
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

    return decrypted.toString("utf8");
}
