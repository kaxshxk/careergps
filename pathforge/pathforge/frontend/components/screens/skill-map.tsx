'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, ClipboardCheck, ExternalLink, Search } from 'lucide-react'

import { getResources } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Resource, SkillTree } from '@/lib/types'

const STATUS_PILL: Record<string, { bg: string; text: string; label: string }> = {
  good:    { bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]', label: 'Good'    },
  partial: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', label: 'Partial' },
  learn:   { bg: 'bg-[#EEF2FF]', text: 'text-[#4338CA]', label: 'Learn'   },
}

const STATUS_BAR: Record<string, string> = {
  good:    '#10B981',
  partial: '#F59E0B',
  learn:   '#6366F1',
}

const RANK_ACCENT: Record<string, string> = {
  gold:   '#F59E0B',
  silver: '#9CA3AF',
  bronze: '#B45309',
}

const FILTER_OPTIONS = [
  { id: 'all',     label: 'All Skills'     },
  { id: 'learn',   label: 'Needs Learning' },
  { id: 'partial', label: 'In Progress'    },
]

interface SkillMapProps {
  categories: SkillTree[]
  selectedSkill: string
  onSelectSkill: (skillId: string) => void
  roadmapId: string
  isMockMode?: boolean
  onOpenQuiz?: () => void
}

