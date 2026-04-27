// IANA zones whose DST or offset rules have recently changed.
// Each entry maps to an i18n key in src/locales/{en,zh}.js explaining the change.
const RECENT_RULE_CHANGES = {
  'America/Edmonton': 'policy.albertaDst',
};

export function hasRecentRuleChange(timezone) {
  if (!timezone) return false;
  return Object.prototype.hasOwnProperty.call(RECENT_RULE_CHANGES, timezone);
}

export function getRuleChangeMessageKey(timezone) {
  if (!timezone) return null;
  return RECENT_RULE_CHANGES[timezone] ?? null;
}
