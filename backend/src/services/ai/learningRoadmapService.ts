import { openRouterService } from './openRouterService.js'

export class LearningRoadmapService {
  /**
   * Generates a step-by-step learning roadmap for a specific skill, 
   * output as HTML cards suitable for the frontend.
   */
  async generateRoadmap(skillName: string): Promise<any[]> {
    const prompt = `
      You are an expert technical career coach. A candidate needs to learn the skill: "${skillName}".
      Create a step-by-step learning roadmap to master this skill.
      
      Format the output STRICTLY as a JSON array of objects. Do not include markdown code blocks.
      Each object should have the following keys:
      - "step": string (e.g., "Step 1: Basics")
      - "title": string (e.g., "Learn the syntax")
      - "description": string (e.g., "Understand variables and loops.")
      - "resource_url": string (e.g., "https://youtube.com/...")
      - "resource_label": string (e.g., "Watch Tutorial")

      Provide 4 clear, actionable steps to master ${skillName}.
    `

    try {
      const responseText = await openRouterService.generateText(prompt)
      let cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim()
      return JSON.parse(cleanJson)
    } catch (error: any) {
      console.error('Error generating roadmap:', error.message)
      // Fallback
      return [
        {
          step: "Step 1: Basics",
          title: "Introduction",
          description: "Start with the fundamental concepts.",
          resource_url: "#",
          resource_label: "Find a tutorial"
        }
      ]
    }
  }
}
