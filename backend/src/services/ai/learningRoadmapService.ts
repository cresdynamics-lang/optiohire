import { openRouterService } from './openRouterService.js'

export class LearningRoadmapService {
  /**
   * Generates a step-by-step learning roadmap for a specific skill, 
   * output as HTML cards suitable for the frontend.
   */
  async generateRoadmap(skillName: string): Promise<string> {
    const prompt = `
      You are an expert technical career coach. A candidate needs to learn the skill: "${skillName}".
      Create a step-by-step learning roadmap to master this skill.
      
      Format the output as clean, modern HTML using Tailwind CSS classes.
      Do not include <html>, <body>, or markdown code blocks (like \`\`\`html).
      Just return the raw HTML div elements.

      Structure guidelines:
      - Use a main container with grid layout: <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      - Each step should be a card: <div class="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      - Include a Step number: <div class="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Step 1: Basics</div>
      - Title of the step: <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">...</h3>
      - Description: <p class="text-sm text-slate-600 dark:text-slate-300 mb-4">...</p>
      - Suggested resource link (fake or generic placeholder link like YouTube/Coursera): <a href="#" class="text-sm text-blue-600 hover:underline inline-flex items-center">Watch Tutorial →</a>

      Provide 4 clear, actionable steps to master ${skillName}.
    `

    try {
      const roadmapHtml = await openRouterService.generateText(prompt)
      
      // Clean up markdown fences if AI included them
      let cleanHtml = roadmapHtml.replace(/```html/gi, '').replace(/```/g, '').trim()
      return cleanHtml
    } catch (error: any) {
      console.error('Error generating roadmap:', error.message)
      throw new Error(`Failed to generate roadmap for ${skillName}`)
    }
  }
}
