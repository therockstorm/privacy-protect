import { ENCRYPTION_CONFIG } from "./constants.js";
import { toUint8Array } from "./to-array.js";

export type EncryptionConfig = typeof ENCRYPTION_CONFIG;

// eslint-disable-next-line sort-keys
export const SECRET_TYPES = { message: "Message", file: "File" } as const;
export const secretTypes = Object.values(SECRET_TYPES);
export type Secret = (typeof secretTypes)[number];

type EncryptReq = Readonly<{
  iv: Uint8Array;
  password: string;
  plainText: ArrayBufferView | ArrayBuffer;
  salt: Uint8Array;
  subtle: SubtleCrypto;
}>;

type EncryptBySecretTypeReq = EncryptReq &
  Readonly<{
    fileExtension?: string;
    secretType: Secret;
    subtle: SubtleCrypto;
  }>;

type EncryptBySecretTypeRes = Readonly<{
  cipher: ArrayBuffer;
  fileExtension?: string;
}>;

export async function encryptBySecretType(
  req: EncryptBySecretTypeReq
): Promise<EncryptBySecretTypeRes> {
  const { fileExtension, secretType } = req;
  const res = { cipher: await encrypt(req) };

  return secretType === SECRET_TYPES.file ? { ...res, fileExtension } : res;
}

async function encrypt({ iv, password, plainText, salt, subtle }: EncryptReq) {
  const { aesGcm, iterations, keyLen, pbkdf2, hash } = ENCRYPTION_CONFIG;
  const importedKey = await subtle.importKey(
    "raw",
    toUint8Array(password),
    { name: pbkdf2 },
    false,
    ["deriveKey"]
  );
  const derivedKey = await subtle.deriveKey(
    { hash, iterations, name: pbkdf2, salt },
    importedKey,
    { length: keyLen * 8, name: aesGcm },
    false,
    ["encrypt"]
  );
  return subtle.encrypt({ iv, name: aesGcm }, derivedKey, plainText);
}
