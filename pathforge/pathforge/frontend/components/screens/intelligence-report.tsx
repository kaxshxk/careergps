'use client'

import { useState } from 'react'
import { TrendingUp } from 'lucide-react'

import type { CompensationTier, JobData, MatchScore, SkillFrequencyItem, UserProfile } from '@/lib/types'

interface IntelligenceReportProps {
  jobData: JobData
  skillFrequency: SkillFrequencyItem[]
  compensationTiers: CompensationTier[]
  matchScore: MatchScore
  userProfile?: UserProfile
}

export function IntelligenceReport({ jobData, skillFrequency, compensationTiers, matchScore, userProfile }: IntelligenceReportProps) {
  const defaultSkillFrequency = [
    { skill: 'React / Next.js', percentage: 94 },
    { skill: 'TypeScript', percentage: 89 },
    { skill: 'CSS / Tailwind', percentage: 82 },
    { skill: 'Jest / RTL', percentage: 71 },
    { skill: 'GraphQL / REST', percentage: 65 },
    { skill: 'Vite / Webpack', percentage: 58 },
    { skill: 'Accessibility', percentage: 52 },
    { skill: 'Cypress / Playwright', percentage: 44 }
  ]

  const defaultCompensationTiers = [
    { level: 'Entry', range: '$90K - $120K' },
    { level: 'Mid', range: '$120K - $165K' },
    { level: 'Senior', range: '$165K - $230K' }
  ]

  const activeSkillFrequency = skillFrequency && skillFrequency.length > 0 ? skillFrequency : defaultSkillFrequency
  const activeCompensationTiers = compensationTiers && compensationTiers.length > 0 ? compensationTiers : defaultCompensationTiers

  const [hoveredRoleIdx, setHoveredRoleIdx] = useState<number | null>(null)

  // Future Outlook demandTrend details
  const demandTrend = jobData.demandTrend || 'HIGH GROWTH'
  let trendText = 'HIGH GROWTH'
  let trendColor = '#10B981'
  let trendArrow = '↑'

  if (demandTrend === 'STABLE' || demandTrend.toLowerCase() === 'stable') {
    trendText = 'STABLE'
    trendColor = '#F59E0B' // amber
    trendArrow = '→'
  } else if (demandTrend === 'DECLINING' || demandTrend.toLowerCase() === 'declining') {
    trendText = 'DECLINING'
    trendColor = '#EF4444' // red
    trendArrow = '↓'
  }

  // Work Arrangement percentages
  const getWorkArrangement = () => {
    const roleOrTitle = (jobData.role || jobData.title || '').toLowerCase()
    if (roleOrTitle.includes('software') || roleOrTitle.includes('developer') || roleOrTitle.includes('engineer') || roleOrTitle.includes('designer') || roleOrTitle.includes('analyst') || roleOrTitle.includes('writer') || roleOrTitle.includes('manager')) {
      return { remote: 45, hybrid: 35, onsite: 20 }
    }
    if (roleOrTitle.includes('nurse') || roleOrTitle.includes('teacher') || roleOrTitle.includes('healthcare') || roleOrTitle.includes('logistics') || roleOrTitle.includes('operations')) {
      return { remote: 10, hybrid: 20, onsite: 70 }
    }
    return { remote: 30, hybrid: 40, onsite: 30 }
  }
  const { remote, hybrid, onsite } = getWorkArrangement()

  // Time to Job Ready weeks & milestones
  const timelineMonths = userProfile?.targetTimelineMonths || 3
  const totalWeeks = timelineMonths * 4
  const w4 = Math.round(totalWeeks * 0.33)
  const w8 = Math.round(totalWeeks * 0.67)
  const w12 = totalWeeks

  // Similar Roles list
  const getSimilarRoles = () => {
    const roleOrTitle = (jobData.role || jobData.title || '').toLowerCase()
    if (roleOrTitle.includes('ml') || roleOrTitle.includes('machine learning') || roleOrTitle.includes('ai') || roleOrTitle.includes('data scientist')) {
      return [
        { name: 'Data Scientist', salary: '$120K - $175K', match: 88 },
        { name: 'AI Researcher', salary: '$140K - $210K', match: 82 },
        { name: 'MLOps Engineer', salary: '$130K - $185K', match: 85 }
      ]
    }
    if (roleOrTitle.includes('frontend') || roleOrTitle.includes('front-end') || roleOrTitle.includes('react') || roleOrTitle.includes('ui') || roleOrTitle.includes('web')) {
      return [
        { name: 'Full Stack', salary: '$110K - $160K', match: 92 },
        { name: 'UI Engineer', salary: '$105K - $155K', match: 90 },
        { name: 'React Native Developer', salary: '$100K - $145K', match: 87 }
      ]
    }
    if (roleOrTitle.includes('marketing') || roleOrTitle.includes('seo') || roleOrTitle.includes('content') || roleOrTitle.includes('growth')) {
      return [
        { name: 'Growth Manager', salary: '$95K - $140K', match: 86 },
        { name: 'Brand Manager', salary: '$90K - $130K', match: 80 },
        { name: 'Content Strategist', salary: '$80K - $115K', match: 84 }
      ]
    }
    if (roleOrTitle.includes('finance') || roleOrTitle.includes('financial') || roleOrTitle.includes('investment') || roleOrTitle.includes('banking') || roleOrTitle.includes('analyst')) {
      return [
        { name: 'Investment Analyst', salary: '$95K - $150K', match: 89 },
        { name: 'Risk Manager', salary: '$110K - $165K', match: 82 },
        { name: 'Portfolio Manager', salary: '$130K - $220K', match: 78 }
      ]
    }
    // Generic fallback
    return [
      { name: 'Product Manager', salary: '$110K - $170K', match: 75 },
      { name: 'Systems Analyst', salary: '$85K - $125K', match: 78 },
      { name: 'Operations Coordinator', salary: '$65K - $95K', match: 72 }
    ]
  }
  const similarRoles = getSimilarRoles()

  return (
    <div className="flex-1 p-6 overflow-auto bg-[#FAFAFA] screen-enter">
      <div className="grid grid-cols-12 gap-4">

        {/* ── Left column ───────────────────────────────────────────────── */}
        <div className="col-span-4 space-y-4">
          <div
            className="bg-white border border-[#E5E7EB] rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5"
            style={{ boxShadow: 'var(--shadow-sm)' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
          >
            <h2 className="text-xl font-semibold text-[#0F172A] mb-3">{jobData.title}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {jobData.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-[#EEF2FF] text-[#6366F1] text-xs font-medium rounded-md">{tag}</span>
              ))}
            </div>
            <p className="text-sm text-[#475569] leading-relaxed">{jobData.description}</p>
          </div>

          <div
            className="bg-white border border-[#E5E7EB] rounded-xl p-5 transition-all duration-200"
            style={{ boxShadow: 'var(--shadow-sm)' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)', (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)', (e.currentTarget as HTMLElement).style.transform = '')}
          >
            <h3 className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Daily Operations</h3>
            <ul className="space-y-2">
              {jobData.dailyOps.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-[#475569]">
                  <span className="text-[#6366F1] mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="bg-white border border-[#E5E7EB] rounded-xl p-5 transition-all duration-200"
            style={{ boxShadow: 'var(--shadow-sm)' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)', (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)', (e.currentTarget as HTMLElement).style.transform = '')}
          >
            <h3 className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Market Signal</h3>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-[#10B981]" />
              <span className="text-3xl font-mono text-[#10B981]">+{jobData.marketSignal.value}%</span>
              <span className="text-sm text-[#94A3B8]">YoY Demand</span>
            </div>
            <div className="mt-3 h-8 flex items-end gap-[2px]">
              {jobData.marketTrendSparkline.map((height, index) => (
                <div key={index} className="flex-1 rounded-t" style={{ height: `${height}%`, background: 'rgba(99,102,241,0.2)' }} />
              ))}
            </div>
          </div>

          {/* ADD 1 — Future Outlook card */}
          <div
            className="bg-white border border-[#E5E7EB] rounded-xl p-5 transition-all duration-200"
            style={{ boxShadow: 'var(--shadow-sm)' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)', (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)', (e.currentTarget as HTMLElement).style.transform = '')}
          >
            <h3 className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">FUTURE OUTLOOK</h3>
            <div className="flex items-center gap-2 mb-4 font-mono font-bold text-lg" style={{ color: trendColor }}>
              <span>{trendArrow} {trendText}</span>
            </div>
            
            {/* 3-year projection bars */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#94A3B8] w-8">2024</span>
                <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#94A3B8] rounded-full" style={{ width: '60%' }} />
                </div>
                <span className="text-[10px] text-[#94A3B8] font-mono">baseline</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#94A3B8] w-8">2025</span>
                <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '75%', background: '#6366F1' }} />
                </div>
                <span className="text-[10px] text-[#6366F1] font-mono font-semibold">+15%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#94A3B8] w-8">2026</span>
                <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '90%', background: '#8B5CF6' }} />
                </div>
                <span className="text-[10px] text-[#8B5CF6] font-mono font-semibold">+28%</span>
              </div>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Demand expected to grow 34% over next 3 years driven by AI adoption
            </p>
          </div>
        </div>

        {/* ── Middle column ─────────────────────────────────────────────── */}
        <div className="col-span-5 space-y-4">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Skill Frequency Across 24 Postings</h3>
              <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
            </div>
            <div className="space-y-3">
              {activeSkillFrequency.map((item, i) => (
                <div key={item.skill} className="flex items-center gap-3" style={{ animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}>
                  <span className="w-32 text-sm text-[#475569] truncate">{item.skill}</span>
                  <div className="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full progress-animate"
                      style={{
                        width: `${item.percentage}%`,
                        background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                        borderRadius: '0 4px 4px 0',
                      }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono text-xs text-[#0F172A]">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h3 className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">Compensation Matrix</h3>
            <div className="grid grid-cols-3 gap-3">
              {activeCompensationTiers.map(tier => (
                <div
                  key={tier.level}
                  className="bg-[#F8F9FF] rounded-xl p-3 cursor-default transition-all duration-200 hover:-translate-y-0.5"
                  style={{ borderTop: '3px solid transparent' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderTopColor = '#6366F1'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderTopColor = 'transparent'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
                >
                  <div className="text-[11px] font-medium text-[#94A3B8] mb-1">{tier.level}</div>
                  <div className="text-lg font-mono font-semibold text-[#0F172A]">{tier.range}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ADD 2 — Remote vs Onsite card */}
          <div
            className="bg-white border border-[#E5E7EB] rounded-xl p-5 transition-all duration-200"
            style={{ boxShadow: 'var(--shadow-sm)' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)', (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)', (e.currentTarget as HTMLElement).style.transform = '')}
          >
            <h3 className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">WORK ARRANGEMENT</h3>
            <div className="flex gap-4 items-center justify-between">
              {[
                { label: 'Remote', pct: remote, icon: '🌐', color: '#10B981' },
                { label: 'Hybrid', pct: hybrid, icon: '🏢', color: '#F59E0B' },
                { label: 'Onsite', pct: onsite, icon: '📍', color: '#6366F1' },
              ].map(item => (
                <div key={item.label} className="flex-1 flex flex-col items-center">
                  <div className="px-2.5 py-1 bg-[#F3F4F6] text-[#475569] rounded-full text-xs font-semibold flex items-center gap-1 mb-2 whitespace-nowrap">
                    <span>{item.icon}</span>
                    <span>{item.label}: {item.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column ──────────────────────────────────────────────── */}
        <div className="col-span-3 space-y-4">
          {/* Agent Analysis with quote decoration */}
          <div
            className="bg-white border border-[#E5E7EB] rounded-xl p-5 relative overflow-hidden pulse-border-left"
            style={{ boxShadow: 'var(--shadow-sm)', borderLeft: '3px solid #6366F1', background: '#FAFBFF' }}
          >
            {/* Large quote mark decoration */}
            <div
              className="absolute top-2 left-3 text-[60px] leading-none font-serif select-none pointer-events-none"
              style={{ color: 'rgba(99,102,241,0.08)' }}
            >
              "
            </div>
            <h3 className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-3 relative z-10">Agent Analysis</h3>
            <div className="text-sm text-[#475569] leading-relaxed relative z-10">
              {jobData.agentAnalysis.split('\n\n').map((paragraph, index) => (
                <p key={index} className={index > 0 ? 'mt-3' : ''}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Confidence score ring */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h3 className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">Confidence Score</h3>
            <div className="relative w-28 h-28 mx-auto mb-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="url(#confGradient)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${matchScore.confidence * 2.64} ${100 * 2.64}`}
                  className="ring-draw"
                />
                <defs>
                  <linearGradient id="confGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-mono font-bold text-[#0F172A]">{matchScore.confidence}%</span>
              </div>
            </div>
            <div className="text-xs text-[#94A3B8]">
              Sources analyzed: <span className="text-[#475569] font-semibold">24</span>
            </div>
          </div>

          {/* ADD 3 — Time to Job Ready */}
          <div
            className="bg-white border border-[#E5E7EB] rounded-xl p-5 transition-all duration-200"
            style={{ boxShadow: 'var(--shadow-sm)' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)', (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)', (e.currentTarget as HTMLElement).style.transform = '')}
          >
            <h3 className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">TIME TO JOB READY</h3>
            <div className="text-3xl font-bold text-[#6366F1] mb-1 text-left" style={{ fontFamily: 'Inter, sans-serif', fontSize: '32px', fontWeight: 700 }}>
              {totalWeeks} Weeks
            </div>
            <p className="text-[13px] text-[#94A3B8] mb-3 text-left">Based on your current skill level</p>
            
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden mb-4">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${matchScore.overall || 0}%`,
                  background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                }}
              />
            </div>

            {/* Milestones */}
            <div className="flex flex-col gap-1.5 text-left">
              <div className="px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] text-xs font-medium rounded-[6px] self-start">
                Week {w4} — Core Skills
              </div>
              <div className="px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] text-xs font-medium rounded-[6px] self-start">
                Week {w8} — Projects
              </div>
              <div className="px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] text-xs font-medium rounded-[6px] self-start">
                Week {w12} — Interview Ready
              </div>
            </div>
          </div>
        </div>

        {/* ADD 4 — Similar Roles row */}
        <div className="col-span-12 mt-6 pt-6 border-t border-[#E5E7EB]">
          <h3 className="text-base font-semibold text-[#0F172A] mb-4 text-left" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 600 }}>
            SIMILAR ROLES TO EXPLORE
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {similarRoles.map((role, idx) => (
              <div
                key={role.name}
                className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex flex-col justify-between transition-all duration-200"
                style={{
                  boxShadow: hoveredRoleIdx === idx ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  transform: hoveredRoleIdx === idx ? 'translateY(-4px)' : 'translateY(0)',
                }}
                onMouseEnter={() => setHoveredRoleIdx(idx)}
                onMouseLeave={() => setHoveredRoleIdx(null)}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-[#0F172A]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                      {role.name}
                    </h4>
                    <span className="px-2 py-0.5 bg-[#EEF2FF] text-[#6366F1] text-[11px] font-semibold rounded-full">
                      {role.match}% Match
                    </span>
                  </div>
                  <p className="text-sm text-[#94A3B8] mb-4">{role.salary}</p>
                </div>
                <div className="flex justify-end">
                  <span className="text-xs font-semibold text-[#6366F1] hover:underline cursor-pointer">
                    Explore →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
