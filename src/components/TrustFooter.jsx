import { useT } from '../contexts/LanguageContext';
import { TZDB_VERSION } from '../data/tzdbVersion';
import './TrustFooter.css';

export default function TrustFooter() {
  const t = useT();
  return (
    <footer className="trust-footer" role="contentinfo">
      {t('footer.dbVersion', { version: TZDB_VERSION })}
    </footer>
  );
}
