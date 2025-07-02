import { Card, CardDeck, CardType, CardRarity } from '@/types';
import { storage } from './storage';

// 示例卡片数据
const sampleCards: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'React',
    description: 'A JavaScript library for building user interfaces',
    type: CardType.GITHUB_REPO,
    rarity: CardRarity.LEGENDARY,
    url: 'https://github.com/facebook/react',
    imageUrl: 'https://avatars.githubusercontent.com/u/69631?s=200&v=4',
    tags: ['JavaScript', 'React', 'Frontend', 'Library'],
    metadata: {
      owner: 'facebook',
      repo: 'react',
      stars: 220000,
      language: 'JavaScript',
      lastUpdated: new Date('2024-06-01')
    }
  },
  {
    title: 'Next.js',
    description: 'The React Framework for Production',
    type: CardType.GITHUB_REPO,
    rarity: CardRarity.EPIC,
    url: 'https://github.com/vercel/next.js',
    imageUrl: 'https://avatars.githubusercontent.com/u/14985020?s=200&v=4',
    tags: ['React', 'Next.js', 'Framework', 'SSR'],
    metadata: {
      owner: 'vercel',
      repo: 'next.js',
      stars: 120000,
      language: 'TypeScript',
      lastUpdated: new Date('2024-06-15')
    }
  },
  {
    title: 'ChatGPT',
    description: 'OpenAI的对话式AI助手',
    type: CardType.TOOL_WEBSITE,
    rarity: CardRarity.LEGENDARY,
    url: 'https://chat.openai.com',
    tags: ['AI', 'ChatGPT', 'OpenAI', '对话'],
    metadata: {
      category: 'AI工具',
      pricing: 'freemium',
      features: ['对话', '代码生成', '文本创作']
    }
  },
  {
    title: 'Claude',
    description: 'Anthropic开发的AI助手',
    type: CardType.TOOL_WEBSITE,
    rarity: CardRarity.EPIC,
    url: 'https://claude.ai',
    tags: ['AI', 'Claude', 'Anthropic', '助手'],
    metadata: {
      category: 'AI工具',
      pricing: 'freemium',
      features: ['对话', '分析', '创作']
    }
  },
  {
    title: 'Tailwind CSS',
    description: 'A utility-first CSS framework',
    type: CardType.GITHUB_REPO,
    rarity: CardRarity.RARE,
    url: 'https://github.com/tailwindlabs/tailwindcss',
    tags: ['CSS', 'Framework', 'Utility', 'Design'],
    metadata: {
      owner: 'tailwindlabs',
      repo: 'tailwindcss',
      stars: 80000,
      language: 'JavaScript',
      lastUpdated: new Date('2024-06-10')
    }
  },
  {
    title: 'VS Code',
    description: 'Visual Studio Code - 免费的代码编辑器',
    type: CardType.TOOL_WEBSITE,
    rarity: CardRarity.EPIC,
    url: 'https://code.visualstudio.com',
    tags: ['编辑器', 'IDE', 'Microsoft', '开发工具'],
    metadata: {
      category: '开发工具',
      pricing: 'free',
      features: ['代码编辑', '调试', '扩展']
    }
  },
  {
    title: '写作助手Prompt',
    description: '帮助改善写作质量的AI提示词',
    type: CardType.PROMPT_SHARE,
    rarity: CardRarity.RARE,
    tags: ['写作', 'Prompt', 'AI', '创作'],
    metadata: {
      promptText: '请帮我改善这段文字的表达，使其更加清晰、简洁且有说服力：[你的文字]',
      useCase: '文字优化',
      model: 'GPT-4',
      author: '社区贡献'
    }
  },
  {
    title: 'TypeScript',
    description: 'JavaScript的超集，添加了静态类型定义',
    type: CardType.GITHUB_REPO,
    rarity: CardRarity.EPIC,
    url: 'https://github.com/microsoft/TypeScript',
    tags: ['TypeScript', 'JavaScript', 'Microsoft', '类型'],
    metadata: {
      owner: 'microsoft',
      repo: 'TypeScript',
      stars: 98000,
      language: 'TypeScript',
      lastUpdated: new Date('2024-06-20')
    }
  },
  {
    title: 'Figma',
    description: '协作式界面设计工具',
    type: CardType.TOOL_WEBSITE,
    rarity: CardRarity.RARE,
    url: 'https://figma.com',
    tags: ['设计', 'UI', 'UX', '协作'],
    metadata: {
      category: '设计工具',
      pricing: 'freemium',
      features: ['界面设计', '原型制作', '团队协作']
    }
  },
  {
    title: '代码审查Prompt',
    description: '用于代码审查的专业提示词',
    type: CardType.PROMPT_SHARE,
    rarity: CardRarity.COMMON,
    tags: ['代码审查', 'Prompt', '开发', '质量'],
    metadata: {
      promptText: '请审查以下代码，关注：1. 代码质量 2. 性能问题 3. 安全隐患 4. 最佳实践。代码：[你的代码]',
      useCase: '代码审查',
      model: 'Claude',
      author: '开发社区'
    }
  }
];

