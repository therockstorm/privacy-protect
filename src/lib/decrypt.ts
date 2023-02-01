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
}: DecryptReq): Promise<ArrayBuffer> {
  const { aesGcm, hash, iterations, keyLen, pbkdf2 } = ENCRYPTION_CONFIG;
  const importedKey = await subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: pbkdf2 },
    false,
    ["deriveKey"]
  );
  const derivedKey = await subtle.deriveKey(
    {
      hash,
      iterations,
      name: pbkdf2,
      salt,
    },
    importedKey,
    { length: keyLen * 8, name: aesGcm },
    false,
    ["decrypt"]
  );
  return subtle.decrypt({ iv, name: aesGcm }, derivedKey, cipherText);
}
