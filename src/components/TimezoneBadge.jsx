import CitySelect from './CitySelect';
import PolicyInfoIcon from './PolicyInfoIcon';
import { findCityByTimezone } from '../data/cities';
import { useT } from '../contexts/LanguageContext';
import './TimezoneBadge.css';

export default function TimezoneBadge({ timezone, onTimezoneChange }) {
  const t = useT();
  const city = timezone ? findCityByTimezone(timezone) : null;

  return (
    <span className="timezone-badge">
      <CitySelect
        value={city}
        onChange={(c) => onTimezoneChange(c.timezone)}
        placeholder={t(timezone ? 'nav.changeTimezone' : 'nav.selectTimezone')}
      />
      {timezone && <PolicyInfoIcon timezone={timezone} />}
    </span>
  );
}
