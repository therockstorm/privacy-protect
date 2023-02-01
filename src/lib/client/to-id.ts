type ToIdReq = Readonly<{ component: string; label: string; other?: string }>;

export function toId({ component, label, other }: ToIdReq): string {
  return `${toKebab(label)}${append(component)}${append(other)}`;
}

function append(val?: string) {
  return val ? `-${toKebab(val)}` : "";
}

function toKebab(val: string) {
  return val.toLowerCase().replace(/\s/g, "-");
}
