import { describe, expect, it } from 'vitest';
import { redact } from './redact.js';

describe('redact()', () => {
  it('returns empty result for empty input', () => {
    const result = redact('');
    expect(result.original).toBe('');
    expect(result.redacted).toBe('');
    expect(result.matches).toHaveLength(0);
  });

  it('passes through text with no sensitive data', () => {
    const input = 'This is a normal sentence with no sensitive info.';
    const result = redact(input);
    expect(result.redacted).toBe(input);
    expect(result.matches).toHaveLength(0);
  });

  describe('cookie redaction', () => {
    it('redacts Set-Cookie headers', () => {
      const input = 'Set-Cookie: session=abc123; Path=/; HttpOnly';
      const result = redact(input);
      expect(result.redacted).not.toContain('session=abc123');
      expect(result.redacted).toContain('REDACTED_COOKIE');
      expect(result.summary.find((s) => s.category === 'cookie')?.count).toBe(1);
    });

    it('redacts Cookie: request headers', () => {
      const input = 'Cookie: session=abc123; theme=dark';
      const result = redact(input);
      expect(result.redacted).not.toContain('session=abc123');
      expect(result.redacted).toContain('REDACTED_COOKIE');
    });

    it('does not redact when cookie category is disabled', () => {
      const input = 'Set-Cookie: token=secret';
      const result = redact(input, { enabledCategories: { cookie: false } });
      expect(result.redacted).toBe(input);
      expect(result.matches).toHaveLength(0);
    });
  });

  describe('authorization redaction', () => {
    it('redacts Authorization headers', () => {
      const input = 'Authorization: Basic dXNlcjpwYXNz';
      const result = redact(input);
      expect(result.redacted).not.toContain('Basic dXNlcjpwYXNz');
      expect(result.redacted).toContain('REDACTED_AUTHORIZATION');
      expect(result.summary.find((s) => s.category === 'authorization')?.count).toBe(1);
    });
  });

  describe('bearer token redaction', () => {
    it('redacts Bearer tokens (standalone, not in Authorization header)', () => {
      const input = 'Use token Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0 for auth';
      const result = redact(input);
      expect(result.redacted).not.toContain('eyJhbGciOiJIUzI1NiJ9');
      expect(result.redacted).toContain('REDACTED_BEARER');
    });

    it('redacts standalone Bearer token', () => {
      const input = 'Use the token Bearer abcdefghijk to authenticate';
      const result = redact(input);
      expect(result.redacted).not.toContain('abcdefghijk');
      expect(result.redacted).toContain('REDACTED_BEARER');
    });
  });

  describe('email redaction', () => {
    it('redacts emails', () => {
      const input = 'Contact support@webrex.dev for help';
      const result = redact(input);
      expect(result.redacted).not.toContain('support@webrex.dev');
      expect(result.redacted).toContain('REDACTED_EMAIL');
    });

    it('redacts multiple emails', () => {
      const input = 'From: alice@example.com To: bob@test.org';
      const result = redact(input);
      expect(result.redacted).not.toContain('alice@example.com');
      expect(result.redacted).not.toContain('bob@test.org');
      expect(result.summary.find((s) => s.category === 'email')?.count).toBe(2);
    });
  });

  describe('phone redaction', () => {
    it('redacts phone numbers', () => {
      const input = 'Call me at 13812345678';
      const result = redact(input);
      expect(result.redacted).not.toContain('13812345678');
      expect(result.redacted).toContain('REDACTED_PHONE');
    });

    it('redacts formatted phone numbers', () => {
      const input = 'Office: +86 21 1234 5678';
      const result = redact(input);
      expect(result.redacted).not.toContain('1234');
      expect(result.summary.find((s) => s.category === 'phone')?.count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('IP redaction', () => {
    it('redacts IP addresses', () => {
      const input = 'Server at 192.168.1.100 is down';
      const result = redact(input);
      expect(result.redacted).not.toContain('192.168.1.100');
      expect(result.redacted).toContain('REDACTED_IP');
    });

    it('redacts multiple IPs', () => {
      const input = 'Request from 10.0.0.1 to 192.168.1.1';
      const result = redact(input);
      const ipSummary = result.summary.find((s) => s.category === 'ip');
      expect(ipSummary?.count).toBe(2);
    });
  });

  describe('internal URL redaction', () => {
    it('redacts localhost URLs', () => {
      const input = 'API at http://localhost:3000/api/users';
      const result = redact(input);
      expect(result.redacted).not.toContain('localhost:3000');
      expect(result.redacted).toContain('REDACTED_INTERNALURL');
    });

    it('redacts .internal URLs', () => {
      const input = 'Go to https://admin.internal/dashboard';
      const result = redact(input);
      expect(result.redacted).not.toContain('admin.internal');
      expect(result.redacted).toContain('REDACTED_INTERNALURL');
    });

    it('redacts .local URLs', () => {
      const input = 'Check http://staging.local/settings';
      const result = redact(input);
      expect(result.redacted).not.toContain('staging.local');
      expect(result.redacted).toContain('REDACTED_INTERNALURL');
    });

    it('does not redact public URLs', () => {
      const input = 'Visit https://react.dev for docs';
      const result = redact(input);
      expect(result.redacted).toBe(input);
    });
  });

  describe('replacement styles', () => {
    it('uses tag style by default', () => {
      const result = redact('user@example.com');
      expect(result.redacted).toContain('<REDACTED_EMAIL>');
    });

    it('uses asterisks style', () => {
      const result = redact('user@example.com', { replacement: 'asterisks' });
      expect(result.redacted).toContain('***');
      expect(result.redacted).not.toContain('REDACTED');
    });

    it('uses label style', () => {
      const result = redact('user@example.com', { replacement: 'label' });
      expect(result.redacted).toContain('[email]');
      expect(result.redacted).not.toContain('REDACTED');
    });
  });

  describe('overlap handling', () => {
    it('resolves overlapping matches without duplicating', () => {
      const input = 'Cookie: session=user@example.com';
      const result = redact(input);
      const _totalReplaced = result.matches.length;
      expect(result.redacted.length).toBeLessThan(input.length * 2);
    });
  });

  describe('summary', () => {
    it('returns summary for all categories', () => {
      const result = redact('');
      expect(result.summary).toHaveLength(7);
      const categories = result.summary.map((s) => s.category).sort();
      expect(categories).toEqual(['authorization', 'bearer', 'cookie', 'email', 'internalUrl', 'ip', 'phone']);
    });

    it('tracks enabled/disabled state', () => {
      const result = redact('', { enabledCategories: { email: false } });
      const email = result.summary.find((s) => s.category === 'email');
      expect(email?.enabled).toBe(false);
      const cookie = result.summary.find((s) => s.category === 'cookie');
      expect(cookie?.enabled).toBe(true);
    });
  });

  describe('match metadata', () => {
    it('includes emoji and label in matches', () => {
      const result = redact('hello@example.com');
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].category).toBe('email');
      expect(result.matches[0].label).toBe('Email');
      expect(result.matches[0].emoji).toBe('📧');
    });

    it('records correct positions', () => {
      const input = '  user@test.com  ';
      const result = redact(input);
      expect(result.matches[0].start).toBe(2);
      expect(result.matches[0].end).toBe(2 + 'user@test.com'.length);
      expect(result.matches[0].original).toBe('user@test.com');
    });
  });
});
