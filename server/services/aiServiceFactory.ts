import { AIService } from './aiService.js';
import { GeminiService } from './gemini.js';
import { KorsifyAIService } from './korsifyAI.js';
import { AIGenerationOptions } from './gemini.js';

export class AIServiceFactory {
  private static geminiService: GeminiService | null = null;
  private static korsifyService: KorsifyAIService | null = null;

  static getService(model: 'gemini' | 'korsify' = 'gemini'): AIService {
    if (model === 'korsify') {
      if (!this.korsifyService) {
        this.korsifyService = new KorsifyAIService();
      }
      return this.korsifyService;
    } else {
      // Default to Gemini
      if (!this.geminiService) {
        this.geminiService = new GeminiService();
      }
      return this.geminiService;
    }
  }

  static async generateCourseStructure(
    documentContent: string,
    fileName: string,
    options: AIGenerationOptions = {}
  ) {
    const model = options.aiModel || 'gemini';
    const service = this.getService(model);
    
    console.log(`Using AI model: ${model === 'korsify' ? 'Korsify AI (Premium)' : 'Google Gemini'}`);
    
    return service.generateCourseStructure(documentContent, fileName, options);
  }
}