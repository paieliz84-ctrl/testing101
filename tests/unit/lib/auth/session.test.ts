import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateId,
  generateSessionToken,
  createSessionCookie,
  createBlankSessionCookie,
  serializeCookie,
  getSessionCookieName,
} from '$lib/auth/session';

describe('Session Utilities', () => {
  describe('generateId', () => {
    it('should generate a UUID string', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('generateSessionToken', () => {
    it('should generate a hex string', () => {
      const token = generateSessionToken();
      expect(typeof token).toBe('string');
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate 64 character string (32 bytes = 64 hex chars)', () => {
      const token = generateSessionToken();
      expect(token.length).toBe(64);
    });

    it('should generate unique tokens', () => {
      const tokens = new Set();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateSessionToken());
      }
      expect(tokens.size).toBe(100);
    });
  });

  describe('createSessionCookie', () => {
    it('should create a session cookie with correct name', () => {
      const cookie = createSessionCookie('test-session-id');
      expect(cookie.name).toBe('auth_session');
      expect(cookie.value).toBe('test-session-id');
    });

    it('should have correct attributes', () => {
      const cookie = createSessionCookie('test-session-id');
      expect(cookie.attributes.httpOnly).toBe(true);
      expect(cookie.attributes.sameSite).toBe('lax');
      expect(cookie.attributes.path).toBe('/');
      expect(cookie.attributes.maxAge).toBe(30 * 24 * 60 * 60); // 30 days
    });
  });

  describe('createBlankSessionCookie', () => {
    it('should create a cookie with empty value', () => {
      const cookie = createBlankSessionCookie();
      expect(cookie.name).toBe('auth_session');
      expect(cookie.value).toBe('');
    });

    it('should have maxAge of 0', () => {
      const cookie = createBlankSessionCookie();
      expect(cookie.attributes.maxAge).toBe(0);
    });

    it('should have expires in the past', () => {
      const cookie = createBlankSessionCookie();
      expect(cookie.attributes.expires).toBeDefined();
      expect(cookie.attributes.expires!.getTime()).toBe(0);
    });
  });

  describe('getSessionCookieName', () => {
    it('should return auth_session', () => {
      expect(getSessionCookieName()).toBe('auth_session');
    });
  });

  describe('serializeCookie', () => {
    it('should serialize a basic cookie', () => {
      const cookie = {
        name: 'test',
        value: 'value',
        attributes: {
          httpOnly: false,
          secure: false,
          sameSite: 'lax' as const,
          path: '/',
        },
      };
      const serialized = serializeCookie(cookie);
      expect(serialized).toContain('test=value');
      expect(serialized).toContain('Path=/');
      expect(serialized).toContain('SameSite=lax');
    });

    it('should include HttpOnly when set', () => {
      const cookie = {
        name: 'test',
        value: 'value',
        attributes: {
          httpOnly: true,
          secure: false,
          sameSite: 'lax' as const,
          path: '/',
        },
      };
      const serialized = serializeCookie(cookie);
      expect(serialized).toContain('HttpOnly');
    });

    it('should include Secure when set', () => {
      const cookie = {
        name: 'test',
        value: 'value',
        attributes: {
          httpOnly: false,
          secure: true,
          sameSite: 'lax' as const,
          path: '/',
        },
      };
      const serialized = serializeCookie(cookie);
      expect(serialized).toContain('Secure');
    });

    it('should encode special characters', () => {
      const cookie = {
        name: 'test cookie',
        value: 'value with spaces',
        attributes: {
          httpOnly: false,
          secure: false,
          sameSite: 'lax' as const,
          path: '/',
        },
      };
      const serialized = serializeCookie(cookie);
      expect(serialized).toContain('test%20cookie');
      expect(serialized).toContain('value%20with%20spaces');
    });
  });
});
