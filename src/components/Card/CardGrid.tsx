'use client';

import React from 'react';
import { Card } from '@/types';
import { CardComponent } from './CardComponent';

interface CardGridProps {
  cards: Card[];
  onCardClick?: (card: Card) => void;
  onCardEdit?: (card: Card) => void;
  onCardDelete?: (card: Card) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  onCardClick,
  onCardEdit,
  onCardDelete,
  loading = false,
  emptyMessage = '暂无卡片',
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-lg font-medium">{emptyMessage}</p>
        <p className="text-sm mt-2">添加一些卡片来开始收集吧！</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {cards.map((card) => (
        <CardComponent
          key={card.id}
          card={card}
          onClick={onCardClick}
          onEdit={onCardEdit}
          onDelete={onCardDelete}
        />
      ))}
    </div>
  );
};

// 卡片骨架屏组件
const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-100 border-2 border-gray-200 rounded-lg p-4 animate-pulse">
      {/* 头部骨架 */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 bg-gray-300 rounded"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-20"></div>
        </div>
        <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
      </div>

      {/* 图片骨架 */}
      <div className="w-full h-32 bg-gray-300 rounded mb-3"></div>

      {/* 描述骨架 */}
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </div>

      {/* 标签骨架 */}
      <div className="flex gap-1 mb-3">
        <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
        <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
        <div className="w-14 h-6 bg-gray-300 rounded-full"></div>
      </div>

      {/* 时间骨架 */}
      <div className="h-3 bg-gray-300 rounded w-24"></div>
    </div>
  );
};
