// IANA zones whose DST or offset rules have recently changed.
// Two layers:
// - STATIC_RULE_CHANGES: human-curated entries with i18n keys for nicely
//   localised messages.
// - dynamicRuleChanges: filled by loadRuleChanges() from public/rule-changes.json,
//   which the GitHub Action `sync-rule-changes` regenerates weekly from
//   IANA NEWS. Values are English snippets prefixed with policy.fallbackPrefix.
const STATIC_RULE_CHANGES = {
  'America/Edmonton': { messageKey: 'policy.albertaDst' },
};

let dynamicRuleChanges = {};

export async function loadRuleChanges() {
  try {
    const res = await fetch('/rule-changes.json');
    if (res.ok) dynamicRuleChanges = await res.json();
  } catch {
    // Network or parse error: keep STATIC_RULE_CHANGES only.
  }
}

export function hasRecentRuleChange(timezone) {
  if (!timezone) return false;
  return (
    Object.prototype.hasOwnProperty.call(STATIC_RULE_CHANGES, timezone) ||
    Object.prototype.hasOwnProperty.call(dynamicRuleChanges, timezone)
  );
}

export function getRuleChangeMessage(timezone, t) {
  if (!timezone) return null;
  const staticEntry = STATIC_RULE_CHANGES[timezone];
  if (staticEntry) return t(staticEntry.messageKey);
  const dynamicEntry = dynamicRuleChanges[timezone];
  if (dynamicEntry) {
    return `${t('policy.fallbackPrefix')} ${dynamicEntry}`;
  }
  return null;
}

// Test seam: lets the unit test reset between cases.
export function __resetDynamicForTests() {
  dynamicRuleChanges = {};
}

// Back-compat: kept for any caller still using the old name during migration.
export function getRuleChangeMessageKey(timezone) {
  if (!timezone) return null;
  return STATIC_RULE_CHANGES[timezone]?.messageKey ?? null;
}
