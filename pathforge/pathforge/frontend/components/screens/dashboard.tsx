'use client'

import { ArrowRight, Award, BookOpen, Calendar, Compass, LogOut, Plus, Target, Trash2 } from 'lucide-react'
import type { SavedRoadmap } from '@/lib/mock-db'

interface DashboardProps {
  savedRoadmaps: SavedRoadmap[]
  userName: string
  userEmail: string
  onContinue: (roadmap: SavedRoadmap) => void
  onNewAnalysis: () => void
  onDelete: (id: string) => void
  onNavigateToProfile: () => void
  onLogout: () => void
}

function timeAgo(dateStr: string): string {
  const date    = new Date(dateStr)
  const now     = new Date()
  const diffMs  = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0)  return 'Today'
  if (diffDays === 1)  return 'Yesterday'
  if (diffDays < 7)   return `${diffDays} days ago`
  if (diffDays < 30)  return `${Math.floor(diffDays / 7)}w ago`
  return `${Math.floor(diffDays / 30)}mo ago`
}


function MiniProgressRing({ percentage }: { percentage: number }) {
  const r = 18
  const circumference = 2 * Math.PI * r
  const offset = circumference - (percentage / 100) * circumference
  const color = percentage >= 75 ? '#10B981' : percentage >= 40 ? '#6366F1' : '#F59E0B'
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#F3F4F6" strokeWidth="4" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-[#0F172A]">{percentage}%</span>
      </div>
    </div>
  )
}

const CATEGORY_COLORS: Record<string, string> = {
  'ML Engineering': 'bg-purple-100 text-purple-700',
  'Data Science':   'bg-blue-100 text-blue-700',
  'Frontend':       'bg-emerald-100 text-emerald-700',
  'Backend':        'bg-orange-100 text-orange-700',
  'DevOps':         'bg-gray-100 text-gray-700',
  'Design':         'bg-pink-100 text-pink-700',
  'Marketing':      'bg-yellow-100 text-yellow-700',
  'Finance':        'bg-cyan-100 text-cyan-700',
}

