import * as Select from '@radix-ui/react-select';
import { useLanguage, useT } from '../contexts/LanguageContext';
import './LanguageSelect.css';

const OPTIONS = [
  { value: 'en', label: 'EN' },
  { value: 'zh', label: '中文' },
];

export default function LanguageSelect() {
  const { language, setLanguage } = useLanguage();
  const t = useT();

  return (
    <Select.Root value={language} onValueChange={setLanguage}>
      <Select.Trigger
        className="language-select__trigger"
        aria-label={t('nav.languageSelect.label')}
      >
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="language-select__content"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport>
            {OPTIONS.map((o) => (
              <Select.Item
                key={o.value}
                value={o.value}
                className="language-select__item"
              >
                <Select.ItemText>{o.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
