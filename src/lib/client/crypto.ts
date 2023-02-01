import { bytesToHexStr } from "$lib/bytes-to-hex";

export function random(length: number) {
  return window.crypto.getRandomValues(new Uint8Array(length));
}

export function randomWithStr(length: number) {
  const bytes = random(length);
  return { bytes, str: bytesToHexStr(bytes) };
}
