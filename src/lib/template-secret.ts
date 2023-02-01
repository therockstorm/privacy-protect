import templateStyle from "../assets/style.css?raw";
import templateHtml from "../assets/template.html?raw";
import { bytesToHexStr } from "./bytes-to-hex";
import { ENCRYPTION_CONFIG, type Secret } from "./encrypt";

type TemplateSecretReq = Readonly<{
  cipher: ArrayBuffer;
  fileExtension?: string;
  iv: Uint8Array;
  passwordHint?: string;
  salt: Uint8Array;
  secretType: Secret;
}>;

export function templateSecret(req: TemplateSecretReq) {
  const { cipher, iv, salt } = req;
  const [c, i, s] = [cipher, iv, salt].map(bytesToHexStr);

  return templateHtml
    .replace(`    <link rel="stylesheet" href="./style.css" />`, "")
    .replace(
      "`{.CONFIG}`",
      JSON.stringify({
        ...ENCRYPTION_CONFIG,
        ...req,
        cipher: c,
        iv: i,
        salt: s,
      })
    )
    .replace("/*{.STYLES}*/", templateStyle);
}
