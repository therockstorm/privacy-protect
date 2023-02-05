import {
  type CipherPayload,
  ENCRYPTION_CONFIG,
  SECRET_TYPES,
  type WithIvSalt,
  type WithPassword,
  type WithPlainText,
  type WithSecretType,
  type WithSubtle,
} from "./constants.js";
import { toUint8Array } from "./to-array.js";

type Payload = WithIvSalt & WithPassword & WithPlainText & WithSecretType;

type EncryptBySecretTypeReq = WithSubtle &
  Readonly<{ payloads: readonly Payload[] }>;

type EncryptOneReq = WithSubtle & Readonly<{ payload: Payload }>;

export function encryptBySecretType({
  payloads,
  subtle,
}: EncryptBySecretTypeReq): Promise<readonly CipherPayload[]> {
  return Promise.all(
    payloads.map(async (payload) => {
      const { iv, fileExtension, salt, secretType } = payload;
      const res = {
        cipherText: await encryptOne({ payload, subtle }),
        fileExtension,
        iv,
        salt,
        secretType,
      };
      return secretType === SECRET_TYPES.file ? { ...res, fileExtension } : res;
    })
  );
}

async function encryptOne({
  payload: { iv, password, plainText, salt },
  subtle,
}: EncryptOneReq) {
  const {
    encryptionAlgo: aesGcm,
    iterations,
    keyLen,
    keyDerivationAlgo: pbkdf2,
    hash,
  } = ENCRYPTION_CONFIG;
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
