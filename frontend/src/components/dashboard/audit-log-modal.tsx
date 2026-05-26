'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Target, Briefcase, GraduationCap, BrainCircuit, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AuditLogModalProps {
  isOpen: boolean
  onClose: () => void
  applicationId: string | null
}

export function AuditLogModal({ isOpen, onClose, applicationId }: AuditLogModalProps) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !applicationId) {
      setData(null)
      setError(null)
      return
    }

    const fetchAudit = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('token')
        const resp = await fetch(`/api/applications/${applicationId}/audit`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}))
          throw new Error(errData.error || 'Failed to fetch audit log')
        }
        setData(await resp.json())
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAudit()
  }, [isOpen, applicationId])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <Card className="bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 flex-1 overflow-hidden flex flex-col">
            <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-figtree font-extralight text-[#2D2DDD] dark:text-white flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5" />
                    AI Scoring Audit Log
                  </CardTitle>
                  {data && (
                    <p className="text-sm text-gray-500 mt-1 font-figtree">
                      Candidate: <span className="font-medium text-gray-900 dark:text-gray-200">{data.candidate_name}</span> 
                      {' '}• Job: {data.job_title}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 overflow-y-auto flex-1 bg-gray-50/50 dark:bg-gray-900/50">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <Loader2 className="w-8 h-8 animate-spin text-[#2D2DDD] mb-4" />
                  <p className="text-gray-500">Decrypting AI reasoning...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <p className="text-red-500 font-medium mb-4">{error}</p>
                  <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
              ) : data ? (
                <div className="space-y-6">
                  {/* Top Level Summary */}
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Final Reasoning</h3>
                      <p className="text-gray-800 dark:text-gray-200 font-figtree">{data.final_reasoning}</p>
                    </div>
                    <div className="text-center px-6 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-3xl font-light text-[#2D2DDD]">{data.final_score}</div>
                      <div className="text-xs font-semibold text-[#2D2DDD] uppercase tracking-wider mt-1">{data.tier}</div>
                    </div>
                  </div>

                  {/* Breakdown Cards */}
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider pt-2">Scoring Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.breakdown.map((item: any, i: number) => {
                      const icons: any = {
                        "Skill Match": <Target className="w-4 h-4 text-purple-500" />,
                        "Experience": <Briefcase className="w-4 h-4 text-blue-500" />,
                        "Education": <GraduationCap className="w-4 h-4 text-emerald-500" />,
                        "Vector Similarity": <BrainCircuit className="w-4 h-4 text-orange-500" />
                      }

                      return (
                        <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              {icons[item.label] || <Info className="w-4 h-4" />}
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 flex-1">{item.label}</h4>
                            <div className="text-lg font-light text-gray-500">{item.score}<span className="text-xs">/100</span></div>
                          </div>
                          
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-figtree">
                            {item.detail}
                          </div>
                          
                          {item.waived && (
                            <div className="mt-3">
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 font-medium">
                                Waived: {item.waiver_reason}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Meta */}
                  <div className="pt-4 flex items-center justify-between text-xs text-gray-400 border-t border-gray-200 dark:border-gray-800">
                    <div>Scored at: {new Date(data.scored_at).toLocaleString()}</div>
                    <div>Model: {data.model_used}</div>
                  </div>

                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
