import TimezoneBadge from '../../components/TimezoneBadge';
import './ReverseSearch.css';

export default function ReverseSearch({ homeTimezone, onTimezoneChange, onTargetHourChange }) {
  function handleTimeChange(e) {
    if (!e.target.value) {
      onTargetHourChange(null);
      return;
    }
    const [h] = e.target.value.split(':');
    onTargetHourChange(parseInt(h, 10));
  }

  return (
    <div className="reverse-search">
      <h2 className="reverse-search__title">Find cities at a target time</h2>
      <div className="reverse-search__row">
        <span className="reverse-search__label">You are in</span>
        <TimezoneBadge timezone={homeTimezone} onTimezoneChange={onTimezoneChange} />
      </div>
      <div className="reverse-search__row">
        <label className="reverse-search__label" htmlFor="target-time">
          Show cities currently at:
        </label>
        <input
          id="target-time"
          type="time"
          className="reverse-search__time-input"
          onChange={handleTimeChange}
        />
      </div>
    </div>
  );
}
