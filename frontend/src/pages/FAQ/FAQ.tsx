import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUser, FiRepeat, FiShoppingBag, FiChevronDown, FiMenu, FiX } from 'react-icons/fi';
import { Input } from '../../components/common/Input/Input';
import { useTranslation } from 'react-i18next';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: FaqItem[];
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  auth: <FiUser size={18} />,
  exchange: <FiRepeat size={18} />,
  market: <FiShoppingBag size={18} />,
  exchange_block: <FiShoppingBag size={18} />,
  prices: <FiShoppingBag size={18} />,
};

const SECTION_IDS = ['auth', 'exchange', 'market', 'exchange_block', 'prices'] as const;

function AccordionItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-[#3a3a5a] rounded-xl overflow-hidden transition-colors hover:border-[#00d9ff]/40">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-5 text-left"
      >
        <span className={`font-medium text-sm pr-4 transition-colors ${isOpen ? 'text-[#00d9ff]' : 'text-white'}`}>
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <FiChevronDown size={18} className={isOpen ? 'text-[#00d9ff]' : 'text-[#6b6b7b]'} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-sm text-[#a0a0b0] leading-relaxed border-t border-[#2a2a3a] pt-4">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const { t } = useTranslation('faq');
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('auth');
  const [searchQuery, setSearchQuery] = useState('');
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const faqSections: FaqSection[] = useMemo(() =>
    SECTION_IDS.map(id => ({
      id,
      title: t(`sections.${id}.title`),
      icon: SECTION_ICONS[id],
      items: (t(`sections.${id}.items`, { returnObjects: true }) as FaqItem[]) || [],
    })),
    [t]
  );

  useEffect(() => {
    const section = searchParams.get('section');
    if (section && faqSections.some(s => s.id === section)) {
      setActiveSection(section);
      setOpenQuestion(null);
      setSearchQuery('');
    }
  }, [searchParams, faqSections]);

  const currentSection = faqSections.find(s => s.id === activeSection)!;

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return currentSection.items;
    const q = searchQuery.toLowerCase();
    return currentSection.items.filter(
      item =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
    );
  }, [searchQuery, currentSection]);

  const allFilteredSections = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const results: { section: FaqSection; items: FaqItem[] }[] = [];
    for (const section of faqSections) {
      const matched = section.items.filter(
        item =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q)
      );
      if (matched.length > 0) {
        results.push({ section, items: matched });
      }
    }
    return results;
  }, [searchQuery, faqSections]);

  const handleSectionClick = (id: string) => {
    setActiveSection(id);
    setOpenQuestion(null);
    setSearchQuery('');
    setMobileNavOpen(false);
  };

  const totalResults = allFilteredSections
    ? allFilteredSections.reduce((sum, s) => sum + s.items.length, 0)
    : filteredItems.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-page pb-10"
    >
      <div className="max-w-[1600px] mx-auto px-4 laptop:px-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-exo2 text-white">
            {t('title')}
          </h1>
          <p className="text-[#6b6b7b] mt-1">{t('subtitle')}</p>
        </div>

        {/* Mobile search (always visible) */}
        <div className="laptop:hidden mb-4">
          <Input
            icon={<FiSearch size={14} />}
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setMobileNavOpen(false); }}
            placeholder={t('common:search.searchFaq')}
          />
        </div>

        {/* Mobile section toggle */}
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="laptop:hidden flex items-center gap-2 w-full mb-4 px-4 py-3 bg-[#1a1a2e] border border-[#3a3a5a] rounded-xl text-white text-sm"
        >
          {mobileNavOpen ? <FiX size={16} /> : <FiMenu size={16} />}
          <span>{t('common:sections')}</span>
          <span className="ml-auto text-[#6b6b7b]">{currentSection.title}</span>
        </button>

        {/* Layout */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside
            className={`
              ${mobileNavOpen ? 'block' : 'hidden'} laptop:block
              w-full laptop:w-[280px] flex-shrink-0
              bg-[#1a1a2e] border border-[#3a3a5a] rounded-2xl p-5
              h-fit sticky top-[90px]
              ${mobileNavOpen ? 'absolute z-30 left-4 right-4 laptop:relative laptop:left-auto laptop:right-auto' : ''}
            `}
          >
            {/* Search (desktop only — mobile search is above) */}
            <div className="mb-5 hidden laptop:block">
              <Input
                icon={<FiSearch size={14} />}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('common:search.searchFaq')}
              />
            </div>

            {/* Section navigation */}
            <nav className="flex flex-col gap-1">
              <span className="text-xs text-[#6b6b7b] uppercase tracking-wider mb-2 font-medium">
                {t('common:sections')}
              </span>
              {faqSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all
                    ${
                      activeSection === section.id && !searchQuery
                        ? 'bg-[#00d9ff]/10 text-[#00d9ff] border border-[#00d9ff]/30'
                        : 'text-[#a0a0b0] hover:bg-[#252540] hover:text-white border border-transparent'
                    }
                  `}
                >
                  <span className="flex-shrink-0">{section.icon}</span>
                  <span className="font-medium">{section.title}</span>
                  <span className="ml-auto text-xs text-[#6b6b7b]">
                    {section.items.length}
                  </span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {searchQuery.trim() && allFilteredSections ? (
                /* Search results across all sections */
                <motion.div
                  key="search-results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-6 p-4 bg-[#1a1a2e] rounded-xl border border-[#3a3a5a]">
                    <FiSearch size={16} className="text-[#6b6b7b]" />
                    <span className="text-sm text-[#a0a0b0]">
                      {t('searchResults.found')} <span className="text-white font-medium">{totalResults}</span> {t('searchResults.resultsFor')}
                      {' '}«<span className="text-[#00d9ff]">{searchQuery}</span>»
                    </span>
                  </div>

                  {allFilteredSections.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-[#6b6b7b] text-5xl mb-4">🔍</div>
                      <p className="text-[#6b6b7b] text-lg">{t('searchResults.nothing')}</p>
                      <p className="text-[#6b6b7b] text-sm mt-1">
                        {t('searchResults.tryAnother')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {allFilteredSections.map(({ section, items }) => (
                        <div key={section.id}>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-[#00d9ff]">{section.icon}</span>
                            <h2 className="text-lg font-bold font-exo2 text-white">
                              {section.title}
                            </h2>
                          </div>
                          <div className="space-y-3">
                            {items.map((item, idx) => (
                              <AccordionItem
                                key={`${section.id}-${idx}`}
                                item={item}
                                isOpen={openQuestion === idx && activeSection === section.id}
                                onToggle={() => {
                                  setActiveSection(section.id);
                                  setOpenQuestion(
                                    openQuestion === idx && activeSection === section.id ? null : idx
                                  );
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                /* Normal section view */
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-6 p-4 bg-[#1a1a2e] rounded-xl border border-[#3a3a5a]">
                    <span className="text-[#00d9ff]">{currentSection.icon}</span>
                    <h2 className="text-lg font-bold font-exo2 text-white">
                      {currentSection.title}
                    </h2>
                    <span className="text-sm text-[#6b6b7b] ml-auto">
                      {t('common:questions', { count: filteredItems.length })}
                    </span>
                  </div>

                  {/* FAQ items */}
                  <div className="space-y-3">
                    {filteredItems.map((item, idx) => (
                      <AccordionItem
                        key={idx}
                        item={item}
                        isOpen={openQuestion === idx}
                        onToggle={() => setOpenQuestion(openQuestion === idx ? null : idx)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
