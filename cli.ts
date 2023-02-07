#!/usr/bin/env -S npx ts-node
import { decryptCli } from "./scripts/cli/decrypt.js";
import { encryptCli } from "./scripts/cli/encrypt.js";
import { exitWithError, parse, USAGE } from "./scripts/cli/parse.js";

async function cli() {
  const parsed = parse();
  const { positionals, values } = parsed;
  if (positionals.length === 0 && values.help) return console.log(USAGE.global);

  switch (positionals[0]) {
    case "encrypt":
      await encryptCli(parsed);
      break;
    case "decrypt":
      await decryptCli(parsed);
      break;
    default:
      exitWithError(USAGE.global);
  }
}

cli();
