const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyBgoV3sV-IqbIqVgRs-BlqTnF-lwKtAVv4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export interface CardPolishRequest {
  title: string;
  description: string;
  url?: string;
  type?: string;
  tags?: string[];
}

export interface CardPolishResponse {
  title: string;
  description: string;
  tags: string[];
  suggestedPrice?: number;
}

/**
 * 使用Gemini Flash 2.0润色卡片信息
 */
export async function polishCardWithGemini(cardData: CardPolishRequest): Promise<CardPolishResponse> {
  const prompt = `
请帮我润色和完善这张卡片的信息。请用中文回复，并以JSON格式返回结果。

当前卡片信息：
- 标题：${cardData.title}
- 描述：${cardData.description}
- 链接：${cardData.url || '无'}
- 类型：${cardData.type || '未知'}
- 标签：${cardData.tags?.join(', ') || '无'}

请帮我：
1. 优化标题，使其更加吸引人和准确
2. 完善描述，使其更加详细和有用，突出核心功能和优势
3. 建议合适的标签（3-5个）
4. 如果可能，建议一个合理的价格（美元/月，如果是免费工具则为0）

请严格按照以下JSON格式返回：
{
  "title": "优化后的标题",
  "description": "优化后的详细描述",
  "tags": ["标签1", "标签2", "标签3"],
  "suggestedPrice": 数字或0
}

注意：
- 标题要简洁有力，不超过50字
- 描述要详细实用，100-200字左右
- 标签要准确反映工具特性
- 价格要合理，参考市场行情
- 只返回JSON，不要其他文字
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No response from Gemini API');
    }

    // 尝试解析JSON响应
    try {
      // 清理响应文本，移除可能的markdown代码块标记
      const cleanedText = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const result = JSON.parse(cleanedText);
      
      // 验证响应格式
      if (!result.title || !result.description || !Array.isArray(result.tags)) {
        throw new Error('Invalid response format from Gemini');
      }

      return {
        title: result.title,
        description: result.description,
        tags: result.tags,
        suggestedPrice: typeof result.suggestedPrice === 'number' ? result.suggestedPrice : undefined
      };
    } catch {
      console.error('Failed to parse Gemini response:', generatedText);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

/**
 * 检查Gemini API是否可用
 */
export async function checkGeminiApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello'
          }]
        }]
      })
    });

    return response.ok;
  } catch {
    return false;
  }
}
