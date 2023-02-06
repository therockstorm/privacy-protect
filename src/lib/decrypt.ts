import type {
  CipherPayload,
  EncryptionConfig,
  WithCipherText,
  WithPassword,
  WithSecretType,
  WithSubtle,
} from "./constants.js";

type Payload = CipherPayload & WithPassword;

type DecryptReq = EncryptionConfig &
  WithSubtle &
  Readonly<{ payloads: readonly Payload[] }>;

type DecryptOneReq = EncryptionConfig &
  WithSubtle &
  Readonly<{ payload: Payload }>;

export type DecryptRes = WithCipherText<ArrayBuffer | undefined> &
  WithSecretType;

export function decrypt(req: DecryptReq): Promise<DecryptRes[]> {
  const config = {
    encryptionAlgo: req.encryptionAlgo,
    hash: req.hash,
    iterations: req.iterations,
    keyDerivationAlgo: req.keyDerivationAlgo,
    keyLen: req.keyLen,
  };

  return Promise.all(
    req.payloads.map(async (payload) => {
      let cipherText: ArrayBuffer | undefined;
      try {
        cipherText = await decryptOne({
          ...config,
          payload,
          subtle: req.subtle,
        });
      } catch (error) {
        // Ignore
      }
      return {
        cipherText,
        fileExtension: payload.fileExtension,
        secretType: payload.secretType,
      };
    })
  );
}

async function decryptOne(req: DecryptOneReq) {
  const importedKey = await req.subtle.importKey(
    "raw",
    new TextEncoder().encode(req.payload.password),
    { name: req.keyDerivationAlgo },
    false,
    ["deriveKey"]
  );
  const derivedKey = await req.subtle.deriveKey(
    {
      hash: req.hash,
      iterations: req.iterations,
      name: req.keyDerivationAlgo,
      salt: req.payload.salt,
    },
    importedKey,
    { length: req.keyLen * 8, name: req.encryptionAlgo },
    false,
    ["decrypt"]
  );
  return req.subtle.decrypt(
    { iv: req.payload.iv, name: req.encryptionAlgo },
    derivedKey,
    req.payload.cipherText
  );
}
