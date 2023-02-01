/* eslint-disable @typescript-eslint/no-unused-vars */
import { subtle, webcrypto } from "crypto";
import { promises as fs } from "fs";

import { toUint8Array } from "../src/lib/client/to-array.js";
import { decrypt } from "../src/lib/decrypt.js";
import {
  encrypt,
  encryptBySecretType,
  ENCRYPTION_CONFIG,
} from "../src/lib/encrypt.js";

const OPTS = {
  help: ["--help", "-h"],
};

const USAGE = {
  encrypt: `
Usage: npm run pp -- encrypt [OPTIONS] [FILE_OR_MESSAGE] [PASSWORD]

Encrypt a file or message.

Options:
  --help, -h      Print usage.
`,
  global: `
Usage: npm run pp -- [OPTIONS] [COMMAND] [ARG...]

Options:
  --help, -h      Print usage.

Commands:
  encrypt         Encrypt a file or message.
`,
};

async function cli() {
  const args = process.argv.slice(2);

  if (args.length === 0 || isHelp([args[0]])) {
    console.log(USAGE.global);
    return;
  }

  if (args[0] === "encrypt") {
    if (args.length < 3 || isHelp(args)) {
      console.log(USAGE.encrypt);
      return;
    }
    const [_, fileOrMessage, password] = args;
    const isFile = await fileExists(fileOrMessage);
    console.log(`Encrypting ${isFile ? "file" : "message"}...`);

    const { keyLen } = ENCRYPTION_CONFIG;
    const [iv, salt] = [cryptoRandom(keyLen), cryptoRandom(keyLen)];
    const req = { iv, password, salt, subtle };
    const cipherText = await encryptBySecretType({
      ...req,
      plainText: isFile
        ? await fs.readFile(fileOrMessage)
        : toUint8Array(fileOrMessage),
      secretType: isFile ? "File" : "Message",
    });
    const plainText = await decrypt({ ...req, cipherText });

    console.log(new TextDecoder().decode(plainText));
    return;
  }

  return console.log(args);
}

function isHelp(args: string[]) {
  return OPTS.help.some((o) => args.includes(o));
}

async function fileExists(path: string): Promise<boolean> {
  try {
    return (await fs.lstat(path)).isFile();
  } catch {
    return false;
  }
}

function cryptoRandom(length: number) {
  return webcrypto.getRandomValues(new Uint8Array(length));
}

cli();
