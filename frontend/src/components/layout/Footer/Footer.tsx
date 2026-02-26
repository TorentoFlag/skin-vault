import { useNavigate } from 'react-router-dom';
import { useFilterStore } from '../../../store/useFilterStore';
import { useTranslation } from 'react-i18next';

const categoryWeapons: Record<string, string[]> = {
  rifles: ['AK-47', 'M4A4', 'M4A1-S', 'AWP', 'SG 553', 'FAMAS', 'Galil AR', 'Scout'],
  pistols: ['USP-S', 'Glock-18', 'Desert Eagle'],
  smgs: ['MP9', 'MAC-10', 'P90'],
  heavy: ['Nova', 'XM1014'],
};

export function Footer() {
  const { t } = useTranslation('footer');
  const navigate = useNavigate();
  const { resetFilters, setWeapons } = useFilterStore();

  const handleCategoryClick = (category: string) => {
    resetFilters();
    const weapons = categoryWeapons[category];
    if (weapons) {
      setWeapons(weapons);
    }
    navigate('/marketplace');
  };
  return (
    <footer className="bg-[#0f0f1a] border-t border-[#3a3a5a] mt-20">
      <div className="max-w-[1600px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 tablet:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 tablet:col-span-1">
            <div className="text-2xl font-bold font-exo2 bg-gradient-to-r from-[#00d9ff] to-[#00ff88] bg-clip-text text-transparent mb-3">
              SkinVault
            </div>
            <p className="text-[#6b6b7b] text-sm leading-relaxed">
              {t('brand')}
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="font-semibold text-white mb-4 font-exo2 text-lg">{t('shop.title')}</h4>
            <ul className="space-y-2">
              {(['all', 'rifles', 'pistols', 'smgs', 'heavy'] as const).map(key => (
                <li key={key}>
                  <button onClick={() => handleCategoryClick(key)} className="text-[#6b6b7b] hover:text-[#00d9ff] transition text-sm">{t(`shop.${key}`)}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4 font-exo2 text-lg">{t('support.title')}</h4>
            <ul className="space-y-2">
              {[
                { label: t('support.faq'), path: '/faq' },
                { label: t('support.howToBuy'), path: '/faq?section=market' },
                { label: t('support.steamTrade'), path: '/faq?section=exchange' },
              ].map(item => (
                <li key={item.label}>
                  <button onClick={() => navigate(item.path)} className="text-[#6b6b7b] hover:text-[#00d9ff] transition text-sm">{item.label}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4 className="font-semibold text-white mb-4 font-exo2 text-lg">{t('why.title')}</h4>
            <div className="space-y-3">
              {([
                { icon: '🔒', key: 'steamVerification' },
                { icon: '⚡', key: 'instantDelivery' },
                { icon: '🛡️', key: 'deals' },
              ] as const).map(item => (
                <div key={item.key} className="flex items-start gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-white">{t(`why.${item.key}.label`)}</div>
                    <div className="text-xs text-[#6b6b7b]">{t(`why.${item.key}.desc`)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#3a3a5a] flex flex-col tablet:flex-row items-center justify-between gap-4">
          <p className="text-[#6b6b7b] text-xs">&copy; 2026 SkinVault.</p>
        </div>
      </div>
    </footer>
  );
}
