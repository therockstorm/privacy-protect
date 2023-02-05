import {
  type CipherPayload,
  ENCRYPTION_CONFIG,
  type EncryptionConfig,
  type WithCipherText,
  type WithIvSalt,
  type WithSecretType,
} from "./constants.js";
import { bytesToHexStr } from "./mappers.js";

type TemplateSecretReq = Readonly<{
  css: string;
  html: string;
  js: string;
  passwordHint?: string;
  payloads: readonly CipherPayload[];
}>;

type Payload = WithCipherText<string> & WithIvSalt<string> & WithSecretType;

export type Config = EncryptionConfig &
  Readonly<{ passwordHint?: string; payloads: readonly Payload[] }>;

export function getFileName(): string {
  const now = new Date().toISOString();
  const withoutMs = now.substring(0, now.length - 5);
  return `${withoutMs}.secret.html`;
}

export function templateSecret(req: TemplateSecretReq): string {
  const { css, html, js, passwordHint, payloads } = req;
  const config: Config = {
    ...ENCRYPTION_CONFIG,
    passwordHint,
    payloads: payloads.map(toConfigPayload),
  };

  return html.replace("/*{.STYLE}*/", css).replace(
    "/*{.SCRIPT}*/",
    js
      .replace("})();", "")
      .replace(
        `"use strict";
(() => {`,
        ""
      )
      .replace("`{.CONFIG}`", JSON.stringify(config))
  );
}

function toConfigPayload(payload: CipherPayload): Payload {
  const { cipherText, iv, salt } = payload;
  const [c, i, s] = [cipherText, iv, salt].map(bytesToHexStr);
  return { ...payload, cipherText: c, iv: i, salt: s };
}
