import { webcrypto } from "crypto";
import { promises as fs, writeFileSync } from "fs";

import { decrypt as libDecrypt } from "../../src/lib/decrypt.js";
import {
  arrayBufToStr,
  hexStrToBytes,
  toFileName,
} from "../../src/lib/mapper.js";
import type { Config } from "../../src/lib/template-secret.js";
import { validateFile, validatePassword } from "../../src/lib/validate.js";
import { hiddenQuestion } from "./hidden-question.js";
import { type Parsed, USAGE } from "./parse.js";

const DECRYPT_REGEX = /^ {2}var CONFIG = ({.+})?;$/m;

export async function decrypt(req: Parsed) {
  const validated = await validate(req);
  if (typeof validated === "string") {
    console.error(validated);
    process.exit(1);
  }

  const { config, password } = validated;
  const params = [config.cipherText, config.iv, config.salt].map(hexStrToBytes);
  let plainText: ArrayBuffer;

  try {
    plainText = await libDecrypt({
      ...config,
      cipherText: params[0],
      iv: params[1],
      password,
      salt: params[2],
      subtle: webcrypto.subtle,
    });
  } catch (error) {
    console.error("Password invalid.");
    process.exit(1);
  }

  if (config.secretType == "Message") {
    console.log(arrayBufToStr(plainText));
  } else if (config.secretType == "File") {
    const { name } = toFileName(config.fileExtension);
    writeFileSync(name, Buffer.from(plainText), "binary");
    console.log(`Wrote file '${name}'.`);
  } else console.error(`Invalid secret type ${config.secretType}`);
}

// eslint-disable-next-line sonarjs/cognitive-complexity
async function validate({ positionals, values }: Parsed) {
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
  let config: Config | undefined = undefined;
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
