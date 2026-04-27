import CitySelect from '../../components/CitySelect';
import './ForwardResult.css';

export default function ForwardSearch({ targetCity, onTargetCityChange }) {
  return (
    <div className="forward-search">
      <label className="forward-search__label" htmlFor="forward-city-select">
        Find current time in:
      </label>
      <CitySelect
        value={targetCity}
        onChange={onTargetCityChange}
        placeholder="Search city..."
      />
    </div>
  );
}
