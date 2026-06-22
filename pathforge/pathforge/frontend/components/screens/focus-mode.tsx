'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, ExternalLink, Settings, X } from 'lucide-react'
import type { DailyTask } from '@/lib/types'
import { cn } from '@/lib/utils'

interface FocusModeProps {
  tasks: DailyTask[]
  completedTasks: Set<string>
  onCompleteTask: (taskId: string, skillId: string) => void
  onExit: () => void
  matchScore: number
  skillProgress: Array<{ name: string; percentage: number }>
}

const TYPE_COLORS: Record<string, string> = {
  Video:    'bg-blue-100 text-blue-700',
  Reading:  'bg-purple-100 text-purple-700',
  Project:  'bg-emerald-100 text-emerald-700',
  Practice: 'bg-orange-100 text-orange-700',
}

const WORK_OPTIONS  = [15, 20, 25, 30, 45, 60]
const BREAK_OPTIONS = [5, 10, 15]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function ConfettiPiece({ index }: { index: number }) {
  const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#8B5CF6', '#F97316']
  const color = colors[index % colors.length]
  const left = `${(index * 3.33) % 100}%`
  const delay = `${(index * 0.07) % 1.5}s`
  const duration = `${1.5 + (index % 5) * 0.3}s`
  const size = 4 + (index % 3) * 2
  return (
    <div
      className="absolute rounded-sm"
      style={{
        left,
        top: '-20px',
        width: size,
        height: size,
        backgroundColor: color,
        animation: `confetti-fall ${duration} ease-in ${delay} infinite`,
        transform: `rotate(${index * 37}deg)`,
      }}
    />
  )
}

