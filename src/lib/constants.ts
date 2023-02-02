export const ENCRYPTION_CONFIG = {
  aesGcm: "AES-GCM",
  hash: "SHA-512",
  iterations: 2_100_000,
  keyLen: 32,
  pbkdf2: "PBKDF2",
} as const;

export type EncryptionConfig = typeof ENCRYPTION_CONFIG;
