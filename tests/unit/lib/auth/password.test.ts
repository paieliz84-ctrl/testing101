import { describe, it, expect, beforeAll } from 'vitest';
import { hashPassword, verifyPassword } from '$lib/auth/password';

describe('Password Hashing', () => {
  const testPassword = 'mySecurePassword123!';
  let hashedPassword: string;

  beforeAll(async () => {
    hashedPassword = await hashPassword(testPassword);
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const hash = await hashPassword(testPassword);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for the same password (due to salt)', async () => {
      const hash1 = await hashPassword(testPassword);
      const hash2 = await hashPassword(testPassword);
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string password', async () => {
      const hash = await hashPassword('');
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should handle long passwords', async () => {
      const longPassword = 'a'.repeat(1000);
      const hash = await hashPassword(longPassword);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should handle passwords with special characters', async () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await hashPassword(specialPassword);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const isValid = await verifyPassword(testPassword, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const isValid = await verifyPassword('wrongPassword', hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should reject empty password when hash was created with non-empty', async () => {
      const isValid = await verifyPassword('', hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should return false for invalid hash format', async () => {
      const isValid = await verifyPassword(testPassword, 'invalid-hash');
      expect(isValid).toBe(false);
    });

    it('should return false for empty hash', async () => {
      const isValid = await verifyPassword(testPassword, '');
      expect(isValid).toBe(false);
    });

    it('should handle unicode passwords', async () => {
      const unicodePassword = 'пароль🔐ñáéíóú';
      const hash = await hashPassword(unicodePassword);
      const isValid = await verifyPassword(unicodePassword, hash);
      expect(isValid).toBe(true);
    });
  });

  describe('integration', () => {
    it('should round-trip hash and verify multiple passwords', async () => {
      const passwords = [
        'short',
        'A very long password with spaces and numbers 12345',
        '!@#$%^&*()',
        'mixedCASE123',
        '   spaces   around   ',
      ];

      for (const password of passwords) {
        const hash = await hashPassword(password);
        const isValid = await verifyPassword(password, hash);
        expect(isValid).toBe(true);
      }
    });
  });
});
