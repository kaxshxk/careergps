'use client'

import { useMemo, useState } from 'react'
import { Check, CheckCircle, ClipboardCheck, Clock, HelpCircle, Target, X, XCircle } from 'lucide-react'
import { quizQuestions, scoreToProficiency, type SkillCategory } from '@/lib/quiz-data'
import { cn } from '@/lib/utils'

interface SkillQuizProps {
  onUpdate: (categoryScores: Record<string, number>) => void
  onClose: () => void
}

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  frontend_dev:     'Frontend Dev',
  backend_dev:      'Backend Dev',
  data_analysis:    'Data Analysis',
  machine_learning: 'Machine Learning',
  marketing:        'Marketing',
  finance:          'Finance',
  design:           'Design',
  general:          'General',
}

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  frontend_dev:     'bg-emerald-100 text-emerald-700',
  backend_dev:      'bg-orange-100 text-orange-700',
  data_analysis:    'bg-blue-100 text-blue-700',
  machine_learning: 'bg-purple-100 text-purple-700',
  marketing:        'bg-yellow-100 text-yellow-700',
  finance:          'bg-cyan-100 text-cyan-700',
  design:           'bg-pink-100 text-pink-700',
  general:          'bg-gray-100 text-gray-700',
}

function proficiencyLabel(score: number): string {
  if (score <= 40) return 'Beginner'
  if (score <= 60) return 'Intermediate'
  if (score <= 80) return 'Advanced'
  return 'Expert'
}

function proficiencyColor(score: number): string {
  if (score <= 40) return '#F59E0B'
  if (score <= 60) return '#6366F1'
  if (score <= 80) return '#3B82F6'
  return '#10B981'
}

