import { toUint8Array } from "./to-array";

export const ENCRYPTION_CONFIG = {
  aesGcm: "AES-GCM",
  iterations: 2_100_000,
  keyLen: 32,
  pbkdf2: "PBKDF2",
  hash: "SHA-512",
};

export async function encrypt({
  password,
  plainText,
}: Readonly<{ password: string; plainText: ArrayBufferView | ArrayBuffer }>) {
  const { aesGcm, iterations, keyLen, pbkdf2, hash } = ENCRYPTION_CONFIG;
  const iv = cryptoRandom(keyLen);
  const salt = cryptoRandom(keyLen);
  const cipherText = await window.crypto.subtle.encrypt(
    { name: aesGcm, iv },
    await window.crypto.subtle.deriveKey(
      { name: pbkdf2, salt, iterations, hash },
      await window.crypto.subtle.importKey(
        "raw",
        toUint8Array(password),
        { name: pbkdf2 },
        false,
        ["deriveKey"]
      ),
      { name: aesGcm, length: keyLen * 8 },
      false,
      ["encrypt"]
    ),
    plainText
  );

  return {
    cipher: bytesToHexStr(cipherText),
    iv: bytesToHexStr(iv),
    salt: bytesToHexStr(salt),
  };
}

function bytesToHexStr(bytes: Uint8Array | ArrayBuffer) {
  return Array.from(
    bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes,
    (byte) => ("0" + (byte & 0xff).toString(16)).slice(-2)
  ).join("");
}

function cryptoRandom(length: number) {
  return crypto.getRandomValues(new Uint8Array(length));
}
