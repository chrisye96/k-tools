import CitySelect from '../../components/CitySelect';
import { useT } from '../../contexts/LanguageContext';
import './ForwardResult.css';

export default function ForwardSearch({ targetCity, onTargetCityChange }) {
  const t = useT();
  return (
    <div className="forward-search">
      <label className="forward-search__label" htmlFor="forward-city-select">
        {t('forward.searchCity')}
      </label>
      <CitySelect
        value={targetCity}
        onChange={onTargetCityChange}
        placeholder={t('forward.searchPlaceholder')}
      />
    </div>
  );
}
