import { motion } from 'framer-motion';
import { FiRefreshCw, FiWifiOff } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface FetchErrorProps {
  onRetry: () => void;
  className?: string;
}

export function FetchError({ onRetry, className = '' }: FetchErrorProps) {
  const { t } = useTranslation('errors');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center text-center py-24 px-6 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 flex items-center justify-center mb-6">
        <FiWifiOff size={28} className="text-[#ff6b6b]" />
      </div>
      <h2 className="text-xl font-bold font-exo2 text-white mb-2">
        {t('loadError.title')}
      </h2>
      <p className="text-[#6b6b7b] text-sm mb-8 max-w-xs">
        {t('loadError.desc')}
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 bg-[#252540] border border-[#3a3a5a] rounded-xl text-[#a0a0b0] hover:text-white hover:border-[#00d9ff] transition font-medium"
      >
        <FiRefreshCw size={15} />
        {t('loadError.retry')}
      </button>
    </motion.div>
  );
}
