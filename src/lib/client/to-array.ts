export function toUint8Array(val?: string) {
  return new TextEncoder().encode(val);
}
