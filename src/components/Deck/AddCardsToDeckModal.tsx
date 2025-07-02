'use client';

import React, { useState } from 'react';
import { Card, CardDeck } from '@/types';
import { CardComponent } from '@/components/Card/CardComponent';

interface AddCardsToDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: CardDeck | null;
  availableCards: Card[];
  onAddCards: (deckId: string, cardIds: string[]) => void;
}

export const AddCardsToDeckModal: React.FC<AddCardsToDeckModalProps> = ({
  isOpen,
  onClose,
  deck,
  availableCards,
  onAddCards
}) => {
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !deck) return null;

  // 过滤出不在当前卡组中的卡片
  const cardsNotInDeck = availableCards.filter(card => !deck.cardIds.includes(card.id));

  // 根据搜索条件过滤卡片
  const filteredCards = cardsNotInDeck.filter(card =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 切换卡片选择状态
  const toggleCardSelection = (cardId: string) => {
    setSelectedCardIds(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedCardIds.length === filteredCards.length) {
      setSelectedCardIds([]);
    } else {
      setSelectedCardIds(filteredCards.map(card => card.id));
    }
  };

  // 添加选中的卡片
  const handleAddCards = () => {
    if (selectedCardIds.length > 0) {
      onAddCards(deck.id, selectedCardIds);
      setSelectedCardIds([]);
      setSearchQuery('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-900">添加卡片到卡组</h2>
              <p className="text-sm text-gray-600 mt-1">
                向 "{deck.name}" 添加卡片
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 搜索和操作栏 */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex gap-4 items-center">
              {/* 搜索框 */}
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索卡片..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 全选按钮 */}
              {filteredCards.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  {selectedCardIds.length === filteredCards.length ? '取消全选' : '全选'}
                </button>
              )}

              {/* 选中数量显示 */}
              <div className="text-sm text-gray-600">
                已选择 {selectedCardIds.length} 张卡片
              </div>
            </div>
          </div>

          {/* 卡片列表 */}
          <div className="flex-1 overflow-y-auto p-6 max-h-[calc(90vh-250px)]">
            {cardsNotInDeck.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-lg font-medium">所有卡片都已在卡组中</p>
                <p className="text-sm mt-2">没有可添加的卡片了</p>
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg font-medium">没有找到匹配的卡片</p>
                <p className="text-sm mt-2">尝试使用不同的搜索关键词</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCards.map((card) => (
                  <div
                    key={card.id}
                    className={`relative cursor-pointer transition-all duration-200 ${
                      selectedCardIds.includes(card.id)
                        ? 'ring-2 ring-blue-500 ring-offset-2'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => toggleCardSelection(card.id)}
                  >
                    <CardComponent
                      card={card}
                      showActions={false}
                      className="pointer-events-none"
                    />
                    
                    {/* 选择指示器 */}
                    <div className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedCardIds.includes(card.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white border-gray-300'
                    }`}>
                      {selectedCardIds.includes(card.id) && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="flex gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleAddCards}
              disabled={selectedCardIds.length === 0}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              添加 {selectedCardIds.length} 张卡片
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
