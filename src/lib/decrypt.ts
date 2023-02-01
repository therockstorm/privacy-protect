import { ENCRYPTION_CONFIG } from "./encrypt.js";

type DecryptReq = Readonly<{
  cipherText: ArrayBuffer;
  iv: Uint8Array;
  password: string;
  salt: Uint8Array;
  subtle: SubtleCrypto;
}>;

export async function decrypt({
  cipherText,
  iv,
  password,
  salt,
  subtle,
}: DecryptReq) {
  const { aesGcm, iterations, keyLen, pbkdf2, hash } = ENCRYPTION_CONFIG;
  const importedKey = await subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: pbkdf2 },
    false,
    ["deriveKey"]
  );
  const derivedKey = await subtle.deriveKey(
    {
      name: pbkdf2,
      salt,
      iterations,
      hash,
    },
    importedKey,
    { name: aesGcm, length: keyLen * 8 },
    false,
    ["decrypt"]
  );
  return subtle.decrypt({ name: aesGcm, iv }, derivedKey, cipherText);
}
