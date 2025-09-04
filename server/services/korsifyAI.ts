import { CourseStructure, AIGenerationOptions } from './gemini.js';
import { AIService } from './aiService.js';
import { GoogleGenAI } from "@google/genai";

export class KorsifyAIService implements AIService {
  private apiKey: string | undefined;
  private apiUrl: string = 'https://api.korsify.com/v1/generate'; // Placeholder URL
  
  constructor() {
    this.apiKey = process.env.KORSIFY_API_KEY;
  }

  async generateCourseStructure(
    documentContent: string,
    fileName: string,
    options: AIGenerationOptions = {}
  ): Promise<CourseStructure> {
    // Since the user mentioned the prompts remain the same for both models,
    // we'll use the same prompt structure as Gemini
    
    // For now, since we don't have the API, we'll fallback to Gemini
    // When the API is available, uncomment the API call code below
    
    if (!this.apiKey) {
      console.log("Korsify API key not found, falling back to Gemini model");
      // Fallback to Gemini for now
      return this.generateWithGemini(documentContent, fileName, options);
    }

    // When the Korsify API is available, use this code:
    /*
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: documentContent,
          fileName: fileName,
          options: options,
          // The same prompt structure will be sent to Korsify API
          // since the user mentioned prompts are the same
        })
      });

      if (!response.ok) {
        throw new Error(`Korsify API error: ${response.statusText}`);
      }

      const courseStructure: CourseStructure = await response.json();
      return courseStructure;
    } catch (error) {
      console.error("Korsify API call failed, falling back to Gemini:", error);
      // Fallback to Gemini on error
      return this.generateWithGemini(documentContent, fileName, options);
    }
    */

    // Temporary: Use Gemini as fallback
    return this.generateWithGemini(documentContent, fileName, options);
  }

