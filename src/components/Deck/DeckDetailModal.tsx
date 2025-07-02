'use client';

import React, { useState } from 'react';
import { Card, CardDeck } from '@/types';
import { CardComponent } from '@/components/Card/CardComponent';

interface DeckDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: CardDeck | null;
  cards: Card[];
  onCardEdit?: (card: Card) => void;
  onCardRemove?: (deckId: string, cardId: string) => void;
  onCardReorder?: (deckId: string, fromIndex: number, toIndex: number) => void;
  onAddCards?: (deckId: string) => void;
  onShareDeck?: (deck: CardDeck) => void;
}

export const DeckDetailModal: React.FC<DeckDetailModalProps> = ({
  isOpen,
  onClose,
  deck,
  cards,
  onCardEdit,
  onCardRemove,
  onCardReorder,
  onAddCards,
  onShareDeck
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!isOpen || !deck) return null;

  // 拖拽开始
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 拖拽经过
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  // 拖拽结束
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex && onCardReorder) {
      onCardReorder(deck.id, draggedIndex, dropIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // 分享卡组
  const handleShare = () => {
    if (onShareDeck) {
      onShareDeck(deck);
    } else {
      // 默认分享行为：复制链接到剪贴板
      const shareData = {
        name: deck.name,
        description: deck.description,
        cardCount: cards.length,
        url: window.location.href
      };
      
      const shareText = `🎴 ${shareData.name}\n\n${shareData.description}\n\n包含 ${shareData.cardCount} 张卡片\n\n查看详情: ${shareData.url}`;
      
      if (navigator.share) {
        navigator.share({
          title: shareData.name,
          text: shareData.description,
          url: shareData.url
        });
      } else {
        navigator.clipboard.writeText(shareText).then(() => {
          alert('卡组信息已复制到剪贴板！');
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-4">
              <div className="text-2xl">📚</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{deck.name}</h2>
                <p className="text-sm text-gray-600">{cards.length} 张卡片</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* 分享按钮 */}
              <button
                onClick={handleShare}
                className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                分享
              </button>
              
              {/* 添加卡片按钮 */}
              {onAddCards && (
                <button
                  onClick={() => onAddCards(deck.id)}
                  className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  添加卡片
                </button>
              )}
              
              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 卡组信息 */}
          <div className="p-6 border-b bg-gray-50">
            <p className="text-gray-700 mb-3">{deck.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className={`px-2 py-1 rounded-full text-xs ${
                deck.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {deck.isPublic ? '公开' : '私有'}
              </span>
              
              <span>创建于 {new Date(deck.createdAt).toLocaleDateString('zh-CN')}</span>
              
              {deck.tags.length > 0 && (
                <div className="flex gap-1">
                  {deck.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 卡片列表 */}
          <div className="flex-1 overflow-y-auto p-6 max-h-[calc(90vh-300px)]">
            {cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg font-medium">卡组还没有卡片</p>
                <p className="text-sm mt-2">点击&ldquo;添加卡片&rdquo;按钮来添加第一张卡片</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card, index) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`relative transition-all duration-200 ${
                      draggedIndex === index ? 'opacity-50 scale-95' : ''
                    } ${
                      dragOverIndex === index ? 'scale-105' : ''
                    }`}
                  >
                    <CardComponent
                      card={card}
                      onEdit={onCardEdit}
                      onDelete={onCardRemove ? () => onCardRemove(deck.id, card.id) : undefined}
                      showActions={true}
                    />
                    
                    {/* 拖拽指示器 */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>
                    
                    {/* 序号指示器 */}
                    <div className="absolute bottom-2 left-2 w-6 h-6 bg-gray-800 bg-opacity-75 text-white text-xs rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 底部提示 */}
          {cards.length > 0 && (
            <div className="p-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600 text-center">
                💡 提示：拖拽卡片可以调整顺序
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
