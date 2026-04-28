import { useEffect, useState } from 'react';
import { detectUserTimezone, isIntlSupported } from './utils/timezone';
import { useT } from './contexts/LanguageContext';
import useFavorites from './utils/useFavorites';
import useHistory from './utils/useHistory';
import { findCityByTimezone } from './data/cities';

import ThemeToggle from './components/ThemeToggle';
import LanguageSelect from './components/LanguageSelect';
import TimezoneBadge from './components/TimezoneBadge';
import TimeTravelBanner from './components/TimeTravelBanner';
import DateTimePicker from './components/DateTimePicker';
import FavoritesList from './components/FavoritesList';
import TrustFooter from './components/TrustFooter';

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

  const reverseFav = useFavorites('reverse');
  const forwardFav = useFavorites('forward');
  const { addToHistory } = useHistory();

  // Debounce history writes by 1s; only when the relevant input is non-null.
  useEffect(() => {
    if (targetHour === null || targetHour === undefined || !homeTimezone) return;
    const id = setTimeout(() => {
      addToHistory({ type: 'reverse', timezone: homeTimezone, targetHour });
    }, 1000);
    return () => clearTimeout(id);
  }, [targetHour, homeTimezone, addToHistory]);

  useEffect(() => {
    if (!targetCity) return;
    const id = setTimeout(() => {
      addToHistory({ type: 'forward', timezone: targetCity.timezone });
    }, 1000);
    return () => clearTimeout(id);
  }, [targetCity, addToHistory]);

  if (!isIntlSupported()) {
    return <div className="unsupported">{t('app.unsupported')}</div>;
  }

  const openPicker = () => setPickerOpen(true);
  const resetReferenceDate = () => setReferenceDate(null);

  // Section 1 onSelect: derive targetHour from the favorite's current local hour.
  const handleReverseFavoriteSelect = (tz) => {
    const ref = referenceDate ?? new Date();
    const hourString = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false,
    }).format(ref);
    setTargetHour(parseInt(hourString, 10) % 24);
  };

  // Section 2 onSelect: set the favorite as the city target.
  const handleForwardFavoriteSelect = (tz) => {
    const city = findCityByTimezone(tz);
    if (city) setTargetCity(city);
  };

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
        <FavoritesList
          favorites={reverseFav.favorites}
          referenceDate={referenceDate}
          onSelect={handleReverseFavoriteSelect}
        />
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
              isFavorite={reverseFav.isFavorite}
              addFavorite={reverseFav.addFavorite}
              removeFavorite={reverseFav.removeFavorite}
            />
          </div>
        </div>
      </section>

      <div className="section-divider" role="separator" aria-hidden="true" />

      <section className="section section--forward" aria-label={t('section.searchByCity')}>
        <h2 className="section__title">{t('section.searchByCity')}</h2>
        <FavoritesList
          favorites={forwardFav.favorites}
          referenceDate={referenceDate}
          onSelect={handleForwardFavoriteSelect}
        />
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
              isFavorite={forwardFav.isFavorite}
              addFavorite={forwardFav.addFavorite}
              removeFavorite={forwardFav.removeFavorite}
            />
          </div>
        </div>
      </section>

      <TrustFooter />

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
