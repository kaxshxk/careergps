'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Calendar, Check, ChevronDown, ChevronRight, Compass, Download, GitBranch, Route, Target, Wallet, Zap } from 'lucide-react'

import { cn } from '@/lib/utils'
import { FocusMode } from '@/components/screens/focus-mode'
import { ProgressCalendar } from '@/components/progress-calendar'
import { RoadmapPrintView } from '@/components/roadmap-print-view'
import {
  buildAlternatePaths,
  buildDeepSprint,
  buildGpsMilestones,
  financialTierFromProfile,
  getResourceSignal,
  taskFitsTier,
  type FinancialTier,
} from '@/lib/career-gps'
import type { DailyViewDay, ProgressData, Roadmap, UserProfile, WeeklyViewWeek } from '@/lib/types'

type ViewMode = 'monthly' | 'weekly' | 'daily'

interface RoadmapProgressProps {
  roadmap: Roadmap[]
  weeklyView: WeeklyViewWeek[]
  dailyView: DailyViewDay[]
  progress: ProgressData
  completedTaskIds: string[]
  onToggleTask: (taskId: string, skillId: string, completed: boolean) => void
  jobTitle?: string
  userName?: string
  userProfile?: UserProfile
}

const TYPE_BADGE: Record<string, string> = {
  Video:    'bg-blue-50 text-blue-600 border-blue-200',
  Reading:  'bg-purple-50 text-purple-600 border-purple-200',
  Project:  'bg-emerald-50 text-emerald-600 border-emerald-200',
  Practice: 'bg-orange-50 text-orange-600 border-orange-200',
}

// ─── Skill proficiency state type ─────────────────────────────────────────────

interface SkillProf {
  current:    number
  required:   number
  totalTasks: number
  name:       string
}

// ─── Monthly sub-view ─────────────────────────────────────────────────────────

interface MonthlyViewProps {
  tasks: Roadmap[]
  expandedMonths: Set<number>
  onToggleMonth: (idx: number) => void
  expandedWeeks: Set<string>
  onToggleWeek: (key: string) => void
  completedTasks: Set<string>
  onToggleTask: (taskId: string, skillId: string) => void
}

