'use client'

import { useMemo, useState } from 'react'

interface ActivityEntry {
  date: string         // YYYY-MM-DD
  count: number
  tasks: string[]
  skill?: string
}

interface ProgressCalendarProps {
  completedTasks?: Set<string>
}

// Generate 12-week realistic mock activity data anchored to today
function generateActivityData(): ActivityEntry[] {
  const entries: ActivityEntry[] = []
  const today = new Date()

  const taskPool = [
    { title: 'Complete Python basics module', skill: 'Python' },
    { title: 'NumPy fundamentals course', skill: 'NumPy/Pandas' },
    { title: 'Practice data structures', skill: 'Python' },
    { title: 'Train logistic regression', skill: 'Scikit-learn' },
    { title: 'MLOps pipeline setup', skill: 'MLOps' },
    { title: 'Docker containerization', skill: 'Docker' },
    { title: 'SQL aggregation queries', skill: 'SQL' },
    { title: 'PyTorch tensor basics', skill: 'PyTorch' },
    { title: 'Feature engineering project', skill: 'Feature Engineering' },
    { title: 'AWS SageMaker workshop', skill: 'AWS' },
    { title: 'Pandas data manipulation', skill: 'NumPy/Pandas' },
    { title: 'Cross-validation techniques', skill: 'Scikit-learn' },
    { title: 'Build CLI data processor', skill: 'Python' },
    { title: 'Kubernetes deployment', skill: 'Kubernetes' },
    { title: 'Neural network fundamentals', skill: 'PyTorch' },
    { title: 'GCP Vertex AI basics', skill: 'GCP' },
  ]

  // Seed-based pseudo-random for deterministic output
  let seed = 42
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    return Math.abs(seed) / 0xffffffff
  }

  for (let daysAgo = 83; daysAgo >= 0; daysAgo--) {
    const d = new Date(today)
    d.setDate(today.getDate() - daysAgo)
    const dayOfWeek = d.getDay() // 0 = Sun

    // Activity pattern: less on weekends, active weekdays, occasional gaps
    let maxTasks = 0
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      maxTasks = rand() < 0.3 ? 2 : 0           // weekends: 30% chance of 1-2 tasks
    } else if (daysAgo > 60) {
      maxTasks = rand() < 0.5 ? 2 : (rand() < 0.3 ? 4 : 0)  // older weeks: lighter
    } else if (daysAgo > 30) {
      maxTasks = rand() < 0.7 ? Math.ceil(rand() * 4) : 0    // mid-range: building habit
    } else {
      maxTasks = rand() < 0.8 ? Math.ceil(rand() * 6) : 0    // recent: consistent
    }

    // Occasional streak-breaking gaps (simulate real life)
    if (rand() < 0.08) maxTasks = 0

    const count = Math.min(maxTasks, 6)
    const tasks: string[] = []
    const skills = new Set<string>()

    for (let i = 0; i < count; i++) {
      const t = taskPool[Math.floor(rand() * taskPool.length)]
      tasks.push(t.title)
      skills.add(t.skill)
    }

    entries.push({
      date: d.toISOString().slice(0, 10),
      count,
      tasks,
      skill: skills.size > 0 ? Array.from(skills)[0] : undefined,
    })
  }

  return entries
}

