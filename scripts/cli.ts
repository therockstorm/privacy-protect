import { subtle, webcrypto } from "crypto";
import { promises as fs, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { parseArgs } from "util";

import { toUint8Array } from "../src/lib/client/to-array.js";
import {
  encryptBySecretType,
  ENCRYPTION_CONFIG,
  type Secret,
} from "../src/lib/encrypt.js";
import {
  SECRET_HTML_FILE_NAME,
  templateSecret,
} from "../src/lib/template-secret.js";

const ASSET_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "assets"
);

const USAGE = {
  encrypt: `
Usage: npm run pp -- encrypt [OPTIONS] [FILE_PATH_OR_MESSAGE] [PASSWORD] [OUT_DIR]

Encrypt a file or message.

Options:
  --help, -h      Print usage.
`,
  global: `
Usage: npm run pp -- [OPTIONS] [COMMAND] [ARG...]

Options:
  --help, -h      Print usage.
  --hint          Password hint.

Commands:
  encrypt         Encrypt a file or message.
`,
};

async function cli() {
  const { positionals, values } = parse();

  if (positionals.length === 0 && values.help) {
    console.log(USAGE.global);
    return;
  }

  if (positionals[0] === "encrypt") {
    if (positionals.length < 4 || values.help) {
      console.log(USAGE.encrypt);
      return;
    }

    const [, fileOrMessage, password, out] = positionals;
    if (!dirExists(out)) {
      console.error(`Output '${out}' does not exist or is not a directory.`);
      return;
    }

    const isFile = await fileExists(fileOrMessage);
    const secretType: Secret = isFile ? "File" : "Message";
    const { keyLen } = ENCRYPTION_CONFIG;
    const args = {
      iv: random(keyLen),
      salt: random(keyLen),
      secretType,
      subtle,
    };
    const encryptRes = await encryptBySecretType({
      ...args,
      fileExtension: isFile ? fileOrMessage.split(".").pop() : undefined,
      password,
      plainText: isFile
        ? await fs.readFile(fileOrMessage)
        : toUint8Array(fileOrMessage),
    });

    const [css, html] = await Promise.all(
      ["style.css", "template.html"].map((asset) =>
        fs.readFile(join(ASSET_DIR, asset), "utf-8")
      )
    );
    const template = templateSecret({
      ...encryptRes,
      ...args,
      css,
      html,
      passwordHint: values.hint,
    });

    writeFileSync(join(out, SECRET_HTML_FILE_NAME), template);
    return;
  }

  console.log(USAGE.global);
}

function parse() {
  try {
    return parseArgs({
      allowPositionals: true,
      args: process.argv.slice(2),
      options: {
        help: { type: "boolean", short: "h" },
        hint: { type: "string" },
      },
    });
  } catch (error) {
    console.log(USAGE.encrypt);
    process.exit(1);
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    return (await fs.lstat(path)).isFile();
  } catch {
    return false;
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
