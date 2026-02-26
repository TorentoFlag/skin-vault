import { useLanguageStore } from '../../../store/useLanguageStore';

export function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguageStore();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#252540] border border-[#3a3a5a] rounded-lg text-sm font-medium hover:border-[#00d9ff] transition-all duration-200"
      title={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
    >
      <span className="text-base leading-none">{language === 'ru' ? '🇷🇺' : '🇺🇸'}</span>
      <span className="text-[#a0a0b0]">{language === 'ru' ? 'RU' : 'EN'}</span>
    </button>
  );
}
