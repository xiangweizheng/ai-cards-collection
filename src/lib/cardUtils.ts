import { Card, CardType, CardRarity, SearchFilters } from '@/types';

// 卡片稀有度权重（用于随机生成）
const RARITY_WEIGHTS = {
  [CardRarity.COMMON]: 60,
  [CardRarity.RARE]: 25,
  [CardRarity.EPIC]: 12,
  [CardRarity.LEGENDARY]: 3
};

// 卡片稀有度颜色映射
export const RARITY_COLORS = {
  [CardRarity.COMMON]: {
    bg: 'bg-white',
    border: 'border-gray-400',
    text: 'text-gray-800',
    glow: 'shadow-md',
    accent: 'bg-gray-500'
  },
  [CardRarity.RARE]: {
    bg: 'bg-white',
    border: 'border-blue-400',
    text: 'text-blue-800',
    glow: 'shadow-md shadow-blue-200',
    accent: 'bg-blue-500'
  },
  [CardRarity.EPIC]: {
    bg: 'bg-white',
    border: 'border-purple-400',
    text: 'text-purple-800',
    glow: 'shadow-md shadow-purple-200',
    accent: 'bg-purple-500'
  },
  [CardRarity.LEGENDARY]: {
    bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    border: 'border-yellow-500',
    text: 'text-yellow-900',
    glow: 'shadow-lg shadow-yellow-300',
    accent: 'bg-gradient-to-r from-yellow-500 to-orange-500'
  }
};

// 卡片类型图标映射
export const TYPE_ICONS = {
  [CardType.GITHUB_REPO]: '🐙',
  [CardType.TOOL_WEBSITE]: '🛠️',
  [CardType.PROMPT_SHARE]: '💬',
  [CardType.CUSTOM]: '📝'
};

// 卡片类型标签映射
export const TYPE_LABELS = {
  [CardType.GITHUB_REPO]: 'GitHub仓库',
  [CardType.TOOL_WEBSITE]: '工具网站',
  [CardType.PROMPT_SHARE]: 'Prompt分享',
  [CardType.CUSTOM]: '自定义'
};

// 稀有度标签映射
export const RARITY_LABELS = {
  [CardRarity.COMMON]: '普通',
  [CardRarity.RARE]: '稀有',
  [CardRarity.EPIC]: '史诗',
  [CardRarity.LEGENDARY]: '传说'
};

// 根据URL判断卡片类型
export function detectCardType(url: string): CardType {
  if (url.includes('github.com')) {
    return CardType.GITHUB_REPO;
  }
  if (url.includes('prompt') || url.includes('chatgpt') || url.includes('claude')) {
    return CardType.PROMPT_SHARE;
  }
  return CardType.TOOL_WEBSITE;
}

// 随机生成卡片稀有度
export function generateRandomRarity(): CardRarity {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    cumulative += weight;
    if (random <= cumulative) {
      return rarity as CardRarity;
    }
  }
  
  return CardRarity.COMMON;
}

// 根据内容智能判断稀有度
export function detectCardRarity(card: Partial<Card>): CardRarity {
  let score = 0;
  
  // GitHub仓库特殊判断
  if (card.type === CardType.GITHUB_REPO && card.metadata) {
    const stars = card.metadata.stars || 0;
    if (stars > 10000) score += 30;
    else if (stars > 1000) score += 20;
    else if (stars > 100) score += 10;
  }
  
  // 标签数量影响稀有度
  const tagCount = card.tags?.length || 0;
  score += Math.min(tagCount * 2, 10);
  
  // 描述长度影响稀有度
  const descLength = card.description?.length || 0;
  if (descLength > 200) score += 10;
  else if (descLength > 100) score += 5;
  
  // 是否有图片
  if (card.imageUrl) score += 5;
  
  // 根据分数确定稀有度
  if (score >= 40) return CardRarity.LEGENDARY;
  if (score >= 25) return CardRarity.EPIC;
  if (score >= 15) return CardRarity.RARE;
  return CardRarity.COMMON;
}

// 过滤卡片
export function filterCards(cards: Card[], filters: SearchFilters): Card[] {
  return cards.filter(card => {
    // 类型过滤
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(card.type)) return false;
    }
    
    // 稀有度过滤
    if (filters.rarity && filters.rarity.length > 0) {
      if (!filters.rarity.includes(card.rarity)) return false;
    }
    
    // 标签过滤
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        card.tags.some(cardTag => 
          cardTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
      if (!hasMatchingTag) return false;
    }
    
    // 关键词搜索
    if (filters.query && filters.query.trim()) {
      const query = filters.query.toLowerCase();
      const searchableText = [
        card.title,
        card.description,
        ...card.tags
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) return false;
    }
    
    // 日期范围过滤
    if (filters.dateRange) {
      const cardDate = new Date(card.createdAt);
      if (filters.dateRange.start && cardDate < filters.dateRange.start) return false;
      if (filters.dateRange.end && cardDate > filters.dateRange.end) return false;
    }
    
    return true;
  });
}

// 排序卡片
export function sortCards(cards: Card[], sortBy: 'date' | 'title' | 'rarity' | 'type', order: 'asc' | 'desc' = 'desc'): Card[] {
  const sorted = [...cards].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'rarity':
        const rarityOrder = [CardRarity.COMMON, CardRarity.RARE, CardRarity.EPIC, CardRarity.LEGENDARY];
        comparison = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}

// 获取卡片统计信息
export function getCardStats(cards: Card[]) {
  const stats = {
    total: cards.length,
    byType: {} as Record<CardType, number>,
    byRarity: {} as Record<CardRarity, number>,
    recentCount: 0
  };
  
  // 初始化计数器
  Object.values(CardType).forEach(type => {
    stats.byType[type] = 0;
  });
  
  Object.values(CardRarity).forEach(rarity => {
    stats.byRarity[rarity] = 0;
  });
  
  // 计算统计
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  cards.forEach(card => {
    stats.byType[card.type]++;
    stats.byRarity[card.rarity]++;
    
    if (new Date(card.createdAt) > oneWeekAgo) {
      stats.recentCount++;
    }
  });
  
  return stats;
}

// 提取常用标签
export function extractPopularTags(cards: Card[], limit: number = 10): Array<{tag: string, count: number}> {
  const tagCounts = new Map<string, number>();
  
  cards.forEach(card => {
    card.tags.forEach(tag => {
      const normalizedTag = tag.toLowerCase().trim();
      tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
    });
  });
  
  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// 验证卡片数据
export function validateCard(card: Partial<Card>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!card.title || card.title.trim().length === 0) {
    errors.push('标题不能为空');
  }
  
  if (!card.description || card.description.trim().length === 0) {
    errors.push('描述不能为空');
  }
  
  if (!card.type || !Object.values(CardType).includes(card.type)) {
    errors.push('卡片类型无效');
  }
  
  if (!card.rarity || !Object.values(CardRarity).includes(card.rarity)) {
    errors.push('稀有度无效');
  }
  
  if (card.url && !isValidUrl(card.url)) {
    errors.push('URL格式无效');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// 验证URL格式
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