function MonthlyView({
  tasks,
  expandedMonths,
  onToggleMonth,
  expandedWeeks,
  onToggleWeek,
  completedTasks,
  onToggleTask,
}: MonthlyViewProps) {
  return (
    <div className="space-y-5">
      {tasks.map((month, mi) => {
        const isMonthExpanded = expandedMonths.has(mi)
        return (
        <div key={month.title} className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden transition-all duration-200" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <button
            onClick={() => onToggleMonth(mi)}
            className="w-full px-4 py-3 border-b border-[#E5E7EB] flex items-center gap-3 hover:bg-[#F8F9FF] transition-colors text-left"
          >
            <span className="font-mono text-xs text-text-muted">Month {String(mi + 1).padStart(2, '0')}</span>
            <span className="font-semibold text-sm text-text-primary">{month.title.split('—')[1]?.trim() ?? month.title}</span>
            {month.weeks[0]?.skill && (
              <span className="px-2 py-0.5 text-xs rounded-md border" style={{ background: '#EEF2FF', color: '#6366F1', borderColor: '#6366F1' }}>
                {month.weeks[0].skill}
              </span>
            )}
            <div className="ml-auto flex-shrink-0">
              {isMonthExpanded
                ? <ChevronDown className="w-4 h-4 text-text-muted" />
                : <ChevronRight className="w-4 h-4 text-text-muted" />}
            </div>
          </button>

          {isMonthExpanded && (
          <div className="divide-y divide-border">
            {month.weeks.map(week => {
              const weekKey = `${month.title}||${week.label}`
              const isExpanded = expandedWeeks.has(weekKey)
              const isCurrentWeek = (week.tasks ?? []).some(t => t.isToday)
              const completedCount = (week.tasks ?? []).filter(t => completedTasks.has(t.id) || t.completed).length

              return (
                <div key={week.label}>
                  <button
                    onClick={() => onToggleWeek(weekKey)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 hover:bg-chip-bg transition-colors text-left',
                      isCurrentWeek && 'border-l-4 border-l-accent'
                    )}
                    style={isCurrentWeek ? { background: 'rgba(238,242,255,0.4)' } : {}}
                  >
                    <div className={cn('w-2 h-2 rounded-full flex-shrink-0', isCurrentWeek ? 'bg-accent' : 'bg-chip-bg border border-border')} />
                    <span className="text-sm text-text-secondary">{week.label}</span>
                    <span className="px-2 py-0.5 text-xs rounded border bg-chip-bg text-text-secondary border-border">{week.skill}</span>
                    {isCurrentWeek && (
                      <span className="px-2 py-0.5 text-xs rounded-md" style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>
                        Current Week
                      </span>
                    )}
                    <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                      <span className="font-mono text-xs text-text-muted">{completedCount}/{(week.tasks ?? []).length}</span>
                      {isExpanded
                        ? <ChevronDown className="w-4 h-4 text-text-muted" />
                        : <ChevronRight className="w-4 h-4 text-text-muted" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="ml-8 mr-4 mb-3 rounded-lg overflow-hidden border-l-2 border-l-accent" style={{ background: 'rgba(238,242,255,0.15)' }}>
                      {(week.tasks ?? []).map(task => {
                        const isDone = completedTasks.has(task.id) || task.completed
                        return (
                          <div
                            key={task.id}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5',
                              task.isToday && 'border-l-2 border-l-accent'
                            )}
                            style={task.isToday ? { background: 'rgba(238,242,255,0.5)' } : {}}
                          >
                            <button
                              onClick={() => onToggleTask(task.id, task.skillId ?? week.skill)}
                              className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150"
                              style={isDone ? { background: '#6366F1', borderColor: '#6366F1' } : { borderColor: '#D1D5DB' }}
                              onMouseEnter={e => { if (!isDone) (e.currentTarget as HTMLElement).style.borderColor = '#6366F1' }}
                              onMouseLeave={e => { if (!isDone) (e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB' }}
                            >
                              {isDone && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                            </button>

                            <span className={cn('flex-1 text-sm transition-all duration-300', isDone ? 'line-through text-text-muted task-done' : 'text-text-primary')}>
                              {task.title}
                            </span>

                            {task.isToday && (
                              <span className="px-2 py-0.5 text-xs rounded-md text-white flex-shrink-0" style={{ background: '#6366F1' }}>Today</span>
                            )}
                            <span className="font-mono text-xs text-text-muted flex-shrink-0">{task.duration}</span>
                            <span className="px-2 py-0.5 text-xs rounded border bg-chip-bg text-text-secondary border-border flex-shrink-0">{task.source}</span>
                            {task.badges?.map(badge => (
                              <span
                                key={badge}
                                className={cn('px-2 py-0.5 text-xs rounded border flex-shrink-0',
                                  badge === 'Resume+' ? 'bg-emerald-50 text-success border-emerald-200' : 'bg-chip-bg text-text-secondary border-border'
                                )}
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          )}
        </div>
        )
      })}
    </div>
  )
}

// ─── Weekly sub-view ──────────────────────────────────────────────────────────

interface WeeklyViewProps {
  weeks: WeeklyViewWeek[]
  completedTasks: Set<string>
  onToggle: (id: string, skillId: string) => void
}

function WeeklyView({ weeks, completedTasks, onToggle }: WeeklyViewProps) {
  return (
    <div className="space-y-4">
      {weeks.map(week => {
        const isCurrent = week.weekNumber === 3
        const completedCount = (week.tasks ?? []).filter(t => completedTasks.has(t.id) || t.completed).length
        const total = (week.tasks ?? []).length
        const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0

        return (
          <div
            key={week.weekNumber}
            className="bg-surface rounded-xl card-shadow overflow-hidden"
            style={{ border: isCurrent ? '1px solid #6366F1' : '1px solid #E5E7EB' }}
          >
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm text-text-primary">Week {week.weekNumber}</span>
                <span className="font-mono text-xs text-text-muted">· {week.dateRange}</span>
                {isCurrent && (
                  <span className="ml-auto px-2 py-0.5 text-xs rounded-md text-white flex-shrink-0" style={{ background: '#6366F1' }}>
                    Current Week
                  </span>
                )}
              </div>
              <span className="px-2 py-0.5 text-xs rounded-md border" style={{ background: '#EEF2FF', color: '#6366F1', borderColor: '#6366F1' }}>
                {week.skill}
              </span>
            </div>

            <div className="divide-y divide-border">
              {(week.tasks ?? []).map(task => {
                const isChecked = completedTasks.has(task.id) || task.completed
                return (
                  <div key={task.id} className="flex items-start gap-3 px-4 py-3">
                    <button
                      onClick={() => onToggle(task.id, task.skillId ?? week.skill)}
                      className={cn(
                        'w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                        isChecked ? 'border-accent' : 'border-border hover:border-accent'
                      )}
                      style={isChecked ? { background: '#6366F1' } : {}}
                    >
                      {isChecked && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium', isChecked ? 'line-through text-text-muted' : 'text-text-primary')}>
                        {task.title}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{task.description}</p>
                      <p className="text-xs mt-1" style={{ color: '#6366F1' }}>{task.resource}</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                      <span className="font-mono text-xs px-2 py-0.5 rounded border bg-chip-bg text-text-muted border-border">{task.duration}</span>
                      <span className={cn('px-2 py-0.5 text-xs rounded border', TYPE_BADGE[task.type] ?? 'bg-chip-bg text-text-secondary border-border')}>
                        {task.type}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#6366F1', transition: 'width 0.4s ease' }} />
                </div>
                <span className="font-mono text-xs text-text-muted">{pct}%</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Daily sub-view ───────────────────────────────────────────────────────────

interface DailyViewProps {
  days: DailyViewDay[]
  completedTasks: Set<string>
  onToggle: (id: string, skillId: string) => void
}

function DailyView({ days, completedTasks, onToggle }: DailyViewProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {days.map(day => {
        const cardStyle: React.CSSProperties = day.isToday
          ? { background: '#FFFFFF', borderTop: '3px solid #6366F1', border: '1px solid #6366F1' }
          : day.isPast
          ? { background: '#F9FAFB', border: '1px solid #E5E7EB' }
          : { background: '#FFFFFF', border: '1px solid #E5E7EB' }

        return (
          <div key={day.dayName} className="rounded-xl card-shadow overflow-hidden" style={cardStyle}>
            <div className="px-3 py-2.5 border-b border-border flex items-center gap-2">
              <span className={cn('font-semibold text-sm', day.isPast && !day.isToday ? 'text-text-muted' : 'text-text-primary')}>
                {day.dayName}
              </span>
              <span className="font-mono text-xs text-text-muted">· {day.date}</span>
              {day.isToday && (
                <span className="ml-auto px-2 py-0.5 text-xs rounded-md border flex-shrink-0" style={{ background: '#EEF2FF', color: '#6366F1', borderColor: '#6366F1' }}>
                  Today
                </span>
              )}
            </div>

            <div className="p-3">
              {(day.tasks ?? []).length === 0 ? (
                <p className="text-xs text-text-muted text-center py-3">Rest day</p>
              ) : (
                <div className="space-y-2">
                  {day.tasks.map(task => {
                    const isChecked = completedTasks.has(task.id) || task.completed
                    return (
                      <button
                        key={task.id}
                        onClick={() => !day.isPast && onToggle(task.id, task.skillId ?? '')}
                        disabled={day.isPast}
                        className={cn(
                          'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors',
                          !day.isPast && 'hover:bg-chip-bg cursor-pointer',
                          day.isPast && 'cursor-default'
                        )}
                      >
                        <div
                          className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors"
                          style={isChecked ? { background: '#6366F1', borderColor: '#6366F1' } : { borderColor: '#E5E7EB' }}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />}
                        </div>
                        <span className={cn(
                          'flex-1 text-xs leading-snug',
                          isChecked ? 'line-through text-text-muted' : day.isPast ? 'text-text-muted' : 'text-text-primary'
                        )}>
                          {task.title}
                        </span>
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded border bg-chip-bg text-text-muted border-border flex-shrink-0">
                          {task.duration}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CareerGpsStrategyPanelProps {
  financialTier: FinancialTier
  onFinancialTierChange: (tier: FinancialTier) => void
  budgetTaskCount: number
  totalTaskCount: number
  milestones: ReturnType<typeof buildGpsMilestones>
  alternatePaths: ReturnType<typeof buildAlternatePaths>
  deepSprint: ReturnType<typeof buildDeepSprint>
}

const FINANCIAL_OPTIONS: { id: FinancialTier; label: string; helper: string }[] = [
  { id: 'free', label: 'Free', helper: 'No-cost route' },
  { id: 'affordable', label: 'Affordable', helper: 'Low-cost mix' },
  { id: 'flexible', label: 'Flexible', helper: 'Fastest path' },
]

function CareerGpsStrategyPanel({
  financialTier,
  onFinancialTierChange,
  budgetTaskCount,
  totalTaskCount,
  milestones,
  alternatePaths,
  deepSprint,
}: CareerGpsStrategyPanelProps) {
  const featuredMilestone = milestones[0]
  const featuredTask = featuredMilestone?.tasks[0]
  const resourceSignal = featuredTask ? getResourceSignal(featuredTask) : null

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="h-[3px]" style={{ background: 'linear-gradient(90deg,#10B981,#6366F1)' }} />
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#10B981] flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#0F172A]">Career GPS Strategy</h3>
            <p className="text-xs text-[#94A3B8]">Budget, milestones, alternates, and deep sprint</p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Wallet className="w-3.5 h-3.5 text-[#6366F1]" />
            <p className="text-xs font-semibold text-[#475569]">Financial view</p>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {FINANCIAL_OPTIONS.map(option => {
              const active = option.id === financialTier
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onFinancialTierChange(option.id)}
                  className="rounded-lg border px-2 py-2 text-left transition-colors"
                  style={active
                    ? { borderColor: '#6366F1', background: '#EEF2FF', color: '#4338CA' }
                    : { borderColor: '#E5E7EB', background: '#FFFFFF', color: '#475569' }}
                >
                  <span className="block text-xs font-bold">{option.label}</span>
                  <span className="block text-[10px] leading-tight opacity-75">{option.helper}</span>
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-[#94A3B8]">
            {budgetTaskCount} of {totalTaskCount} roadmap tasks fit this view.
          </p>
        </div>

        {featuredMilestone && (
          <div className="rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Route className="w-3.5 h-3.5 text-[#10B981]" />
              <p className="text-xs font-semibold text-[#475569]">Next milestone</p>
            </div>
            <p className="text-sm font-bold text-[#0F172A]">{featuredMilestone.timeframe}: {featuredMilestone.title}</p>
            <p className="text-xs text-[#94A3B8] mt-1">{featuredMilestone.skill}</p>
            {featuredTask && (
              <div className="mt-2 rounded-md bg-white border border-[#E5E7EB] p-2">
                <p className="text-xs text-[#475569]">{featuredTask.title}</p>
                {resourceSignal && (
                  <p className="text-[11px] text-[#94A3B8] mt-1">
                    {resourceSignal.label}: {resourceSignal.description}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="rounded-lg border border-[#E5E7EB] p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <GitBranch className="w-3.5 h-3.5 text-[#6366F1]" />
            <p className="text-xs font-semibold text-[#475569]">Alternate paths</p>
          </div>
          <div className="space-y-2">
            {alternatePaths.slice(0, 2).map(path => (
              <div key={path.title}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-[#0F172A]">{path.title}</p>
                  <span className="font-mono text-[11px] text-[#6366F1]">{path.overlap}% overlap</span>
                </div>
                <p className="text-[11px] text-[#64748B] mt-0.5">{path.firstMove}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[#C7D2FE] bg-[#F8F9FF] p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3.5 h-3.5 text-[#6366F1]" />
            <p className="text-xs font-semibold text-[#4338CA]">Deep optimization sprint</p>
          </div>
          <div className="space-y-2">
            {deepSprint.slice(0, 3).map(item => (
              <div key={`${item.week}-${item.topic}`} className="grid grid-cols-[52px_1fr] gap-2">
                <span className="text-[11px] font-mono text-[#6366F1]">{item.week}</span>
                <span className="text-[11px] text-[#475569]">
                  <strong className="text-[#0F172A]">{item.topic}:</strong> {item.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function RoadmapProgress({
  roadmap,
  weeklyView,
  dailyView,
  progress,
  completedTaskIds,
  onToggleTask,
  jobTitle = '',
  userName = '',
  userProfile,
}: RoadmapProgressProps) {
  const [viewMode, setViewMode]   = useState<ViewMode>('monthly')
  const [focusMode, setFocusMode] = useState(false)
  const [financialTier, setFinancialTier] = useState<FinancialTier>(() => financialTierFromProfile(userProfile))

  // ── Single completedTasks Set across all three views ──────────────────────
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(() => {
    const s = new Set<string>()
    completedTaskIds.forEach(id => s.add(id))
    ;(roadmap ?? []).forEach(m => (m.weeks ?? []).forEach(w =>
      (w.tasks ?? []).forEach(t => { if (t.completed) s.add(t.id) })
    ))
    ;(weeklyView ?? []).forEach(w =>
      (w.tasks ?? []).forEach(t => { if (t.completed) s.add(t.id) })
    )
    ;(dailyView ?? []).forEach(d =>
      (d.tasks ?? []).forEach(t => { if (t.completed) s.add(t.id) })
    )
    ;(progress.todaysTasks ?? []).forEach(t => { if (t.completed) s.add(t.id) })
    return s
  })

  // ── Skill proficiencies (drives both rings + bars) ────────────────────────
  const [skillProfs, setSkillProfs] = useState<Map<string, SkillProf>>(() => {
    const m = new Map<string, SkillProf>()
    ;(progress.skillProgress ?? []).forEach(sp => {
      if (!sp.skillId || sp.requiredProficiency <= 0) return
      const prof: SkillProf = {
        current:    sp.currentProficiency ?? sp.percentage ?? 0,
        required:   sp.requiredProficiency,
        totalTasks: sp.totalTasks ?? 1,
        name:       sp.name,
      }
      m.set(sp.skillId, prof)
      // Also key by lowercase so skill-name fallbacks resolve
      m.set(sp.skillId.toLowerCase(), prof)
    })
    return m
  })

  // Calculate match score from current proficiencies
  const calcMatchScore = useCallback((profs: Map<string, SkillProf>): number => {
    // Deduplicate: count each skillId once (original casing wins)
    const seen = new Set<string>()
    let total = 0
    let count = 0
    profs.forEach((prof, key) => {
      const normalKey = key.toLowerCase()
      if (seen.has(normalKey)) return
      seen.add(normalKey)
      if (prof.required > 0) {
        total += Math.min(100, (prof.current / prof.required) * 100)
        count++
      }
    })
    if (count === 0) return progress.matchScore
    return Math.round(total / count)
  }, [progress.matchScore])

  const [matchScore, setMatchScore] = useState(() => calcMatchScore(skillProfs))
  const [scoreChange, setScoreChange] = useState(0)
  const scoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync when server updates progress
  useEffect(() => {
    if (!(progress.skillProgress ?? []).some(sp => sp.skillId && sp.requiredProficiency > 0)) {
      setMatchScore(progress.matchScore)
      return
    }
    const m = new Map<string, SkillProf>()
    progress.skillProgress.forEach(sp => {
      if (!sp.skillId || sp.requiredProficiency <= 0) return
      const prof: SkillProf = {
        current:    sp.currentProficiency ?? sp.percentage ?? 0,
        required:   sp.requiredProficiency,
        totalTasks: sp.totalTasks ?? 1,
        name:       sp.name,
      }
      m.set(sp.skillId, prof)
      m.set(sp.skillId.toLowerCase(), prof)
    })
    setSkillProfs(m)
    setMatchScore(calcMatchScore(m))
  }, [progress.matchScore, progress.skillProgress, calcMatchScore])

  // ── Unified task complete handler ─────────────────────────────────────────
  const handleTaskComplete = useCallback((taskId: string, skillId: string) => {
    const wasCompleted = completedTasks.has(taskId)

    // Update completed set
    const nextCompleted = new Set(completedTasks)
    wasCompleted ? nextCompleted.delete(taskId) : nextCompleted.add(taskId)
    setCompletedTasks(nextCompleted)

    // Update skill proficiency
    const normId = skillId.toLowerCase()
    const nextProfs = new Map(skillProfs)
    const prof = nextProfs.get(skillId) ?? nextProfs.get(normId)
    if (prof && prof.totalTasks > 0) {
      const gain = prof.required / prof.totalTasks
      const updated: SkillProf = {
        ...prof,
        current: wasCompleted
          ? Math.max(0, prof.current - gain)
          : prof.current + gain,
      }
      nextProfs.set(skillId, updated)
      if (normId !== skillId) nextProfs.set(normId, updated)
    }
    setSkillProfs(nextProfs)

    // Recalculate match score
    const newScore = calcMatchScore(nextProfs)
    const delta = newScore - matchScore
    setMatchScore(newScore)
    if (delta !== 0) {
      setScoreChange(delta)
      if (scoreTimerRef.current) clearTimeout(scoreTimerRef.current)
      scoreTimerRef.current = setTimeout(() => setScoreChange(0), 2500)
    }
  }, [completedTasks, skillProfs, calcMatchScore, matchScore])

  // Monthly handler: also notifies parent for server persistence
  const handleMonthlyTaskToggle = useCallback((taskId: string, skillId: string) => {
    handleTaskComplete(taskId, skillId)
    const isNowCompleted = !completedTasks.has(taskId)
    onToggleTask(taskId, skillId, !isNowCompleted)
  }, [handleTaskComplete, completedTasks, onToggleTask])

  // ── Expansion state ───────────────────────────────────────────────────────
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(() => new Set([0]))

  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    ;(roadmap ?? []).forEach(month => {
      ;(month.weeks ?? []).forEach(week => {
        if ((week.tasks ?? []).some(t => t.isToday)) {
          initial.add(`${month.title}||${week.label}`)
        }
      })
    })
    return initial
  })

  const toggleMonth = (idx: number) =>
    setExpandedMonths(prev => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n })

  const toggleWeek = (key: string) =>
    setExpandedWeeks(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })

  // ── Monthly tasks with completedTasks applied ─────────────────────────────
  const tasks = useMemo(
    () =>
      (roadmap ?? []).map(month => ({
        ...month,
        weeks: (month.weeks ?? []).map(week => ({
          ...week,
          tasks: (week.tasks ?? []).map(task => ({
            ...task,
            completed: task.completed || completedTasks.has(task.id),
          })),
        })),
      })),
    [completedTasks, roadmap]
  )

  // ── Skill progress bars derived from live proficiencies ───────────────────
  const skillProgressBars = useMemo(() => {
    return (progress.skillProgress ?? []).map(sp => {
      const prof = skillProfs.get(sp.skillId) ?? skillProfs.get((sp.skillId ?? '').toLowerCase())
      const curr = prof?.current ?? sp.currentProficiency ?? sp.percentage ?? 0
      const req  = prof?.required ?? sp.requiredProficiency ?? 100
      const pct  = req > 0 ? Math.round(Math.min(100, (curr / req) * 100)) : 0
      return { name: sp.name, percentage: pct }
    })
  }, [progress.skillProgress, skillProfs])

  // ── Today's tasks ─────────────────────────────────────────────────────────
  const todayTotal = (progress.todaysTasks ?? []).length
  const todayDone  = (progress.todaysTasks ?? []).filter(t => completedTasks.has(t.id)).length

  // ── Progress ring ─────────────────────────────────────────────────────────
  const circumference = 2 * Math.PI * 42
  const ringOffset    = circumference - (matchScore / 100) * circumference

  const viewOptions: { id: ViewMode; label: string }[] = [
    { id: 'monthly', label: 'Monthly' },
    { id: 'weekly',  label: 'Weekly'  },
    { id: 'daily',   label: 'Daily'   },
  ]

  const monthCount = (roadmap ?? []).length
  const viewLabel = {
    monthly: `${monthCount}-month learning plan`,
    weekly:  "This week's tasks",
    daily:   "Today's schedule",
  }[viewMode]

  // Today's tasks for focus mode (from dailyView today, else todaysTasks)
  const focusTasks = useMemo(() => {
    const todayDay = (dailyView ?? []).find(d => d.isToday)
    if (todayDay && todayDay.tasks.length > 0) return todayDay.tasks
    return (progress.todaysTasks ?? []).map(t => ({
      id:       t.id,
      skillId:  t.skillId,
      title:    t.title,
      source:   '',
      duration: '',
      type:     'Practice' as const,
      completed: t.completed,
    }))
  }, [dailyView, progress.todaysTasks])

  const handleExportPDF = () => {
    const el = document.getElementById('print-view')
    if (el) {
      el.style.display = 'block'
      window.print()
      setTimeout(() => { el.style.display = 'none' }, 500)
    }
  }

  useEffect(() => {
    setFinancialTier(financialTierFromProfile(userProfile))
  }, [userProfile])

  const gpsMilestones = useMemo(
    () => buildGpsMilestones(tasks, Array.from(completedTasks)),
    [completedTasks, tasks]
  )

  const alternatePaths = useMemo(
    () => buildAlternatePaths(jobTitle, tasks),
    [jobTitle, tasks]
  )

  const deepSprint = useMemo(
    () => buildDeepSprint(weeklyView ?? [], tasks),
    [tasks, weeklyView]
  )

  const budgetTasks = useMemo(
    () => tasks.flatMap(month => month.weeks.flatMap(week => week.tasks ?? [])).filter(task => taskFitsTier(task, financialTier)),
    [financialTier, tasks]
  )

  if (focusMode) {
    return (
      <FocusMode
        tasks={focusTasks}
        completedTasks={completedTasks}
        onCompleteTask={handleTaskComplete}
        onExit={() => setFocusMode(false)}
        matchScore={matchScore}
        skillProgress={skillProgressBars}
      />
    )
  }

  return (
    <div className="flex-1 flex overflow-hidden screen-enter" style={{ background: '#FAFAFA' }}>
      {/* ── Left column ─────────────────────────────────────────────────── */}
      <div className="flex flex-col overflow-hidden border-r border-[#E5E7EB]" style={{ width: '65%' }}>
        {/* Toggle header */}
        <div className="px-4 py-3 border-b border-[#E5E7EB] bg-white">
          <div className="flex items-center gap-2 mb-1.5">
            {viewOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setViewMode(opt.id)}
                className="px-4 py-1.5 text-sm rounded-full transition-all duration-150"
                style={
                  viewMode === opt.id
                    ? { background: '#EEF2FF', color: '#6366F1', border: '1px solid #6366F1', fontWeight: 600 }
                    : { background: '#F3F4F6', color: '#475569', border: '1px solid transparent', fontWeight: 400 }
                }
              >
                {opt.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition-all border border-[#E5E7EB] bg-white text-[#475569] hover:bg-[#F8F9FF] hover:border-[#6366F1] hover:text-[#6366F1]"
              >
                <Download className="w-3.5 h-3.5" />
                Export PDF
              </button>
              <button
                onClick={() => setFocusMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition-all text-white font-semibold"
                style={{ background: 'linear-gradient(135deg,#6366F1,#7C3AED)', boxShadow: 'var(--shadow-indigo)' }}
              >
                <Target className="w-3.5 h-3.5" />
                Focus Mode
              </button>
            </div>
          </div>
          <p className="text-xs text-[#94A3B8]">{viewLabel}</p>
        </div>

        {/* View content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div key={viewMode} className="fade-in">
            {viewMode === 'monthly' && (
              <MonthlyView
                tasks={tasks}
                expandedMonths={expandedMonths}
                onToggleMonth={toggleMonth}
                expandedWeeks={expandedWeeks}
                onToggleWeek={toggleWeek}
                completedTasks={completedTasks}
                onToggleTask={handleMonthlyTaskToggle}
              />
            )}
            {viewMode === 'weekly' && (
              <WeeklyView
                weeks={weeklyView ?? []}
                completedTasks={completedTasks}
                onToggle={handleTaskComplete}
              />
            )}
            {viewMode === 'daily' && (
              <DailyView
                days={dailyView ?? []}
                completedTasks={completedTasks}
                onToggle={handleTaskComplete}
              />
            )}
          </div>
        </div>
      </div>

      {/* Hidden print view — shown only during window.print() */}
      <RoadmapPrintView
        jobTitle={jobTitle}
        userName={userName}
        matchScore={matchScore}
        roadmap={roadmap ?? []}
        progress={progress}
      />

      {/* ── Right column ─────────────────────────────────────────────────── */}
      <div className="flex flex-col overflow-auto p-4 space-y-4 bg-[#FAFAFA]" style={{ width: '35%' }}>
        {/* Progress ring with gradient stroke */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="relative w-36 h-36 mx-auto mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#F3F4F6" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="url(#ringGrad)" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={ringOffset}
                className="ring-draw"
                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)', filter: 'drop-shadow(0 2px 8px rgba(99,102,241,0.25))' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-4xl font-bold text-[#0F172A]">{matchScore}%</span>
              <span className="text-xs mt-1 text-[#94A3B8]">Match Score</span>
              {scoreChange !== 0 && (
                <span className="text-xs font-semibold mt-0.5" style={{ color: scoreChange > 0 ? '#10B981' : '#EF4444' }}>
                  {scoreChange > 0 ? `+${scoreChange}` : scoreChange}
                </span>
              )}
            </div>
          </div>
        </div>

        <CareerGpsStrategyPanel
          financialTier={financialTier}
          onFinancialTierChange={setFinancialTier}
          budgetTaskCount={budgetTasks.length}
          totalTaskCount={tasks.flatMap(month => month.weeks.flatMap(week => week.tasks ?? [])).length}
          milestones={gpsMilestones}
          alternatePaths={alternatePaths}
          deepSprint={deepSprint}
        />

        {/* Streaks */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="font-mono text-3xl font-bold mb-1" style={{ color: '#F59E0B' }}>
              {String(progress.currentStreak).padStart(2, '0')}
            </div>
            <div className="text-xs text-[#94A3B8]">day streak 🔥</div>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="font-mono text-3xl font-bold text-[#475569] mb-1">{progress.bestStreak}</div>
            <div className="text-xs text-[#94A3B8]">best streak</div>
          </div>
        </div>

        {/* Skill progress — gradient bars, staggered */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="space-y-4">
            {skillProgressBars.slice(0, 5).map((skill, i) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-[#475569]">{skill.name}</span>
                  <span className="font-mono text-xs text-[#94A3B8]">{skill.percentage}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-[#F3F4F6]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${skill.percentage}%`,
                      background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                      transition: 'width 1.2s ease',
                      transitionDelay: `${i * 80}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's mission */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="h-[3px]" style={{ background: 'linear-gradient(90deg,#6366F1,#7C3AED)' }} />
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 flex-shrink-0 text-[#6366F1]" />
              <h3 className="text-sm font-bold text-[#0F172A]">Today&apos;s Mission</h3>
            </div>
            <div className="space-y-1">
              {(progress.todaysTasks ?? []).map(task => {
                const checked = completedTasks.has(task.id)
                return (
                  <button
                    key={task.id}
                    onClick={() => handleTaskComplete(task.id, task.skillId ?? '')}
                    className="w-full flex items-center gap-3 px-2 py-2 -mx-2 rounded-lg hover:bg-[#F8F9FF] transition-colors text-left"
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150"
                      style={checked
                        ? { background: '#6366F1', borderColor: '#6366F1' }
                        : { borderColor: '#D1D5DB' }
                      }
                      onMouseEnter={e => { if (!checked) (e.currentTarget as HTMLElement).style.borderColor = '#6366F1' }}
                      onMouseLeave={e => { if (!checked) (e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB' }}
                    >
                      {checked && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                    </div>
                    <span className={cn('flex-1 text-sm transition-all duration-200', checked ? 'line-through text-[#94A3B8] task-done' : 'text-[#0F172A]')}>
                      {task.title}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-[#94A3B8] mt-3 pt-3 border-t border-[#E5E7EB]">
              {todayDone} of {todayTotal} tasks complete
            </p>
          </div>
        </div>

        {/* Phase indicator */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-xs font-semibold text-[#94A3B8] mb-2">Phase 1 of 3 · Foundation</p>
          <div className="h-1.5 rounded-full overflow-hidden bg-[#F3F4F6]">
            <div className="h-full rounded-full" style={{ width: '33%', background: 'linear-gradient(90deg,#6366F1,#7C3AED)', transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* Activity calendar */}
        <ProgressCalendar completedTasks={completedTasks} />
      </div>
    </div>
  )
}
