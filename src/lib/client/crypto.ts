export function cryptoRandom(length: number) {
  return window.crypto.getRandomValues(new Uint8Array(length));
}
