import type { EncryptionConfig } from "./constants.js";

type DecryptReq = EncryptionConfig &
  Readonly<{
    cipherText: ArrayBuffer;
    iv: Uint8Array;
    password: string;
    salt: Uint8Array;
    subtle: SubtleCrypto;
  }>;

export async function decrypt(req: DecryptReq): Promise<ArrayBuffer> {
  const importedKey = await req.subtle.importKey(
    "raw",
    new TextEncoder().encode(req.password),
    { name: req.pbkdf2 },
    false,
    ["deriveKey"]
  );
  const derivedKey = await req.subtle.deriveKey(
    {
      hash: req.hash,
      iterations: req.iterations,
      name: req.pbkdf2,
      salt: req.salt,
    },
    importedKey,
    { length: req.keyLen * 8, name: req.aesGcm },
    false,
    ["decrypt"]
  );
  return req.subtle.decrypt(
    { iv: req.iv, name: req.aesGcm },
    derivedKey,
    req.cipherText
  );
}