// 示例卡组数据
const sampleDecks: Omit<CardDeck, 'id' | 'createdAt' | 'updatedAt' | 'cardIds'>[] = [
  {
    name: 'React生态系统',
    description: '收集React相关的工具和资源',
    isPublic: true,
    tags: ['React', 'Frontend', 'JavaScript']
  },
  {
    name: 'AI工具箱',
    description: '各种AI工具和服务的集合',
    isPublic: true,
    tags: ['AI', '工具', '效率']
  },
  {
    name: '开发工具',
    description: '日常开发中使用的工具和资源',
    isPublic: false,
    tags: ['开发', '工具', '效率']
  },
  {
    name: 'Prompt库',
    description: '收集有用的AI提示词',
    isPublic: true,
    tags: ['Prompt', 'AI', '模板']
  }
];

// 初始化示例数据
export function initializeSampleData(): boolean {
  try {
    // 检查是否已有数据
    const existingCards = storage.getCards();
    if (existingCards.length > 0) {
      console.log('数据已存在，跳过初始化');
      return true;
    }

    console.log('开始初始化示例数据...');

    // 创建卡片
    const createdCards: Card[] = [];
    sampleCards.forEach(cardData => {
      const card: Card = {
        ...cardData,
        id: storage.generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      if (storage.saveCard(card)) {
        createdCards.push(card);
      }
    });

    // 创建卡组并分配卡片
    sampleDecks.forEach((deckData, index) => {
      const deck: CardDeck = {
        ...deckData,
        id: storage.generateId(),
        cardIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 为每个卡组分配一些卡片
      switch (index) {
        case 0: // React生态系统
          deck.cardIds = createdCards
            .filter(card => card.tags.includes('React') || card.tags.includes('Next.js'))
            .map(card => card.id);
          break;
        case 1: // AI工具箱
          deck.cardIds = createdCards
            .filter(card => card.tags.includes('AI') || card.type === CardType.TOOL_WEBSITE)
            .map(card => card.id);
          break;
        case 2: // 开发工具
          deck.cardIds = createdCards
            .filter(card => card.tags.includes('开发工具') || card.tags.includes('编辑器'))
            .map(card => card.id);
          break;
        case 3: // Prompt库
          deck.cardIds = createdCards
            .filter(card => card.type === CardType.PROMPT_SHARE)
            .map(card => card.id);
          break;
      }

      storage.saveDeck(deck);
    });

    console.log(`成功创建 ${createdCards.length} 张卡片和 ${sampleDecks.length} 个卡组`);
    return true;
  } catch (error) {
    console.error('初始化示例数据失败:', error);
    return false;
  }
}

// 清除所有数据
export function clearAllData(): boolean {
  return storage.clearAllData();
}

// 导出数据
export function exportData() {
  const data = storage.getAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-cards-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
