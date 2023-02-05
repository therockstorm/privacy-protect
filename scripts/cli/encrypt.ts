import { webcrypto } from "crypto";
import { promises as fs, Stats, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import {
  ENCRYPTION_CONFIG,
  SECRET_TYPES,
  type SecretType,
  type WithPassword,
  type WithPlainText,
  type WithSecretType,
} from "../../src/lib/constants.js";
import { encryptBySecretType } from "../../src/lib/encrypt.js";
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

type Payload = WithPassword & WithPlainText & WithSecretType;

type ValidateRes =
  | string
  | Readonly<{
      hint: string | undefined;
      out: Readonly<{ isFile: boolean; path: string }>;
      payloads: readonly Payload[];
    }>;

export async function encryptCli(req: Parsed) {
  const validated = await validate(req);
  if (typeof validated === "string") {
    console.error(validated);
    process.exit(1);
  }

  const { hint, out, payloads } = validated;
  const [css, html, js] = await Promise.all(
    ["template.css", "template.html", "template.js"].map((asset) =>
      fs.readFile(join(ASSET_DIR, asset), "utf-8")
    )
  );
  const { keyLen } = ENCRYPTION_CONFIG;
  const encryptRes = await encryptBySecretType({
    payloads: payloads.map((p) => ({
      ...p,
      iv: random(keyLen),
      salt: random(keyLen),
    })),
    subtle: webcrypto.subtle,
  });

  const file = out.isFile ? out.path : join(out.path, getFileName());
  writeFileSync(
    file,
    templateSecret({
      css,
      html,
      js,
      passwordHint: hint,
      payloads: encryptRes,
    })
  );
  console.log(`Wrote file '${file}'.`);
}

// eslint-disable-next-line sonarjs/cognitive-complexity
async function validate({ positionals, values }: Parsed): Promise<ValidateRes> {
  if (positionals.length !== 2 || values.help) return USAGE.encrypt;

  const errors: (string | undefined)[] = [];
  const [, out] = positionals;
  const { deniableMessage, file, hint, message, password } = values;
  const secretType: SecretType = file ? "File" : "Message";

  const lenient = false;
  const outStat = await stat(out);
  if (outStat == null || (!outStat.isFile() && !outStat.isDirectory())) {
    errors.push(`Output '${out}' not found.`);
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

  errors.push(
    validateMessage({ lenient: true, secretType, val: deniableMessage })
  );

  const error = errors.filter((error) => error != null).join("\n");
  if (error) return error;

  const pw = password ?? (await hiddenQuestion("Password: "));
  const pwError = validatePassword({
    lenient,
    secretType,
    val: pw,
  });
  if (pwError) return pwError;

  let deniablePw: string | undefined;
  if (deniableMessage) {
    console.log("ROCKY", deniableMessage);
    deniablePw = await hiddenQuestion("Deniable password: ");
    const deniablePwError = validatePassword({
      lenient,
      secretType,
      val: deniablePw,
    });
    if (deniablePwError) return deniablePwError;
  }

  const payloads: Payload[] =
    deniableMessage && deniablePw
      ? [
          {
            password: deniablePw,
            plainText: toUint8Array(deniableMessage),
            secretType: "Message",
          },
        ]
      : [];
  const res = { hint, out: { isFile: outStat?.isFile() ?? false, path: out } };

  return secretType === SECRET_TYPES.file && file != null
    ? {
        ...res,
        payloads: [
          ...payloads,
          {
            fileExtension: file.split(".").pop(),
            password: pw,
            plainText: await fs.readFile(file),
            secretType,
          },
        ],
      }
    : {
        ...res,
        payloads: [
          ...payloads,
          { password: pw, plainText: toUint8Array(message), secretType },
        ],
      };
}

async function stat(path: string): Promise<Stats | undefined> {
  try {
    return await fs.lstat(path);
  } catch {
    return undefined;
  }
}

function random(length: number) {
  return webcrypto.getRandomValues(new Uint8Array(length));
}
