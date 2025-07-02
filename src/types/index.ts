// 卡片类型枚举
export enum CardType {
  GITHUB_REPO = 'github_repo',
  TOOL_WEBSITE = 'tool_website', 
  PROMPT_SHARE = 'prompt_share',
  CUSTOM = 'custom'
}

// 卡片稀有度枚举
export enum CardRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

// 价格等级
export enum PriceLevel {
  FREE = 'free',        // 免费 (0元)
  BUDGET = 'budget',    // 经济型 (1-50元)
  STANDARD = 'standard', // 标准型 (51-200元)
  PREMIUM = 'premium',   // 高级型 (201-500元)
  ENTERPRISE = 'enterprise' // 企业级 (500元以上)
}

// 基础卡片接口
export interface Card {
  id: string;
  title: string;
  description: string;
  type: CardType;
  rarity: CardRarity;
  price?: number; // 新增价格字段，单位为元
  url?: string;
  imageUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

// GitHub仓库卡片特定数据
export interface GitHubRepoMetadata {
  owner: string;
  repo: string;
  stars: number;
  language: string;
  lastUpdated: Date;
}

// 工具网站卡片特定数据
export interface ToolWebsiteMetadata {
  category: string;
  pricing: 'free' | 'paid' | 'freemium';
  features: string[];
}

// Prompt分享卡片特定数据
export interface PromptShareMetadata {
  promptText: string;
  useCase: string;
  model: string;
  author: string;
}

// 卡组接口
export interface CardDeck {
  id: string;
  name: string;
  description: string;
  cardIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
}

// 搜索过滤器接口
export interface SearchFilters {
  type?: CardType[];
  rarity?: CardRarity[];
  priceLevel?: PriceLevel[];
  tags?: string[];
  query?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// 本地存储数据结构
export interface LocalStorageData {
  cards: Card[];
  decks: CardDeck[];
  settings: UserSettings;
  lastSync: Date;
}

// 用户设置接口
export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'zh' | 'en';
  autoSync: boolean;
  notifications: boolean;
}

// JSON导入数据结构
export interface ImportData {
  cards?: Partial<Card>[];
  decks?: Partial<CardDeck>[];
}

// 单个卡片导入数据
export interface ImportCardData {
  title: string;
  description: string;
  type?: CardType;
  rarity?: CardRarity;
  price?: number;
  url?: string;
  imageUrl?: string;
  tags?: string[];
}

// 单个卡组导入数据
export interface ImportDeckData {
  name: string;
  description: string;
  isPublic?: boolean;
  tags?: string[];
  cards?: ImportCardData[];
}

// API响应接口
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 链接解析结果接口
export interface LinkParseResult {
  title: string;
  description: string;
  type: CardType;
  metadata: Record<string, any>;
  imageUrl?: string;
  tags: string[];
}
