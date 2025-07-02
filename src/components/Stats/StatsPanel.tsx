'use client';

import React from 'react';
import { getCardStats } from '@/lib/cardUtils';
import { Card } from '@/types';
import { TYPE_LABELS, RARITY_LABELS, TYPE_ICONS } from '@/lib/cardUtils';

interface StatsPanelProps {
  cards: Card[];
  className?: string;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  cards,
  className = ''
}) => {
  const stats = getCardStats(cards);

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 收藏统计</h3>
      
      <div className="space-y-6">
        {/* 总体统计 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">总卡片数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.recentCount}</div>
            <div className="text-sm text-gray-600">本周新增</div>
          </div>
        </div>

        {/* 类型分布 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">卡片类型分布</h4>
          <div className="space-y-2">
            {Object.entries(stats.byType).map(([type, count]) => {
              if (count === 0) return null;
              const percentage = stats.total > 0 ? (count / stats.total * 100).toFixed(1) : '0';
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{TYPE_ICONS[type as keyof typeof TYPE_ICONS]}</span>
                    <span className="text-sm text-gray-700">
                      {TYPE_LABELS[type as keyof typeof TYPE_LABELS]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 稀有度分布 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">稀有度分布</h4>
          <div className="space-y-2">
            {Object.entries(stats.byRarity).map(([rarity, count]) => {
              if (count === 0) return null;
              const percentage = stats.total > 0 ? (count / stats.total * 100).toFixed(1) : '0';
              
              // 稀有度颜色映射
              const rarityColors = {
                common: 'bg-gray-500',
                rare: 'bg-blue-500',
                epic: 'bg-purple-500',
                legendary: 'bg-yellow-500'
              };
              
              return (
                <div key={rarity} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {RARITY_LABELS[rarity as keyof typeof RARITY_LABELS]}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${rarityColors[rarity as keyof typeof rarityColors]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 收藏进度 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">收藏成就</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">新手收藏家</span>
              <span className={`text-sm font-medium ${stats.total >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                {stats.total >= 10 ? '✅' : '⏳'} {stats.total}/10
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">资深收藏家</span>
              <span className={`text-sm font-medium ${stats.total >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                {stats.total >= 50 ? '✅' : '⏳'} {stats.total}/50
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">传说收藏家</span>
              <span className={`text-sm font-medium ${stats.total >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
                {stats.total >= 100 ? '✅' : '⏳'} {stats.total}/100
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">传说卡片收集者</span>
              <span className={`text-sm font-medium ${stats.byRarity.legendary >= 5 ? 'text-green-600' : 'text-gray-400'}`}>
                {stats.byRarity.legendary >= 5 ? '✅' : '⏳'} {stats.byRarity.legendary}/5
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
