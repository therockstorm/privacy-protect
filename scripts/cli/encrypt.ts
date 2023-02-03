import { webcrypto } from "crypto";
import { promises as fs, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { ENCRYPTION_CONFIG } from "../../src/lib/constants.js";
import {
  encryptBySecretType,
  SECRET_TYPES,
  type SecretType,
} from "../../src/lib/encrypt.js";
import { getFileName, templateSecret } from "../../src/lib/template-secret.js";
import { toUint8Array } from "../../src/lib/to-array.js";
import {
  validateFile,
  validateMessage,
  validatePassword,
} from "../../src/lib/validate.js";
import { hiddenQuestion } from "./hidden-question.js";
import { type Parsed, USAGE } from "./parse.js";

const ASSET_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "src",
  "assets"
);

export async function encrypt(req: Parsed) {
  const validated = await validate(req);
  if (typeof validated === "string") {
    console.error(validated);
    process.exit(1);
  }

  const { hint, out, secretType } = validated;
  const [css, html, js] = await Promise.all(
    ["template.css", "template.html", "template.js"].map((asset) =>
      fs.readFile(join(ASSET_DIR, asset), "utf-8")
    )
  );
  const { keyLen } = ENCRYPTION_CONFIG;
  const [iv, salt] = [random(keyLen), random(keyLen)];
  const encryptRes = await encryptBySecretType({
    ...validated,
    iv,
    salt,
    secretType,
    subtle: webcrypto.subtle,
  });

  const isDir = dirname(out) === out;
  const dir = isDir ? join(out, getFileName()) : out;
  writeFileSync(
    dir,
    templateSecret({
      ...encryptRes,
      css,
      html,
      iv,
      js,
      passwordHint: hint,
      salt,
      secretType,
    })
  );
  console.log(`Wrote file '${dir}'.`);
}

// eslint-disable-next-line sonarjs/cognitive-complexity
async function validate({ positionals, values }: Parsed) {
  if (positionals.length !== 2 || values.help) return USAGE.encrypt;

  const errors: (string | undefined)[] = [];
  const [, out] = positionals;
  const { file, hint, message, password } = values;
  const secretType: SecretType = file ? "File" : "Message";

  const lenient = false;
  if (!(await dirExists(dirname(out)))) {
    errors.push(`Output '${out}' not found or is not a directory.`);
  }
  if ((!file && !message) || (file && message)) {
    errors.push(`Either --file or --message option required, but not both.`);
  }

  if (file) {
    try {
      errors.push(
        validateFile({
          lenient,
          secretType,
          val: { path: file, size: (await fs.lstat(file)).size },
        })
      );
    } catch (error) {
      errors.push(`File '${file}' not found.`);
    }
  } else {
    errors.push(validateMessage({ lenient, secretType, val: message }));
  }

  const error = errors.filter((error) => error != null).join("\n");
  if (error) return error;

  const pw = password ?? (await hiddenQuestion("Password: "));
  const passwordError = validatePassword({
    lenient,
    secretType,
    val: pw,
  });
  if (passwordError) return passwordError;

  const res = { hint, out, password: pw, secretType };
  return secretType === SECRET_TYPES.file && file != null
    ? {
        ...res,
        fileExtension: file.split(".").pop(),
        plainText: await fs.readFile(file),
      }
    : { ...res, plainText: toUint8Array(message) };
}

async function dirExists(path: string): Promise<boolean> {
  try {
    return (await fs.lstat(path)).isDirectory();
  } catch {
    return false;
  }
}

function random(length: number) {
  return webcrypto.getRandomValues(new Uint8Array(length));
}
