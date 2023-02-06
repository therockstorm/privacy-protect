export const ENCRYPTION_CONFIG = {
  encryptionAlgo: "AES-GCM",
  hash: "SHA-512",
  iterations: 2_100_000,
  keyDerivationAlgo: "PBKDF2",
  keyLen: 32,
} as const;

// eslint-disable-next-line sort-keys
export const SECRET_TYPES = { message: "Message", file: "File" } as const;
export const secretTypes = Object.values(SECRET_TYPES);
export type SecretType = (typeof secretTypes)[number];

export type EncryptionConfig = typeof ENCRYPTION_CONFIG;

export type ValueOf<T> = T[keyof T];

export type WithCipherText<T = ArrayBuffer> = Readonly<{ cipherText: T }>;

export type WithIvSalt<T = Uint8Array> = Readonly<{ iv: T; salt: T }>;

export type WithPassword = Readonly<{ password: string }>;

export type WithPlainText = Readonly<{
  plainText: ArrayBuffer | string;
}>;

export type WithSecretType = Readonly<{
  fileExtension?: string;
  secretType: SecretType;
}>;

export type WithSubtle = Readonly<{ subtle: SubtleCrypto }>;

export type CipherPayload = WithCipherText & WithIvSalt & WithSecretType;

export function isString(val: unknown): val is string {
  return typeof val === "string" || val instanceof String;
}
