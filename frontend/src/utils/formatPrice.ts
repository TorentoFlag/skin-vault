import type { Currency } from '../store/useCurrencyStore';
import { useCurrencyStore } from '../store/useCurrencyStore';

const USD_TO_RUB = 95;

function convertPrice(price: number, currency: Currency): number {
  return currency === 'rub' ? price * USD_TO_RUB : price;
}

function symbol(currency: Currency): string {
  return currency === 'rub' ? '₽' : '$';
}

export function formatPrice(price: number, currency: Currency = 'usd'): string {
  const converted = convertPrice(price, currency);
  const s = symbol(currency);
  if (converted >= 10000) {
    return `${s}${(converted / 1000).toFixed(1)}k`;
  }
  if (converted < 1) {
    return `${s}${converted.toFixed(2)}`;
  }
  return `${s}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPriceFull(price: number, currency: Currency = 'usd'): string {
  const converted = convertPrice(price, currency);
  const s = symbol(currency);
  return `${s}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function useFormatPrice() {
  const currency = useCurrencyStore(s => s.currency);
  return {
    formatPrice: (price: number) => formatPrice(price, currency),
    formatPriceFull: (price: number) => formatPriceFull(price, currency),
    currency,
  };
}
