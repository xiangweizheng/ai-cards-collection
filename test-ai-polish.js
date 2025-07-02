// 简单测试AI润色功能
const { polishCardWithGemini } = require('./src/utils/geminiApi.ts');

async function testAiPolish() {
  try {
    console.log('测试AI润色功能...');
    
    const testCard = {
      title: 'ChatGPT',
      description: '一个AI聊天工具',
      url: 'https://chat.openai.com',
      type: 'ai_service',
      tags: ['AI']
    };

    console.log('原始卡片:', testCard);
    
    const result = await polishCardWithGemini(testCard);
    
    console.log('润色后的卡片:', result);
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

// 如果直接运行此文件则执行测试
if (require.main === module) {
  testAiPolish();
}

module.exports = { testAiPolish };
