import { lazy, Suspense, useEffect, useState } from 'react';
import { detectUserTimezone, isIntlSupported } from './utils/timezone';
import { useT } from './contexts/LanguageContext';
import useFavorites from './utils/useFavorites';
import useHistory from './utils/useHistory';
import { findCityByTimezone } from './data/cities';

import ThemeToggle from './components/ThemeToggle';
import LanguageSelect from './components/LanguageSelect';
import TimezoneBadge from './components/TimezoneBadge';
import TimeTravelBanner from './components/TimeTravelBanner';
import FavoritesList from './components/FavoritesList';
import HistoryStrip from './components/HistoryStrip';
import PinnedStrip from './components/PinnedStrip';
import AnchorTimezoneHelper from './components/AnchorTimezoneHelper';
import TrustFooter from './components/TrustFooter';

import ReverseSearch from './features/reverse/ReverseSearch';
import ReverseResults from './features/reverse/ReverseResults';
import ForwardSearch from './features/forward/ForwardSearch';
import ForwardResult from './features/forward/ForwardResult';

// react-day-picker is the heaviest dep on the page (~80 KB gz). Defer its
// import until the user actually opens the time-travel banner so it does
// not block first paint on initial load.
const DateTimePicker = lazy(() => import('./components/DateTimePicker'));

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
  const anchorFav = useFavorites('anchor');
  const pinnedFav = useFavorites('pinned', { cap: 5 });
  const { history, addToHistory, clearHistory } = useHistory();

  // Strong-constraint invariant: pin requires the city to be in at least one
  // favorite scope; unfavoriting auto-unpins.
  const isFavoritedAnywhere = (tz) =>
    reverseFav.isFavorite(tz) || forwardFav.isFavorite(tz) || anchorFav.isFavorite(tz);

  const pinIfFavorited = (tz) => {
    if (!isFavoritedAnywhere(tz)) return;
    pinnedFav.addFavorite(tz);
  };

  const unpin = pinnedFav.removeFavorite;

  // Wrap section unfavorite handlers so unfavoriting also unpins when the
  // city is no longer in any favorite scope.
  const removeReverseFavorite = (tz) => {
    reverseFav.removeFavorite(tz);
    if (!forwardFav.isFavorite(tz) && !anchorFav.isFavorite(tz)) pinnedFav.removeFavorite(tz);
  };
  const removeForwardFavorite = (tz) => {
    forwardFav.removeFavorite(tz);
    if (!reverseFav.isFavorite(tz) && !anchorFav.isFavorite(tz)) pinnedFav.removeFavorite(tz);
  };
  const removeAnchorFavorite = (tz) => {
    anchorFav.removeFavorite(tz);
    if (!reverseFav.isFavorite(tz) && !forwardFav.isFavorite(tz)) pinnedFav.removeFavorite(tz);
  };

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
        <PinnedStrip
          pinned={pinnedFav.favorites}
          referenceDate={referenceDate}
          onUnpin={unpin}
        />
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
          onRemove={removeReverseFavorite}
          isPinned={pinnedFav.isFavorite}
          pin={pinIfFavorited}
          unpin={unpin}
        />
        <div className="section__layout">
          <div className="section__inputs">
            <ReverseSearch
              homeTimezone={homeTimezone}
              onTimezoneChange={setHomeTimezone}
              onTargetHourChange={setTargetHour}
            />
            <HistoryStrip
              entries={history}
              type="reverse"
              onSelect={(entry) => setTargetHour(entry.targetHour)}
              onClear={clearHistory}
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
              removeFavorite={removeReverseFavorite}
            />
          </div>
        </div>
      </section>

      <div className="section-divider" role="separator" aria-hidden="true" />

      <AnchorTimezoneHelper
        homeTimezone={homeTimezone}
        onTimezoneChange={setHomeTimezone}
        favorites={anchorFav.favorites}
        isFavorite={anchorFav.isFavorite}
        addFavorite={anchorFav.addFavorite}
        removeFavorite={removeAnchorFavorite}
        isPinned={pinnedFav.isFavorite}
        pin={pinIfFavorited}
        unpin={unpin}
      />

      <div className="section-divider" role="separator" aria-hidden="true" />

      <section className="section section--forward" aria-label={t('section.searchByCity')}>
        <h2 className="section__title">{t('section.searchByCity')}</h2>
        <FavoritesList
          favorites={forwardFav.favorites}
          referenceDate={referenceDate}
          onSelect={handleForwardFavoriteSelect}
          onRemove={removeForwardFavorite}
          isPinned={pinnedFav.isFavorite}
          pin={pinIfFavorited}
          unpin={unpin}
        />
        <div className="section__layout">
          <div className="section__inputs">
            <ForwardSearch targetCity={targetCity} onTargetCityChange={setTargetCity} />
            <HistoryStrip
              entries={history}
              type="forward"
              onSelect={(entry) => {
                const c = findCityByTimezone(entry.timezone);
                if (c) setTargetCity(c);
              }}
              onClear={clearHistory}
            />
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
              removeFavorite={removeForwardFavorite}
            />
          </div>
        </div>
      </section>

      <TrustFooter />

      {pickerOpen && (
        <Suspense fallback={null}>
          <DateTimePicker
            open
            value={referenceDate}
            timezone={homeTimezone}
            onChange={setReferenceDate}
            onClose={() => setPickerOpen(false)}
          />
        </Suspense>
      )}
    </main>
  );
}
