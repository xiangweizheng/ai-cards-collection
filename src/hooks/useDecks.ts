'use client';

import { useState, useEffect, useCallback } from 'react';
import { CardDeck, Card } from '@/types';
import { storage } from '@/lib/storage';

export interface UseDecksReturn {
  // 数据状态
  decks: CardDeck[];
  loading: boolean;
  error: string | null;
  
  // 卡组操作
  createDeck: (deck: Omit<CardDeck, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateDeck: (deck: CardDeck) => Promise<boolean>;
  deleteDeck: (deckId: string) => Promise<boolean>;
  getDeck: (deckId: string) => CardDeck | null;
  
  // 卡片管理
  addCardToDeck: (deckId: string, cardId: string) => Promise<boolean>;
  removeCardFromDeck: (deckId: string, cardId: string) => Promise<boolean>;
  moveCardInDeck: (deckId: string, fromIndex: number, toIndex: number) => Promise<boolean>;
  getCardsInDeck: (deckId: string) => Card[];
  
  // 批量操作
  addCardsToDeck: (deckId: string, cardIds: string[]) => Promise<boolean>;
  removeCardsFromDeck: (deckId: string, cardIds: string[]) => Promise<boolean>;
  duplicateDeck: (deckId: string, newName?: string) => Promise<boolean>;
  
  // 统计信息
  getDeckStats: (deckId: string) => {
    cardCount: number;
    typeDistribution: Record<string, number>;
    rarityDistribution: Record<string, number>;
  };
  
  // 刷新数据
  refresh: () => void;
}

export const useDecks = (): UseDecksReturn => {
  const [decks, setDecks] = useState<CardDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载卡组数据
  const loadDecks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedDecks = storage.getDecks();
      setDecks(loadedDecks);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载卡组失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  // 创建卡组
  const createDeck = useCallback(async (deckData: Omit<CardDeck, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const newDeck: CardDeck = {
        ...deckData,
        id: storage.generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const success = storage.saveDeck(newDeck);
      if (success) {
        setDecks(prev => [...prev, newDeck]);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建卡组失败');
      return false;
    }
  }, []);

  // 更新卡组
  const updateDeck = useCallback(async (updatedDeck: CardDeck): Promise<boolean> => {
    try {
      const deckWithUpdatedTime = {
        ...updatedDeck,
        updatedAt: new Date()
      };

      const success = storage.saveDeck(deckWithUpdatedTime);
      if (success) {
        setDecks(prev => prev.map(deck => 
          deck.id === updatedDeck.id ? deckWithUpdatedTime : deck
        ));
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新卡组失败');
      return false;
    }
  }, []);

  // 删除卡组
  const deleteDeck = useCallback(async (deckId: string): Promise<boolean> => {
    try {
      const success = storage.deleteDeck(deckId);
      if (success) {
        setDecks(prev => prev.filter(deck => deck.id !== deckId));
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除卡组失败');
      return false;
    }
  }, []);

  // 获取单个卡组
  const getDeck = useCallback((deckId: string): CardDeck | null => {
    return decks.find(deck => deck.id === deckId) || null;
  }, [decks]);

  // 添加卡片到卡组
  const addCardToDeck = useCallback(async (deckId: string, cardId: string): Promise<boolean> => {
    try {
      const deck = getDeck(deckId);
      if (!deck) return false;

      // 检查卡片是否已存在
      if (deck.cardIds.includes(cardId)) {
        return true; // 已存在，视为成功
      }

      const updatedDeck = {
        ...deck,
        cardIds: [...deck.cardIds, cardId],
        updatedAt: new Date()
      };

      return await updateDeck(updatedDeck);
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加卡片到卡组失败');
      return false;
    }
  }, [getDeck, updateDeck]);

  // 从卡组移除卡片
  const removeCardFromDeck = useCallback(async (deckId: string, cardId: string): Promise<boolean> => {
    try {
      const deck = getDeck(deckId);
      if (!deck) return false;

      const updatedDeck = {
        ...deck,
        cardIds: deck.cardIds.filter(id => id !== cardId),
        updatedAt: new Date()
      };

      return await updateDeck(updatedDeck);
    } catch (err) {
      setError(err instanceof Error ? err.message : '从卡组移除卡片失败');
      return false;
    }
  }, [getDeck, updateDeck]);

  // 在卡组中移动卡片位置
  const moveCardInDeck = useCallback(async (deckId: string, fromIndex: number, toIndex: number): Promise<boolean> => {
    try {
      const deck = getDeck(deckId);
      if (!deck) return false;

      const newCardIds = [...deck.cardIds];
      const [movedCard] = newCardIds.splice(fromIndex, 1);
      newCardIds.splice(toIndex, 0, movedCard);

      const updatedDeck = {
        ...deck,
        cardIds: newCardIds,
        updatedAt: new Date()
      };

      return await updateDeck(updatedDeck);
    } catch (err) {
      setError(err instanceof Error ? err.message : '移动卡片失败');
      return false;
    }
  }, [getDeck, updateDeck]);

  // 获取卡组中的卡片
  const getCardsInDeck = useCallback((deckId: string): Card[] => {
    const deck = getDeck(deckId);
    if (!deck) return [];

    const allCards = storage.getCards();
    return deck.cardIds
      .map(cardId => allCards.find(card => card.id === cardId))
      .filter((card): card is Card => card !== undefined);
  }, [getDeck]);

  // 批量添加卡片到卡组
  const addCardsToDeck = useCallback(async (deckId: string, cardIds: string[]): Promise<boolean> => {
    try {
      const deck = getDeck(deckId);
      if (!deck) return false;

      // 过滤掉已存在的卡片
      const newCardIds = cardIds.filter(cardId => !deck.cardIds.includes(cardId));
      
      if (newCardIds.length === 0) {
        return true; // 没有新卡片需要添加
      }

      const updatedDeck = {
        ...deck,
        cardIds: [...deck.cardIds, ...newCardIds],
        updatedAt: new Date()
      };

      return await updateDeck(updatedDeck);
    } catch (err) {
      setError(err instanceof Error ? err.message : '批量添加卡片失败');
      return false;
    }
  }, [getDeck, updateDeck]);

  // 批量从卡组移除卡片
  const removeCardsFromDeck = useCallback(async (deckId: string, cardIds: string[]): Promise<boolean> => {
    try {
      const deck = getDeck(deckId);
      if (!deck) return false;

      const updatedDeck = {
        ...deck,
        cardIds: deck.cardIds.filter(cardId => !cardIds.includes(cardId)),
        updatedAt: new Date()
      };

      return await updateDeck(updatedDeck);
    } catch (err) {
      setError(err instanceof Error ? err.message : '批量移除卡片失败');
      return false;
    }
  }, [getDeck, updateDeck]);

  // 复制卡组
  const duplicateDeck = useCallback(async (deckId: string, newName?: string): Promise<boolean> => {
    try {
      const originalDeck = getDeck(deckId);
      if (!originalDeck) return false;

      const duplicatedDeck = {
        name: newName || `${originalDeck.name} (副本)`,
        description: originalDeck.description,
        cardIds: [...originalDeck.cardIds],
        isPublic: false, // 副本默认为私有
        tags: [...originalDeck.tags]
      };

      return await createDeck(duplicatedDeck);
    } catch (err) {
      setError(err instanceof Error ? err.message : '复制卡组失败');
      return false;
    }
  }, [getDeck, createDeck]);

  // 获取卡组统计信息
  const getDeckStats = useCallback((deckId: string) => {
    const cards = getCardsInDeck(deckId);
    
    const stats = {
      cardCount: cards.length,
      typeDistribution: {} as Record<string, number>,
      rarityDistribution: {} as Record<string, number>
    };

    cards.forEach(card => {
      // 统计类型分布
      stats.typeDistribution[card.type] = (stats.typeDistribution[card.type] || 0) + 1;
      
      // 统计稀有度分布
      stats.rarityDistribution[card.rarity] = (stats.rarityDistribution[card.rarity] || 0) + 1;
    });

    return stats;
  }, [getCardsInDeck]);

  // 刷新数据
  const refresh = useCallback(() => {
    loadDecks();
  }, [loadDecks]);

  return {
    // 数据状态
    decks,
    loading,
    error,
    
    // 卡组操作
    createDeck,
    updateDeck,
    deleteDeck,
    getDeck,
    
    // 卡片管理
    addCardToDeck,
    removeCardFromDeck,
    moveCardInDeck,
    getCardsInDeck,
    
    // 批量操作
    addCardsToDeck,
    removeCardsFromDeck,
    duplicateDeck,
    
    // 统计信息
    getDeckStats,
    
    // 刷新数据
    refresh
  };
};
