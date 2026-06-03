import { randomInt } from 'node:crypto';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const CODE_LENGTH = 7;

/** Cryptographically-random 7-char base62 short code. */
export function generateCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}

/** True when `code` is exactly CODE_LENGTH base62 characters. */
export function isValidCode(code: string): boolean {
  return new RegExp(`^[0-9A-Za-z]{${CODE_LENGTH}}$`).test(code);
}
