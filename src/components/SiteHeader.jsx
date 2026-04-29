import { useT } from '../contexts/LanguageContext';
import './SiteHeader.css';

function scrollToTop() {
  if (typeof window === 'undefined') return;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function SiteHeader() {
  const t = useT();
  return (
    <div className="site-header">
      <button
        type="button"
        className="site-header__brand"
        onClick={scrollToTop}
        aria-label={t('site.brandAria')}
      >
        <span className="site-header__title">
          K-Zone
          <span className="site-header__dot" aria-hidden="true" />
        </span>
        <span className="site-header__tagline">{t('site.tagline')}</span>
      </button>
    </div>
  );
}
