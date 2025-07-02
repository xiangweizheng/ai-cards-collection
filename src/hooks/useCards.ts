'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, SearchFilters } from '@/types';
import { storage } from '@/lib/storage';
import { filterCards, sortCards, getCardStats, extractPopularTags } from '@/lib/cardUtils';

export interface UseCardsReturn {
  // 数据状态
  cards: Card[];
  filteredCards: Card[];
  loading: boolean;
  error: string | null;
  
  // 统计信息
  stats: ReturnType<typeof getCardStats>;
  popularTags: Array<{tag: string, count: number}>;
  
  // 搜索和过滤
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  sortBy: 'date' | 'title' | 'rarity' | 'type';
  setSortBy: (sortBy: 'date' | 'title' | 'rarity' | 'type') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // 卡片操作
  addCard: (card: Card) => Promise<boolean>;
  updateCard: (card: Card) => Promise<boolean>;
  deleteCard: (cardId: string) => Promise<boolean>;
  getCard: (cardId: string) => Card | null;
  
  // 批量操作
  deleteCards: (cardIds: string[]) => Promise<boolean>;
  exportCards: () => string;
  importCards: (jsonData: string) => Promise<boolean>;
  
  // 刷新数据
  refresh: () => void;
}

export const useCards = (): UseCardsReturn => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 搜索和过滤状态
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'rarity' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 加载卡片数据
  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedCards = storage.getCards();
      setCards(loadedCards);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载卡片失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // 计算过滤后的卡片
  const filteredCards = useCallback(() => {
    let result = filterCards(cards, filters);
    result = sortCards(result, sortBy, sortOrder);
    return result;
  }, [cards, filters, sortBy, sortOrder])();

  // 计算统计信息
  const stats = useCallback(() => {
    return getCardStats(cards);
  }, [cards])();

  // 计算热门标签
  const popularTags = useCallback(() => {
    return extractPopularTags(cards, 20);
  }, [cards])();

  // 添加卡片
  const addCard = useCallback(async (card: Card): Promise<boolean> => {
    try {
      const success = storage.saveCard(card);
      if (success) {
        setCards(prev => [...prev, card]);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加卡片失败');
      return false;
    }
  }, []);

  // 更新卡片
  const updateCard = useCallback(async (updatedCard: Card): Promise<boolean> => {
    try {
      const cardWithUpdatedTime = {
        ...updatedCard,
        updatedAt: new Date()
      };
      
      const success = storage.saveCard(cardWithUpdatedTime);
      if (success) {
        setCards(prev => prev.map(card => 
          card.id === updatedCard.id ? cardWithUpdatedTime : card
        ));
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新卡片失败');
      return false;
    }
  }, []);

  // 删除卡片
  const deleteCard = useCallback(async (cardId: string): Promise<boolean> => {
    try {
      const success = storage.deleteCard(cardId);
      if (success) {
        setCards(prev => prev.filter(card => card.id !== cardId));
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除卡片失败');
      return false;
    }
  }, []);

  // 获取单个卡片
  const getCard = useCallback((cardId: string): Card | null => {
    return cards.find(card => card.id === cardId) || null;
  }, [cards]);

  // 批量删除卡片
  const deleteCards = useCallback(async (cardIds: string[]): Promise<boolean> => {
    try {
      let allSuccess = true;
      for (const cardId of cardIds) {
        const success = storage.deleteCard(cardId);
        if (!success) allSuccess = false;
      }
      
      if (allSuccess) {
        setCards(prev => prev.filter(card => !cardIds.includes(card.id)));
      }
      
      return allSuccess;
    } catch (err) {
      setError(err instanceof Error ? err.message : '批量删除失败');
      return false;
    }
  }, []);

  // 导出卡片
  const exportCards = useCallback((): string => {
    const exportData = {
      cards,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(exportData, null, 2);
  }, [cards]);

  // 导入卡片
  const importCards = useCallback(async (jsonData: string): Promise<boolean> => {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.cards || !Array.isArray(importData.cards)) {
        throw new Error('无效的导入数据格式');
      }

      // 验证每个卡片的数据结构
      const validCards = importData.cards.filter((card: unknown) => {
        const cardObj = card as Record<string, unknown>;
        return cardObj.id && cardObj.title && cardObj.description && cardObj.type && cardObj.rarity;
      });

      if (validCards.length === 0) {
        throw new Error('没有找到有效的卡片数据');
      }

      // 处理ID冲突
      const existingIds = new Set(cards.map(card => card.id));
      const cardsToImport = validCards.map((card: Card) => {
        if (existingIds.has(card.id)) {
          // 如果ID冲突，生成新ID
          return {
            ...card,
            id: storage.generateId(),
            createdAt: new Date(card.createdAt),
            updatedAt: new Date()
          };
        }
        return {
          ...card,
          createdAt: new Date(card.createdAt),
          updatedAt: new Date(card.updatedAt)
        };
      });

      // 保存导入的卡片
      let successCount = 0;
      for (const card of cardsToImport) {
        const success = storage.saveCard(card);
        if (success) successCount++;
      }

      if (successCount > 0) {
        // 重新加载数据
        await loadCards();
        return true;
      }

      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败');
      return false;
    }
  }, [cards, loadCards]);

  // 刷新数据
  const refresh = useCallback(() => {
    loadCards();
  }, [loadCards]);

  return {
    // 数据状态
    cards,
    filteredCards,
    loading,
    error,
    
    // 统计信息
    stats,
    popularTags,
    
    // 搜索和过滤
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    
    // 卡片操作
    addCard,
    updateCard,
    deleteCard,
    getCard,
    
    // 批量操作
    deleteCards,
    exportCards,
    importCards,
    
    // 刷新数据
    refresh
  };
};
