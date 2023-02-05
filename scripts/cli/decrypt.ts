import { webcrypto } from "crypto";
import { promises as fs, writeFileSync } from "fs";

import { decrypt, type DecryptRes } from "../../src/lib/decrypt.js";
import {
  arrayBufToStr,
  hexStrToBytes,
  toFileName,
} from "../../src/lib/mappers.js";
import type { Config } from "../../src/lib/template-secret.js";
import {
  notEmpty,
  validateFile,
  validatePassword,
} from "../../src/lib/validators.js";
import { hiddenQuestion } from "./hidden-question.js";
import { type Parsed, USAGE } from "./parse.js";

const DECRYPT_REGEX = /^ {2}var CONFIG = ({.+})?;$/m;

type ValidateRes = string | Readonly<{ config: Config; password: string }>;

export async function decryptCli(req: Parsed) {
  const validated = await validate(req);
  if (typeof validated === "string") {
    console.error(validated);
    process.exit(1);
  }

  const { config, password } = validated;
  let res: DecryptRes;

  try {
    res = (
      await decrypt({
        ...config,
        payloads: config.payloads.map((p) => ({
          ...p,
          cipherText: hexStrToBytes(p.cipherText),
          iv: hexStrToBytes(p.iv),
          password,
          salt: hexStrToBytes(p.salt),
        })),
        subtle: webcrypto.subtle,
      })
    ).filter((r) => notEmpty(r.cipherText))[0];
  } catch (error) {
    console.error("Password invalid.");
    process.exit(1);
  }

  if (!res || !res.cipherText) throw new Error("Invalid password.");
  if (res.secretType == "Message") {
    console.log(arrayBufToStr(res.cipherText));
  } else if (res.secretType == "File") {
    const { name } = toFileName(res.fileExtension);
    writeFileSync(name, Buffer.from(res.cipherText), "binary");
    console.log(`Wrote file '${name}'.`);
  } else console.error(`Invalid secret type ${res.secretType}`);
}

// eslint-disable-next-line sonarjs/cognitive-complexity
async function validate({ positionals, values }: Parsed): Promise<ValidateRes> {
  if (positionals.length > 2 || values.help) return USAGE.decrypt;

  const errors: (string | undefined)[] = [];
  const lenient = false;
  if ((!values.file && !positionals[1]) || (values.file && positionals[1])) {
    errors.push(
      `Either --file option or [FILE] argument required, but not both.`
    );
  }

  const secretType = "File";
  const file = values.file ?? positionals[1];
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

  const matches = DECRYPT_REGEX.exec(
    await fs.readFile(values.file ?? "", "utf-8")
  );

  const UNSUPPORTED = `File '${file}' is an unsupported format.`;
  let config: Config | undefined;
  try {
    const c = matches?.[1];
    if (!c) errors.push(UNSUPPORTED);
    else config = JSON.parse(c);
  } catch (error) {
    errors.push(UNSUPPORTED);
  }

  const error = errors.filter((error) => error != null).join("\n");
  if (error || config == null) return error;

  const password =
    values.password ??
    (await hiddenQuestion(
      config.passwordHint
        ? `${config.passwordHint}\n\nPassword: `
        : "Password: "
    ));
  const passwordError = validatePassword({
    lenient,
    secretType,
    val: password,
  });
  if (passwordError) return passwordError;

  return { config, password };
}