  private async generateWithGemini(
    documentContent: string,
    fileName: string,
    options: AIGenerationOptions
  ): Promise<CourseStructure> {
    // Use the exact same prompt structure as the Gemini service
    // since the user mentioned the prompts are the same
    
    const language = options.language || 'English';
    const targetAudience = options.targetAudience || 'General learners';
    const contentFocus = options.contentFocus || 'Comprehensive understanding';
    const difficultyLevel = options.difficultyLevel || 'intermediate';
    const moduleCount = options.moduleCount || 3;
    
    const generateQuizzes = options.generateQuizzes;
    const quizFrequency = options.quizFrequency;
    const questionsPerQuiz = options.questionsPerQuiz;
    const includeExercises = options.includeExercises;
    const includeExamples = options.includeExamples;

    const systemPrompt = `
    You are an advanced educational content generator focused on creating comprehensive online courses from source documents.

    CRITICAL UNIQUENESS REQUIREMENTS:
    - EVERY module must have a UNIQUE, distinct title and focus
    - EVERY lesson must have a UNIQUE title and cover different aspects
    - NO duplicate content, titles, or themes across modules or lessons
    - Each module must address a DIFFERENT aspect of the subject matter
    - Each lesson within a module must cover DISTINCT subtopics
    - Ensure progressive learning without repetition

    CONTENT GENERATION APPROACH:
    
    Transform the provided document into a structured online course by:
    
    1. PEDAGOGICAL FRAMEWORK:
       - Apply evidence-based learning science principles specific to the topic domain
       - Implement Bloom's Revised Taxonomy for progressive learning
       - Use structured lessons that build upon each other logically
       - Apply Cognitive Load Theory to optimize information presentation
       - Incorporate spaced repetition and interleaving principles
       - Build on foundational knowledge progressively
       - Focus on practical understanding and application

    2. CONTENT DEVELOPMENT (1000-1200 words per lesson):
       - Begin each lesson with clear learning objectives
       - Present historical context and theoretical foundations where relevant
       - Address common misconceptions with clear explanations
       - Provide cross-disciplinary connections when present in source material
       - Include current developments and research from the document
       - Use clear analogies and metaphors to explain complex concepts
       - Include "Key Concepts" and "Important Notes" sections
       - Provide practical examples and case studies from the source
       
       FORMAT CONTENT AS HTML:
       - Use proper HTML tags for structure: <h2>, <h3>, <p>, <ul>, <ol>, <li>
       - Wrap key concepts in styled divs: <div class="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded">
       - Format examples in green boxes: <div class="bg-green-50 border-l-4 border-green-500 p-4 my-4 rounded">
       - Use <strong> for emphasis and <em> for italics
       - Include structured sections with clear headings
       - Format lists properly with <ul> or <ol> tags

    3. LESSON STRUCTURE BY POSITION:
       - FOUNDATIONAL LESSONS (First in module): Establish core concepts, definitions, and fundamental principles
       - DEVELOPMENT LESSONS (Middle): Build complexity through application, analysis, and practical examples
       - SYNTHESIS LESSONS (Last in module): Integrate concepts, present advanced applications, and connect to broader context

    DIFFICULTY LEVEL ADAPTATIONS:
    Adjust content for ${difficultyLevel} level learners:
    
    ${difficultyLevel === 'beginner' ? `
    - Use simple, everyday language and avoid jargon
    - Provide extensive definitions and background
    - Include more analogies and real-world comparisons
    - Focus on fundamental concepts before details
    - Offer step-by-step explanations with visual descriptions
    - Limit content to essential information
    ` : difficultyLevel === 'intermediate' ? `
    - Balance technical terms with clear explanations
    - Assume basic familiarity but explain complex concepts
    - Include both theoretical understanding and practical application
    - Provide moderate depth with comprehensive coverage
    - Connect concepts to show relationships
    ` : difficultyLevel === 'advanced' ? `
    - Use appropriate technical terminology
    - Explore complex relationships and nuances
    - Include critical analysis and evaluation
    - Present multiple perspectives and debates
    - Focus on application and synthesis
    ` : `
    - Employ specialized technical language
    - Dive deep into theoretical frameworks
    - Explore cutting-edge developments
    - Critically evaluate methodologies
    - Focus on innovation and research implications
    `}

    ${generateQuizzes && quizFrequency === 'lesson' ? `
    4. QUIZ GENERATION FOR EACH LESSON:
       MANDATORY: Generate EXACTLY ${questionsPerQuiz} unique questions for EVERY lesson.
       - Create questions that test understanding of that specific lesson's content
       - Mix question types: multiple choice, true/false, short answer
       - Ensure questions are directly tied to the lesson material
       - Include answer explanations that reinforce learning
       - Difficulty should match the ${difficultyLevel} level
       - Questions must reference specific facts from the source document
       - NEVER generate generic questions - all must be document-specific
       - Each lesson MUST have exactly ${questionsPerQuiz} questions - no exceptions
    ` : generateQuizzes && quizFrequency === 'module' ? `
    4. QUIZ GENERATION FOR EACH MODULE:
       MANDATORY: Generate EXACTLY ${questionsPerQuiz} unique questions for EVERY module.
       - Create comprehensive questions covering all lessons in the module
       - Test synthesis and connection of concepts across lessons
       - Mix question types: multiple choice, true/false, short answer
       - Ensure questions integrate material from multiple lessons
       - Include answer explanations that reinforce learning
       - Difficulty should match the ${difficultyLevel} level
       - Questions must reference specific facts from the source document
       - NEVER generate generic questions - all must be document-specific
       - Each module MUST have exactly ${questionsPerQuiz} questions - no exceptions
    ` : ''}

    ${includeExercises ? `
    5. PRACTICAL EXERCISES:
       - Include hands-on exercises in EVERY lesson
       - Design exercises that apply the lesson concepts
       - Provide clear instructions and expected outcomes
       - Scale complexity based on ${difficultyLevel} level
       - Include reflection questions
       - All exercises must use examples from the source document
    ` : ''}

    ${includeExamples ? `
    6. REAL-WORLD EXAMPLES:
       - Incorporate practical examples throughout each lesson
       - Use cases and scenarios from the source document
       - Show how concepts apply in real situations
       - Include industry-specific or domain-relevant examples
       - Ensure examples match ${difficultyLevel} complexity
    ` : ''}

    OUTPUT REQUIREMENTS:
    - Generate EXACTLY ${moduleCount} modules
    - Each module should have 3-4 lessons
    - Follow the exact JSON structure provided
    - Ensure all content is derived from the source document
    - Maintain consistency in depth and quality across all modules
    - Each lesson must be substantial (1000-1200 words)
    ${generateQuizzes ? `- MANDATORY: Include quizzes with EXACTLY ${questionsPerQuiz} questions per ${quizFrequency}` : ''}

    STRICT CONTENT RULES:
    - ALL content must be factually derived from the provided document
    - Do NOT invent or add information not present in the source
    - When the document lacks detail on a required topic, acknowledge limitations
    - Focus on depth over breadth when document content is limited
    - Maintain academic integrity by staying true to the source material

    Focus exclusively on the document content, presenting information clearly and comprehensively. Ensure all content is directly derived from the provided source material.

    Respond with a valid JSON structure matching the CourseStructure interface.
    `;

    const userPrompt = `
    Create a comprehensive online course from the following document:
    
    Document Name: ${fileName}
    Target Language: ${language}
    Target Audience: ${targetAudience}
    Content Focus: ${contentFocus}
    Number of Modules: EXACTLY ${moduleCount} modules
    ${generateQuizzes ? `Quiz Requirements: Generate EXACTLY ${questionsPerQuiz} unique questions per ${quizFrequency}` : ''}
    ${includeExercises ? 'Include practical exercises in each lesson' : ''}
    ${includeExamples ? 'Include real-world examples throughout' : ''}
    
    Document Content:
    ${documentContent}
    `;

    try {
      // Use the same schema structure as Gemini
      const moduleSchema = {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          lessons: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                content: { type: "string" },
                estimatedDuration: { type: "number" },
                quiz: generateQuizzes && quizFrequency === 'lesson' ? {
                  type: "object",
                  properties: {
                    questions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          question: { type: "string" },
                          options: { type: "array", items: { type: "string" } },
                          correctAnswer: { type: "string" },
                          explanation: { type: "string" }
                        },
                        required: ["question", "options", "correctAnswer", "explanation"]
                      }
                    }
                  },
                  required: ["questions"]
                } : undefined
              },
              required: generateQuizzes && quizFrequency === 'lesson' 
                ? ["title", "content", "estimatedDuration", "quiz"] 
                : ["title", "content", "estimatedDuration"]
            }
          },
          quiz: generateQuizzes && quizFrequency === 'module' ? {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    correctAnswer: { type: "string" },
                    explanation: { type: "string" }
                  },
                  required: ["question", "options", "correctAnswer", "explanation"]
                }
              }
            },
            required: ["questions"]
          } : undefined
        },
        required: generateQuizzes && quizFrequency === 'module' 
          ? ["title", "description", "lessons", "quiz"]
          : ["title", "description", "lessons"]
      };

      const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("No API key found for AI generation");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", // Use Gemini as fallback but with Korsify branding
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              estimatedDuration: { type: "number" },
              difficultyLevel: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
              modules: {
                type: "array",
                items: moduleSchema
              }
            },
            required: ["title", "description", "estimatedDuration", "difficultyLevel", "modules"]
          }
        },
        contents: userPrompt,
      });

      const rawJson = response.text;
      if (!rawJson) {
        throw new Error("Empty response from model");
      }

      const courseStructure: CourseStructure = JSON.parse(rawJson);
      return courseStructure;
    } catch (error) {
      console.error("Failed to generate course structure:", error);
      throw new Error(`Failed to generate course structure: ${error}`);
    }
  }
}