import {
  type CipherPayload,
  ENCRYPTION_CONFIG,
  type EncryptionConfig,
  isString,
  type WithCipherText,
  type WithIvSalt,
  type WithSecretType,
} from "./constants.js";

type TemplateSecretReq = Readonly<{
  css: string;
  html: string;
  js: string;
  passwordHint?: string;
  payloads: readonly CipherPayload[];
}>;

type Payload = WithCipherText<string> & WithIvSalt<string> & WithSecretType;

export type Config = EncryptionConfig &
  Readonly<{
    passwordHint?: string;
    payloads: readonly CipherPayload[];
  }>;

type StrConfig = EncryptionConfig &
  Readonly<{ passwordHint?: string; payloads: readonly Payload[] }>;

export function getFileName(): string {
  const now = new Date().toISOString();
  const withoutMs = now.substring(0, now.length - 5);
  return `${withoutMs}.secret.html`;
}

export function templateSecret(req: TemplateSecretReq): string {
  const config: StrConfig = {
    ...ENCRYPTION_CONFIG,
    passwordHint: req.passwordHint,
    payloads: req.payloads.map(cipherPayloadToPayload),
  };

  return req.html.replace("/*{.STYLE}*/", req.css).replace(
    "/*{.SCRIPT}*/",
    req.js
      .replace("})();", "")
      .replace(
        `"use strict";
(() => {`,
        ""
      )
      .replace(`"{.CONFIG}"`, "`" + JSON.stringify(config) + "`")
  );
}

export function strToConfig(payload?: string | StrConfig): Config | undefined {
  try {
    if (!payload) return undefined;

    const config = isString(payload) ? JSON.parse(payload) : payload;
    return {
      ...config,
      payloads: config.payloads.map(payloadToCipherPayload),
    };
  } catch (error) {
    return undefined;
  }
}

function payloadToCipherPayload(payload: Payload): CipherPayload {
  return {
    ...payload,
    cipherText: hexStrToBytes(payload.cipherText),
    iv: hexStrToBytes(payload.iv),
    salt: hexStrToBytes(payload.salt),
  };
}

function cipherPayloadToPayload(payload: CipherPayload): Payload {
  return {
    ...payload,
    cipherText: bytesToHexStr(payload.cipherText),
    iv: bytesToHexStr(payload.iv),
    salt: bytesToHexStr(payload.salt),
  };
}

function bytesToHexStr(bytes: Uint8Array | ArrayBuffer): string {
  return Array.from(
    bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes,
    (byte) => ("0" + (byte & 0xff).toString(16)).slice(-2)
  ).join("");
}

function hexStrToBytes(hex: string): Uint8Array {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substring(c, c + 2), 16));
  }
  return Uint8Array.from(bytes);
}
