import { type Secret, SECRET_TYPES } from "./encrypt";

export const MAX_FILE_SIZE_MB = 100;

type ValidateInputReq<T> = Readonly<{
  lenient: boolean;
  match: boolean;
  name: string;
  secretType: Secret;
  val?: null | Readonly<{ [k: number]: T; length: number }>;
}>;

export type Validator<T> = Pick<
  ValidateInputReq<T>,
  "lenient" | "secretType" | "val"
>;

export function validatePassword(req: Validator<string>): string | undefined {
  return validateInput({ ...req, match: true, name: "Password" });
}

export function validateMessage(req: Validator<string>): string | undefined {
  return validateInput({
    ...req,
    match: req.secretType === SECRET_TYPES.message,
    name: "Message",
  });
}

export function validateFiles(req: Validator<File>): string | undefined {
  const name = "File";
  const res = validateInput({
    ...req,
    match: req.secretType === SECRET_TYPES.file,
    name,
  });
  if (res) return res;

  const sizeMb = req.val != null && req.val[0].size / 1024 / 1024;
  return sizeMb > MAX_FILE_SIZE_MB
    ? `${name} larger than ${MAX_FILE_SIZE_MB}MB limit.`
    : undefined;
}

function validateInput<T>({ lenient, name, match, val }: ValidateInputReq<T>) {
  if (!match || (lenient && val == null)) return undefined;
  return val == null || val.length < 1 ? `${name} required.` : undefined;
}
