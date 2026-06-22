'use client'

import type { ProgressData, Roadmap, SkillProgressItem } from '@/lib/types'

interface RoadmapPrintViewProps {
  jobTitle: string
  userName: string
  matchScore: number
  roadmap: Roadmap[]
  progress: ProgressData
}

function StatusDot({ percentage }: { percentage: number }) {
  const color = percentage >= 75 ? '#10B981' : percentage >= 40 ? '#6366F1' : '#F59E0B'
  const label = percentage >= 75 ? 'Good' : percentage >= 40 ? 'Partial' : 'Learning'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
      <span style={{ color }}>{label}</span>
    </span>
  )
}

export function RoadmapPrintView({ jobTitle, userName, matchScore, roadmap, progress }: RoadmapPrintViewProps) {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const totalTasks = roadmap.reduce((sum, m) => sum + m.weeks.reduce((ws, w) => ws + w.tasks.length, 0), 0)
  const completedTasks = roadmap.reduce(
    (sum, m) => sum + m.weeks.reduce((ws, w) => ws + w.tasks.filter(t => t.completed).length, 0),
    0
  )
  const months = roadmap.length

  const skills: SkillProgressItem[] = progress.skillProgress ?? []

  return (
    <div
      id="print-view"
      style={{
        display: 'none',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#111827',
        background: '#fff',
        padding: '0',
      }}
    >
      {/* ── Cover Page ─────────────────────────────────────────────────────── */}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '60px 40px',
          pageBreakAfter: 'always',
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#6366F1">
            <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
          </svg>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: '0 0 12px', color: '#111827' }}>
          PathForge Learning Roadmap
        </h1>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: '#6366F1', margin: '0 0 8px' }}>
          {jobTitle}
        </h2>
        <p style={{ color: '#6B7280', marginBottom: 48 }}>Prepared for {userName} · {now}</p>

        <div style={{ display: 'flex', gap: 40, justifyContent: 'center' }}>
          {[
            { label: 'Match Score',       value: `${matchScore}%` },
            { label: 'Total Duration',    value: `${months} months` },
            { label: 'Total Tasks',       value: String(totalTasks) },
            { label: 'Tasks Completed',   value: String(completedTasks) },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#6366F1', fontFamily: 'monospace' }}>{value}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Skill Summary Page ──────────────────────────────────────────────── */}
      {skills.length > 0 && (
        <div style={{ padding: '40px', pageBreakAfter: 'always' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 20 }}>
            Skill Summary
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F3F4F6' }}>
                {['Skill', 'Status', 'Proficiency', 'Progress'].map(h => (
                  <th
                    key={h}
                    style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151', border: '1px solid #E5E7EB' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {skills.map((s, index) => {
                const pct = s.percentage ?? Math.round(Math.min(100, ((s.currentProficiency ?? 0) / (s.requiredProficiency || 100)) * 100))
                return (
                  <tr key={s.skillId ?? `${s.name}-${index}`} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '9px 14px', border: '1px solid #E5E7EB', fontWeight: 500 }}>{s.name}</td>
                    <td style={{ padding: '9px 14px', border: '1px solid #E5E7EB' }}>
                      <StatusDot percentage={pct} />
                    </td>
                    <td style={{ padding: '9px 14px', border: '1px solid #E5E7EB', fontFamily: 'monospace' }}>
                      {s.currentProficiency ?? 0} / {s.requiredProficiency ?? 100}
                    </td>
                    <td style={{ padding: '9px 14px', border: '1px solid #E5E7EB' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: '#6366F1', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#6B7280' }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Monthly Roadmap Pages ───────────────────────────────────────────── */}
      {roadmap.map((month, mi) => (
        <div key={month.title} style={{ padding: '40px', pageBreakAfter: 'always' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
            {month.title}
          </h2>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 24 }}>Month {mi + 1}</p>

          {month.weeks.map(week => (
            <div key={week.label} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>{week.label}</span>
                <span
                  style={{
                    fontSize: 12,
                    padding: '2px 10px',
                    borderRadius: 20,
                    background: '#EEF2FF',
                    color: '#6366F1',
                    border: '1px solid #6366F1',
                  }}
                >
                  {week.skill}
                </span>
              </div>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
                {week.tasks.map((task, ti) => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      background: ti % 2 === 0 ? '#fff' : '#FAFAFA',
                      borderBottom: ti < week.tasks.length - 1 ? '1px solid #E5E7EB' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        border: task.completed ? 'none' : '1px solid #D1D5DB',
                        background: task.completed ? '#6366F1' : 'transparent',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {task.completed && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span
                      style={{
                        flex: 1,
                        fontSize: 13,
                        color: task.completed ? '#9CA3AF' : '#111827',
                        textDecoration: task.completed ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </span>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>{task.source}</span>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#6B7280',
                        fontFamily: 'monospace',
                        padding: '1px 6px',
                        border: '1px solid #E5E7EB',
                        borderRadius: 4,
                      }}
                    >
                      {task.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
