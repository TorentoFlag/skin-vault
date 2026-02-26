import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShield, FiZap, FiUsers } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export function HeroSection() {
  const { t } = useTranslation('home');

  return (
    <section className="relative min-h-[85vh] flex flex-col overflow-hidden animated-gradient pt-hero">
      {/* Decorative neon circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00d9ff]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#00ff88]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#aa44ff]/3 rounded-full blur-3xl pointer-events-none" />

      <div className="flex-1 flex items-center justify-center">
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#00d9ff]/10 border border-[#00d9ff]/30 rounded-full text-[#00d9ff] text-sm mb-6"
        >
          <span className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
          {t('hero.badge')}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl tablet:text-6xl laptop:text-7xl font-bold font-exo2 leading-tight mb-4"
        >
          <span className="text-white">{t('hero.titleLine1')}</span>
          <br />
          <span className="gradient-text">{t('hero.titleLine2')}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[#a0a0b0] text-lg tablet:text-xl max-w-2xl mx-auto mb-8"
        >
         {t('hero.subtitle')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col mobile-lg:flex-row items-center justify-center gap-4 mb-12"
        >
          <Link
            to="/marketplace"
            className="flex items-center gap-2 bg-gradient-to-r from-[#00d9ff] to-[#00ff88] px-8 py-4 rounded-xl text-black font-bold text-lg hover:shadow-[0_0_30px_rgba(0,217,255,0.5)] transition-all duration-300 hover:scale-105"
          >
            {t('common:actions.viewCatalog')} <FiArrowRight size={20} />
          </Link>
          <Link
            to="/faq"
            className="flex items-center gap-2 px-8 py-4 rounded-xl border border-[#3a3a5a] text-[#a0a0b0] hover:text-white hover:border-[#6b6b7b] transition font-medium text-lg"
          >
            {t('common:actions.howItWorks')}
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-3 gap-4 max-w-lg mx-auto"
        >
          {[
            { icon: <FiUsers />, value: '5K+', label: t('hero.stats.users') },
            { icon: <FiZap />, value: '20K+', label: t('hero.stats.trades') },
            { icon: <FiShield />, value: '100%', label: t('hero.stats.secure') },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center gap-1 p-4 bg-[#252540]/50 rounded-xl border border-[#3a3a5a]">
              <div className="text-[#00d9ff] text-xl">{stat.icon}</div>
              <div className="text-white font-bold font-exo2 text-2xl">{stat.value}</div>
              <div className="text-[#6b6b7b] text-xs">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
      </div>

      {/* Gradient fade to main bg */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#0f0f1a] pointer-events-none" />
    </section>
  );
}
