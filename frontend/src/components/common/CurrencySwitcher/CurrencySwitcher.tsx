import { useCurrencyStore } from '../../../store/useCurrencyStore';

export function CurrencySwitcher() {
  const { currency, toggleCurrency } = useCurrencyStore();

  return (
    <button
      onClick={toggleCurrency}
      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#252540] border border-[#3a3a5a] rounded-lg text-sm font-medium hover:border-[#00d9ff] transition-all duration-200"
      title={currency === 'usd' ? 'Переключить на рубли' : 'Switch to USD'}
    >
      <span className="text-[#a0a0b0]">{currency === 'usd' ? '$ USD' : '₽ RUB'}</span>
    </button>
  );
}
