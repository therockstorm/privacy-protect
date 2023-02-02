import { subtle, webcrypto } from "crypto";
import { promises as fs, writeFileSync } from "fs";
import { dirname, join } from "path";
import readline from "readline";
import { fileURLToPath } from "url";
import { parseArgs } from "util";

import { toUint8Array } from "../src/lib/client/to-array.js";
import { ENCRYPTION_CONFIG } from "../src/lib/constants.js";
import {
  encryptBySecretType,
  type Secret,
  SECRET_TYPES,
} from "../src/lib/encrypt.js";
import {
  SECRET_HTML_FILE_NAME,
  templateSecret,
} from "../src/lib/template-secret.js";
import {
  validateFile,
  validateMessage,
  validatePassword,
} from "../src/lib/validate.js";

const ASSET_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "assets"
);

const USAGE = {
  encrypt: `
Usage: npm run pp -- encrypt [OPTIONS] [--file OR --message] [OUT_DIR]

Encrypt a file or message.

Options:
  --help, -h      Print usage.

  --file, -f      Secret file to conceal.
  --hint          Password hint.
  --message, -m   Secret message to conceal.
`,
  global: `
Usage: npm run pp -- [OPTIONS] [COMMAND] [ARG...]

Options:
  --help, -h      Print usage.

Commands:
  encrypt         Encrypt a file or message.
`,
};

type ValidateReq = Readonly<{
  file?: string;
  message?: string;
  out: string;
  secretType: Secret;
}>;

async function cli() {
  const { positionals, values } = parse();

  if (positionals.length === 0 && values.help) console.log(USAGE.global);
  else if (positionals[0] === "encrypt") {
    if (positionals.length < 2 || values.help) {
      console.log(USAGE.encrypt);
      return;
    }

    const [, out] = positionals;
    const { file, message, hint } = values;
    const secretType: Secret = file ? "File" : "Message";
    const validated = await validate({ file, message, out, secretType });
    if (typeof validated === "string") {
      console.error(validated);
      return;
    }

    const [css, html, js] = await Promise.all(
      ["template.css", "template.html", "template.js"].map((asset) =>
        fs.readFile(join(ASSET_DIR, asset), "utf-8")
      )
    );
    const { keyLen } = ENCRYPTION_CONFIG;
    const [iv, salt] = [random(keyLen), random(keyLen)];
    const args = { iv, salt, secretType, subtle };

    const encryptRes = await encryptBySecretType({ ...args, ...validated });

    writeFileSync(
      join(out, SECRET_HTML_FILE_NAME),
      templateSecret({
        ...encryptRes,
        ...args,
        css,
        html,
        js,
        passwordHint: hint,
      })
    );
  } else console.log(USAGE.global);
}

async function validate({ file, message, out, secretType }: ValidateReq) {
  const errors: (string | undefined)[] = [];
  const lenient = false;
  if (!dirExists(out)) {
    errors.push(`Output '${out}' not found or is not a directory.`);
  }
  if ((!file && !message) || (file && message)) {
    errors.push(`Either --file or --message required, but not both.`);
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

  const password = await hiddenQuestion("Password: ");
  const passwordError = validatePassword({
    lenient,
    secretType,
    val: password,
  });
  if (passwordError) return passwordError;

  return secretType === SECRET_TYPES.file && file != null
    ? {
        fileExtension: file.split(".").pop(),
        password,
        plainText: await fs.readFile(file),
      }
    : { password, plainText: toUint8Array(message) };
}

function hiddenQuestion(query: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const stdin = process.openStdin();
    process.stdin.on("data", (char) => {
      switch (char.toString()) {
        case "\n":
        case "\r":
        case "\u0004":
          stdin.pause();
          break;
        default:
          process.stdout.clearLine(0);
          readline.cursorTo(process.stdout, 0);
          process.stdout.write(query + Array(rl.line.length + 1).join("*"));
          break;
      }
    });
    rl.question(query, resolve);
  });
}

function parse() {
  try {
    return parseArgs({
      allowPositionals: true,
      args: process.argv.slice(2),
      options: {
        file: { short: "f", type: "string" },
        help: { short: "h", type: "boolean" },
        hint: { type: "string" },
        message: { short: "m", type: "string" },
      },
    });
  } catch (error) {
    console.log(USAGE.encrypt);
    process.exit(1);
  }
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

cli();
