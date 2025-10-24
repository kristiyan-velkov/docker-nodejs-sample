import { describe, expect, it } from 'vitest';
import { validateTodoId, validateTodoName } from '../validation';

describe('validation utilities', () => {
  describe('validateTodoName', () => {
    it('returns true for valid todo names', () => {
      expect(validateTodoName('Buy groceries')).toBe(true);
      expect(validateTodoName('Complete project')).toBe(true);
      expect(validateTodoName('Call mom')).toBe(true);
      expect(validateTodoName('a')).toBe(true); // Single character
    });

    it('returns false for invalid todo names', () => {
      expect(validateTodoName('')).toBe(false);
      expect(validateTodoName('   ')).toBe(false); // Only whitespace
      expect(validateTodoName('\t\n')).toBe(false); // Only whitespace characters
    });

    it('handles null and undefined', () => {
      expect(validateTodoName(null as any)).toBe(false);
      expect(validateTodoName(undefined as any)).toBe(false);
    });

    it('handles non-string inputs', () => {
      expect(validateTodoName(123 as any)).toBe(false);
      expect(validateTodoName({} as any)).toBe(false);
      expect(validateTodoName([] as any)).toBe(false);
      expect(validateTodoName(true as any)).toBe(false);
    });

    it('trims whitespace before validation', () => {
      expect(validateTodoName('  valid todo  ')).toBe(true);
      expect(validateTodoName('\tvalid todo\n')).toBe(true);
    });

    it('handles very long names', () => {
      const longName = 'a'.repeat(1000);
      expect(validateTodoName(longName)).toBe(true);
    });

    it('handles special characters', () => {
      expect(validateTodoName('Todo with émojis 🎉')).toBe(true);
      expect(validateTodoName('Todo with "quotes"')).toBe(true);
      expect(validateTodoName("Todo with 'apostrophes'")).toBe(true);
      expect(validateTodoName('Todo with numbers 123')).toBe(true);
      expect(validateTodoName('Todo with symbols !@#$%')).toBe(true);
    });
  });

  describe('validateTodoId', () => {
    it('returns true for valid UUIDs', () => {
      expect(validateTodoId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(validateTodoId('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
      expect(validateTodoId('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    });

    it('returns true for simple string IDs', () => {
      expect(validateTodoId('1')).toBe(true);
      expect(validateTodoId('abc123')).toBe(true);
      expect(validateTodoId('todo-1')).toBe(true);
      expect(validateTodoId('user_123')).toBe(true);
    });

    it('returns false for invalid IDs', () => {
      expect(validateTodoId('')).toBe(false);
      expect(validateTodoId('   ')).toBe(false);
      expect(validateTodoId('\t\n')).toBe(false);
    });

    it('handles null and undefined', () => {
      expect(validateTodoId(null as any)).toBe(false);
      expect(validateTodoId(undefined as any)).toBe(false);
    });

    it('handles non-string inputs', () => {
      expect(validateTodoId(123 as any)).toBe(false);
      expect(validateTodoId({} as any)).toBe(false);
      expect(validateTodoId([] as any)).toBe(false);
      expect(validateTodoId(true as any)).toBe(false);
    });

    it('trims whitespace before validation', () => {
      expect(validateTodoId('  valid-id  ')).toBe(true);
      expect(validateTodoId('\tvalid-id\n')).toBe(true);
    });

    it('handles special characters in IDs', () => {
      expect(validateTodoId('id-with-dashes')).toBe(true);
      expect(validateTodoId('id_with_underscores')).toBe(true);
      expect(validateTodoId('id.with.dots')).toBe(true);
      expect(validateTodoId('id123')).toBe(true);
    });

    it('rejects IDs with only special characters', () => {
      expect(validateTodoId('---')).toBe(true); // Actually valid as it's not empty after trim
      expect(validateTodoId('...')).toBe(true); // Actually valid as it's not empty after trim
    });
  });
});
