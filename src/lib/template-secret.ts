import { ENCRYPTION_CONFIG, type EncryptionConfig } from "./constants.js";
import type { SecretType } from "./encrypt.js";
import { bytesToHexStr } from "./mapper.js";

export const SECRET_HTML_FILE_NAME = "privacyprotect.secret.html";

type DynamicConfig = Readonly<{
  fileExtension?: string;
  passwordHint?: string;
  secretType: SecretType;
}>;

type TemplateSecretReq = DynamicConfig &
  Readonly<{
    cipherText: ArrayBuffer;
    css: string;
    html: string;
    iv: Uint8Array;
    js: string;
    salt: Uint8Array;
  }>;

export type Config = EncryptionConfig &
  DynamicConfig &
  Readonly<{ cipherText: string; iv: string; salt: string }>;

export function templateSecret(req: TemplateSecretReq): string {
  const { cipherText, css, html, iv, js, salt, ...rest } = req;
  const [c, i, s] = [cipherText, iv, salt].map(bytesToHexStr);
  const config: Config = {
    ...ENCRYPTION_CONFIG,
    ...rest,
    cipherText: c,
    iv: i,
    salt: s,
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
