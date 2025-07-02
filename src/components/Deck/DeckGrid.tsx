'use client';

import React from 'react';
import { CardDeck, Card } from '@/types';
import { DeckCard } from './DeckCard';

interface DeckGridProps {
  decks: CardDeck[];
  cards?: Card[];
  getCardCount: (deckId: string) => number;
  onDeckClick?: (deck: CardDeck) => void;
  onDeckEdit?: (deck: CardDeck) => void;
  onDeckDelete?: (deck: CardDeck) => void;
  onDeckDuplicate?: (deck: CardDeck) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const DeckGrid: React.FC<DeckGridProps> = ({
  decks,
  cards = [],
  getCardCount,
  onDeckClick,
  onDeckEdit,
  onDeckDelete,
  onDeckDuplicate,
  loading = false,
  emptyMessage = '暂无卡组',
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <DeckSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-lg font-medium">{emptyMessage}</p>
        <p className="text-sm mt-2">创建一个卡组来整理你的卡片吧！</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {decks.map((deck) => (
        <DeckCard
          key={deck.id}
          deck={deck}
          cards={cards}
          cardCount={getCardCount(deck.id)}
          onClick={onDeckClick}
          onEdit={onDeckEdit}
          onDelete={onDeckDelete}
          onDuplicate={onDeckDuplicate}
        />
      ))}
    </div>
  );
};

// 卡组骨架屏组件
const DeckSkeleton: React.FC = () => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 animate-pulse">
      {/* 头部骨架 */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 bg-gray-300 rounded"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-20"></div>
        </div>
        <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
      </div>

      {/* 描述骨架 */}
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </div>

      {/* 标签骨架 */}
      <div className="flex gap-1 mb-3">
        <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
        <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
      </div>

      {/* 时间骨架 */}
      <div className="h-3 bg-gray-300 rounded w-24"></div>
    </div>
  );
};
