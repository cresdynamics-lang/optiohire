'use client'

import React, { useState } from 'react'
import { Plus, Trash2, GripVertical, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CustomQuestion } from '@/types'

interface ScreeningQuestionsBuilderProps {
  questions: CustomQuestion[]
  onChange: (questions: CustomQuestion[]) => void
  jobTitle: string
  jobDescription: string
  token?: string | null
}

export function ScreeningQuestionsBuilder({ questions, onChange, jobTitle, jobDescription, token }: ScreeningQuestionsBuilderProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const addQuestion = () => {
    const newQuestion: CustomQuestion = {
      id: `q_${Date.now()}`,
      question: '',
      type: 'TEXT',
      required: false,
    }
    onChange([...(questions || []), newQuestion])
  }

  const updateQuestion = (id: string, updates: Partial<CustomQuestion>) => {
    onChange((questions || []).map(q => q.id === id ? { ...q, ...updates } : q))
  }

  const removeQuestion = (id: string) => {
    onChange((questions || []).filter(q => q.id !== id))
  }

  const addOption = (questionId: string) => {
    onChange((questions || []).map(q => {
      if (q.id === questionId) {
        return { ...q, options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] }
      }
      return q
    }))
  }

  const updateOption = (questionId: string, index: number, value: string) => {
    onChange((questions || []).map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options]
        newOptions[index] = value
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  const removeOption = (questionId: string, index: number) => {
    onChange((questions || []).map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options]
        newOptions.splice(index, 1)
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  const generateAIQuestions = async () => {
    if (!jobTitle || !jobDescription || jobDescription.length < 20) {
      setError('Please provide a job title and description first to generate relevant questions.')
      setTimeout(() => setError(''), 4000)
      return
    }

    setIsGenerating(true)
    setError('')
    try {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const authToken = token || storedToken;
      
      const response = await fetch('/api/job-postings/generate-questions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          job_title: jobTitle,
          job_description: jobDescription
        })
      })
      const data = await response.json()

      if (data.questions && data.questions.length > 0) {
        const newQuestions = data.questions.map((q: any) => ({
          ...q,
          id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))
        onChange([...(questions || []), ...newQuestions])
      } else {
        setError('Failed to generate questions. Please try again.')
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to generate questions.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Screening Questions</h3>
          <p className="text-sm text-gray-400">Ask candidates custom questions to filter them early.</p>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={generateAIQuestions}
          disabled={isGenerating}
          className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
        >
          {isGenerating ? (
            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Auto-generate with AI
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-4">
        {(!questions || questions.length === 0) ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-800 rounded-xl">
            <p className="text-gray-400 mb-4">No screening questions added yet.</p>
            <Button variant="outline" onClick={addQuestion}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        ) : (
          questions.map((q, index) => (
            <div key={q.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4 relative group">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-move text-gray-500">
                <GripVertical className="w-4 h-4" />
              </div>
              <div className="flex items-start gap-4 pl-4">
                <div className="flex-1 space-y-4">
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">Question {index + 1}</Label>
                    <Input 
                      value={q.question}
                      onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                      placeholder="e.g. How many years of B2B sales experience do you have?"
                      className="bg-black/50"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs text-gray-400 mb-1 block">Answer Type</Label>
                      <Select 
                        value={q.type} 
                        onValueChange={(val: any) => {
                          const updates: Partial<CustomQuestion> = { type: val }
                          if (val === 'MULTIPLE_CHOICE' && !q.options) {
                            updates.options = ['Option 1', 'Option 2']
                          }
                          updateQuestion(q.id, updates)
                        }}
                      >
                        <SelectTrigger className="bg-black/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TEXT">Short Answer</SelectItem>
                          <SelectItem value="PARAGRAPH">Paragraph</SelectItem>
                          <SelectItem value="BOOLEAN">Yes / No</SelectItem>
                          <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-6">
                      <Switch 
                        checked={q.required} 
                        onCheckedChange={(checked) => updateQuestion(q.id, { required: checked })}
                      />
                      <Label className="text-sm">Required</Label>
                    </div>
                  </div>

                  {q.type === 'MULTIPLE_CHOICE' && (
                    <div className="space-y-2 pt-2 border-t border-gray-800">
                      <Label className="text-xs text-gray-400">Options</Label>
                      {(q.options || []).map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-gray-600 flex-shrink-0" />
                          <Input 
                            value={opt}
                            onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                            className="h-8 bg-black/30"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-500 hover:text-red-400"
                            onClick={() => removeOption(q.id, optIndex)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" onClick={() => addOption(q.id)} className="text-xs text-gray-400 mt-2">
                        <Plus className="w-3 h-3 mr-1" /> Add Option
                      </Button>
                    </div>
                  )}

                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeQuestion(q.id)}
                  className="text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {questions && questions.length > 0 && (
        <Button variant="outline" onClick={addQuestion} className="w-full border-dashed">
          <Plus className="w-4 h-4 mr-2" />
          Add Another Question
        </Button>
      )}
    </div>
  )
}


