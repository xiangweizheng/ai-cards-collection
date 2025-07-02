'use client';

import React, { useState } from 'react';
import { Card, CardDeck } from '@/types';
import { parseImportData, importCardsAndDecks } from '@/utils/importUtils';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (cards: Card[], decks: CardDeck[], summary: { cardsAdded: number, decksAdded: number }) => void;
  existingCards: Card[];
  existingDecks: CardDeck[];
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  existingCards,
  existingDecks
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [previewData, setPreviewData] = useState<{
    cards: number;
    decks: number;
  } | null>(null);

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    setError(null);
    setPreviewData(null);

    const trimmedValue = value.trim();
    if (trimmedValue) {
      // 检查是否看起来像JSON
      if (!trimmedValue.startsWith('{') && !trimmedValue.startsWith('[')) {
        setError('输入的内容不是有效的JSON格式（应该以 { 或 [ 开头）');
        return;
      }
      try {
        const importData = parseImportData(trimmedValue);
        if (importData) {
          setPreviewData({
            cards: importData.cards?.length || 0,
            decks: importData.decks?.length || 0
          });
        } else {
          setError('JSON格式不正确或不包含有效的卡片/卡组数据');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'JSON格式错误';
        setError(errorMessage);
        console.error('导入错误:', err);
      }
    }
  };

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      setError('请输入JSON数据');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const importData = parseImportData(jsonInput);
      if (!importData) {
        setError('无法解析JSON数据');
        return;
      }

      const result = importCardsAndDecks(importData, existingCards, existingDecks);
      onImportComplete(result.cards, result.decks, result.summary);
      
      // 重置状态
      setJsonInput('');
      setPreviewData(null);
      onClose();
    } catch (err) {
      setError('导入失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setError('请选择JSON文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      handleJsonChange(content);
    };
    reader.onerror = () => {
      setError('文件读取失败');
    };
    reader.readAsText(file);
  };

  const exampleData = {
    "title": "示例卡片",
    "description": "这是一个示例卡片的描述",
    "type": "tool",
    "price": 99.99,
    "url": "https://example.com",
    "tags": ["示例", "工具"]
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">JSON导入</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：导入区域 */}
            <div className="space-y-4">
              {/* 导入说明 */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="text-sm font-medium text-blue-900 mb-2">📋 支持的导入格式</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <div>• <strong>单个卡片</strong>：直接粘贴卡片JSON对象</div>
                  <div>• <strong>单个卡组</strong>：包含name、description和cards数组</div>
                  <div>• <strong>批量导入</strong>：包含cards和/或decks数组</div>
                  <div>• <strong>完整导出</strong>：支持导入完整的导出文件</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExamples(!showExamples)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  {showExamples ? '隐藏' : '查看'}示例格式
                </button>
              </div>

              {/* 示例格式 */}
              {showExamples && (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">单个卡片示例：</h4>
                    <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
{`{
  "title": "ChatGPT",
  "description": "OpenAI的AI对话助手",
  "type": "tool_website",
  "rarity": "legendary",
  "price": 20,
  "url": "https://chat.openai.com",
  "tags": ["AI", "对话"]
}`}
                    </pre>
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">单个卡组示例：</h4>
                    <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
{`{
  "name": "AI工具精选",
  "description": "精选的AI工具集合",
  "isPublic": true,
  "tags": ["AI", "工具"],
  "cards": [
    {
      "title": "ChatGPT",
      "description": "OpenAI的AI对话助手",
      "type": "tool_website",
      "rarity": "legendary",
      "price": 20,
      "url": "https://chat.openai.com",
      "tags": ["AI", "对话"]
    }
  ]
}`}
                    </pre>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    JSON数据
                  </label>
                  {jsonInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setJsonInput('');
                        setError(null);
                        setPreviewData(null);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      清除
                    </button>
                  )}
                </div>
                <textarea
                  value={jsonInput}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  placeholder="粘贴JSON数据或使用下方的文件上传..."
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900"
                />
              </div>

              {/* 文件上传 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  或上传JSON文件
                </label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              {/* 预览信息 */}
              {previewData && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">预览</h4>
                  <p className="text-sm text-blue-800">
                    将导入 {previewData.cards} 张卡片，{previewData.decks} 个卡组
                  </p>
                </div>
              )}

              {/* 错误信息 */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* 右侧：示例和说明 */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">导入格式说明</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>支持以下格式：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>单个卡片：包含 title 和 description 字段</li>
                    <li>单个卡组：包含 name、description 和 cards 数组</li>
                    <li>批量导入：包含 cards 和/或 decks 数组</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">单个卡片示例</h4>
                <pre className="text-xs bg-gray-100 p-3 rounded-md overflow-x-auto">
                  {JSON.stringify(exampleData, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">卡片字段说明</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>title*</strong>: 卡片标题（必需）</p>
                  <p><strong>description*</strong>: 卡片描述（必需）</p>
                  <p><strong>type</strong>: 卡片类型（可选）</p>
                  <p><strong>price</strong>: 价格，单位为元（可选）</p>
                  <p><strong>url</strong>: 相关链接（可选）</p>
                  <p><strong>imageUrl</strong>: 图片链接（可选）</p>
                  <p><strong>tags</strong>: 标签数组（可选）</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleImport}
            disabled={!previewData || isImporting}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImporting ? '导入中...' : `导入 ${previewData?.cards || 0} 张卡片，${previewData?.decks || 0} 个卡组`}
          </button>
        </div>
      </div>
    </div>
  );
};
