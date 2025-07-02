import { LinkParseResult, CardType } from '@/types';

// GitHub API 基础URL
const GITHUB_API_BASE = 'https://api.github.com';

// 链接解析器接口
export interface LinkParser {
  canParse(url: string): boolean;
  parse(url: string): Promise<LinkParseResult>;
}

// GitHub 仓库解析器
class GitHubRepoParser implements LinkParser {
  canParse(url: string): boolean {
    return url.includes('github.com') && url.includes('/') && !url.includes('/issues') && !url.includes('/pull');
  }

  async parse(url: string): Promise<LinkParseResult> {
    try {
      // 从URL提取owner和repo
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        throw new Error('Invalid GitHub URL');
      }

      const [, owner, repo] = match;
      const cleanRepo = repo.replace(/\.git$/, ''); // 移除.git后缀

      // 调用GitHub API
      const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${cleanRepo}`);
      if (!response.ok) {
        throw new Error('Failed to fetch repository data');
      }

      const repoData = await response.json();

      // 生成标签
      const tags = [
        repoData.language,
        'GitHub',
        '开源',
        ...(repoData.topics || [])
      ].filter(Boolean);

      return {
        title: repoData.name,
        description: repoData.description || '这是一个GitHub仓库',
        type: CardType.GITHUB_REPO,
        imageUrl: repoData.owner.avatar_url,
        tags,
        metadata: {
          owner: repoData.owner.login,
          repo: repoData.name,
          stars: repoData.stargazers_count,
          language: repoData.language,
          lastUpdated: new Date(repoData.updated_at)
        }
      };
    } catch {
      // 如果API调用失败，返回基础信息
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      const [, owner, repo] = match || ['', 'unknown', 'unknown'];
      
      return {
        title: repo.replace(/\.git$/, ''),
        description: `GitHub仓库: ${owner}/${repo}`,
        type: CardType.GITHUB_REPO,
        tags: ['GitHub', '开源'],
        metadata: {
          owner,
          repo: repo.replace(/\.git$/, ''),
          stars: 0,
          language: 'Unknown',
          lastUpdated: new Date()
        }
      };
    }
  }
}

// 通用网页解析器
class GenericWebParser implements LinkParser {
  canParse(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  async parse(url: string): Promise<LinkParseResult> {
    try {
      // 由于CORS限制，我们无法直接抓取网页内容
      // 这里提供一个基础的解析结果
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      
      // 根据域名判断类型和生成标签
      let type = CardType.TOOL_WEBSITE;
      const tags = ['网站'];
      
      // 特殊域名处理
      if (domain.includes('prompt') || domain.includes('chatgpt') || domain.includes('claude')) {
        type = CardType.PROMPT_SHARE;
        tags.push('AI', 'Prompt');
      } else if (domain.includes('tool') || domain.includes('app')) {
        tags.push('工具');
      }

      // 添加域名作为标签
      tags.push(domain);

      return {
        title: `${domain} - 网站`,
        description: `来自 ${domain} 的资源`,
        type,
        tags,
        metadata: {
          domain,
          url
        }
      };
    } catch {
      return {
        title: '未知网站',
        description: '无法解析的链接',
        type: CardType.CUSTOM,
        tags: ['链接'],
        metadata: {}
      };
    }
  }
}

// Prompt分享链接解析器
class PromptShareParser implements LinkParser {
  canParse(url: string): boolean {
    const promptKeywords = ['prompt', 'chatgpt', 'claude', 'openai', 'anthropic'];
    return promptKeywords.some(keyword => url.toLowerCase().includes(keyword));
  }

  async parse(url: string): Promise<LinkParseResult> {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    return {
      title: `Prompt分享 - ${domain}`,
      description: '这是一个AI Prompt分享链接',
      type: CardType.PROMPT_SHARE,
      tags: ['Prompt', 'AI', '分享', domain],
      metadata: {
        domain,
        url,
        promptText: '', // 实际使用时可能需要用户手动填写
        useCase: '通用',
        model: '未知',
        author: '未知'
      }
    };
  }
}

// 主链接解析器类
export class LinkParserService {
  private parsers: LinkParser[] = [
    new GitHubRepoParser(),
    new PromptShareParser(),
    new GenericWebParser() // 放在最后作为兜底
  ];

  async parseLink(url: string): Promise<LinkParseResult> {
    // 验证URL格式
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }

    // 找到合适的解析器
    const parser = this.parsers.find(p => p.canParse(url));
    if (!parser) {
      throw new Error('No suitable parser found');
    }

    // 解析链接
    return await parser.parse(url);
  }

  // 批量解析链接
  async parseLinks(urls: string[]): Promise<LinkParseResult[]> {
    const results = await Promise.allSettled(
      urls.map(url => this.parseLink(url))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        // 解析失败时返回基础信息
        return {
          title: `链接 ${index + 1}`,
          description: '解析失败的链接',
          type: CardType.CUSTOM,
          tags: ['链接'],
          metadata: { url: urls[index], error: result.reason }
        };
      }
    });
  }

  // 检测链接类型
  detectLinkType(url: string): CardType {
    if (url.includes('github.com')) {
      return CardType.GITHUB_REPO;
    }
    
    const promptKeywords = ['prompt', 'chatgpt', 'claude', 'openai', 'anthropic'];
    if (promptKeywords.some(keyword => url.toLowerCase().includes(keyword))) {
      return CardType.PROMPT_SHARE;
    }
    
    return CardType.TOOL_WEBSITE;
  }

  // 验证链接是否可访问
  async validateLink(url: string): Promise<boolean> {
    try {
      // 使用HEAD请求检查链接是否可访问
      await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      return true; // 如果没有抛出错误，说明链接可能是有效的
    } catch {
      return false;
    }
  }
}

// 导出单例实例
export const linkParser = new LinkParserService();
