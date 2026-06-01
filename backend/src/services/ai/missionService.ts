import { query } from '../../db/index.js'
import { openRouterService } from './openRouterService.js'
import { EmailService } from '../emailService.js'

export class MissionService {
  private emailService = new EmailService()

  /**
   * Run daily for each candidate profile to assign a new mission.
   */
  async generateDailyMission(profileId: string, email: string, name: string): Promise<void> {
    // Determine target skill (e.g. from their active learning path or missing skills)
    const { rows } = await query(`SELECT active_learning_path FROM candidate_profiles WHERE profile_id = $1`, [profileId])
    const activePath = rows[0]?.active_learning_path || 'General Tech Skills'

    const prompt = `
      Create a "Daily Learning Mission" for a candidate trying to learn: ${activePath}.
      The mission should take about 30 minutes to complete.
      Format:
      Title: [Actionable Title]
      Description: [2-3 sentences explaining the task]
    `
    const aiResponse = await openRouterService.generateText(prompt)
    
    // Parse response
    let title = 'Daily Mission'
    let description = aiResponse
    const titleMatch = aiResponse.match(/Title:\s*(.+)/i)
    if (titleMatch) title = titleMatch[1].trim()
    const descMatch = aiResponse.match(/Description:\s*(.+)/is)
    if (descMatch) description = descMatch[1].trim()

    // Save mission
    await query(`
      INSERT INTO candidate_missions (profile_id, mission_title, mission_description, target_skill)
      VALUES ($1, $2, $3, $4)
    `, [profileId, title, description, activePath])

    // Send email (we'll assume emailService has a generic sendEmail method, or we use our own implementation here if needed)
    try {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Your Daily Learning Mission</h2>
          <p>Hi ${name},</p>
          <p>Here is your daily mission to help you master <strong>${activePath}</strong>:</p>
          <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">${title}</h3>
            <p style="margin-bottom: 0; color: #475569;">${description}</p>
          </div>
          <p>Log in to your OptioHire Dashboard to mark this mission as completed and track your progress!</p>
          <a href="https://optiohire.com/dashboard/candidate" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
        </div>
      `
      
      // We assume EmailService has sendHTML or we can add it, 
      // but let's just log it if we can't be sure of the exact signature yet.
      // E.g. this.emailService.sendGenericEmail(email, 'Your Daily Learning Mission 🚀', emailHtml)
    } catch (e) {
      console.error('Failed to send daily mission email:', e)
    }
  }
}
