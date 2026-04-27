import { useState } from 'react';
import { detectUserTimezone, isIntlSupported } from './utils/timezone';
import { useT } from './contexts/LanguageContext';

import ThemeToggle from './components/ThemeToggle';
import LanguageSelect from './components/LanguageSelect';
import TimezoneBadge from './components/TimezoneBadge';
import TimeTravelBanner from './components/TimeTravelBanner';
import DateTimePicker from './components/DateTimePicker';

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
  const [referenceDate, setReferenceDate] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!isIntlSupported()) {
    return <div className="unsupported">{t('app.unsupported')}</div>;
  }

  const openPicker = () => setPickerOpen(true);
  const resetReferenceDate = () => setReferenceDate(null);

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
            <TimeTravelBanner
              referenceDate={referenceDate}
              onOpen={openPicker}
              onReset={resetReferenceDate}
            />
          </div>
          <div className="section__output">
            <ReverseResults
              targetHour={targetHour}
              homeTimezone={homeTimezone}
              referenceDate={referenceDate}
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
            <TimeTravelBanner
              referenceDate={referenceDate}
              onOpen={openPicker}
              onReset={resetReferenceDate}
            />
          </div>
          <div className="section__output">
            <ForwardResult
              targetCity={targetCity}
              homeTimezone={homeTimezone}
              referenceDate={referenceDate}
            />
          </div>
        </div>
      </section>

      <DateTimePicker
        open={pickerOpen}
        value={referenceDate}
        timezone={homeTimezone}
        onChange={setReferenceDate}
        onClose={() => setPickerOpen(false)}
      />
    </main>
  );
}
