import { useIsDesktop } from '../../../hooks/useMediaQuery';
import { HeaderDesktop } from './HeaderDesktop';
import { HeaderMobile } from './HeaderMobile';

export function Header() {
  const isDesktop = useIsDesktop();
  return isDesktop ? <HeaderDesktop /> : <HeaderMobile />;
}
