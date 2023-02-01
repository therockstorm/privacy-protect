export function bytesToHexStr(bytes: Uint8Array | ArrayBuffer): string {
  return Array.from(
    bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes,
    (byte) => ("0" + (byte & 0xff).toString(16)).slice(-2)
  ).join("");
}
