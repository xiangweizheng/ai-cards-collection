import { Card, CardDeck, LocalStorageData, UserSettings } from '@/types';

// 存储键名常量
const STORAGE_KEYS = {
  CARDS: 'ai-cards-collection-cards',
  DECKS: 'ai-cards-collection-decks', 
  SETTINGS: 'ai-cards-collection-settings',
  LAST_SYNC: 'ai-cards-collection-last-sync'
} as const;

// 默认用户设置
const DEFAULT_SETTINGS: UserSettings = {
  theme: 'auto',
  language: 'zh',
  autoSync: false,
  notifications: true
};

// 存储管理器类
export class StorageManager {
  private static instance: StorageManager;

  private constructor() {}

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // 检查是否支持localStorage
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // 安全的JSON解析
  private safeJsonParse<T>(json: string, defaultValue: T): T {
    try {
      return JSON.parse(json);
    } catch {
      return defaultValue;
    }
  }

  // 获取所有卡片
  public getCards(): Card[] {
    if (!this.isLocalStorageAvailable()) return [];
    
    const cardsJson = localStorage.getItem(STORAGE_KEYS.CARDS);
    if (!cardsJson) return [];
    
    const cards = this.safeJsonParse<Card[]>(cardsJson, []);
    // 转换日期字符串为Date对象
    return cards.map(card => ({
      ...card,
      createdAt: new Date(card.createdAt),
      updatedAt: new Date(card.updatedAt)
    }));
  }

  // 保存卡片
  public saveCard(card: Card): boolean {
    try {
      const cards = this.getCards();
      const existingIndex = cards.findIndex(c => c.id === card.id);
      
      if (existingIndex >= 0) {
        cards[existingIndex] = { ...card, updatedAt: new Date() };
      } else {
        cards.push(card);
      }
      
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
      return true;
    } catch {
      return false;
    }
  }

  // 删除卡片
  public deleteCard(cardId: string): boolean {
    try {
      const cards = this.getCards().filter(c => c.id !== cardId);
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
      return true;
    } catch {
      return false;
    }
  }

  // 获取单个卡片
  public getCard(cardId: string): Card | null {
    const cards = this.getCards();
    return cards.find(c => c.id === cardId) || null;
  }

  // 获取所有卡组
  public getDecks(): CardDeck[] {
    if (!this.isLocalStorageAvailable()) return [];
    
    const decksJson = localStorage.getItem(STORAGE_KEYS.DECKS);
    if (!decksJson) return [];
    
    const decks = this.safeJsonParse<CardDeck[]>(decksJson, []);
    return decks.map(deck => ({
      ...deck,
      createdAt: new Date(deck.createdAt),
      updatedAt: new Date(deck.updatedAt)
    }));
  }

  // 保存卡组
  public saveDeck(deck: CardDeck): boolean {
    try {
      const decks = this.getDecks();
      const existingIndex = decks.findIndex(d => d.id === deck.id);
      
      if (existingIndex >= 0) {
        decks[existingIndex] = { ...deck, updatedAt: new Date() };
      } else {
        decks.push(deck);
      }
      
      localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
      return true;
    } catch {
      return false;
    }
  }

  // 删除卡组
  public deleteDeck(deckId: string): boolean {
    try {
      const decks = this.getDecks().filter(d => d.id !== deckId);
      localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
      return true;
    } catch {
      return false;
    }
  }

  // 获取用户设置
  public getSettings(): UserSettings {
    if (!this.isLocalStorageAvailable()) return DEFAULT_SETTINGS;
    
    const settingsJson = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!settingsJson) return DEFAULT_SETTINGS;
    
    return { ...DEFAULT_SETTINGS, ...this.safeJsonParse(settingsJson, {}) };
  }

  // 保存用户设置
  public saveSettings(settings: Partial<UserSettings>): boolean {
    try {
      const currentSettings = this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
      return true;
    } catch {
      return false;
    }
  }

  // 获取所有数据
  public getAllData(): LocalStorageData {
    return {
      cards: this.getCards(),
      decks: this.getDecks(),
      settings: this.getSettings(),
      lastSync: this.getLastSync()
    };
  }

  // 导入数据
  public importData(data: Partial<LocalStorageData>): boolean {
    try {
      if (data.cards) {
        localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(data.cards));
      }
      if (data.decks) {
        localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(data.decks));
      }
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      this.updateLastSync();
      return true;
    } catch {
      return false;
    }
  }

  // 清空所有数据
  public clearAllData(): boolean {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch {
      return false;
    }
  }

  // 获取最后同步时间
  public getLastSync(): Date {
    if (!this.isLocalStorageAvailable()) return new Date(0);
    
    const lastSyncStr = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return lastSyncStr ? new Date(lastSyncStr) : new Date(0);
  }

  // 更新最后同步时间
  public updateLastSync(): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      return true;
    } catch {
      return false;
    }
  }

  // 生成唯一ID
  public generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出单例实例
export const storage = StorageManager.getInstance();
