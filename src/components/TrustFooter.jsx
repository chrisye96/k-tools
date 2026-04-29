import { useT } from '../contexts/LanguageContext';
import { TZDB_VERSION } from '../data/tzdbVersion';
import { APP_VERSION } from '../data/appVersion';
import './TrustFooter.css';

const REPO_URL = 'https://github.com/chrisye96/k-tools';

export default function TrustFooter() {
  const t = useT();
  return (
    <footer className="trust-footer" role="contentinfo">
      <p className="trust-footer__line">
        {t('footer.dbVersion', { version: TZDB_VERSION })}
      </p>
      <p className="trust-footer__line trust-footer__line--meta">
        <a className="trust-footer__link" href={REPO_URL} target="_blank" rel="noopener noreferrer">
          {t('footer.openSource')}
        </a>
        <span aria-hidden="true"> · </span>
        <span>v{APP_VERSION}</span>
      </p>
    </footer>
  );
}
