import { describe, it, expect } from 'bun:test';
import { EXPENSE_CATEGORIES } from './types';

describe('EXPENSE_CATEGORIES', () => {
  it('should have the expected categories in the correct order', () => {
    const expected = [
      'Food',
      'Transportation',
      'Housing',
      'Utilities',
      'Entertainment',
      'Healthcare',
      'Shopping',
      'Education',
      'Other'
    ];
    expect([...EXPENSE_CATEGORIES]).toEqual(expected);
  });

  it('should be a read-only array', () => {
    expect(Array.isArray(EXPENSE_CATEGORIES)).toBe(true);
  });

  it('should contain all expected category names', () => {
    expect(EXPENSE_CATEGORIES).toContain('Food');
    expect(EXPENSE_CATEGORIES).toContain('Transportation');
    expect(EXPENSE_CATEGORIES).toContain('Housing');
    expect(EXPENSE_CATEGORIES).toContain('Utilities');
    expect(EXPENSE_CATEGORIES).toContain('Entertainment');
    expect(EXPENSE_CATEGORIES).toContain('Healthcare');
    expect(EXPENSE_CATEGORIES).toContain('Shopping');
    expect(EXPENSE_CATEGORIES).toContain('Education');
    expect(EXPENSE_CATEGORIES).toContain('Other');
  });

  it('should have the correct number of categories', () => {
    expect(EXPENSE_CATEGORIES).toHaveLength(9);
  });
});
