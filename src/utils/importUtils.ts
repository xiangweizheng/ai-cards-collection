import { Card, CardDeck, CardType, CardRarity, ImportData, ImportCardData, ImportDeckData } from '@/types';
import { getRarityFromPrice } from './priceUtils';

/**
 * 生成唯一ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 验证卡片数据
 */
function validateCardData(data: any): ImportCardData | null {
  if (!data || typeof data !== 'object') return null;
  if (!data.title || typeof data.title !== 'string') return null;
  if (!data.description || typeof data.description !== 'string') return null;

  return {
    title: data.title.trim(),
    description: data.description.trim(),
    type: data.type && Object.values(CardType).includes(data.type) ? data.type : CardType.TOOL,
    rarity: data.rarity && Object.values(CardRarity).includes(data.rarity) ? data.rarity : undefined,
    price: typeof data.price === 'number' && data.price >= 0 ? data.price : undefined,
    url: data.url && typeof data.url === 'string' ? data.url.trim() : undefined,
    imageUrl: data.imageUrl && typeof data.imageUrl === 'string' ? data.imageUrl.trim() : undefined,
    tags: Array.isArray(data.tags) ? data.tags.filter(tag => typeof tag === 'string').map(tag => tag.trim()) : []
  };
}

/**
 * 验证卡组数据
 */
function validateDeckData(data: any): ImportDeckData | null {
  if (!data || typeof data !== 'object') return null;
  if (!data.name || typeof data.name !== 'string') return null;
  if (!data.description || typeof data.description !== 'string') return null;

  const cards = Array.isArray(data.cards) 
    ? data.cards.map(validateCardData).filter(Boolean) as ImportCardData[]
    : [];

  return {
    name: data.name.trim(),
    description: data.description.trim(),
    isPublic: typeof data.isPublic === 'boolean' ? data.isPublic : false,
    tags: Array.isArray(data.tags) ? data.tags.filter(tag => typeof tag === 'string').map(tag => tag.trim()) : [],
    cards
  };
}

/**
 * 将导入的卡片数据转换为完整的Card对象
 */
export function convertImportCardToCard(importCard: ImportCardData): Card {
  const now = new Date();
  const rarity = importCard.rarity || getRarityFromPrice(importCard.price);
  
  return {
    id: generateId(),
    title: importCard.title,
    description: importCard.description,
    type: importCard.type || CardType.TOOL,
    rarity,
    price: importCard.price,
    url: importCard.url,
    imageUrl: importCard.imageUrl,
    tags: importCard.tags || [],
    createdAt: now,
    updatedAt: now,
    metadata: {}
  };
}

/**
 * 将导入的卡组数据转换为完整的CardDeck对象
 */
export function convertImportDeckToDeck(importDeck: ImportDeckData, cardIds: string[] = []): CardDeck {
  const now = new Date();
  
  return {
    id: generateId(),
    name: importDeck.name,
    description: importDeck.description,
    cardIds,
    isPublic: importDeck.isPublic || false,
    tags: importDeck.tags || [],
    createdAt: now,
    updatedAt: now
  };
}

/**
 * 解析JSON导入数据
 */
export function parseImportData(jsonString: string): ImportData | null {
  try {
    const data = JSON.parse(jsonString);
    
    // 支持单个卡片导入
    if (data.title && data.description) {
      const card = validateCardData(data);
      return card ? { cards: [card] } : null;
    }
    
    // 支持单个卡组导入
    if (data.name && data.description && !data.title) {
      const deck = validateDeckData(data);
      return deck ? { decks: [deck] } : null;
    }
    
    // 支持批量导入
    const result: ImportData = {};
    
    if (Array.isArray(data.cards)) {
      const validCards = data.cards.map(validateCardData).filter(Boolean) as ImportCardData[];
      if (validCards.length > 0) {
        result.cards = validCards;
      }
    }
    
    if (Array.isArray(data.decks)) {
      const validDecks = data.decks.map(validateDeckData).filter(Boolean) as ImportDeckData[];
      if (validDecks.length > 0) {
        result.decks = validDecks;
      }
    }
    
    return Object.keys(result).length > 0 ? result : null;
  } catch (error) {
    console.error('JSON解析失败:', error);
    return null;
  }
}

