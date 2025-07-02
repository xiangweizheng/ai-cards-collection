'use client';

import React, { useState } from 'react';
import { Card, CardType, CardRarity } from '@/types';
import { TYPE_LABELS, RARITY_LABELS, detectCardType, detectCardRarity, validateCard } from '@/lib/cardUtils';
import { storage } from '@/lib/storage';

interface AddCardFormProps {
  onCardAdded: (card: Card) => void;
  onCancel: () => void;
  initialUrl?: string;
  className?: string;
}

export const AddCardForm: React.FC<AddCardFormProps> = ({
  onCardAdded,
  onCancel,
  initialUrl = '',
  className = ''
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: initialUrl,
    imageUrl: '',
    type: CardType.CUSTOM,
    rarity: CardRarity.COMMON,
    price: 0,
    tags: [] as string[],
    tagInput: ''
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 当URL改变时自动检测类型
  const handleUrlChange = (url: string) => {
    setFormData(prev => ({
      ...prev,
      url,
      type: url ? detectCardType(url) : CardType.CUSTOM
    }));
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    // 创建卡片对象
    const newCard: Card = {
      id: storage.generateId(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      url: formData.url.trim() || undefined,
      imageUrl: formData.imageUrl.trim() || undefined,
      type: formData.type,
      rarity: formData.rarity,
      price: formData.price > 0 ? formData.price : undefined,
      tags: formData.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {}
    };

    // 智能检测稀有度
    if (formData.rarity === CardRarity.COMMON) {
      newCard.rarity = detectCardRarity(newCard);
    }

    // 验证卡片数据
    const validation = validateCard(newCard);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // 保存到本地存储
      const success = storage.saveCard(newCard);
      if (success) {
        onCardAdded(newCard);
        // 重置表单
        setFormData({
          title: '',
          description: '',
          url: '',
          imageUrl: '',
          type: CardType.CUSTOM,
          rarity: CardRarity.COMMON,
          price: 0,
          tags: [],
          tagInput: ''
        });
      } else {
        setErrors(['保存失败，请重试']);
      }
    } catch (error) {
      setErrors(['保存时发生错误']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">添加新卡片</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

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
        {/* URL输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            链接 (可选)
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>

        {/* 标题输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标题 *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="输入卡片标题"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>

        {/* 描述输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            描述 *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="输入卡片描述"
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>

        {/* 图片URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            图片链接 (可选)
          </label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>

        {/* 类型、稀有度和价格选择 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              类型
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CardType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              {Object.entries(TYPE_LABELS).map(([type, label]) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              稀有度
            </label>
            <select
              value={formData.rarity}
              onChange={(e) => setFormData(prev => ({ ...prev, rarity: e.target.value as CardRarity }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              {Object.entries(RARITY_LABELS).map(([rarity, label]) => (
                <option key={rarity} value={rarity}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              价格 (元)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
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

        {/* 提交按钮 */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '保存中...' : '保存卡片'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
};
