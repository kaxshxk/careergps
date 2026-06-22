'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Copy } from 'lucide-react'

import type { LoadingStep } from '@/lib/types'
import { LOADING_STEPS } from '@/lib/ui-data'
import type { AnalysisPhaseMessage } from '@/lib/websocket'

interface LoadingScreenProps {
  sessionId: string
  phases: Partial<Record<AnalysisPhaseMessage['phase'], unknown>>
  onConnect: () => void
}

const TAGLINES = [
  'Scanning live job market for your role...',
  'Identifying the skills that matter most...',
  'Building your personalized learning path...',
]

export function LoadingScreen({ sessionId, phases, onConnect }: LoadingScreenProps) {
  const [taglineIndex, setTaglineIndex] = useState(0)
  const [taglineFading, setTaglineFading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { onConnect() }, [onConnect])

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineFading(true)
      setTimeout(() => {
        setTaglineIndex(i => (i + 1) % TAGLINES.length)
        setTaglineFading(false)
      }, 500)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const steps = useMemo<LoadingStep[]>(() => {
    return LOADING_STEPS.map((step, index) => {
      let state: LoadingStep['state'] = 'pending'
      if (index === 0)      state = phases.JOB_INSIGHT ? 'done' : 'running'
      else if (index === 1) state = phases.SKILL_TREE  ? 'done' : phases.JOB_INSIGHT ? 'running' : 'pending'
      else if (index === 2) state = phases.GAP_MAP     ? 'done' : phases.SKILL_TREE  ? 'running' : 'pending'
      else if (index === 3) state = phases.RESOURCES   ? 'done' : phases.GAP_MAP     ? 'running' : 'pending'
      else if (index === 4) state = phases.ROADMAP || phases.COMPLETE ? 'done' : phases.RESOURCES ? 'running' : 'pending'
      return { ...step, state }
    })
  }, [phases])

  const progress = useMemo(() => {
    const doneCount = steps.filter(s => s.state === 'done').length
    return Math.max(8, Math.min(100, (doneCount / steps.length) * 100))
  }, [steps])

  const handleCopy = () => {
    void navigator.clipboard.writeText(sessionId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const DOT_POSITIONS = [
    { left: '10%', top: '25%', delay: '0s',   dur: '5s'   },
    { left: '80%', top: '15%', delay: '1.2s',  dur: '4.5s' },
    { left: '65%', top: '70%', delay: '0.6s',  dur: '6s'   },
    { left: '20%', top: '75%', delay: '2s',    dur: '5.5s' },
    { left: '45%', top: '10%', delay: '0.3s',  dur: '4s'   },
    { left: '90%', top: '50%', delay: '1.5s',  dur: '5s'   },
  ]

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden bg-white"
      style={{
        background: `
          radial-gradient(ellipse 60% 40% at 50% 30%, rgba(99,102,241,0.06), transparent),
          #FFFFFF
        `,
      }}
    >
      {/* Background dot particles */}
      {DOT_POSITIONS.map((d, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full pointer-events-none dot-particle"
          style={{ left: d.left, top: d.top, background: '#6366F1', '--dot-dur': d.dur, '--dot-delay': d.delay } as React.CSSProperties}
        />
      ))}

      {/* Logo section */}
      <div className="pt-14 pb-6 flex flex-col items-center gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg,#6366F1,#7C3AED)',
            animation: 'logoPulse 2.5s ease-in-out infinite',
          }}
        >
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
          </svg>
        </div>
        <span
          className="text-xl font-bold"
          style={{
            background: 'linear-gradient(135deg,#6366F1,#7C3AED)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'pulse 3s ease-in-out infinite',
          }}
        >
          PathForge
        </span>
        {/* Cycling tagline with crossfade */}
        <p
          className="text-sm text-[#475569] text-center transition-opacity duration-500"
          style={{ opacity: taglineFading ? 0 : 1 }}
        >
          {TAGLINES[taglineIndex]}
        </p>
      </div>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="bg-white rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  border: step.state === 'done'
                    ? '1px solid #D1FAE5'
                    : step.state === 'running'
                    ? '1px solid #C7D2FE'
                    : '1px solid #E5E7EB',
                  borderLeft: step.state === 'done'
                    ? '3px solid #10B981'
                    : step.state === 'running'
                    ? '3px solid #6366F1'
                    : '1px solid #E5E7EB',
                  transform: step.state === 'running' ? 'translateY(-1px)' : undefined,
                  boxShadow: step.state === 'running' ? '0 4px 16px rgba(99,102,241,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                  animation: `slideInFromRight 0.4s ease ${index * 0.08}s both`,
                  opacity: step.state === 'pending' ? 0.45 : 1,
                }}
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Circle indicator */}
                  <div className="flex-shrink-0">
                    {step.state === 'done' ? (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#10B981' }}>
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      </div>
                    ) : step.state === 'running' ? (
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ border: '3px solid #6366F1', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full" style={{ border: '2px solid #D1D5DB' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#0F172A]">{step.label}</p>
                    <p className="text-xs mt-0.5 text-[#475569]">{step.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Session ID */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <p className="text-xs text-[#94A3B8] font-mono">Session: {sessionId.slice(0, 8)}...</p>
            <button onClick={handleCopy} className="text-[#94A3B8] hover:text-[#6366F1] transition-colors" title="Copy session ID">
              {copied ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </main>

      {/* Progress bar — gradient with shimmer, 6px */}
      <div className="h-[6px] bg-[#F3F4F6] relative overflow-hidden" style={{ borderRadius: '3px' }}>
        <div
          className="h-full relative overflow-hidden"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #6366F1, #7C3AED)',
            transition: 'width 0.5s ease-linear',
            borderRadius: '3px',
          }}
        >
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmerBar 1.5s ease infinite',
            }}
          />
        </div>
        <div className="absolute right-2 -top-5 font-mono text-xs text-[#94A3B8]">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  )
}
