export function toUint8Array(val?: string): Uint8Array {
  return new TextEncoder().encode(val);
}
