'use client';

import React, { useState } from 'react';
import { exportData, clearAllData, initializeSampleData } from '@/lib/sampleData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onDataChanged
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      exportData();
    } catch (error) {
      console.error('导出数据失败:', error);
      alert('导出数据失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('确定要清除所有数据吗？此操作不可撤销！')) {
      return;
    }

    setIsClearing(true);
    try {
      const success = clearAllData();
      if (success) {
        alert('数据已清除');
        onDataChanged();
        onClose();
      } else {
        alert('清除数据失败');
      }
    } catch (error) {
      console.error('清除数据失败:', error);
      alert('清除数据失败，请重试');
    } finally {
      setIsClearing(false);
    }
  };

  const handleInitializeSampleData = async () => {
    if (!window.confirm('确定要重新初始化示例数据吗？这将添加一些示例卡片和卡组。')) {
      return;
    }

    setIsInitializing(true);
    try {
      const success = initializeSampleData();
      if (success) {
        alert('示例数据已初始化');
        onDataChanged();
        onClose();
      } else {
        alert('初始化示例数据失败');
      }
    } catch (error) {
      console.error('初始化示例数据失败:', error);
      alert('初始化示例数据失败，请重试');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        // 这里可以添加导入逻辑
        console.log('导入数据:', jsonData);
        alert('导入功能待实现');
      } catch (error) {
        console.error('导入数据失败:', error);
        alert('导入数据失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">⚙️ 设置</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* 数据管理 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📁 数据管理</h3>
              <div className="space-y-3">
                {/* 导出数据 */}
                <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      导出中...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      导出数据
                    </>
                  )}
                </button>

                {/* 导入数据 */}
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    导入数据
                  </label>
                </div>

                {/* 初始化示例数据 */}
                <button
                  onClick={handleInitializeSampleData}
                  disabled={isInitializing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInitializing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      初始化中...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      初始化示例数据
                    </>
                  )}
                </button>

                {/* 清除所有数据 */}
                <button
                  onClick={handleClearData}
                  disabled={isClearing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClearing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      清除中...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      清除所有数据
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 关于信息 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ℹ️ 关于</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>AI卡片收藏系统</strong></p>
                <p>版本: 1.0.0</p>
                <p>一个用于收集和管理AI工具、GitHub仓库、Prompt等资源的卡片系统。</p>
                <p>支持链接解析、智能分类、搜索过滤等功能。</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
