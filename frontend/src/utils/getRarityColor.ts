import type { Rarity, Quality } from '../@types';

export function getRarityColor(rarity: Rarity): string {
  const map: Record<Rarity, string> = {
    'Consumer': '#b0c3d9',
    'Industrial': '#44aaff',
    'Mil-Spec': '#4444ff',
    'Restricted': '#aa44ff',
    'Classified': '#ff44ff',
    'Covert': '#ff4444',
    'Contraband': '#e4ae39',
  };
  return map[rarity] || '#b0c3d9';
}

export function getQualityColor(quality: Quality): string {
  const map: Record<Quality, string> = {
    'FN': '#00ff88',
    'MW': '#88ff00',
    'FT': '#ffaa00',
    'WW': '#ff6600',
    'BS': '#ff4444',
  };
  return map[quality] || '#ffffff';
}

export function getQualityLabel(quality: Quality): string {
  const map: Record<Quality, string> = {
    'FN': 'Factory New',
    'MW': 'Minimal Wear',
    'FT': 'Field-Tested',
    'WW': 'Well-Worn',
    'BS': 'Battle-Scarred',
  };
  return map[quality];
}

export function getRarityGlow(rarity: Rarity): string {
  const color = getRarityColor(rarity);
  return `0 0 20px ${color}40, 0 0 40px ${color}20`;
}