function LogoBar({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-[#6366F1] rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
          </svg>
        </div>
        <span className="font-bold text-[#111827]">{title}</span>
      </div>
      <button
        onClick={onClose}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:border-[#6366F1] hover:text-[#6366F1] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        Close
      </button>
    </div>
  )
}

export function SkillQuiz({ onUpdate, onClose }: SkillQuizProps) {
  const [screen, setScreen]               = useState<'intro' | 'quiz' | 'results'>('intro')
  const [currentIdx, setCurrentIdx]       = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers]             = useState<Record<string, number>>({})

  const questions = useMemo(() => quizQuestions.slice(0, 20), [])
  const totalQuestions = questions.length
  const currentQuestion = questions[currentIdx]

  const handleSelectAnswer = (idx: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(idx)
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: idx }))
  }

  const handleNext = () => {
    if (currentIdx + 1 >= totalQuestions) {
      setScreen('results')
    } else {
      setCurrentIdx(prev => prev + 1)
      setSelectedAnswer(null)
    }
  }

  const handleRetake = () => {
    setScreen('intro')
    setCurrentIdx(0)
    setSelectedAnswer(null)
    setAnswers({})
  }

  const categoryResults = useMemo((): Record<string, number> => {
    if (screen !== 'results') return {}
    const scores: Record<string, { correct: number; total: number }> = {}
    questions.forEach(q => {
      if (answers[q.id] !== undefined) {
        if (!scores[q.skillCategory]) scores[q.skillCategory] = { correct: 0, total: 0 }
        scores[q.skillCategory].total++
        if (answers[q.id] === q.correctIndex) scores[q.skillCategory].correct++
      }
    })
    return Object.fromEntries(
      Object.entries(scores).map(([cat, { correct, total }]) => [
        cat,
        Math.round((correct / total) * 100),
      ])
    )
  }, [screen, questions, answers])

  const overallScore = useMemo(() => {
    const vals = Object.values(categoryResults)
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
  }, [categoryResults])

  // ── Intro ─────────────────────────────────────────────────────────────────

  if (screen === 'intro') {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <LogoBar title="PathForge" onClose={onClose} />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-lg w-full text-center">
            <div className="w-20 h-20 bg-[#EEF2FF] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ClipboardCheck className="w-10 h-10 text-[#6366F1]" />
            </div>
            <h1 className="text-3xl font-bold text-[#111827] mb-3">Skill Assessment</h1>
            <p className="text-[#6B7280] mb-8 max-w-sm mx-auto leading-relaxed">
              Calibrate your learning roadmap by testing what you already know.
              Results will automatically update your skill proficiency levels.
            </p>
            <div className="flex items-center justify-center gap-3 mb-10">
              {([
                { Icon: Clock,       label: '~5 minutes'      },
                { Icon: HelpCircle,  label: `${totalQuestions} questions` },
                { Icon: Target,      label: 'Updates roadmap' },
              ] as const).map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-4 py-2 bg-[#F3F4F6] rounded-lg text-sm text-[#374151]">
                  <Icon className="w-4 h-4 text-[#6B7280]" />
                  {label}
                </div>
              ))}
            </div>
            <button
              onClick={() => setScreen('quiz')}
              className="px-8 py-3 bg-[#6366F1] text-white rounded-xl text-base font-semibold hover:bg-[#5457E5] transition-colors"
            >
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────

  if (screen === 'quiz' && currentQuestion) {
    const progressPct = ((currentIdx + 1) / totalQuestions) * 100
    const isAnswered  = selectedAnswer !== null
    const isCorrect   = selectedAnswer === currentQuestion.correctIndex

    return (
      <div className="fixed inset-0 bg-[#FAFAFA] z-50 flex flex-col">
        {/* Header + progress bar */}
        <div className="bg-white border-b border-[#E5E7EB] px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#6366F1] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
                </svg>
              </div>
              <span className="font-bold text-[#111827]">Skill Assessment</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#9CA3AF]">
                Question {currentIdx + 1} of {totalQuestions}
              </span>
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:border-[#6366F1] hover:text-[#6366F1] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Exit
              </button>
            </div>
          </div>
          <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, background: '#6366F1' }}
            />
          </div>
        </div>

        {/* Question area */}
        <div className="flex-1 overflow-y-auto flex justify-center px-6 py-8">
          <div className="w-full max-w-xl">
            {/* Category chip */}
            <div className="mb-4">
              <span className={cn(
                'inline-flex px-3 py-1 rounded-full text-xs font-medium',
                CATEGORY_COLORS[currentQuestion.skillCategory]
              )}>
                {CATEGORY_LABELS[currentQuestion.skillCategory]}
              </span>
            </div>

            {/* Question card */}
            <div
              className="bg-white border border-[#E5E7EB] rounded-xl p-6 mb-5"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            >
              <p className="text-lg font-medium text-[#111827] leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            {/* Option cards */}
            <div className="space-y-3 mb-4">
              {currentQuestion.options.map((option, idx) => {
                const isSelected      = selectedAnswer === idx
                const isCorrectOption = idx === currentQuestion.correctIndex

                let border = 'border-[#E5E7EB]'
                let bg     = 'bg-white'
                let text   = 'text-[#374151]'
                let dotBg  = 'border-[#D1D5DB] text-[#6B7280]'
                let opacity = ''

                if (isAnswered) {
                  if (isCorrectOption) {
                    border = 'border-[#10B981]'; bg = 'bg-[#ECFDF5]'; text = 'text-[#065F46]'
                    dotBg = 'bg-[#10B981] border-[#10B981] text-white'
                  } else if (isSelected) {
                    border = 'border-[#EF4444]'; bg = 'bg-[#FEF2F2]'; text = 'text-[#991B1B]'
                    dotBg = 'bg-[#EF4444] border-[#EF4444] text-white'
                  } else {
                    opacity = 'opacity-50'
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(idx)}
                    disabled={isAnswered}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 border rounded-xl text-left transition-all',
                      border, bg, opacity,
                      !isAnswered && 'cursor-pointer hover:border-[#6366F1] hover:shadow-sm',
                      isAnswered && 'cursor-default'
                    )}
                  >
                    <div className={cn(
                      'w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 text-sm font-semibold',
                      dotBg
                    )}>
                      {isAnswered && isCorrectOption
                        ? <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        : isAnswered && isSelected && !isCorrectOption
                        ? <X className="w-3.5 h-3.5" strokeWidth={3} />
                        : String.fromCharCode(65 + idx)}
                    </div>
                    <span className={cn('flex-1 text-sm leading-snug', text)}>{option}</span>
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            {isAnswered && (
              <div className={cn(
                'flex items-start gap-3 p-4 rounded-xl mb-4 border text-sm',
                isCorrect
                  ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46]'
                  : 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E]'
              )}>
                {isCorrect
                  ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                }
                <p className="leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}

            {/* Next button */}
            {isAnswered && (
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-[#6366F1] text-white rounded-lg text-sm font-medium hover:bg-[#5457E5] transition-colors"
                >
                  {currentIdx + 1 >= totalQuestions ? 'See Results' : 'Next'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Results ───────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-[#FAFAFA] z-50 overflow-y-auto">
      <LogoBar title="Assessment Results" onClose={onClose} />

      <div className="max-w-2xl mx-auto w-full px-6 py-8">
        {/* Overall score card */}
        <div
          className="bg-white border border-[#E5E7EB] rounded-xl p-6 mb-6 text-center"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
        >
          <h2 className="text-2xl font-bold text-[#111827] mb-1">Assessment Complete!</h2>
          <p className="text-[#6B7280] mb-5 text-sm">Here&apos;s how you scored across skill areas.</p>
          <div className="inline-flex flex-col items-center px-8 py-4 bg-[#EEF2FF] rounded-xl">
            <span className="font-mono text-5xl font-bold text-[#6366F1]">{overallScore}%</span>
            <span className="text-sm text-[#6B7280] mt-1">Overall Score · {proficiencyLabel(overallScore)}</span>
          </div>
        </div>

        {/* Per-category breakdown */}
        <div
          className="bg-white border border-[#E5E7EB] rounded-xl p-6 mb-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
        >
          <h3 className="text-sm font-semibold text-[#111827] mb-5">Scores by Category</h3>
          <div className="space-y-5">
            {Object.entries(categoryResults).map(([cat, score]) => {
              const color = proficiencyColor(score)
              const label = proficiencyLabel(score)
              const catKey = cat as SkillCategory
              const newProf = scoreToProficiency(score)
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        CATEGORY_COLORS[catKey] ?? 'bg-[#F3F4F6] text-[#6B7280]'
                      )}>
                        {CATEGORY_LABELS[catKey] ?? cat}
                      </span>
                      <span className="text-xs font-medium" style={{ color }}>{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#9CA3AF]">→ proficiency {newProf}</span>
                      <span className="font-mono text-sm font-semibold text-[#111827]">{score}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${score}%`, backgroundColor: color, transition: 'width 1s ease' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-[#EEF2FF] border border-[#6366F1]/20 rounded-xl p-4 mb-6 text-sm text-[#374151]">
          <ClipboardCheck className="w-4 h-4 text-[#6366F1] flex-shrink-0 mt-0.5" />
          <p>
            <span className="font-medium text-[#6366F1]">What happens next: </span>
            Clicking &ldquo;Update my skill map&rdquo; adjusts proficiency levels based on your results.
            Skills in categories where you scored higher will show greater proficiency.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => onUpdate(categoryResults)}
            className="flex-1 py-3 bg-[#6366F1] text-white rounded-xl text-sm font-semibold hover:bg-[#5457E5] transition-colors"
          >
            Update my skill map
          </button>
          <button
            onClick={handleRetake}
            className="px-6 py-3 border border-[#E5E7EB] text-[#6B7280] rounded-xl text-sm font-medium hover:border-[#6366F1] hover:text-[#6366F1] transition-colors"
          >
            Retake quiz
          </button>
        </div>
      </div>
    </div>
  )
}
