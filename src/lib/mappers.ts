export const IMG_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];

type ToIdReq = Readonly<{ component: string; label: string; other?: string }>;

export function arrayBufToStr(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
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

export function toId(req: ToIdReq): string {
  return `${toKebab(req.label)}${append(req.component)}${append(req.other)}`;
}

function append(val?: string) {
  return val ? `-${toKebab(val)}` : "";
}

function toKebab(val: string) {
  return val.toLowerCase().replace(/\s/g, "-");
}
