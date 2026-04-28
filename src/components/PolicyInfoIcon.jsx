import { Info } from 'lucide-react';
import { useT } from '../contexts/LanguageContext';
import { hasRecentRuleChange, getRuleChangeMessageKey } from '../data/ruleChanges';
import './PolicyInfoIcon.css';

export default function PolicyInfoIcon({ timezone }) {
  const t = useT();
  if (!hasRecentRuleChange(timezone)) return null;

  const messageKey = getRuleChangeMessageKey(timezone);

  function handleClick(e) {
    e.stopPropagation();
    window.alert(t(messageKey));
  }

  return (
    <button
      type="button"
      className="policy-info"
      aria-label="Timezone rules updated"
      onClick={handleClick}
    >
      <Info size={14} aria-hidden="true" />
    </button>
  );
}