export function Dashboard({ savedRoadmaps, userName, userEmail, onContinue, onNewAnalysis, onDelete, onNavigateToProfile, onLogout }: DashboardProps) {
  const totalCompleted  = savedRoadmaps.reduce((sum, r) => sum + r.completedTasks, 0)
  const avgMatchScore   = savedRoadmaps.length ? Math.round(savedRoadmaps.reduce((sum, r) => sum + r.matchScore, 0) / savedRoadmaps.length) : 0
  const bestStreak      = 14
  const totalSkillsLearning = savedRoadmaps.length * 8
  const tasksThisWeek   = savedRoadmaps.reduce((sum, r) => sum + Math.min(r.completedTasks, 5), 0)
  const initials        = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'D'

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-[#E5E7EB] flex flex-col">
        <div className="px-4 py-5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366F1,#7C3AED)' }}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
              </svg>
            </div>
            <span
              className="text-lg font-bold"
              style={{ background: 'linear-gradient(135deg,#6366F1,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              PathForge
            </span>
          </div>
        </div>

        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8]">Active Roadmaps</span>
              <span className="text-sm font-bold text-[#6366F1]">{savedRoadmaps.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8]">Tasks Completed</span>
              <span className="text-sm font-bold text-[#0F172A]">{totalCompleted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8]">Avg Match Score</span>
              <span className="text-sm font-bold text-[#0F172A]">{avgMatchScore}%</span>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1">
          <button
            onClick={onNewAnalysis}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            style={{ height: '40px', borderRadius: '10px' }}
          >
            <Plus className="w-4 h-4" />
            New Analysis
          </button>
        </div>

        <div className="p-3 border-t border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center gap-2.5 rounded-lg p-1 cursor-pointer hover:bg-[#F3F4F6] transition-colors flex-1 min-w-0 text-left"
              onClick={onNavigateToProfile}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#6366F1,#7C3AED)' }}
              >
                <span className="text-sm font-semibold text-white">{initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#0F172A] truncate">{userName}</p>
                <span className="inline-block px-1.5 py-0.5 bg-[#F3F4F6] rounded-full text-[10px] font-medium text-[#94A3B8]">Free Plan</span>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onLogout() }}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" style={{ color: '#EF4444' }} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#FAFAFA]">
        <div className="p-6 max-w-5xl mx-auto">

          {/* Greeting Card */}
          <div
            className="bg-white border border-[#E5E7EB] rounded-xl p-6 mb-6 transition-all duration-200"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <div>
              <h1
                className="text-2xl font-extrabold mb-1"
                style={{
                  background: 'linear-gradient(135deg, #0F172A 40%, #6366F1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Welcome back, {userName.split(' ')[0]}!
              </h1>
              <p className="text-sm text-[#475569]">
                You have{' '}
                <span className="font-bold text-[#6366F1]">{savedRoadmaps.length}</span>{' '}
                active roadmap{savedRoadmaps.length !== 1 ? 's' : ''}. Keep the momentum going!
              </p>
            </div>
          </div>

          {/* Roadmaps Section */}
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <h2 className="text-base font-bold text-[#0F172A]">Your Roadmaps</h2>
            </div>

            {savedRoadmaps.length === 0 ? (
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 flex flex-col items-center text-center w-full" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-[#6366F1]" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">No roadmaps yet</h3>
                <p className="text-sm text-[#475569] mb-6 max-w-sm">Start your first analysis to build a personalized learning roadmap</p>
                <button onClick={onNewAnalysis} className="btn-primary flex items-center gap-2 px-5 text-sm h-10 bg-[#6366F1] hover:bg-[#4F46E5] text-white border-none" style={{ height: '40px', borderRadius: '10px', width: 'auto' }}>
                  + New Analysis
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center justify-center">
                {savedRoadmaps.map(roadmap => {
                  const barColor = roadmap.progressPercentage >= 75 ? '#10B981' : roadmap.progressPercentage >= 40 ? '#6366F1' : '#F59E0B'
                  return (
                    <div
                      key={roadmap.id}
                      className="w-full max-w-sm bg-white border border-[#E5E7EB] rounded-xl p-5 transition-all duration-200 hover:-translate-y-1"
                      style={{ boxShadow: 'var(--shadow-sm)' }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-indigo)')}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 mr-3">
                          <h3 className="text-sm font-bold text-[#0F172A] truncate mb-1.5">{roadmap.jobTitle}</h3>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_COLORS[roadmap.roleCategory] ?? 'bg-[#F3F4F6] text-[#475569]'}`}>
                            {roadmap.roleCategory}
                          </span>
                        </div>
                        <MiniProgressRing percentage={roadmap.progressPercentage} />
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[#94A3B8]">Progress</span>
                          <span className="text-xs font-medium text-[#475569]">{roadmap.completedTasks}/{roadmap.totalTasks} tasks</span>
                        </div>
                        <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${roadmap.progressPercentage}%`, backgroundColor: barColor, transition: 'width 1s ease' }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4 text-xs text-[#94A3B8]">
                        <span>Match: <span className="font-semibold text-[#475569]">{roadmap.matchScore}%</span></span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {timeAgo(roadmap.lastActive)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onContinue(roadmap)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-white text-xs font-semibold rounded-lg transition-all hover:opacity-90 hover:-translate-y-0.5"
                          style={{ background: 'linear-gradient(135deg,#6366F1,#7C3AED)', boxShadow: 'var(--shadow-indigo)' }}
                        >
                          Continue
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(roadmap.id)}
                          className="flex items-center justify-center p-2 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete roadmap"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Bottom Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Skills Learning',  value: totalSkillsLearning as number | string, Icon: BookOpen,   color: 'text-[#6366F1]',  delay: 0   },
              { label: 'Tasks This Week',  value: tasksThisWeek       as number | string, Icon: Target,     color: 'text-emerald-500', delay: 100 },
              { label: 'Best Streak',      value: `${bestStreak}d`    as number | string, Icon: Award,      color: 'text-orange-500',  delay: 200 },
              { label: 'Roles Explored',   value: savedRoadmaps.length as number | string,Icon: Compass,    color: 'text-purple-500',  delay: 300 },
            ].map(({ label, value, Icon, color, delay }) => (
              <div
                key={label}
                className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 cursor-default"
                style={{ boxShadow: 'var(--shadow-sm)', animation: `fadeUp 0.4s ease ${delay}ms both` }}
                onMouseEnter={e => { (e.currentTarget.style.boxShadow = 'var(--shadow-md)'); (e.currentTarget.style.borderTopColor = '#6366F1') }}
                onMouseLeave={e => { (e.currentTarget.style.boxShadow = 'var(--shadow-sm)'); (e.currentTarget.style.borderTopColor = '') }}
              >
                <div className="w-10 h-10 bg-[#F3F4F6] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-[11px] text-[#94A3B8] mb-0.5">{label}</p>
                  <p className="text-lg font-bold text-[#0F172A]">{value}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  )
}
