import { webcrypto } from "crypto";
import { promises as fs, writeFileSync } from "fs";

import type { WithPassword } from "../../src/lib/constants.js";
import { decrypt, type DecryptRes } from "../../src/lib/decrypt.js";
import { arrayBufToStr, toFileName } from "../../src/lib/mappers.js";
import { type Config, strToConfig } from "../../src/lib/template-secret.js";
import {
  nonNull,
  validateFile,
  validatePassword,
} from "../../src/lib/validators.js";
import { hiddenQuestion } from "./hidden-question.js";
import { exitWithError, type Parsed, USAGE } from "./parse.js";

const DECRYPT_REGEX = /^ {2}var CONFIG = ({.+})?;$/m;
const PASSWORD_INVALID = "Password invalid.";

type ValidateRes = string | (WithPassword & Readonly<{ config: Config }>);

export async function decryptCli(req: Parsed) {
  const validated = await validate(req);
  if (typeof validated === "string") exitWithError(validated);

  const { config, password } = validated;
  let res: DecryptRes;

  try {
    res = (
      await decrypt({
        ...config,
        payloads: config.payloads.map((p) => ({ ...p, password })),
        subtle: webcrypto.subtle,
      })
    ).filter((r) => nonNull(r.cipherText))[0];
  } catch (error) {
    exitWithError(PASSWORD_INVALID);
  }

  if (!res || !res.cipherText) exitWithError(PASSWORD_INVALID);
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

  const matches = DECRYPT_REGEX.exec(await fs.readFile(file ?? "", "utf-8"));

  const UNSUPPORTED = `File '${file}' is an unsupported format.`;
  const config = strToConfig(matches?.[1]);
  if (config == null) errors.push(UNSUPPORTED);

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
