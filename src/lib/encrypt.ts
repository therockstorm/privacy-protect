import { toUint8Array } from "./client/to-array.js";

export const ENCRYPTION_CONFIG = {
  aesGcm: "AES-GCM",
  iterations: 2_100_000,
  keyLen: 32,
  pbkdf2: "PBKDF2",
  hash: "SHA-512",
};

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
