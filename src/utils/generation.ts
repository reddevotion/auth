export function randomString(length = 16) {
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generate2FACode() {
  return Math.floor(100_000 + Math.random() * 900_000).toString();
}