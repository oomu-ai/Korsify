import { CourseStructure, AIGenerationOptions } from './gemini.js';

export interface AIService {
  generateCourseStructure(
    documentContent: string,
    fileName: string,
    options: AIGenerationOptions
  ): Promise<CourseStructure>;
}