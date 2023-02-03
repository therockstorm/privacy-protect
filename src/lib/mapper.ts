export const IMG_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];

export function arrayBufToStr(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}

export function bytesToHexStr(bytes: Uint8Array | ArrayBuffer): string {
  return Array.from(
    bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes,
    (byte) => ("0" + (byte & 0xff).toString(16)).slice(-2)
  ).join("");
}

export function hexStrToBytes(hex: string) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substring(c, c + 2), 16));
  }
  return Uint8Array.from(bytes);
}

export function toFileName(fileExtension?: string) {
  const fe = fileExtension ?? "";
  const ext = fe ? `.${fe}` : "";
  return {
    ext: fe,
    isImg: IMG_EXTS.includes(fe),
    name: `privacyprotect${ext}`,
  };
}
