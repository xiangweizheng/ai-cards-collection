import { PriceLevel, CardRarity } from '@/types';

/**
 * 根据价格获取价格等级
 */
export function getPriceLevelFromPrice(price?: number): PriceLevel {
  if (!price || price === 0) return PriceLevel.FREE;
  if (price <= 50) return PriceLevel.BUDGET;
  if (price <= 200) return PriceLevel.STANDARD;
  if (price <= 500) return PriceLevel.PREMIUM;
  return PriceLevel.ENTERPRISE;
}

/**
 * 根据价格等级获取稀有度（用于向后兼容）
 */
export function getRarityFromPriceLevel(priceLevel: PriceLevel): CardRarity {
  switch (priceLevel) {
    case PriceLevel.FREE:
    case PriceLevel.BUDGET:
      return CardRarity.COMMON;
    case PriceLevel.STANDARD:
      return CardRarity.RARE;
    case PriceLevel.PREMIUM:
      return CardRarity.EPIC;
    case PriceLevel.ENTERPRISE:
      return CardRarity.LEGENDARY;
    default:
      return CardRarity.COMMON;
  }
}

/**
 * 根据价格获取稀有度
 */
export function getRarityFromPrice(price?: number): CardRarity {
  const priceLevel = getPriceLevelFromPrice(price);
  return getRarityFromPriceLevel(priceLevel);
}

/**
 * 获取价格等级的显示信息
 */
export function getPriceLevelInfo(priceLevel: PriceLevel) {
  const info = {
    [PriceLevel.FREE]: {
      label: '免费',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      range: '¥0'
    },
    [PriceLevel.BUDGET]: {
      label: '经济型',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      range: '¥1-50'
    },
    [PriceLevel.STANDARD]: {
      label: '标准型',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      range: '¥51-200'
    },
    [PriceLevel.PREMIUM]: {
      label: '高级型',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      range: '¥201-500'
    },
    [PriceLevel.ENTERPRISE]: {
      label: '企业级',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      range: '¥500+'
    }
  };

  return info[priceLevel];
}

/**
 * 格式化价格显示
 */
export function formatPrice(price?: number): string {
  if (!price || price === 0) return '免费';
  return `¥${price.toLocaleString()}`;
}

/**
 * 用$$$$符号表示价格等级
 */
export function formatPriceLevel(price?: number): string {
  if (!price || price === 0) return '免费';

  const priceLevel = getPriceLevelFromPrice(price);

  switch (priceLevel) {
    case PriceLevel.FREE:
      return '免费';
    case PriceLevel.BUDGET:
      return '$';
    case PriceLevel.STANDARD:
      return '$$';
    case PriceLevel.PREMIUM:
      return '$$$';
    case PriceLevel.ENTERPRISE:
      return '$$$$';
    default:
      return '$';
  }
}

/**
 * 计算卡组总价值
 */
export function calculateDeckValue(cards: Array<{ price?: number }>): number {
  return cards.reduce((total, card) => total + (card.price || 0), 0);
}

/**
 * 获取卡组价格等级（基于总价值）
 */
export function getDeckPriceLevel(totalValue: number): PriceLevel {
  return getPriceLevelFromPrice(totalValue);
}
