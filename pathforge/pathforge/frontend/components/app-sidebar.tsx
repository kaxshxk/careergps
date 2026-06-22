'use client'

import { cn } from '@/lib/utils'
import { BookOpen, FileText, LayoutDashboard, LogOut, Map, Plus } from 'lucide-react'

type Tab = 'intelligence' | 'skills' | 'roadmap'

interface AppSidebarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  jobTitle: string
  onBack: () => void
  userName?: string
  onProfileClick?: () => void
  onLogout?: () => void
  previousScreen?: string
  sidebarContext?: 'dashboard' | 'analysis'
  savedRoadmapsCount?: number
  tasksCompleted?: number
  avgMatchScore?: number
  onNewAnalysis?: () => void
}

export function AppSidebar({
  activeTab,
  onTabChange,
  jobTitle,
  onBack,
  userName = 'PathForge User',
  onProfileClick,
  onLogout,
  previousScreen,
  sidebarContext = 'analysis',
  savedRoadmapsCount = 0,
  tasksCompleted = 0,
  avgMatchScore = 0,
  onNewAnalysis,
}: AppSidebarProps) {
  const navItems = [
    { id: 'intelligence' as Tab, label: 'Intelligence Report', icon: FileText },
    { id: 'skills'       as Tab, label: 'Skill Map',           icon: BookOpen },
    { id: 'roadmap'      as Tab, label: 'Roadmap',             icon: Map      },
  ]

  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'D'

  return (
    <aside className="w-60 border-r border-[#E5E7EB] flex flex-col bg-white">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#6366F1,#7C3AED)' }}>
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

      {/* Target Role */}
      {sidebarContext !== 'dashboard' && (
        <div className="px-4 py-3 border-b border-[#E5E7EB]">
          <p className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider mb-1">Target Role</p>
          <p className="text-sm font-medium text-[#0F172A] truncate">{jobTitle}</p>
        </div>
      )}

      {/* Stats for Dashboard Context */}
      {sidebarContext === 'dashboard' && (
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8]">Active Roadmaps</span>
              <span className="text-sm font-bold text-[#6366F1]">{savedRoadmapsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8]">Tasks Completed</span>
              <span className="text-sm font-bold text-[#0F172A]">{tasksCompleted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8]">Avg Match Score</span>
              <span className="text-sm font-bold text-[#0F172A]">{avgMatchScore}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation / New Analysis */}
      {sidebarContext !== 'dashboard' ? (
        <nav className="flex-1 p-2 pt-3">
          {navItems.map(item => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mb-1 relative',
                  isActive
                    ? 'text-[#6366F1] bg-[#EEF2FF]'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8F9FF]'
                )}
                style={isActive ? { borderLeft: '3px solid #6366F1' } : { borderLeft: '3px solid transparent' }}
              >
                <item.icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-[#6366F1]' : 'text-[#94A3B8]')} />
                <span>{item.label}</span>
              </button>
            )
          })}
          
          {/* New Analysis button in analysis sidebar */}
          <div className="px-1 pt-3 mt-2 border-t border-[#F3F4F6]">
            <button
              onClick={onNewAnalysis}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white rounded-lg hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: 'linear-gradient(135deg,#6366F1,#7C3AED)', boxShadow: 'var(--shadow-indigo)', height: '36px' }}
            >
              <Plus className="w-3.5 h-3.5" />
              New Analysis
            </button>
          </div>
        </nav>
      ) : (
        <div className="pt-3 space-y-2">
          {/* New Analysis button in dashboard context */}
          <div className="px-2">
            <button
              onClick={onNewAnalysis}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white rounded-lg hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: 'linear-gradient(135deg,#6366F1,#7C3AED)', boxShadow: 'var(--shadow-indigo)', height: '36px' }}
            >
              <Plus className="w-3.5 h-3.5" />
              New Analysis
            </button>
          </div>

          {/* My Roadmaps Button in dashboard context */}
          <div className="px-2">
            <button
              onClick={onBack}
              aria-label="My Roadmaps"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#475569] hover:text-[#6366F1] transition-colors rounded-lg hover:bg-[#F8F9FF]"
            >
              <LayoutDashboard className="w-4 h-4" />
              My Roadmaps
            </button>
          </div>
        </div>
      )}

      {/* Spacer to push user section to the bottom */}
      {sidebarContext === 'dashboard' && <div className="flex-1" />}

      {/* My Roadmaps Button (analysis context fallback/default) */}
      {sidebarContext !== 'dashboard' && (
        <div className="px-2 pb-2">
          <button
            onClick={onBack}
            aria-label="My Roadmaps"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#475569] hover:text-[#6366F1] transition-colors rounded-lg hover:bg-[#F8F9FF]"
          >
            <LayoutDashboard className="w-4 h-4" />
            My Roadmaps
          </button>
        </div>
      )}

      {/* User section */}
      <div className="p-3 border-t border-[#E5E7EB]">
        <div className="flex items-center justify-between gap-1 p-1">
          <div
            className="flex items-center gap-2.5 rounded-lg p-1 cursor-pointer hover:bg-[#F3F4F6] transition-colors flex-1 min-w-0 text-left"
            onClick={onProfileClick}
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
            onClick={(e) => { e.stopPropagation(); onLogout?.() }}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
            title="Sign out"
            type="button"
          >
            <LogOut className="w-4 h-4" style={{ color: '#EF4444' }} />
          </button>
        </div>
      </div>
    </aside>
  )
}
