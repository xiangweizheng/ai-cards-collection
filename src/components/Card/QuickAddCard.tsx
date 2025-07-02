'use client';

import React, { useState } from 'react';
import { Card } from '@/types';
import { linkParser } from '@/lib/linkParser';
import { storage } from '@/lib/storage';
import { detectCardRarity } from '@/lib/cardUtils';

interface QuickAddCardProps {
  onCardAdded: (card: Card) => void;
  className?: string;
}

export const QuickAddCard: React.FC<QuickAddCardProps> = ({
  onCardAdded,
  className = ''
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // 解析链接
      const parseResult = await linkParser.parseLink(url.trim());
      
      // 创建卡片
      const newCard: Card = {
        id: storage.generateId(),
        title: parseResult.title,
        description: parseResult.description,
        url: url.trim(),
        imageUrl: parseResult.imageUrl,
        type: parseResult.type,
        rarity: detectCardRarity({
          ...parseResult,
          url: url.trim()
        }),
        tags: parseResult.tags,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: parseResult.metadata
      };

      // 保存卡片
      const success = storage.saveCard(newCard);
      if (success) {
        onCardAdded(newCard);
        setUrl('');
        setError('');
      } else {
        setError('保存失败，请重试');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析链接失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
        setUrl(text);
      }
    } catch {
      // 忽略剪贴板访问错误
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">快速添加卡片</h3>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="粘贴链接地址..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            {/* 粘贴按钮 */}
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="从剪贴板粘贴"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                解析中...
              </>
            ) : (
              '添加'
            )}
          </button>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
            {error}
          </div>
        )}

        {/* 支持的链接类型提示 */}
        <div className="text-xs text-gray-500">
          <p className="mb-1">支持的链接类型：</p>
          <ul className="list-disc list-inside space-y-1">
            <li>🐙 GitHub 仓库链接</li>
            <li>💬 Prompt 分享链接</li>
            <li>🛠️ 工具网站链接</li>
            <li>🌐 其他网站链接</li>
          </ul>
        </div>
      </form>
    </div>
  );
};
