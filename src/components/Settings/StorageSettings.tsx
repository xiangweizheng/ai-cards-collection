import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface StorageSettingsProps {
  useSupabase: boolean;
  onToggleStorage: (useSupabase: boolean) => void;
}

export const StorageSettings: React.FC<StorageSettingsProps> = ({
  useSupabase,
  onToggleStorage
}) => {
  const { user, loading, signInAnonymously, signOut } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleToggleStorage = async (enabled: boolean) => {
    if (enabled && !user) {
      // 需要登录才能使用Supabase
      setIsSigningIn(true);
      const success = await signInAnonymously();
      setIsSigningIn(false);
      
      if (success) {
        onToggleStorage(true);
      }
    } else {
      onToggleStorage(enabled);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onToggleStorage(false); // 登出后切换回localStorage
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-3">数据存储设置</h3>
      
      <div className="space-y-4">
        {/* 当前存储方式 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">
              当前存储方式: {useSupabase ? 'Supabase云端' : '本地存储'}
            </p>
            <p className="text-xs text-gray-500">
              {useSupabase 
                ? '数据保存在云端，可跨设备同步' 
                : '数据保存在浏览器本地，仅限当前设备'}
            </p>
          </div>
          <div className={`w-3 h-3 rounded-full ${useSupabase ? 'bg-green-500' : 'bg-blue-500'}`}></div>
        </div>

        {/* 用户状态 */}
        {user && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800">✅ 已连接到云端存储</p>
                <p className="text-xs text-green-600">用户ID: {user.id.slice(0, 8)}...</p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs text-green-700 hover:text-green-900 underline"
              >
                断开连接
              </button>
            </div>
          </div>
        )}

        {/* 存储切换 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="localStorage"
              name="storage"
              checked={!useSupabase}
              onChange={() => handleToggleStorage(false)}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor="localStorage" className="text-sm text-gray-700">
              <span className="font-medium">本地存储</span>
              <span className="block text-xs text-gray-500">
                数据保存在浏览器中，速度快但仅限当前设备
              </span>
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="supabase"
              name="storage"
              checked={useSupabase}
              onChange={() => handleToggleStorage(true)}
              disabled={isSigningIn}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor="supabase" className="text-sm text-gray-700">
              <span className="font-medium">云端存储 (Supabase)</span>
              <span className="block text-xs text-gray-500">
                数据保存在云端，可跨设备同步，需要网络连接
              </span>
            </label>
          </div>
        </div>

        {/* 登录状态提示 */}
        {!user && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              💡 选择云端存储将自动创建匿名账户，无需注册
            </p>
          </div>
        )}

        {/* 登录中状态 */}
        {isSigningIn && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              🔄 正在连接云端存储...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