export function FocusMode({
  tasks,
  completedTasks,
  onCompleteTask,
  onExit,
  matchScore,
  skillProgress,
}: FocusModeProps) {
  const [currentIdx, setCurrentIdx]       = useState(0)
  const [workMins, setWorkMins]           = useState(25)
  const [breakMins, setBreakMins]         = useState(5)
  const [timeRemaining, setTimeRemaining] = useState(25 * 60)
  const [totalTime, setTotalTime]         = useState(25 * 60)
  const [phase, setPhase]                 = useState<'work' | 'break'>('work')
  const [isRunning, setIsRunning]         = useState(false)
  const [showSettings, setShowSettings]   = useState(false)
  const [showTimeUp, setShowTimeUp]       = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [isFlashing, setIsFlashing]       = useState(false)
  const [sessionDone, setSessionDone]     = useState<Set<string>>(new Set())

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const activeTasks = tasks.filter(t => !completedTasks.has(t.id) && !t.completed)
  const totalTasks  = tasks.length
  const doneTasks   = tasks.filter(t => completedTasks.has(t.id) || t.completed || sessionDone.has(t.id)).length
  const currentTask = activeTasks[currentIdx] ?? activeTasks[0]

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
  }, [])

  const resetTimer = useCallback((workM = workMins) => {
    stopTimer()
    setPhase('work')
    setTimeRemaining(workM * 60)
    setTotalTime(workM * 60)
  }, [stopTimer, workMins])

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          setIsRunning(false)
          setIsFlashing(true)
          setShowTimeUp(true)
          setTimeout(() => setIsFlashing(false), 1200)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleStart  = () => setIsRunning(true)
  const handlePause  = () => stopTimer()

  const handleReset  = () => resetTimer()

  const handleTimeUpYes = () => {
    setShowTimeUp(false)
    if (!currentTask) return
    onCompleteTask(currentTask.id, currentTask.skillId ?? '')
    const next = new Set(sessionDone)
    next.add(currentTask.id)
    setSessionDone(next)

    const remaining = activeTasks.filter(t => !next.has(t.id))
    if (remaining.length === 0) {
      setShowCelebration(true)
      return
    }
    setCurrentIdx(prev => Math.max(0, Math.min(prev, remaining.length - 1)))
    startBreak()
  }

  const handleTimeUpSkip = () => {
    setShowTimeUp(false)
    startBreak()
  }

  const startBreak = () => {
    setPhase('break')
    setTimeRemaining(breakMins * 60)
    setTotalTime(breakMins * 60)
    setIsRunning(true)
  }

  const handleDotClick = (idx: number) => {
    stopTimer()
    setCurrentIdx(idx)
    resetTimer()
  }

  const handleApplySettings = (newWork: number, newBreak: number) => {
    setWorkMins(newWork)
    setBreakMins(newBreak)
    setShowSettings(false)
    stopTimer()
    setPhase('work')
    setTimeRemaining(newWork * 60)
    setTotalTime(newWork * 60)
  }

  // Timer ring
  const r             = 90
  const circumference = 2 * Math.PI * r
  const progress      = totalTime > 0 ? timeRemaining / totalTime : 1
  const strokeOffset  = circumference * (1 - progress)
  const timerColor    = phase === 'break' ? '#10B981' : isFlashing ? '#EF4444' : '#6366F1'

  if (showCelebration) {
    const oldScore = matchScore
    const newScore = Math.min(100, matchScore + sessionDone.size)
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 overflow-hidden">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => <ConfettiPiece key={i} index={i} />)}
        </div>
        <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-md">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">All done for today!</h1>
          <p className="text-text-secondary mb-6">
            You completed all {totalTasks} tasks in this session. Incredible focus!
          </p>
          <div className="flex items-center gap-4 mb-8 px-6 py-4 bg-chip-bg rounded-xl">
            <div className="text-center">
              <p className="text-xs text-text-muted mb-1">Match Score</p>
              <p className="text-2xl font-bold text-text-primary font-mono">{oldScore}%</p>
            </div>
            <div className="text-2xl text-text-muted">→</div>
            <div className="text-center">
              <p className="text-xs text-emerald-600 font-medium mb-1">Updated</p>
              <p className="text-2xl font-bold text-emerald-600 font-mono">{newScore}%</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="px-6 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              See full roadmap
            </button>
            <button
              onClick={onExit}
              className="px-6 py-2.5 border border-border text-text-secondary rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
            </svg>
          </div>
          <span className="font-bold text-text-primary">PathForge</span>
          <span className="ml-2 text-xs text-text-muted px-2 py-0.5 bg-chip-bg rounded-full">Focus Mode</span>
        </div>
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary border border-border rounded-lg hover:border-accent hover:text-accent transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Exit Focus
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start px-6 py-8">
        <div className="w-full max-w-lg">

          {/* Phase badge */}
          <div className="flex justify-center mb-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={
                phase === 'work'
                  ? { background: '#EEF2FF', color: '#6366F1' }
                  : { background: '#ECFDF5', color: '#10B981' }
              }
            >
              {phase === 'work' ? 'Work Session' : 'Break Time'}
            </span>
          </div>

          {/* Current task card */}
          {currentTask ? (
            <div className="bg-white border border-border rounded-2xl p-6 mb-6 shadow-sm">
              <p className="text-xs text-text-muted mb-3">
                Task {currentIdx + 1} of {activeTasks.length} today
              </p>
              <h2
                className="font-bold text-text-primary mb-3 leading-tight"
                style={{ fontSize: '22px' }}
              >
                {currentTask.title}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                {currentTask.skillId && (
                  <span className="px-2.5 py-1 bg-accent-light text-accent rounded-full text-xs font-medium">
                    {currentTask.skillId}
                  </span>
                )}
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', TYPE_COLORS[currentTask.type] ?? 'bg-chip-bg text-text-secondary')}>
                  {currentTask.type}
                </span>
                {currentTask.source && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-chip-bg text-text-secondary rounded-full text-xs">
                    {currentTask.source}
                    <ExternalLink className="w-3 h-3" />
                  </span>
                )}
                {currentTask.duration && (
                  <span className="px-2.5 py-1 bg-chip-bg text-text-muted rounded-full text-xs font-mono">
                    {currentTask.duration}
                  </span>
                )}
              </div>

              {/* Task dots navigation */}
              <div className="flex items-center justify-center gap-2 mt-5">
                {activeTasks.map((t, i) => {
                  const isDone = sessionDone.has(t.id) || completedTasks.has(t.id)
                  const isActive = i === currentIdx
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleDotClick(i)}
                      className="transition-all"
                      title={t.title}
                    >
                      {isDone ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center check-bounce">
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </div>
                      ) : isActive ? (
                        <div className="w-3 h-3 rounded-full bg-accent" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-chip-bg border border-border" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-2xl p-6 mb-6 text-center text-text-muted">
              No tasks scheduled for today.
            </div>
          )}

          {/* Timer */}
          <div className="flex flex-col items-center mb-6">
            <div className={cn('relative', isFlashing && 'timer-flash')}>
              <svg className="-rotate-90" width="220" height="220" viewBox="0 0 220 220">
                <circle cx="110" cy="110" r={r} fill="none" stroke="#F3F4F6" strokeWidth="10" />
                <circle
                  cx="110" cy="110" r={r} fill="none"
                  stroke={timerColor} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={strokeOffset}
                  style={{ transition: isRunning ? 'stroke-dashoffset 1s linear' : 'none' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-5xl font-bold text-text-primary" style={{ letterSpacing: '-1px' }}>
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-xs text-text-muted mt-1">
                  {phase === 'work' ? `${workMins} min focus` : `${breakMins} min break`}
                </span>
              </div>
            </div>

            {/* Timer controls */}
            <div className="flex items-center gap-3 mt-5">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="px-8 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="px-8 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ background: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }}
                >
                  Pause
                </button>
              )}
              <button
                onClick={handleReset}
                className="px-5 py-2.5 border border-border text-text-secondary rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setShowSettings(s => !s)}
                className="p-2.5 border border-border text-text-secondary rounded-lg hover:border-accent hover:text-accent transition-colors"
                title="Timer settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <SettingsPanel
              workMins={workMins}
              breakMins={breakMins}
              onApply={handleApplySettings}
              onClose={() => setShowSettings(false)}
            />
          )}

          {/* Progress summary */}
          <div className="bg-white border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-text-primary">
                {doneTasks} of {totalTasks} tasks complete today
              </span>
              <span className="text-sm font-mono font-semibold text-accent">{matchScore}%</span>
            </div>
            <div className="space-y-2">
              {skillProgress.slice(0, 3).map(s => (
                <div key={s.name}>
                  <div className="flex justify-between text-xs text-text-muted mb-0.5">
                    <span>{s.name}</span>
                    <span>{s.percentage}%</span>
                  </div>
                  <div className="h-1 bg-chip-bg rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${s.percentage}%`, background: '#6366F1', transition: 'width 0.8s ease' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Time's up dialog */}
      {showTimeUp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60">
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full mx-4 text-center">
            <div className="w-14 h-14 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-accent font-mono">!</span>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Time&apos;s up!</h3>
            <p className="text-text-secondary text-sm mb-6">
              Did you complete <span className="font-semibold">{currentTask?.title}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleTimeUpYes}
                className="flex-1 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                Yes, mark done
              </button>
              <button
                onClick={handleTimeUpSkip}
                className="flex-1 py-2.5 border border-border text-text-secondary rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Settings Panel ───────────────────────────────────────────────────────────

interface SettingsPanelProps {
  workMins: number
  breakMins: number
  onApply: (work: number, brk: number) => void
  onClose: () => void
}

function SettingsPanel({ workMins, breakMins, onApply, onClose }: SettingsPanelProps) {
  const [work,  setWork]  = useState(workMins)
  const [brk,   setBrk]   = useState(breakMins)

  return (
    <div className="bg-white border border-border rounded-xl p-5 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Timer Settings</h3>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-xs text-text-muted mb-2">Work duration (minutes)</p>
        <div className="flex flex-wrap gap-2">
          {WORK_OPTIONS.map(m => (
            <button
              key={m}
              onClick={() => setWork(m)}
              className="px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={
                work === m
                  ? { background: '#EEF2FF', color: '#6366F1', border: '1px solid #6366F1' }
                  : { background: '#F3F4F6', color: '#6B7280', border: '1px solid transparent' }
              }
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs text-text-muted mb-2">Break duration (minutes)</p>
        <div className="flex flex-wrap gap-2">
          {BREAK_OPTIONS.map(m => (
            <button
              key={m}
              onClick={() => setBrk(m)}
              className="px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={
                brk === m
                  ? { background: '#ECFDF5', color: '#10B981', border: '1px solid #10B981' }
                  : { background: '#F3F4F6', color: '#6B7280', border: '1px solid transparent' }
              }
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onApply(work, brk)}
        className="w-full py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
      >
        Apply
      </button>
    </div>
  )
}
