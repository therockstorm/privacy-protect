import { webcrypto } from "crypto";
import { promises as fs, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import {
  ENCRYPTION_CONFIG,
  SECRET_TYPES,
  type SecretType,
  type ValueOf,
  type WithPassword,
  type WithPlainText,
  type WithSecretType,
} from "../../src/lib/constants.js";
import { encryptBySecretType } from "../../src/lib/encrypt.js";
import { getFileName, templateSecret } from "../../src/lib/template-secret.js";
import {
  validateFile,
  validateMessage,
  validatePassword,
} from "../../src/lib/validators.js";
import { hiddenQuestion } from "./hidden-question.js";
import { exitWithError, type Parsed, USAGE } from "./parse.js";

const ASSET_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "src",
  "assets"
);

const OUT_TYPE = {
  directory: "directory",
  file: "file",
  invalid: "invalid",
} as const;
type OutType = ValueOf<typeof OUT_TYPE>;

type Payload = WithPassword & WithPlainText & WithSecretType;

type ValidateRes =
  | string
  | Readonly<{
      hint: string | undefined;
      out: Readonly<{ path: string; type: OutType }>;
      payloads: readonly Payload[];
    }>;

export async function encryptCli(req: Parsed) {
  const validated = await validate(req);
  if (typeof validated === "string") exitWithError(validated);

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

  const file =
    out.type === OUT_TYPE.file ? out.path : join(out.path, getFileName());
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
  const [, outPath] = positionals;
  const { deniableMessage, file, hint, message, password } = values;
  const secretType: SecretType = file ? "File" : "Message";

  const lenient = false;
  const outType = await validatePath(outPath);
  if (outType == OUT_TYPE.invalid) {
    errors.push(`Output '${outPath}' not found.`);
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
            plainText: deniableMessage,
            secretType: "Message",
          },
        ]
      : [];
  const res = { hint, out: { path: outPath, type: outType } };
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
          {
            password: pw,
            plainText: message ?? "",
            secretType,
          },
        ],
      };
}

async function validatePath(path: string): Promise<OutType> {
  try {
    try {
      const stat = await fs.lstat(path);
      if (stat.isFile()) return OUT_TYPE.file;

      return stat.isDirectory() ? OUT_TYPE.directory : OUT_TYPE.invalid;
    } catch {
      const stat = await fs.lstat(dirname(path));
      return stat.isDirectory() ? OUT_TYPE.file : OUT_TYPE.invalid;
    }
  } catch {
    return OUT_TYPE.invalid;
  }
}

function random(length: number) {
  return webcrypto.getRandomValues(new Uint8Array(length));
}
