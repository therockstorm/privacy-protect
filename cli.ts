#!/usr/bin/env npx ts-node
import { decrypt } from "./scripts/cli/decrypt.js";
import { encrypt } from "./scripts/cli/encrypt.js";
import { parse, USAGE } from "./scripts/cli/parse.js";

async function cli() {
  const parsed = parse();
  const { positionals, values } = parsed;
  if (positionals.length === 0 && values.help) return console.log(USAGE.global);

  switch (positionals[0]) {
    case "encrypt":
      await encrypt(parsed);
      break;
    case "decrypt":
      await decrypt(parsed);
      break;
    default:
      console.error(USAGE.global);
      process.exit(1);
  }
}

cli();
