import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { useT } from '../contexts/LanguageContext';
import {
  hasRecentRuleChange,
  getRuleChangeMessage,
  loadRuleChanges,
} from '../data/ruleChanges';
import './PolicyInfoIcon.css';

export default function PolicyInfoIcon({ timezone }) {
  const t = useT();
  // Forces a re-render once the dynamic rule list resolves so a previously
  // unaffected zone can flip to "affected" when the JSON contains it.
  const [, setLoaded] = useState(0);

  useEffect(() => {
    loadRuleChanges().finally(() => setLoaded((n) => n + 1));
  }, []);

  if (!hasRecentRuleChange(timezone)) return null;

  function handleClick(e) {
    e.stopPropagation();
    const msg = getRuleChangeMessage(timezone, t);
    if (msg) window.alert(msg);
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
