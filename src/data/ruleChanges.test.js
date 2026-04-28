import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  hasRecentRuleChange,
  getRuleChangeMessage,
  getRuleChangeMessageKey,
  loadRuleChanges,
  __resetDynamicForTests,
} from './ruleChanges';

const t = (key) => {
  const dict = {
    'policy.albertaDst': 'Alberta DST changed.',
    'policy.fallbackPrefix': 'Recent IANA rule change:',
  };
  return dict[key] ?? key;
};

beforeEach(() => {
  __resetDynamicForTests();
});

describe('ruleChanges static layer', () => {
  it('returns true for hardcoded zones', () => {
    expect(hasRecentRuleChange('America/Edmonton')).toBe(true);
  });

  it('returns false for unaffected zones and null', () => {
    expect(hasRecentRuleChange('Europe/London')).toBe(false);
    expect(hasRecentRuleChange(null)).toBe(false);
  });

  it('getRuleChangeMessage uses the localised i18n key for static entries', () => {
    expect(getRuleChangeMessage('America/Edmonton', t)).toBe('Alberta DST changed.');
  });

  it('getRuleChangeMessage returns null for unaffected zones', () => {
    expect(getRuleChangeMessage('Europe/London', t)).toBeNull();
  });

  it('getRuleChangeMessageKey kept for back-compat', () => {
    expect(getRuleChangeMessageKey('America/Edmonton')).toBe('policy.albertaDst');
    expect(getRuleChangeMessageKey('Europe/London')).toBeNull();
  });
});

describe('ruleChanges dynamic layer', () => {
  it('loadRuleChanges merges fetched JSON into the lookup', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 'Africa/Cairo': 'Egypt resumed DST in 2023' }),
    });
    await loadRuleChanges();
    expect(hasRecentRuleChange('Africa/Cairo')).toBe(true);
    expect(getRuleChangeMessage('Africa/Cairo', t)).toBe(
      'Recent IANA rule change: Egypt resumed DST in 2023',
    );
  });

  it('loadRuleChanges swallows fetch errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('offline'));
    await loadRuleChanges();
    // Static layer is still usable; dynamic stays empty.
    expect(hasRecentRuleChange('America/Edmonton')).toBe(true);
    expect(hasRecentRuleChange('Africa/Cairo')).toBe(false);
  });

  it('static entry wins over dynamic for the same zone', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 'America/Edmonton': 'Some other description' }),
    });
    await loadRuleChanges();
    expect(getRuleChangeMessage('America/Edmonton', t)).toBe('Alberta DST changed.');
  });
});