/**
 * 导入卡片和卡组
 */
export function importCardsAndDecks(
  importData: ImportData,
  existingCards: Card[] = [],
  existingDecks: CardDeck[] = []
): { cards: Card[], decks: CardDeck[], summary: { cardsAdded: number, decksAdded: number } } {
  const newCards: Card[] = [...existingCards];
  const newDecks: CardDeck[] = [...existingDecks];
  let cardsAdded = 0;
  let decksAdded = 0;

  // 导入卡片
  if (importData.cards) {
    for (const importCard of importData.cards) {
      const card = convertImportCardToCard(importCard);
      // 检查是否已存在相同标题的卡片
      const exists = newCards.some(existingCard => 
        existingCard.title.toLowerCase() === card.title.toLowerCase()
      );
      
      if (!exists) {
        newCards.push(card);
        cardsAdded++;
      }
    }
  }

  // 导入卡组
  if (importData.decks) {
    for (const importDeck of importData.decks) {
      // 先导入卡组中的卡片
      const deckCardIds: string[] = [];
      
      if (importDeck.cards) {
        for (const importCard of importDeck.cards) {
          const card = convertImportCardToCard(importCard);
          // 检查是否已存在相同标题的卡片
          let existingCard = newCards.find(existingCard => 
            existingCard.title.toLowerCase() === card.title.toLowerCase()
          );
          
          if (!existingCard) {
            newCards.push(card);
            existingCard = card;
            cardsAdded++;
          }
          
          deckCardIds.push(existingCard.id);
        }
      }
      
      // 创建卡组
      const deck = convertImportDeckToDeck(importDeck, deckCardIds);
      // 检查是否已存在相同名称的卡组
      const exists = newDecks.some(existingDeck => 
        existingDeck.name.toLowerCase() === deck.name.toLowerCase()
      );
      
      if (!exists) {
        newDecks.push(deck);
        decksAdded++;
      }
    }
  }

  return {
    cards: newCards,
    decks: newDecks,
    summary: { cardsAdded, decksAdded }
  };
}

/**
 * 生成单个卡片导出数据
 */
export function generateCardExportData(card: Card): string {
  const exportData = {
    title: card.title,
    description: card.description,
    type: card.type,
    rarity: card.rarity,
    price: card.price,
    url: card.url,
    imageUrl: card.imageUrl,
    tags: card.tags
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * 生成单个卡组导出数据
 */
export function generateDeckExportData(deck: CardDeck, cards: Card[]): string {
  const exportData = {
    name: deck.name,
    description: deck.description,
    isPublic: deck.isPublic,
    tags: deck.tags,
    cards: deck.cardIds.map(cardId => {
      const card = cards.find(c => c.id === cardId);
      return card ? {
        title: card.title,
        description: card.description,
        type: card.type,
        rarity: card.rarity,
        price: card.price,
        url: card.url,
        imageUrl: card.imageUrl,
        tags: card.tags
      } : null;
    }).filter(Boolean)
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * 生成批量导出数据
 */
export function generateExportData(cards: Card[], decks: CardDeck[]): string {
  const exportData = {
    cards: cards.map(card => ({
      title: card.title,
      description: card.description,
      type: card.type,
      rarity: card.rarity,
      price: card.price,
      url: card.url,
      imageUrl: card.imageUrl,
      tags: card.tags
    })),
    decks: decks.map(deck => ({
      name: deck.name,
      description: deck.description,
      isPublic: deck.isPublic,
      tags: deck.tags,
      cards: deck.cardIds.map(cardId => {
        const card = cards.find(c => c.id === cardId);
        return card ? {
          title: card.title,
          description: card.description,
          type: card.type,
          rarity: card.rarity,
          price: card.price,
          url: card.url,
          imageUrl: card.imageUrl,
          tags: card.tags
        } : null;
      }).filter(Boolean)
    }))
  };

  return JSON.stringify(exportData, null, 2);
}
