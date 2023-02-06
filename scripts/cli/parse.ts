import { parseArgs } from "util";

export const USAGE = {
  decrypt: `
Usage: ./cli decrypt [OPTIONS] [FILE]

Decrypt a PrivacyProtect HTML file.

Options:
  --help, -h        Print usage.
  --file, -f        Path to PrivacyProtect HTML file containing secret to reveal.
  --password, -p    Password used to reveal your secret. Provided as a
                    convenience to allow for scripting. If not provided as an
                    option, the CLI will prompt for it and hide typed characters.

Examples:
  ./cli.ts decrypt ./out/secret.html
`,
  encrypt: `
Usage: ./cli encrypt [OPTIONS] [--file OR --message] [OUT]

Encrypt a file or message, creating a PrivacyProtect HTML file.

Options:
  --help, -h        Print usage.

  --file, -f        Path to secret file to conceal.
  --hint            Password hint.
  --message, -m     Secret message to conceal.
  --password, -p    Password used to conceal your secret. Provided as a
                    convenience to allow for scripting. If not provided as an
                    option, the CLI will prompt for it and hide typed characters.
  --deniableMessage Secret message to conceal. If provided, the CLI will prompt
                    for a second password. Entering this password while under
                    duress will reveal the deniableMessage instead of the
                    --message or --file.

Examples:
  ./cli.ts encrypt -m "My secret" --hint "My hint" ./out/secret.html
`,
  global: `
Usage: ./cli [OPTIONS] [COMMAND] [ARG...]

Options:
  --help, -h        Print usage.

Commands:
  decrypt           Decrypt a PrivacyProtect HTML file.
  encrypt           Encrypt a file or message, creating a PrivacyProtect HTML
                    file.
`,
};

type Values = {
  deniableMessage: string | undefined;
  file: string | undefined;
  help: boolean | undefined;
  hint: string | undefined;
  message: string | undefined;
  password: string | undefined;
};

export type Parsed = Readonly<{ positionals: string[]; values: Values }>;

export function parse(): Parsed {
  try {
    return parseArgs({
      allowPositionals: true,
      args: process.argv.slice(2),
      options: {
        deniableMessage: { type: "string" },
        file: { short: "f", type: "string" },
        help: { short: "h", type: "boolean" },
        hint: { type: "string" },
        message: { short: "m", type: "string" },
        password: { short: "p", type: "string" },
      },
    });
  } catch (error) {
    exitWithError(USAGE.global);
  }
}

export function exitWithError(error: string): never {
  console.error(error);
  process.exit(1);
}
