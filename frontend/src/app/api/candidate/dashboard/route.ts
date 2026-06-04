import { NextResponse } from 'next/server'

export async function GET() {
  // Return dummy data so the candidate dashboard renders successfully for the demo
  return NextResponse.json({
    success: true,
    data: {
      profile: {
        profile_id: 'mock-123',
        total_score: 85
      },
      skills: [
        {
          skill_id: 'sk-1',
          skill_name: 'Data Analysis',
          proficiency_score: 90,
          is_verified: true
        },
        {
          skill_id: 'sk-2',
          skill_name: 'Python',
          proficiency_score: 75,
          is_verified: false
        }
      ],
      recommendations: [
        {
          job_id: 'job-1',
          job_title: 'Health Data Analyst',
          company_name: 'Healthcare Inc',
          match_score: 92
        }
      ],
      gapAnalysis: {
        topMissingSkill: 'Bioinformatics',
        insight: 'Adding Bioinformatics to your profile could increase your match rate by 40% for top jobs.',
        allMissingSkills: ['Bioinformatics', 'R', 'Clinical Data Management']
      }
    }
  })
}
