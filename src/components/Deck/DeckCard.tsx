'use client';

import React from 'react';
import { CardDeck, Card } from '@/types';
import { calculateDeckValue, formatPrice, formatPriceLevel, getDeckPriceLevel, getPriceLevelInfo } from '@/utils/priceUtils';

interface DeckCardProps {
  deck: CardDeck;
  cardCount: number;
  cards?: Card[]; // 添加卡片数据用于计算价值
  onClick?: (deck: CardDeck) => void;
  onEdit?: (deck: CardDeck) => void;
  onDelete?: (deck: CardDeck) => void;
  onDuplicate?: (deck: CardDeck) => void;
  className?: string;
  showActions?: boolean;
}

export const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  cardCount,
  cards = [],
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
  className = '',
  showActions = true
}) => {
  // 计算卡组总价值
  const deckCards = cards.filter(card => deck.cardIds.includes(card.id));
  const totalValue = calculateDeckValue(deckCards);
  const priceLevel = getDeckPriceLevel(totalValue);
  const priceLevelInfo = getPriceLevelInfo(priceLevel);

  const handleCardClick = () => {
    onClick?.(deck);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(deck);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个卡组吗？')) {
      onDelete?.(deck);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate?.(deck);
  };

  return (
    <div
      className={`
        relative group cursor-pointer transition-all duration-300 hover:scale-105
        bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-lg
        ${className}
      `}
      onClick={handleCardClick}
    >
      {/* 公开/私有指示器 */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {deck.isPublic ? (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            公开
          </span>
        ) : (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
            私有
          </span>
        )}
      </div>

      {/* 卡组头部 */}
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl flex-shrink-0">
          📚
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 truncate" title={deck.name}>
            {deck.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-700">
              {cardCount} 张卡片
            </p>
            {totalValue >= 0 && (
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priceLevelInfo.bgColor} ${priceLevelInfo.color}`}>
                  {formatPrice(totalValue)}
                </span>
                <span className="text-sm font-bold text-yellow-600">
                  {formatPriceLevel(totalValue)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 卡组描述 */}
      <p className="text-gray-800 text-sm mb-3 line-clamp-2">
        {deck.description || '暂无描述'}
      </p>

      {/* 标签 */}
      {deck.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {deck.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {deck.tags.length > 3 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              +{deck.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* 创建时间 */}
      <div className="text-xs text-gray-400">
        创建于 {new Date(deck.createdAt).toLocaleDateString('zh-CN')}
      </div>

      {/* 操作按钮 */}
      {showActions && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                title="编辑卡组"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDuplicate && (
              <button
                onClick={handleDuplicate}
                className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                title="复制卡组"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="删除卡组"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 卡片数量指示器 */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {cardCount}
        </div>
      </div>
    </div>
  );
};
