'use client';

import React, { useState } from 'react';
import { Card, CardDeck } from '@/types';
import { CardComponent } from '@/components/Card/CardComponent';

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDeck: (deck: Omit<CardDeck, 'id' | 'createdAt' | 'updatedAt'>) => void;
  availableCards: Card[];
}

export const CreateDeckModal: React.FC<CreateDeckModalProps> = ({
  isOpen,
  onClose,
  onCreateDeck,
  availableCards
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    tags: [] as string[],
    tagInput: ''
  });

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  // 过滤卡片
  const filteredCards = availableCards.filter(card =>
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

  // 添加标签
  const addTag = () => {
    const tag = formData.tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: ''
      }));
    }
  };

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 处理标签输入的回车键
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // 验证表单
    const newErrors: string[] = [];
    if (!formData.name.trim()) {
      newErrors.push('卡组名称不能为空');
    }
    if (!formData.description.trim()) {
      newErrors.push('卡组描述不能为空');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // 创建卡组
    const newDeck = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      isPublic: formData.isPublic,
      tags: formData.tags,
      cardIds: selectedCardIds
    };

    onCreateDeck(newDeck);
    
    // 重置表单
    setFormData({
      name: '',
      description: '',
      isPublic: false,
      tags: [],
      tagInput: ''
    });
    setSelectedCardIds([]);
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">📚 创建新卡组</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
              {/* 左侧：卡组信息表单 */}
              <div className="p-6 border-r overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* 错误信息 */}
                {errors.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <ul className="text-sm text-red-600">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 卡组名称 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      卡组名称 *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="输入卡组名称"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>

                  {/* 卡组描述 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      卡组描述 *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="输入卡组描述"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>

                  {/* 公开设置 */}
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">公开卡组</span>
                    </label>
                  </div>

                  {/* 标签输入 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      标签
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={formData.tagInput}
                        onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                        onKeyPress={handleTagKeyPress}
                        placeholder="输入标签后按回车"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        添加
                      </button>
                    </div>
                    
                    {/* 标签列表 */}
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-blue-600"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 选中的卡片数量 */}
                  <div className="p-3 bg-blue-50 rounded-md sticky bottom-0 bg-white border-t">
                    <p className="text-sm text-blue-800">
                      已选择 <span className="font-bold">{selectedCardIds.length}</span> 张卡片
                    </p>
                  </div>
                </form>
              </div>

              {/* 右侧：卡片选择区域 */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="mb-4 sticky top-0 bg-white z-10 pb-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">选择卡片</h3>

                  {/* 搜索框 */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索卡片..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                {/* 卡片网格 */}
                <div className="grid grid-cols-1 gap-3">
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

                {filteredCards.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>没有找到匹配的卡片</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex gap-3 p-6 border-t bg-gray-50 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!formData.name.trim() || !formData.description.trim()}
            >
              创建卡组 ({selectedCardIds.length} 张卡片)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
