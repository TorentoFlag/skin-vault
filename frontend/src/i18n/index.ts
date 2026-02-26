import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ruCommon from './locales/ru/common.json';
import ruHome from './locales/ru/home.json';
import ruMarketplace from './locales/ru/marketplace.json';
import ruProduct from './locales/ru/product.json';
import ruCart from './locales/ru/cart.json';
import ruWishlist from './locales/ru/wishlist.json';
import ruFaq from './locales/ru/faq.json';
import ruExchange from './locales/ru/exchange.json';
import ruErrors from './locales/ru/errors.json';
import ruFooter from './locales/ru/footer.json';

import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enMarketplace from './locales/en/marketplace.json';
import enProduct from './locales/en/product.json';
import enCart from './locales/en/cart.json';
import enWishlist from './locales/en/wishlist.json';
import enFaq from './locales/en/faq.json';
import enExchange from './locales/en/exchange.json';
import enErrors from './locales/en/errors.json';
import enFooter from './locales/en/footer.json';

function getSavedLanguage(): string {
  try {
    const raw = localStorage.getItem('skinvault-language');
    if (!raw) return 'ru';
    const parsed = JSON.parse(raw);
    return parsed?.state?.language || 'ru';
  } catch {
    return 'ru';
  }
}

i18n.use(initReactI18next).init({
  resources: {
    ru: {
      common: ruCommon,
      home: ruHome,
      marketplace: ruMarketplace,
      product: ruProduct,
      cart: ruCart,
      wishlist: ruWishlist,
      faq: ruFaq,
      exchange: ruExchange,
      errors: ruErrors,
      footer: ruFooter,
    },
    en: {
      common: enCommon,
      home: enHome,
      marketplace: enMarketplace,
      product: enProduct,
      cart: enCart,
      wishlist: enWishlist,
      faq: enFaq,
      exchange: enExchange,
      errors: enErrors,
      footer: enFooter,
    },
  },
  lng: getSavedLanguage(),
  fallbackLng: 'ru',
  defaultNS: 'common',
  ns: ['common', 'home', 'marketplace', 'product', 'cart', 'wishlist', 'faq', 'exchange', 'errors', 'footer'],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
