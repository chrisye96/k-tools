import { describe, it, expect } from 'vitest';
import { hasRecentRuleChange, getRuleChangeMessageKey } from './ruleChanges';

describe('ruleChanges', () => {
  it('returns true for zones in the rule-change list', () => {
    expect(hasRecentRuleChange('America/Edmonton')).toBe(true);
  });

  it('returns false for unaffected zones', () => {
    expect(hasRecentRuleChange('Europe/London')).toBe(false);
    expect(hasRecentRuleChange(null)).toBe(false);
  });

  it('returns the correct i18n message key for a known zone', () => {
    expect(getRuleChangeMessageKey('America/Edmonton')).toBe('policy.albertaDst');
  });

  it('returns null for unaffected zones', () => {
    expect(getRuleChangeMessageKey('Europe/London')).toBeNull();
  });
});
