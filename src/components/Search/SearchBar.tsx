'use client';

import React, { useState, useEffect } from 'react';
import { SearchFilters, CardType, CardRarity } from '@/types';
import { TYPE_LABELS, RARITY_LABELS } from '@/lib/cardUtils';

interface SearchBarProps {
  onFiltersChange: (filters: SearchFilters) => void;
  popularTags?: Array<{tag: string, count: number}>;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onFiltersChange,
  popularTags = [],
  className = ''
}) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 当过滤器改变时通知父组件
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleQueryChange = (query: string) => {
    setFilters(prev => ({ ...prev, query: query.trim() || undefined }));
  };

  const handleTypeToggle = (type: CardType) => {
    setFilters(prev => {
      const currentTypes = prev.type || [];
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type];
      
      return {
        ...prev,
        type: newTypes.length > 0 ? newTypes : undefined
      };
    });
  };

  const handleRarityToggle = (rarity: CardRarity) => {
    setFilters(prev => {
      const currentRarities = prev.rarity || [];
      const newRarities = currentRarities.includes(rarity)
        ? currentRarities.filter(r => r !== rarity)
        : [...currentRarities, rarity];
      
      return {
        ...prev,
        rarity: newRarities.length > 0 ? newRarities : undefined
      };
    });
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => {
      const currentTags = prev.tags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag];
      
      return {
        ...prev,
        tags: newTags.length > 0 ? newTags : undefined
      };
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    key !== 'query' && filters[key as keyof SearchFilters]
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      {/* 搜索输入框 */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="搜索卡片标题、描述或标签..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          value={filters.query || ''}
          onChange={(e) => handleQueryChange(e.target.value)}
        />
      </div>

      {/* 高级搜索切换 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <span>高级搜索</span>
          <svg 
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-800"
          >
            清除过滤器
          </button>
        )}
      </div>

      {/* 高级搜索选项 */}
      {showAdvanced && (
        <div className="space-y-4">
          {/* 卡片类型过滤 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              卡片类型
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TYPE_LABELS).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type as CardType)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.type?.includes(type as CardType)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 稀有度过滤 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              稀有度
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(RARITY_LABELS).map(([rarity, label]) => (
                <button
                  key={rarity}
                  onClick={() => handleRarityToggle(rarity as CardRarity)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.rarity?.includes(rarity as CardRarity)
                      ? 'bg-purple-500 text-white border-purple-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-purple-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 热门标签 */}
          {popularTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                热门标签
              </label>
              <div className="flex flex-wrap gap-2">
                {popularTags.slice(0, 10).map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      filters.tags?.includes(tag)
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {tag} ({count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 活跃过滤器显示 */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.type?.map(type => (
              <span
                key={type}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {TYPE_LABELS[type]}
                <button
                  onClick={() => handleTypeToggle(type)}
                  className="hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.rarity?.map(rarity => (
              <span
                key={rarity}
                className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
              >
                {RARITY_LABELS[rarity]}
                <button
                  onClick={() => handleRarityToggle(rarity)}
                  className="hover:text-purple-600"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.tags?.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
              >
                {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="hover:text-green-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
