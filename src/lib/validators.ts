import { SECRET_TYPES, type SecretType } from "./constants.js";

export const MAX_FILE_SIZE_MB = 100;

type ValidateInputReq<T> = Readonly<{
  lenient: boolean;
  match: boolean;
  name: string;
  secretType: SecretType;
  val?: null | T;
}>;

export type Validator<T> = Pick<
  ValidateInputReq<T>,
  "lenient" | "secretType" | "val"
>;

export function validateMessage(req: Validator<string>): string | undefined {
  return validateInput({
    ...req,
    match: req.secretType === SECRET_TYPES.message,
    name: "Message",
  });
}

export function validateFile(
  req: Validator<Readonly<{ path?: string; size: number }>>
): string | undefined {
  const match = req.secretType === SECRET_TYPES.file;
  const name = "File";
  const res = validateInput({ ...req, match, name, val: req.val?.path });
  if (res) return res;

  const sizeMb = req.val != null ? req.val.size / 1024 / 1024 : 0;
  if (match && sizeMb <= 0 && !req.lenient) return `${name} required.`;

  return sizeMb > MAX_FILE_SIZE_MB
    ? `${name} larger than ${MAX_FILE_SIZE_MB}MB limit.`
    : undefined;
}

export function validateInput<T>(req: ValidateInputReq<T>) {
  if (!req.match || (req.lenient && req.val == null)) return undefined;
  if (
    req.val == null ||
    (typeof req.val === "string" && req.val.trim() === "") ||
    (Array.isArray(req.val) && req.val.length === 0)
  ) {
    return `${req.name} required.`;
  }

  return undefined;
}

export function nonNull<T>(value?: T | null): value is T {
  return value != null;
}

export function validatePassword(req: Validator<string>): string | undefined {
  return validateInput({ ...req, match: true, name: "Password" });
}
