import { describe, it, expect } from 'vitest';
import { generateCode, isValidCode, CODE_LENGTH } from './codes';

describe('generateCode', () => {
  it('returns a 7-character base62 string', () => {
    const code = generateCode();
    expect(code).toHaveLength(CODE_LENGTH);
    expect(code).toMatch(/^[0-9A-Za-z]{7}$/);
  });

  it('returns different codes across calls', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateCode()));
    expect(codes.size).toBe(100);
  });
});

describe('isValidCode', () => {
  it('accepts a well-formed code', () => {
    expect(isValidCode('aZ09bYx')).toBe(true);
  });

  it('rejects wrong length, empty, and non-base62 input', () => {
    expect(isValidCode('short')).toBe(false);
    expect(isValidCode('')).toBe(false);
    expect(isValidCode('abc-123')).toBe(false);
    expect(isValidCode('toolongcode')).toBe(false);
  });
});
