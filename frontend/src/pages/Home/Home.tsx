import { motion } from 'framer-motion';
import { HeroSection } from './HeroSection';
import { PopularSkins } from './PopularSkins';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export function Home() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <HeroSection />
      <PopularSkins />
    </motion.div>
  );
}