function intensityColor(count: number): string {
  if (count === 0)  return '#F3F4F6'
  if (count <= 2)   return '#C7D2FE'
  if (count <= 4)   return '#818CF8'
  return '#4F46E5'
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return `${Math.floor(diffDays / 7)}w ago`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ProgressCalendar({ completedTasks: _completedTasks }: ProgressCalendarProps) {
  const activityData = useMemo(() => generateActivityData(), [])

  const today = new Date().toISOString().slice(0, 10)
  const totalCompleted = activityData.reduce((sum, e) => sum + e.count, 0)

  // Build 12-week grid (84 days, starting from Sunday of the earliest week)
  const grid = useMemo(() => {
    // We have 84 days of data. Group into 12 weeks × 7 days
    // First entry is 83 days ago; last is today
    const weeks: ActivityEntry[][] = []
    let week: ActivityEntry[] = []

    for (let i = 0; i < activityData.length; i++) {
      week.push(activityData[i])
      if (week.length === 7 || i === activityData.length - 1) {
        weeks.push(week)
        week = []
      }
    }
    return weeks
  }, [activityData])

  // Month labels: find the first entry of each month in the grid
  const monthLabels = useMemo(() => {
    const labels: Array<{ weekIdx: number; label: string }> = []
    let lastMonth = -1
    grid.forEach((week, wi) => {
      if (week.length > 0) {
        const d = new Date(week[0].date + 'T00:00:00')
        const m = d.getMonth()
        if (m !== lastMonth) {
          labels.push({ weekIdx: wi, label: MONTHS[m] })
          lastMonth = m
        }
      }
    })
    return labels
  }, [grid])

  // Recent activity log (last 10 days with tasks)
  const recentActivity = useMemo(() =>
    [...activityData]
      .reverse()
      .filter(e => e.count > 0)
      .slice(0, 10),
    [activityData]
  )

  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  return (
    <div className="bg-surface border border-border rounded-xl p-4 card-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary">Activity Timeline</h3>
        <span className="text-xs text-text-muted">{totalCompleted} tasks in last 12 weeks</span>
      </div>

      {/* Calendar grid */}
      <div className="relative">
        {/* Month labels row */}
        <div className="flex mb-1" style={{ paddingLeft: 28 }}>
          {grid.map((_, wi) => {
            const label = monthLabels.find(ml => ml.weekIdx === wi)
            return (
              <div key={wi} style={{ width: 14, flexShrink: 0 }}>
                {label && (
                  <span className="text-xs text-text-muted" style={{ fontSize: 9, whiteSpace: 'nowrap' }}>
                    {label.label}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-0.5">
          {/* Day labels column */}
          <div className="flex flex-col justify-between mr-1" style={{ width: 24 }}>
            {[0, 2, 4, 6].map(d => (
              <span key={d} className="text-text-muted" style={{ fontSize: 9, lineHeight: '14px' }}>
                {DAY_LABELS[d]}
              </span>
            ))}
          </div>

          {/* Week columns */}
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((entry, di) => {
                const isToday = entry.date === today
                const isHovered = hoveredDate === entry.date
                return (
                  <div
                    key={di}
                    className="relative"
                    onMouseEnter={() => setHoveredDate(entry.date)}
                    onMouseLeave={() => setHoveredDate(null)}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 2,
                        backgroundColor: intensityColor(entry.count),
                        border: isToday ? '1.5px solid #6366F1' : '1px solid transparent',
                        cursor: entry.count > 0 ? 'pointer' : 'default',
                        flexShrink: 0,
                      }}
                    />
                    {/* Tooltip */}
                    {isHovered && (
                      <div
                        className="absolute z-10 bg-text-primary text-white rounded-lg px-2.5 py-2 pointer-events-none"
                        style={{
                          bottom: 18,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          whiteSpace: 'nowrap',
                          fontSize: 11,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          minWidth: 120,
                        }}
                      >
                        <div className="font-medium">{formatDateLabel(entry.date)}</div>
                        <div style={{ color: '#D1D5DB', marginTop: 2 }}>
                          {entry.count === 0 ? 'No tasks' : `${entry.count} task${entry.count > 1 ? 's' : ''}`}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 mb-4">
        <span className="text-xs text-text-muted mr-1">Less</span>
        {[0, 1, 3, 5].map(c => (
          <div
            key={c}
            style={{
              width: 10, height: 10, borderRadius: 2,
              backgroundColor: intensityColor(c),
              border: '1px solid rgba(0,0,0,0.06)',
            }}
          />
        ))}
        <span className="text-xs text-text-muted ml-1">More</span>
      </div>

      {/* Recent activity log */}
      <div className="border-t border-border pt-3">
        <h4 className="text-xs font-medium text-text-secondary mb-2">Recent Activity</h4>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {recentActivity.map((entry, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-primary truncate flex-1">
                    {entry.tasks[0]}
                    {entry.count > 1 && (
                      <span className="text-text-muted"> +{entry.count - 1} more</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {entry.skill && (
                    <span className="px-1.5 py-0.5 bg-accent-light text-accent rounded-full text-xs">
                      {entry.skill}
                    </span>
                  )}
                  <span className="text-xs text-text-muted">{timeAgo(entry.date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

