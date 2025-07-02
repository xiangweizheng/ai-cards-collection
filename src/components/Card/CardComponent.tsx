'use client';

import React from 'react';
import { Card as CardType } from '@/types';
import { RARITY_COLORS, TYPE_ICONS, TYPE_LABELS, RARITY_LABELS } from '@/lib/cardUtils';
import { formatPrice, formatPriceLevel, getPriceLevelFromPrice, getPriceLevelInfo } from '@/utils/priceUtils';

interface CardComponentProps {
  card: CardType;
  onClick?: (card: CardType) => void;
  onEdit?: (card: CardType) => void;
  onDelete?: (card: CardType) => void;
  className?: string;
  showActions?: boolean;
}

export const CardComponent: React.FC<CardComponentProps> = ({
  card,
  onClick,
  onEdit,
  onDelete,
  className = '',
  showActions = true
}) => {
  const rarityStyles = RARITY_COLORS[card.rarity];
  const typeIcon = TYPE_ICONS[card.type];
  const typeLabel = TYPE_LABELS[card.type];
  const rarityLabel = RARITY_LABELS[card.rarity];

  const handleCardClick = () => {
    if (onClick) {
      onClick(card);
    } else if (card.url) {
      window.open(card.url, '_blank');
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(card);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这张卡片吗？')) {
      onDelete?.(card);
    }
  };

  return (
    <div
      className={`
        relative group cursor-pointer transition-all duration-300 hover:scale-105
        ${rarityStyles.bg} ${rarityStyles.border} border-2 rounded-lg p-4
        ${rarityStyles.glow} hover:shadow-lg
        ${className}
      `}
      onClick={handleCardClick}
    >
      {/* 稀有度指示器 */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white ${rarityStyles.accent}`}>
        {rarityLabel}
      </div>

      {/* 卡片头部 */}
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl flex-shrink-0">
          {typeIcon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 truncate" title={card.title}>
            {card.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {typeLabel}
          </p>
        </div>
      </div>

      {/* 卡片图片 */}
      {card.imageUrl && (
        <div className="mb-3 rounded-md overflow-hidden">
          <img
            src={card.imageUrl}
            alt={card.title}
            className="w-full h-32 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* 卡片描述 */}
      <p className="text-gray-800 text-sm mb-3 line-clamp-3">
        {card.description}
      </p>

      {/* 标签 */}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {card.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {card.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
              +{card.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* 价格信息 */}
      {card.price !== undefined && (
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            💰 {formatPrice(card.price)}
          </span>
          <span className="text-lg font-bold text-yellow-600">
            {formatPriceLevel(card.price)}
          </span>
        </div>
      )}

      {/* 元数据显示 */}
      {card.metadata && (
        <div className="text-xs text-gray-500 mb-2">
          {card.type === 'github_repo' && card.metadata.stars && (
            <span className="flex items-center gap-1">
              ⭐ {card.metadata.stars.toLocaleString()} stars
            </span>
          )}
          {card.type === 'tool_website' && card.metadata.pricing && (
            <span className="capitalize">
              💰 {card.metadata.pricing}
            </span>
          )}
        </div>
      )}

      {/* 创建时间 */}
      <div className="text-xs text-gray-400">
        {new Date(card.createdAt).toLocaleDateString('zh-CN')}
      </div>

      {/* 操作按钮 */}
      {showActions && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                title="编辑"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="删除"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 链接指示器 */}
      {card.url && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      )}
    </div>
  );
};
