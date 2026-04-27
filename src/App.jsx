import { useState } from 'react';
import { detectUserTimezone, isIntlSupported } from './utils/timezone';
import { useT } from './contexts/LanguageContext';

import ThemeToggle from './components/ThemeToggle';
import LanguageSelect from './components/LanguageSelect';
import TimezoneBadge from './components/TimezoneBadge';

import ReverseSearch from './features/reverse/ReverseSearch';
import ReverseResults from './features/reverse/ReverseResults';
import ForwardSearch from './features/forward/ForwardSearch';
import ForwardResult from './features/forward/ForwardResult';

const initialTimezone = isIntlSupported() ? detectUserTimezone() : null;

export default function App() {
  const t = useT();

  const [homeTimezone, setHomeTimezone] = useState(initialTimezone);
  const [targetHour, setTargetHour] = useState(null);
  const [targetCity, setTargetCity] = useState(null);

  if (!isIntlSupported()) {
    return <div className="unsupported">{t('app.unsupported')}</div>;
  }

  return (
    <main className="app">
      <header className="top-nav" aria-label={t('nav.label')}>
        <TimezoneBadge timezone={homeTimezone} onTimezoneChange={setHomeTimezone} />
        <div className="top-nav__actions">
          <ThemeToggle />
          <LanguageSelect />
        </div>
      </header>

      <section className="section section--reverse" aria-label={t('section.searchByTime')}>
        <h2 className="section__title">{t('section.searchByTime')}</h2>
        <div className="section__layout">
          <div className="section__inputs">
            <ReverseSearch
              homeTimezone={homeTimezone}
              onTimezoneChange={setHomeTimezone}
              onTargetHourChange={setTargetHour}
            />
          </div>
          <div className="section__output">
            <ReverseResults
              targetHour={targetHour}
              homeTimezone={homeTimezone}
            />
          </div>
        </div>
      </section>

      <div className="section-divider" role="separator" aria-hidden="true" />

      <section className="section section--forward" aria-label={t('section.searchByCity')}>
        <h2 className="section__title">{t('section.searchByCity')}</h2>
        <div className="section__layout">
          <div className="section__inputs">
            <ForwardSearch targetCity={targetCity} onTargetCityChange={setTargetCity} />
          </div>
          <div className="section__output">
            <ForwardResult targetCity={targetCity} homeTimezone={homeTimezone} />
          </div>
        </div>
      </section>
    </main>
  );
}
