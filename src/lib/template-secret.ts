import { bytesToHexStr } from "./bytes-to-hex.js";
import { ENCRYPTION_CONFIG, type Secret } from "./encrypt.js";

export const SECRET_HTML_FILE_NAME = "privacyprotect.secret.html";

type TemplateSecretReq = Readonly<{
  cipher: ArrayBuffer;
  css: string;
  fileExtension?: string;
  html: string;
  iv: Uint8Array;
  passwordHint?: string;
  salt: Uint8Array;
  secretType: Secret;
}>;

export function templateSecret(req: TemplateSecretReq): string {
  const { cipher, css, html, iv, salt, ...rest } = req;
  const [c, i, s] = [cipher, iv, salt].map(bytesToHexStr);

  return html
    .replace(`    <link rel="stylesheet" href="./style.css" />`, "")
    .replace(
      "`{.CONFIG}`",
      JSON.stringify({
        ...ENCRYPTION_CONFIG,
        ...rest,
        cipher: c,
        iv: i,
        salt: s,
      })
    )
    .replace("/*{.STYLES}*/", css);
}
