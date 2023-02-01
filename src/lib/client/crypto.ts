export function random(length: number): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(length));
}
