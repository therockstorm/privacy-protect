import { decrypt, type DecryptRes } from "./decrypt.js";
import { arrayBufToStr, hexStrToBytes, toFileName } from "./mappers.js";
import type { Config } from "./template-secret.js";
import { notEmpty } from "./validators.js";

const CONFIG: Config = `{.CONFIG}` as unknown as Config;
const CLS = {
  animate: "animate-pulse",
  hidden: "hidden",
  inputError: "input-error",
} as const;
const ELS: Record<string, HTMLElement | null> = {
  file: null,
  img: null,
  message: null,
  pw: null,
  pwError: null,
  pwHide: null,
  pwHint: null,
  pwHintDiv: null,
  pwShow: null,
  revealBtn: null,
  saveBtn: null,
};
const els = ELS as Record<string, HTMLInputElement>;
let showPassword = false;

export function init() {
  Object.keys(ELS).forEach((k) => {
    ELS[k] = document.getElementById(k);
  });

  if (CONFIG.passwordHint) els.pwHint.innerHTML = CONFIG.passwordHint;
  else els.pwHintDiv.classList.add(CLS.hidden);

  els.pw.addEventListener("keyup", (event) => {
    if (event.key === "Enter") revealSecret();
  });
  els.pw.addEventListener("input", () => {
    inputError(els.pw, els.pwError, "");
  });
}

export function togglePwVisibility() {
  showPassword = !showPassword;

  if (showPassword) {
    els.pw.type = "text";
    els.pwShow.classList.add(CLS.hidden);
    els.pwHide.classList.remove(CLS.hidden);
  } else {
    els.pw.type = "password";
    els.pwShow.classList.remove(CLS.hidden);
    els.pwHide.classList.add(CLS.hidden);
  }
}

export async function revealSecret(e?: Event) {
  const pw = els.pw.value;
  if (pw.length == 0) return;
  if (e != null) e.preventDefault();

  let res: DecryptRes;
  try {
    setLoading(true);
    res = (
      await decrypt({
        ...CONFIG,
        payloads: CONFIG.payloads.map((p) => ({
          ...p,
          cipherText: hexStrToBytes(p.cipherText),
          iv: hexStrToBytes(p.iv),
          password: pw,
          salt: hexStrToBytes(p.salt),
        })),
        subtle: window.crypto.subtle,
      })
    ).filter((r) => notEmpty(r.cipherText))[0];
    els.pw.value = "";
  } catch (error) {
    inputError(els.pw, els.pwError, "Password invalid.");
    return;
  } finally {
    setLoading(false);
  }

  if (!res || !res.cipherText) {
    inputError(els.pw, els.pwError, "Password invalid.");
  } else if (res.secretType == "Message") {
    els.message.innerHTML = arrayBufToStr(res.cipherText);
  } else if (res.secretType == "File") {
    els.message.classList.add(CLS.hidden);

    const fn = toFileName(res.fileExtension);
    const content = new Uint8Array(res.cipherText).reduce(
      (a, b) => a + String.fromCharCode(b),
      ""
    );
    const b64 = btoa(content);
    const data = fn.isImg
      ? `data:image/${fn.ext};base64,${b64}`
      : `data:application/octet-stream;base64,${b64}`;
    els.saveBtn.classList.remove(CLS.hidden);
    els.saveBtn.innerHTML = `Save ${fn.name}`;
    els.file.setAttribute("download", fn.name);
    els.file.setAttribute("href", data);
    if (fn.isImg) {
      els.img.setAttribute("src", data);
      els.img.classList.remove(CLS.hidden);
    }
  } else console.error(`Invalid secret type ${res.secretType}`);
}

function setLoading(loading: boolean) {
  els.revealBtn.disabled = loading;
  loading
    ? els.revealBtn.classList.add(CLS.animate)
    : els.revealBtn.classList.remove(CLS.animate);
}

function inputError(el: HTMLElement, errorEl: HTMLElement, error: string) {
  errorEl.innerHTML = error;
  error
    ? el.classList.add(CLS.inputError)
    : el.classList.remove(CLS.inputError);
}
