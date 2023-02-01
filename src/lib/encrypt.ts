import { toUint8Array } from "./client/to-array.js";

export const ENCRYPTION_CONFIG = {
  aesGcm: "AES-GCM",
  iterations: 2_100_000,
  keyLen: 32,
  pbkdf2: "PBKDF2",
  hash: "SHA-512",
};

type EncryptReq = Readonly<{
  iv: Uint8Array;
  password: string;
  plainText: ArrayBufferView | ArrayBuffer;
  salt: Uint8Array;
  subtle: SubtleCrypto;
}>;

export async function encrypt({
  iv,
  password,
  plainText,
  salt,
  subtle,
}: EncryptReq) {
  const { aesGcm, iterations, keyLen, pbkdf2, hash } = ENCRYPTION_CONFIG;
  return subtle.encrypt(
    { name: aesGcm, iv },
    await subtle.deriveKey(
      { name: pbkdf2, salt, iterations, hash },
      await subtle.importKey(
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
}

export function bytesToHexStr(bytes: Uint8Array | ArrayBuffer) {
  return Array.from(
    bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes,
    (byte) => ("0" + (byte & 0xff).toString(16)).slice(-2)
  ).join("");
}
