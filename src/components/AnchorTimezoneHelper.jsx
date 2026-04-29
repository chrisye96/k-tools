import { useMemo, useState } from 'react';
import { Star, X } from 'lucide-react';
import TimePickerWithDropdown from './TimePickerWithDropdown';
import TimezoneBadge from './TimezoneBadge';
import FavoritesList from './FavoritesList';
import useAnchorHelper from '../utils/useAnchorHelper';
import useNow from '../utils/useNow';
import {
  findSleepTimezones,
  formatOffsetLabel,
  formatDuration,
} from '../utils/sleepTimezone';
import { formatTimeInTimezone } from '../utils/timezone';
import { useT } from '../contexts/LanguageContext';
import './AnchorTimezoneHelper.css';

function nowToHHmm(homeTimezone, now) {
  if (!homeTimezone) return null;
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: homeTimezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);
}

function CandidateRow({ candidate, liveNow, isFavorite, addFavorite, removeFavorite, t }) {
  const { city, offset } = candidate;
  const canStar = typeof addFavorite === 'function';
  const starred = canStar && (isFavorite?.(city.timezone) ?? false);
  return (
    <li className="anchor-helper__candidate">
      <span className="anchor-helper__candidate-city">{city.label}</span>
      <span className="anchor-helper__candidate-time">
        {formatTimeInTimezone(city.timezone, liveNow)}
      </span>
      <span className="anchor-helper__candidate-offset">{formatOffsetLabel(offset)}</span>
      {canStar && (
        <button
          type="button"
          className={`anchor-helper__star${starred ? ' anchor-helper__star--active' : ''}`}
          onClick={() =>
            starred ? removeFavorite(city.timezone) : addFavorite(city.timezone)
          }
          aria-label={t(starred ? 'favorites.remove' : 'favorites.add')}
        >
          <Star size={14} fill={starred ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      )}
    </li>
  );
}

export default function AnchorTimezoneHelper({
  homeTimezone,
  onTimezoneChange,
  favorites,
  isFavorite,
  addFavorite,
  removeFavorite,
  isPinned,
  pin,
  unpin,
}) {
  const t = useT();
  const liveNow = useNow();
  const { anchor, actual, setAnchor, setActual, clear } = useAnchorHelper();
  const [showAll, setShowAll] = useState(false);

  const result = useMemo(
    () => findSleepTimezones({ homeTimezone, anchor, actual, now: liveNow }),
    [homeTimezone, anchor, actual, liveNow],
  );

  const incomplete = !anchor || !actual;
  const description = result && !incomplete
    ? result.delta === 0
      ? t('anchor.deltaNone')
      : (result.delta > 0
          ? t('anchor.aheadOfHome', { value: formatDuration(result.delta) })
          : t('anchor.behindHome', { value: formatDuration(result.delta) }))
    : null;

  const visible = showAll && result ? result.candidates : (result?.visible ?? []);

  function handleSetNow() {
    if (!homeTimezone) return;
    setActual(nowToHHmm(homeTimezone, liveNow));
  }

  return (
    <section className="section anchor-helper" aria-label={t('section.anchor')}>
      <div className="anchor-helper__heading">
        <h2 className="section__title">{t('section.anchor')}</h2>
        {(anchor || actual) && (
          <button type="button" className="anchor-helper__clear" onClick={clear}>
            <X size={12} aria-hidden="true" />
            <span>{t('anchor.clear')}</span>
          </button>
        )}
      </div>

      {favorites && favorites.length > 0 && (
        <FavoritesList
          favorites={favorites}
          referenceDate={null}
          onSelect={(tz) => onTimezoneChange?.(tz)}
          onRemove={removeFavorite}
          isPinned={isPinned}
          pin={pin}
          unpin={unpin}
        />
      )}

      <div className="section__layout">
        <div className="section__inputs">
          <div className="anchor-helper__row">
            <span className="anchor-helper__label">{t('reverse.youAreIn')}</span>
            <TimezoneBadge timezone={homeTimezone} onTimezoneChange={onTimezoneChange} />
          </div>
          <div className="anchor-helper__row">
            <label className="anchor-helper__label">{t('anchor.gameAnchor')}</label>
            <TimePickerWithDropdown value={anchor} onChange={setAnchor} />
          </div>
          <div className="anchor-helper__row">
            <label className="anchor-helper__label">{t('anchor.actualBedtime')}</label>
            <div className="anchor-helper__inline">
              <TimePickerWithDropdown value={actual} onChange={setActual} />
              <button
                type="button"
                className="anchor-helper__set-now"
                onClick={handleSetNow}
                disabled={!homeTimezone}
              >
                {t('anchor.setNow')}
              </button>
            </div>
          </div>
        </div>

        <div className="section__output">
          {incomplete ? (
            <p className="results-empty">{t('anchor.placeholder')}</p>
          ) : result.candidates.length === 0 && !result.closest ? (
            <p className="results-empty">{t('anchor.noMatches')}</p>
          ) : (
            <div className="anchor-helper__output">
              {description && (
                <p className="anchor-helper__description">{description}</p>
              )}
              {result.candidates.length > 0 ? (
                <>
                  <ul className="anchor-helper__candidates" role="list">
                    {visible.map((candidate) => (
                      <CandidateRow
                        key={candidate.city.timezone}
                        candidate={candidate}
                        liveNow={liveNow}
                        isFavorite={isFavorite}
                        addFavorite={addFavorite}
                        removeFavorite={removeFavorite}
                        t={t}
                      />
                    ))}
                  </ul>
                  {!showAll && result.overflow > 0 && (
                    <button
                      type="button"
                      className="anchor-helper__show-more"
                      onClick={() => setShowAll(true)}
                    >
                      {t('anchor.showMore', { count: result.overflow })}
                    </button>
                  )}
                </>
              ) : (
                <div className="anchor-helper__closest">
                  <p className="anchor-helper__closest-note">
                    {t('anchor.closestNote')}
                  </p>
                  <ul className="anchor-helper__candidates" role="list">
                    <CandidateRow
                      candidate={result.closest}
                      liveNow={liveNow}
                      isFavorite={isFavorite}
                      addFavorite={addFavorite}
                      removeFavorite={removeFavorite}
                      t={t}
                    />
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