export function SkillMap({ categories, selectedSkill, onSelectSkill, roadmapId, isMockMode = false, onOpenQuiz }: SkillMapProps) {
  const [filter, setFilter]                       = useState<string>('all')
  const [searchQuery, setSearchQuery]             = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set(categories.map(c => c.name)))
  const [resources, setResources]                 = useState<Resource[]>([])
  const [resourcesLoading, setResourcesLoading]   = useState(false)

  const fetchResources = useCallback(async (skillId: string) => {
    if (!skillId || !roadmapId) return
    setResourcesLoading(true)
    try { setResources(await getResources(roadmapId, skillId, isMockMode)) }
    catch { setResources([]) }
    finally { setResourcesLoading(false) }
  }, [roadmapId, isMockMode])

  useEffect(() => {
    if (selectedSkill && roadmapId) void fetchResources(selectedSkill)
  }, [selectedSkill, roadmapId, fetchResources])

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const selectedSkillName = useMemo(() => {
    for (const cat of (categories ?? [])) {
      const skill = cat.skills.find(s => (s.id ?? s.name) === selectedSkill)
      if (skill) return skill.name
    }
    return selectedSkill
  }, [categories, selectedSkill])

  const filteredCategories = useMemo(
    () =>
      (categories ?? [])
        .map(cat => ({
          ...cat,
          skills: (cat.skills ?? []).filter(skill => {
            const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesFilter = filter === 'all' || skill.status === filter
            return matchesSearch && matchesFilter
          }),
        }))
        .filter(cat => cat.skills.length > 0),
    [categories, filter, searchQuery]
  )

  return (
    <div className="flex-1 flex overflow-hidden screen-enter" style={{ background: '#FAFAFA' }}>

      {/* ── Left panel ──────────────────────────────────────────────────── */}
      <div className="w-[60%] border-r border-[#E5E7EB] flex flex-col overflow-hidden">

        {/* Filter bar */}
        <div className="px-5 py-3 border-b border-[#E5E7EB] bg-white flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 flex-1">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setFilter(opt.id)}
                className="px-3 py-1.5 text-sm rounded-full border transition-all duration-150"
                style={
                  filter === opt.id
                    ? { background: '#EEF2FF', color: '#6366F1', borderColor: '#6366F1', transform: 'none' }
                    : { background: '#F3F4F6', color: '#475569', borderColor: '#F3F4F6' }
                }
                onMouseEnter={e => { if (filter !== opt.id) { (e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB' } }}
                onMouseLeave={e => { if (filter !== opt.id) { (e.currentTarget as HTMLElement).style.borderColor = '#F3F4F6' } }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {onOpenQuiz && (
              <button
                onClick={onOpenQuiz}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-all bg-[#EEF2FF] text-[#6366F1] border-[#6366F1] hover:bg-[#6366F1] hover:text-white"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                Take Assessment
              </button>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search skills..."
                className="w-40 bg-white border border-[#E5E7EB] rounded-lg py-1.5 pl-9 pr-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:shadow-[0_0_0_2px_rgba(99,102,241,0.1)] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category cards */}
        <div className="flex-1 overflow-auto p-5 space-y-3">
          {filteredCategories.map(category => (
            <div
              key={category.name}
              className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              {/* Section header */}
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F8F9FF] transition-colors"
              >
                <span className="text-sm font-semibold text-[#0F172A]">{category.name}</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#EEF2FF] text-[#6366F1] text-xs font-semibold rounded-full">
                    {category.skills.length} skill{category.skills.length !== 1 ? 's' : ''}
                  </span>
                  <div
                    className="transition-transform duration-200"
                    style={{ transform: expandedCategories.has(category.name) ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                  >
                    <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
                  </div>
                </div>
              </button>

              {/* Skill rows */}
              {expandedCategories.has(category.name) && (
                <div>
                  {category.skills.map((skill, skillIndex) => {
                    const skillKey  = skill.id ?? skill.name
                    const isSelected = selectedSkill === skillKey
                    const pill      = STATUS_PILL[skill.status] ?? STATUS_PILL.learn
                    const barColor  = STATUS_BAR[skill.status]  ?? STATUS_BAR.learn
                    return (
                      <div
                        key={skillKey}
                        onClick={() => onSelectSkill(skillKey)}
                        className="px-4 py-3 cursor-pointer border-b border-[#F3F4F6] last:border-0 transition-all duration-150"
                        style={{
                          background:  isSelected ? '#FAFBFF' : undefined,
                          borderLeft:  isSelected ? '3px solid #6366F1' : '3px solid transparent',
                          animation:   `slideRight 0.3s ease ${skillIndex * 0.04}s both`,
                        }}
                        onMouseEnter={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = '#F8F9FF'; (e.currentTarget as HTMLElement).style.borderLeftColor = '#C7D2FE' } }}
                        onMouseLeave={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.borderLeftColor = 'transparent' } }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-[#0F172A]">{skill.name}</span>
                          <span className={cn('px-2 py-0.5 text-xs font-semibold rounded-full', pill.bg, pill.text, skill.status === 'learn' && 'learn-pulse')}>
                            {pill.label}
                          </span>
                        </div>
                        {skill.description && (
                          <p className="text-[13px] text-[#475569] mb-2 leading-snug">{skill.description}</p>
                        )}
                        <div className="h-[3px] bg-[#F3F4F6] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${skill.proficiency}%`,
                              background: `linear-gradient(90deg, ${barColor}, ${barColor}CC)`,
                              transition: 'width 1.2s ease',
                              transitionDelay: `${skillIndex * 80}ms`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-[#94A3B8]">
              <Search className="w-8 h-8 mb-3" />
              <p className="text-sm">No skills match your filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────── */}
      <div className="w-[40%] flex flex-col overflow-hidden bg-[#FAFAFA]">
        <div className="px-5 py-3 border-b border-[#E5E7EB] bg-white flex-shrink-0" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#0F172A]">{selectedSkillName || 'Resources'}</span>
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Top Resources</span>
          </div>
          <div className="mt-2 h-px" style={{ background: 'linear-gradient(90deg,#6366F1,#7C3AED)', opacity: 0.6 }} />
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-3">
          {!selectedSkill && !resourcesLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-[#94A3B8]">
              <BookOpen className="w-10 h-10 mb-3" />
              <p className="text-sm font-medium">Select a skill to see top resources</p>
            </div>
          )}

          {resourcesLoading && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-sm text-[#475569]" style={{ boxShadow: 'var(--shadow-sm)' }}>
              Loading resources for {selectedSkillName}…
            </div>
          )}

          {!resourcesLoading && (resources ?? []).map((resource, i) => {
            const accentColor   = RANK_ACCENT[resource.rank] ?? RANK_ACCENT.bronze
            const durationLabel = resource.duration ?? resource.tags.find(t => /\d+H/.test(t)) ?? ''
            return (
              <div
                key={i}
                className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden flex transition-all duration-200 hover:-translate-y-0.5"
                style={{ boxShadow: 'var(--shadow-sm)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
              >
                <div className="w-1 flex-shrink-0" style={{ backgroundColor: accentColor }} />
                <div className="flex-1 p-4">
                  <h4 className="text-[15px] font-semibold text-[#0F172A] mb-0.5 leading-snug">{resource.title}</h4>
                  <p className="text-[13px] text-[#94A3B8] mb-3">{resource.provider}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {resource.tags.map(tag => (
                      <span
                        key={tag}
                        className={cn('px-2 py-0.5 text-xs rounded-md border', tag === 'Free' ? 'bg-[#D1FAE5] text-[#065F46] border-green-200' : tag === 'Paid' ? 'bg-[#FEF3C7] text-[#92400E] border-amber-200' : 'bg-[#F3F4F6] text-[#475569] border-[#E5E7EB]')}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#94A3B8]">{durationLabel}</span>
                    <button
                      onClick={() => resource.url && window.open(resource.url, '_blank')}
                      disabled={!resource.url}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2FF] text-[#4338CA] text-xs font-semibold rounded-lg hover:bg-[#6366F1] hover:text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Open
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {selectedSkill && !resourcesLoading && (resources ?? []).length > 0 && (
            <div
              className="bg-[#FAFBFF] border border-[#E5E7EB] rounded-xl p-4"
              style={{ borderLeft: '3px solid #6366F1', boxShadow: 'var(--shadow-sm)' }}
            >
              <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Agent Tip</p>
              <p className="text-sm text-[#475569] leading-relaxed">
                For <span className="font-semibold text-[#0F172A]">{selectedSkillName}</span>, start with the first resource to build foundations, then use the official docs as a reference while you practice.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
