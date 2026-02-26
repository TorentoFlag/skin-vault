import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: string;
  className?: string;
  variant?: 'solid' | 'outline' | 'glow';
}

export function Badge({ children, color = '#00d9ff', className = '', variant = 'solid' }: BadgeProps) {
  const baseStyle = {
    ...(variant === 'solid' ? { backgroundColor: `${color}20`, color, border: `1px solid ${color}40` } : {}),
    ...(variant === 'outline' ? { backgroundColor: 'transparent', color, border: `1px solid ${color}` } : {}),
    ...(variant === 'glow' ? { backgroundColor: `${color}20`, color, border: `1px solid ${color}40`, boxShadow: `0 0 8px ${color}40` } : {}),
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${className}`}
      style={baseStyle}
    >
      {children}
    </span>
  );
}

export function QualityBadge({ quality }: { quality: string }) {
  const colors: Record<string, string> = {
    FN: '#00ff88', MW: '#88ff00', FT: '#ffaa00', WW: '#ff6600', BS: '#ff4444',
  };
  return <Badge color={colors[quality] || '#fff'} variant="glow">{quality}</Badge>;
}

export function RarityBadge({ rarity }: { rarity: string }) {
  const colors: Record<string, string> = {
    'Consumer': '#b0c3d9',
    'Industrial': '#44aaff',
    'Mil-Spec': '#4444ff',
    'Restricted': '#aa44ff',
    'Classified': '#ff44ff',
    'Covert': '#ff4444',
    'Contraband': '#e4ae39',
  };
  return <Badge color={colors[rarity] || '#fff'} variant="glow">{rarity}</Badge>;
}

export function NewBadge() {
  return <Badge color="#00d9ff" variant="glow">NEW</Badge>;
}

export function StatTrakBadge() {
  return <Badge color="#e4ae39" variant="glow">StatTrak™</Badge>;
}

export function DiscountBadge({ discount }: { discount: number }) {
  return <Badge color="#ff6b6b" variant="solid">-{discount}%</Badge>;
}
