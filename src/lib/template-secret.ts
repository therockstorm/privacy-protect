import { bytesToHexStr } from "./bytes-to-hex.js";
import { ENCRYPTION_CONFIG, type EncryptionConfig } from "./constants.js";
import type { Secret } from "./encrypt.js";

export const SECRET_HTML_FILE_NAME = "privacyprotect.secret.html";

type DynamicConfig = Readonly<{
  fileExtension?: string;
  passwordHint?: string;
  secretType: Secret;
}>;

type TemplateSecretReq = DynamicConfig &
  Readonly<{
    cipher: ArrayBuffer;
    css: string;
    html: string;
    iv: Uint8Array;
    js: string;
    salt: Uint8Array;
  }>;

export type Config = EncryptionConfig &
  DynamicConfig &
  Readonly<{ cipher: string; iv: string; salt: string }>;

export function templateSecret(req: TemplateSecretReq): string {
  const { cipher, css, html, iv, js, salt, ...rest } = req;
  const [c, i, s] = [cipher, iv, salt].map(bytesToHexStr);
  const config: Config = {
    ...ENCRYPTION_CONFIG,
    ...rest,
    cipher: c,
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
