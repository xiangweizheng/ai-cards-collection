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
function validateCardData(data: unknown): ImportCardData | null {
  if (!data || typeof data !== 'object') return null;
  const dataObj = data as Record<string, unknown>;
  if (!dataObj.title || typeof dataObj.title !== 'string') return null;
  if (!dataObj.description || typeof dataObj.description !== 'string') return null;

  return {
    title: dataObj.title.trim(),
    description: dataObj.description.trim(),
    type: dataObj.type && Object.values(CardType).includes(dataObj.type as CardType) ? dataObj.type as CardType : CardType.CUSTOM,
    rarity: dataObj.rarity && Object.values(CardRarity).includes(dataObj.rarity as CardRarity) ? dataObj.rarity as CardRarity : undefined,
    price: typeof dataObj.price === 'number' && dataObj.price >= 0 ? dataObj.price : undefined,
    url: dataObj.url && typeof dataObj.url === 'string' ? dataObj.url.trim() : undefined,
    imageUrl: dataObj.imageUrl && typeof dataObj.imageUrl === 'string' ? dataObj.imageUrl.trim() : undefined,
    tags: Array.isArray(dataObj.tags) ? dataObj.tags.filter(tag => typeof tag === 'string').map(tag => (tag as string).trim()) : []
  };
}

/**
 * 验证卡组数据
 */
function validateDeckData(data: unknown): ImportDeckData | null {
  if (!data || typeof data !== 'object') return null;
  const dataObj = data as Record<string, unknown>;
  if (!dataObj.name || typeof dataObj.name !== 'string') return null;
  if (!dataObj.description || typeof dataObj.description !== 'string') return null;

  const cards = Array.isArray(dataObj.cards)
    ? dataObj.cards.map(validateCardData).filter(Boolean) as ImportCardData[]
    : [];

  return {
    name: dataObj.name.trim(),
    description: dataObj.description.trim(),
    isPublic: typeof dataObj.isPublic === 'boolean' ? dataObj.isPublic : false,
    tags: Array.isArray(dataObj.tags) ? dataObj.tags.filter(tag => typeof tag === 'string').map(tag => (tag as string).trim()) : [],
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
    type: importCard.type || CardType.CUSTOM,
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
 * 将完整的Card对象转换为ImportCardData
 */
function convertFullCardToImportCard(card: unknown): ImportCardData | null {
  if (!card || typeof card !== 'object') return null;
  const cardObj = card as Record<string, unknown>;
  if (!cardObj.title || !cardObj.description) return null;

  return {
    title: cardObj.title as string,
    description: cardObj.description as string,
    type: cardObj.type as CardType,
    rarity: cardObj.rarity as CardRarity,
    price: cardObj.price as number,
    url: cardObj.url as string,
    imageUrl: cardObj.imageUrl as string,
    tags: Array.isArray(cardObj.tags) ? cardObj.tags as string[] : []
  };
}

/**
 * 将完整的CardDeck对象转换为ImportDeckData
 */
function convertFullDeckToImportDeck(deck: unknown, allCards: unknown[]): ImportDeckData | null {
  if (!deck || typeof deck !== 'object') return null;
  const deckObj = deck as Record<string, unknown>;
  if (!deckObj.name || !deckObj.description) return null;

  // 根据cardIds找到对应的卡片
  const deckCards = Array.isArray(deckObj.cardIds) ?
    deckObj.cardIds.map((cardId: unknown) => {
      const card = allCards.find((c: unknown) => {
        const cardObj = c as Record<string, unknown>;
        return cardObj.id === cardId;
      });
      return card ? convertFullCardToImportCard(card) : null;
    }).filter(Boolean) as ImportCardData[] : [];

  return {
    name: deckObj.name as string,
    description: deckObj.description as string,
    isPublic: deckObj.isPublic as boolean,
    tags: Array.isArray(deckObj.tags) ? deckObj.tags as string[] : [],
    cards: deckCards
  };
}

/**
 * 解析JSON导入数据
 */
export function parseImportData(jsonString: string): ImportData | null {
  try {
    // 清理字符串，移除可能的BOM和额外空白
    const cleanedString = jsonString.trim().replace(/^\uFEFF/, '');

    if (!cleanedString) {
      return null;
    }

    const data = JSON.parse(cleanedString);

    // 支持单个卡片导入
    if (data.title && data.description && !data.cards && !data.decks) {
      const card = validateCardData(data);
      return card ? { cards: [card] } : null;
    }

    // 支持单个卡组导入
    if (data.name && data.description && !data.title && !data.cards && !data.decks) {
      const deck = validateDeckData(data);
      return deck ? { decks: [deck] } : null;
    }

    // 支持完整存储格式导入（包含cards和decks数组）
    const result: ImportData = {};

    if (Array.isArray(data.cards)) {
      // 检查是否是完整的Card对象格式
      const isFullCardFormat = data.cards.length > 0 && data.cards[0].id && data.cards[0].createdAt;

      if (isFullCardFormat) {
        // 转换完整Card对象为ImportCardData
        const validCards = data.cards.map(convertFullCardToImportCard).filter(Boolean) as ImportCardData[];
        if (validCards.length > 0) {
          result.cards = validCards;
        }
      } else {
        // 处理简化的ImportCardData格式
        const validCards = data.cards.map(validateCardData).filter(Boolean) as ImportCardData[];
        if (validCards.length > 0) {
          result.cards = validCards;
        }
      }
    }

    if (Array.isArray(data.decks)) {
      // 检查是否是完整的CardDeck对象格式
      const isFullDeckFormat = data.decks.length > 0 &&
        typeof data.decks[0] === 'object' &&
        data.decks[0] !== null &&
        'id' in data.decks[0] &&
        'cardIds' in data.decks[0];

      if (isFullDeckFormat) {
        // 转换完整CardDeck对象为ImportDeckData
        const validDecks = data.decks.map((deck: unknown) =>
          convertFullDeckToImportDeck(deck, data.cards || [])
        ).filter(Boolean) as ImportDeckData[];
        if (validDecks.length > 0) {
          result.decks = validDecks;
        }
      } else {
        // 处理简化的ImportDeckData格式
        const validDecks = data.decks.map(validateDeckData).filter(Boolean) as ImportDeckData[];
        if (validDecks.length > 0) {
          result.decks = validDecks;
        }
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch (error) {
    console.error('JSON解析失败:', error);
    console.error('原始字符串长度:', jsonString.length);
    console.error('字符串前100个字符:', jsonString.substring(0, 100));
    throw new Error(`JSON解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
