import { ENCRYPTION_CONFIG } from "./constants.js";

type DecryptReq = Readonly<{
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
    { name: ENCRYPTION_CONFIG.pbkdf2 },
    false,
    ["deriveKey"]
  );
  const derivedKey = await req.subtle.deriveKey(
    {
      hash: ENCRYPTION_CONFIG.hash,
      iterations: ENCRYPTION_CONFIG.iterations,
      name: ENCRYPTION_CONFIG.pbkdf2,
      salt: req.salt,
    },
    importedKey,
    { length: ENCRYPTION_CONFIG.keyLen * 8, name: ENCRYPTION_CONFIG.aesGcm },
    false,
    ["decrypt"]
  );
  return req.subtle.decrypt(
    { iv: req.iv, name: ENCRYPTION_CONFIG.aesGcm },
    derivedKey,
    req.cipherText
  );
}
