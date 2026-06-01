import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, ArrowRight, Percent } from 'lucide-react'
import Link from 'next/link'

interface Recommendation {
  recommendation_id: string
  job_posting_id: string
  match_score: number
  match_reason: string
  missing_skills: string[]
}

export function JobRecommendations({ recommendations }: { recommendations: Recommendation[] }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Briefcase className="h-12 w-12 mb-4 text-slate-300" />
          <p className="text-lg font-medium text-slate-900 dark:text-slate-100">No Perfect Matches Yet</p>
          <p className="max-w-sm mt-2">
            Upload certificates to boost your skill scores. The AI will match you with jobs as you level up!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {recommendations.map((rec) => (
        <Card key={rec.recommendation_id} className="overflow-hidden border-indigo-100 dark:border-indigo-900 shadow-md">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 w-full" />
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">Matched Position</CardTitle>
                <CardDescription>AI Recommended based on your skills</CardDescription>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full flex items-center font-bold text-sm">
                <Percent className="h-3 w-3 mr-1" />
                {rec.match_score} Match
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-indigo-50 dark:bg-slate-800 p-4 rounded-lg mb-4 text-sm text-indigo-900 dark:text-indigo-200">
              <p><strong>Why you match:</strong> {rec.match_reason}</p>
            </div>
            
            {rec.missing_skills?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Skills to improve:</p>
                <div className="flex flex-wrap gap-2">
                  {rec.missing_skills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-md border border-red-100 dark:border-red-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <Link href={`/jobs/${rec.job_posting_id}`} passHref legacyBehavior>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white group">
                View Job & Apply
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
