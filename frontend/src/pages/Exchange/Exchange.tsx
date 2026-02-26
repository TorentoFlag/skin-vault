import { motion } from 'framer-motion';
import { FiLock, FiRefreshCw } from 'react-icons/fi';
import { FaSteam } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export function Exchange() {
  const { t } = useTranslation('exchange');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-page flex flex-col items-center justify-center text-center px-4 pb-20"
    >
      {/* Icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-[#252540] border border-[#3a3a5a] flex items-center justify-center">
          <FiRefreshCw className="text-[#00d9ff]" size={40} />
        </div>
        <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-[#1a1a2e] border border-[#3a3a5a] flex items-center justify-center">
          <FiLock className="text-[#ff6b6b]" size={18} />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl tablet:text-4xl font-bold font-exo2 text-white mb-3">
        {t('title')}
      </h1>
      <p className="text-[#a0a0b0] max-w-md mb-8 leading-relaxed">
        {t('desc')}
      </p>

      {/* Auth card */}
      <div className="bg-gradient-to-br from-[#252540] to-[#1f1f3a] rounded-2xl p-8 border border-[#3a3a5a] max-w-sm w-full">
        <FiLock className="text-[#ff6b6b] mx-auto mb-4" size={28} />
        <h2 className="text-white font-semibold text-lg mb-2">{t('authRequired')}</h2>
        <p className="text-[#6b6b7b] text-sm mb-6">
          {t('authDesc')}
        </p>
        <button className="w-full flex items-center justify-center gap-3 bg-[#171a21] hover:bg-[#1b2838] border border-[#3a3a5a] hover:border-[#66c0f4] px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200">
          <FaSteam size={22} />
          {t('common:auth.loginSteam')}
        </button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4 mt-12 max-w-2xl w-full">
        {(['p2p', 'security', 'fast'] as const).map((key, i) => (
          <div key={key} className="bg-[#252540] rounded-xl p-4 border border-[#3a3a5a]">
            <div className="text-2xl mb-2">{['🔄', '🛡️', '⚡'][i]}</div>
            <div className="text-white font-medium text-sm">{t(`features.${key}.title`)}</div>
            <div className="text-[#6b6b7b] text-xs mt-1">{t(`features.${key}.desc`)}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
