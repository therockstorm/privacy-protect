import { decrypt } from "./decrypt.js";
import type { Config } from "./template-secret.js";

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
const IMG_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];
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

  let plainText;
  try {
    setLoading(true);
    const params = [CONFIG.cipher, CONFIG.iv, CONFIG.salt].map(hexStrToBytes);
    plainText = await decrypt({
      cipherText: params[0],
      iv: params[1],
      password: pw,
      salt: params[2],
      subtle: window.crypto.subtle,
    });
    els.pw.value = "";
  } catch (error) {
    inputError(els.pw, els.pwError, "Password invalid.");
    return;
  } finally {
    setLoading(false);
  }

  if (CONFIG.secretType == "Message") {
    const message = new TextDecoder().decode(plainText);
    els.message.innerHTML = message;
  } else if (CONFIG.secretType == "File") {
    els.message.classList.add(CLS.hidden);
    els.saveBtn.classList.remove(CLS.hidden);
    const ext = CONFIG.fileExtension ?? "";
    const isImg = IMG_EXTS.includes(ext);
    const fExt = ext ? `.${ext}` : "";
    const fileName = `privacyprotect${fExt}`;
    const b64 = btoa(
      new Uint8Array(plainText).reduce((a, b) => a + String.fromCharCode(b), "")
    );
    const file = isImg
      ? `data:image/${ext};base64,${b64}`
      : `data:application/octet-stream;base64,${b64}`;
    els.saveBtn.innerHTML = `Save ${fileName}`;
    els.file.setAttribute("download", fileName);
    els.file.setAttribute("href", file);
    if (isImg) {
      els.img.setAttribute("src", file);
      els.img.classList.remove(CLS.hidden);
    }
  } else console.error(`Invalid secret type ${CONFIG.secretType}`);
}

function setLoading(loading: boolean) {
  els.revealBtn.disabled = loading;
  loading
    ? els.revealBtn.classList.add(CLS.animate)
    : els.revealBtn.classList.remove(CLS.animate);
}

function hexStrToBytes(hex: string) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substring(c, c + 2), 16));
  }
  return Uint8Array.from(bytes);
}

function inputError(el: HTMLElement, errorEl: HTMLElement, error: string) {
  errorEl.innerHTML = error;
  error
    ? el.classList.add(CLS.inputError)
    : el.classList.remove(CLS.inputError);
}
