'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check } from 'lucide-react'

import { AgentChat } from '@/components/screens/agent-chat'
import { AppSidebar } from '@/components/app-sidebar'
import { AuthScreen, type MockUser } from '@/components/screens/auth-screen'
import { Dashboard } from '@/components/screens/dashboard'
import { IntelligenceReport } from '@/components/screens/intelligence-report'
import { JobInput, type JobInputValue } from '@/components/screens/job-input'
import { LoadingScreen } from '@/components/screens/loading-screen'
import { ProfileScreen } from '@/components/screens/profile-screen'
import { RoadmapProgress } from '@/components/screens/roadmap-progress'
import { SkillMap } from '@/components/screens/skill-map'
import { SkillQuiz } from '@/components/screens/skill-quiz'
import {
  analyzeRole,
  completeTask,
  getMockStatus,
  getProgress,
  getRoadmap,
  type JobInputPayload,
  type RoadmapRecord,
} from '@/lib/api'
import { mockSavedRoadmaps, type SavedRoadmap } from '@/lib/mock-db'
import { scoreToProficiency } from '@/lib/quiz-data'
import { getClientSession } from '@/lib/supabase'
import type {
  CompensationTier,
  DailyViewDay,
  JobData,
  MatchScore,
  ProgressData,
  Roadmap,
  SkillFrequencyItem,
  SkillTree,
  UserProfile,
  WeeklyViewWeek,
} from '@/lib/types'
import { DEFAULT_USER_PROFILE } from '@/lib/ui-data'
import { connectAnalysisWebSocket, type AnalysisPhaseMessage } from '@/lib/websocket'

type Screen = 'auth' | 'jobInput' | 'agentChat' | 'loadingScreen' | 'dashboard' | 'analysis' | 'profile'
type Tab = 'intelligence' | 'skills' | 'roadmap'
type SkillTreePayload = { skill_tree: { matchScore: number; categories: SkillTree[] }; market_skills: SkillFrequencyItem[] }

const EMPTY_PROGRESS: ProgressData = {
  matchScore: 0,
  currentStreak: 0,
  bestStreak: 0,
  skillProgress: [],
  todaysTasks: [],
}

export function PathForgeApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth')
  const [activeTab, setActiveTab] = useState<Tab>('intelligence')
  const [jobInput, setJobInput] = useState<JobInputPayload | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [userAnswers, setUserAnswers] = useState<UserProfile>(DEFAULT_USER_PROFILE)
  const [sessionId, setSessionId] = useState('')
  const [isMockMode, setIsMockMode] = useState(true)
  const [hasAuthSession, setHasAuthSession] = useState(true)
  const [authRequired, setAuthRequired] = useState(false)
  const [jobData, setJobData] = useState<JobData | null>(null)
  const [skillFrequency, setSkillFrequency] = useState<SkillFrequencyItem[]>([])
  const [compensationTiers, setCompensationTiers] = useState<CompensationTier[]>([])
  const [skillTree, setSkillTree] = useState<{ matchScore: number; categories: SkillTree[] } | null>(null)
  const [gapMap, setGapMap] = useState<{ matchScore: number; categories: SkillTree[] } | null>(null)
  const [roadmap, setRoadmapState] = useState<Roadmap[]>([])
  const setRoadmap = useCallback((val: Roadmap[] | null) => {
    setRoadmapState(val || [])
  }, [])
  const [weeklyView, setWeeklyView] = useState<WeeklyViewWeek[]>([])
  const [dailyView, setDailyView] = useState<DailyViewDay[]>([])
  const [progress, setProgress] = useState<ProgressData>(EMPTY_PROGRESS)
  const setMatchScore = useCallback((score: number) => {
    setProgress(prev => ({ ...prev, matchScore: score }))
  }, [])
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([])
  const [selectedSkill, setSelectedSkill] = useState('')
  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>(mockSavedRoadmaps)
  const [phaseData, setPhaseData] = useState<Partial<Record<AnalysisPhaseMessage['phase'], unknown>>>({})
  const [analysisStarted, setAnalysisStarted] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [mockUser, setMockUser] = useState<MockUser | null>(null)
  const [toast, setToast] = useState('')
  const [previousScreen, setPreviousScreen] = useState<Screen>('jobInput')
  const connectionRef = useRef<{ close: () => void } | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadUserData = useCallback((email: string) => {
    try {
      const key = `pathforge_data_${email}`
      const raw = localStorage.getItem(key)

      const savedKey = `pathforge_roadmaps_${email}`
      const savedRaw = localStorage.getItem(savedKey)
      if (savedRaw) {
        setSavedRoadmaps(JSON.parse(savedRaw))
      } else {
        setSavedRoadmaps([])
      }

      if (!raw) { setCurrentScreen('jobInput'); return }
      const parsed = JSON.parse(raw) as Record<string, unknown>
      if (parsed.jobData)   setJobData(parsed.jobData as JobData)
      if (parsed.skillFrequency) setSkillFrequency(parsed.skillFrequency as SkillFrequencyItem[])
      if (parsed.compensationTiers) setCompensationTiers(parsed.compensationTiers as CompensationTier[])
      if (parsed.skillTree) setSkillTree(parsed.skillTree as { matchScore: number; categories: SkillTree[] })
      if (parsed.gapMap)    setGapMap(parsed.gapMap as { matchScore: number; categories: SkillTree[] })
      if (parsed.jobTitle)  setJobTitle(parsed.jobTitle as string)
      if (parsed.sessionId) setSessionId(parsed.sessionId as string)
      const months = parsed.roadmapMonths as Roadmap[] | undefined
      if (months?.length)   setRoadmap(months)
      const weekly = parsed.weeklyView as WeeklyViewWeek[] | undefined
      if (weekly?.length)   setWeeklyView(weekly)
      const daily = parsed.dailyView as DailyViewDay[] | undefined
      if (daily?.length)    setDailyView(daily)
      const savedCompletedTasks = parsed.completedTasks as string[] | undefined
      if (savedCompletedTasks) setCompletedTaskIds(savedCompletedTasks)
      const savedMatchScore = parsed.matchScore as number | undefined
      if (savedMatchScore) setProgress(prev => ({ ...prev, matchScore: savedMatchScore }))

      if (months?.length) {
        setCurrentScreen('analysis')
        setActiveTab('intelligence')
      } else {
        setCurrentScreen('jobInput')
      }
    } catch {
      setCurrentScreen('jobInput')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let active = true

    const bootstrap = async () => {
      const mockStatus = await getMockStatus()
      const forceMock = Boolean(mockStatus.mock_mode)
      const { session } = await getClientSession(forceMock)
      if (!active) return
      setIsMockMode(forceMock)
      setHasAuthSession(Boolean(session))
    }

    void bootstrap()
    return () => {
      active = false
    }
  }, [])

  const applyRoadmapRecord = useCallback((record: RoadmapRecord, completedIds: string[], currentStreak?: number, bestStreak?: number) => {
    setJobData(record.job_data)
    setSkillFrequency(record.market_skills ?? [])
    setCompensationTiers(record.job_data.compensationTiers ?? [])
    setSkillTree(record.skill_tree)
    setGapMap(record.gap_map)
    setRoadmap(record.roadmap.months ?? [])
    setWeeklyView(record.roadmap.weeklyView ?? [])
    setDailyView(record.roadmap.dailyView ?? [])
    const rp = record.roadmap.progress
    setProgress({
      matchScore:     rp?.matchScore     ?? 0,
      skillProgress:  rp?.skillProgress  ?? [],
      todaysTasks:    rp?.todaysTasks    ?? [],
      currentStreak:  currentStreak      ?? rp?.currentStreak ?? 0,
      bestStreak:     bestStreak         ?? rp?.bestStreak    ?? 0,
    })
    setCompletedTaskIds(completedIds)
  }, [])

  const refreshRoadmap = useCallback(
    async (id: string, forceMock: boolean) => {
      const [record, progressRecord] = await Promise.all([getRoadmap(id, forceMock), getProgress(id, forceMock)])
      applyRoadmapRecord(
        record,
        progressRecord.completed.map(item => item.task_id),
        progressRecord.streak.current_streak,
        progressRecord.streak.longest_streak
      )
    },
    [applyRoadmapRecord]
  )

  const handleJobSubmit = (value: JobInputValue) => {
    setAuthRequired(false)
    setJobInput(value)
    setJobTitle(value.jobTitle || 'Senior ML Engineer')
    setCurrentScreen('agentChat')
  }

  const startAnalysis = useCallback(
    async (answers: UserProfile) => {
      if (!jobInput) return
      // Show loading screen immediately — never return to home state during analysis
      if (!isMockMode) {
        setCurrentScreen('loadingScreen')
      }
      setUserAnswers(answers)
      setPhaseData({})
      setAnalysisStarted(false)
      const response = await analyzeRole(jobInput, answers, isMockMode)
      setSessionId(response.session_id)

      if (isMockMode) {
        const record = await getRoadmap(response.session_id, true)
        applyRoadmapRecord(record, [])
        setCurrentScreen('analysis')
        setActiveTab('roadmap')
      }
    },
    [applyRoadmapRecord, isMockMode, jobInput]
  )

  const handleChatComplete = (answers: UserProfile) => void startAnalysis(answers)
  const handleChatSkip = (answers: UserProfile) => void startAnalysis(answers)

  const handleEditJob = () => {
    setCurrentScreen('jobInput')
  }

  const handleBack = () => {
    setCurrentScreen('dashboard')
    setActiveTab('intelligence')
  }

  const handleNewAnalysis = useCallback(() => {
    connectionRef.current?.close()
    connectionRef.current = null
    setCurrentScreen('jobInput')
    setActiveTab('intelligence')
    setJobInput(null)
    setJobTitle('')
    setUserAnswers(DEFAULT_USER_PROFILE)
    setSessionId('')
    setAuthRequired(false)
    setJobData(null)
    setSkillFrequency([])
    setCompensationTiers([])
    setSkillTree(null)
    setGapMap(null)
    setRoadmap([])
    setWeeklyView([])
    setDailyView([])
    setProgress(EMPTY_PROGRESS)
    setCompletedTaskIds([])
    setSelectedSkill('')
    setPhaseData({})
    setAnalysisStarted(false)
  }, [])

  const handleDeleteRoadmap = useCallback((id: string) => {
    setSavedRoadmaps(prev => {
      const nextList = prev.filter(r => r.id !== id)
      if (mockUser?.email) {
        try {
          localStorage.setItem(`pathforge_roadmaps_${mockUser.email}`, JSON.stringify(nextList))
        } catch (e) {
          console.error('Failed to save roadmaps to localStorage', e)
        }
      }
      return nextList
    })
  }, [mockUser])

  const handleNavigateToDashboard = useCallback(() => {
    setCurrentScreen('dashboard')
  }, [])

  // Keywords that map a skill name → quiz category
  const CATEGORY_KEYWORDS: Record<string, string[]> = {
    machine_learning: ['pytorch', 'tensorflow', 'mlops', 'scikit', 'neural', 'deep learning', 'bert', 'gpt', 'llm', 'ml'],
    data_analysis:    ['sql', 'pandas', 'numpy', 'feature engineering', 'data pipeline', 'spark', 'analytics', 'tableau'],
    backend_dev:      ['python', 'node', 'api', 'docker', 'kubernetes', 'aws', 'gcp', 'ci/cd', 'cicd', 'fastapi', 'flask', 'django', 'rest'],
    frontend_dev:     ['react', 'typescript', 'javascript', 'css', 'html', 'vue', 'angular', 'svelte', 'next'],
    marketing:        ['marketing', 'seo', 'growth', 'campaign', 'analytics'],
    finance:          ['finance', 'accounting', 'valuation', 'financial', 'investment'],
    design:           ['design', 'ui', 'ux', 'figma', 'sketch', 'wireframe', 'prototype'],
  }

  const findCategoryForSkill = useCallback((skillName: string): string => {
    const lower = skillName.toLowerCase()
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => lower.includes(kw) || kw.includes(lower))) return cat
    }
    return 'general'
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateSkillsFromQuiz = useCallback((categoryScores: Record<string, number>) => {
    if (!gapMap) { setQuizOpen(false); return }

    const updatedCategories = gapMap.categories.map(cat => ({
      ...cat,
      skills: cat.skills.map(skill => {
        const quizCat = findCategoryForSkill(skill.name)
        const score = categoryScores[quizCat] ?? categoryScores['general']
        if (score === undefined) return skill
        const newProf = scoreToProficiency(score)
        const newStatus = (newProf >= 75 ? 'good' : newProf >= 50 ? 'partial' : 'learn') as 'good' | 'partial' | 'learn'
        return { ...skill, proficiency: newProf, status: newStatus }
      }),
    }))

    setGapMap({ ...gapMap, categories: updatedCategories })
    setQuizOpen(false)
    setActiveTab('skills')

    setToast('Skill map updated based on your assessment')
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(''), 3500)
  }, [gapMap, findCategoryForSkill])

  const handleContinueRoadmap = useCallback(async (roadmap: SavedRoadmap) => {
    setJobTitle(roadmap.jobTitle)
    setSessionId(roadmap.id)
    try {
      await refreshRoadmap(roadmap.id, isMockMode)
    } catch {
      // fallback to default mock data if id not found
    }
    setCurrentScreen('analysis')
    setActiveTab('intelligence')
  }, [isMockMode, refreshRoadmap])

  const beginStreaming = useCallback(() => {
    if (!sessionId || analysisStarted) return
    setAnalysisStarted(true)

    connectionRef.current = connectAnalysisWebSocket(
      sessionId,
      message => {
        setPhaseData(prev => ({ ...prev, [message.phase]: message.data ?? message.message ?? message.session_id ?? true }))

        if (message.phase === 'JOB_INSIGHT' && message.data) {
          const nextJobData = message.data as JobData & { compensationTiers?: CompensationTier[] }
          setJobData(nextJobData)
          setCompensationTiers(nextJobData.compensationTiers ?? [])
        }

        if (message.phase === 'SKILL_TREE' && message.data) {
          const payload = message.data as SkillTreePayload
          setSkillTree(payload.skill_tree)
          setSkillFrequency(payload.market_skills ?? [])
        }

        if (message.phase === 'GAP_MAP' && message.data) {
          setGapMap(message.data as { matchScore: number; categories: SkillTree[] })
        }

        if (message.phase === 'RESOURCES' && message.data) {
          const resourceMap = message.data as Record<string, unknown>
          if (!selectedSkill) {
            const firstId = Object.keys(resourceMap)[0]
            if (firstId) setSelectedSkill(firstId)
          }
        }

        if (message.phase === 'ROADMAP' && message.data) {
          const payload = message.data as { months: Roadmap[]; weeklyView?: WeeklyViewWeek[]; dailyView?: DailyViewDay[]; progress: Partial<ProgressData> }
          setRoadmap(payload.months)
          setWeeklyView(payload.weeklyView ?? [])
          setDailyView(payload.dailyView ?? [])
          setProgress(prev => ({
            ...prev,
            matchScore: payload.progress.matchScore ?? prev.matchScore,
            currentStreak: payload.progress.currentStreak ?? prev.currentStreak,
            bestStreak: payload.progress.bestStreak ?? prev.bestStreak,
            skillProgress: payload.progress.skillProgress ?? prev.skillProgress,
            todaysTasks: payload.progress.todaysTasks ?? prev.todaysTasks,
          }))
        }

        if (message.phase === 'COMPLETE') {
          setCurrentScreen('analysis')
          setActiveTab('intelligence')
          void refreshRoadmap(sessionId, isMockMode)
        }
      },
      () => {
        setAnalysisStarted(false)
      }
    )
  }, [analysisStarted, isMockMode, refreshRoadmap, selectedSkill, sessionId])

  useEffect(() => {
    return () => {
      connectionRef.current?.close()
    }
  }, [])

  const handleSelectSkill = useCallback((skillId: string) => {
    setSelectedSkill(skillId)
  }, [])

  const handleToggleTask = useCallback(
    async (taskId: string, skillId: string, completed: boolean) => {
      if (!sessionId || completed) return
      const result = await completeTask(sessionId, taskId, skillId, isMockMode)
      const progressRecord = await getProgress(sessionId, isMockMode)
      setCompletedTaskIds(progressRecord.completed.map(item => item.task_id))
      setProgress(prev => ({
        ...prev,
        matchScore: result.matchScore,
        currentStreak: progressRecord.streak.current_streak,
        bestStreak: progressRecord.streak.longest_streak,
      }))
    },
    [isMockMode, sessionId]
  )

  const saveUserData = useCallback((data: Record<string, unknown>) => {
    if (!mockUser) return
    try {
      const key = `pathforge_data_${mockUser.email}`
      const existing = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, unknown>
      localStorage.setItem(key, JSON.stringify({ ...existing, ...data, lastUpdated: new Date().toISOString() }))
    } catch {
      // ignore storage errors
    }
  }, [mockUser])

  const handleMockSignIn = useCallback((user: MockUser) => {
    setMockUser(user)
    setHasAuthSession(true)
    try { localStorage.setItem('mockUser', JSON.stringify(user)) } catch { /* ignore */ }
    loadUserData(user.email)
    setToast(`Welcome back, ${user.name.split(' ')[0]}!`)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(''), 3500)
  }, [loadUserData])

  const handleLogout = useCallback(() => {
    try { localStorage.removeItem('mockUser') } catch { /* ignore */ }
    connectionRef.current?.close()
    connectionRef.current = null
    setMockUser(null)
    setHasAuthSession(false)
    setCurrentScreen('auth')
    setJobInput(null)
    setJobTitle('')
    setUserAnswers(DEFAULT_USER_PROFILE)
    setSessionId('')
    setJobData(null)
    setSkillFrequency([])
    setCompensationTiers([])
    setSkillTree(null)
    setGapMap(null)
    setRoadmap([])
    setWeeklyView([])
    setDailyView([])
    setProgress(EMPTY_PROGRESS)
    setCompletedTaskIds([])
    setSelectedSkill('')
    setPhaseData({})
    setAnalysisStarted(false)
    setActiveTab('intelligence')
    setSavedRoadmaps([])
    setToast('Signed out successfully')
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(''), 3500)
  }, [])

  const handleProfileClick = useCallback(() => {
    setPreviousScreen(currentScreen)
    setCurrentScreen('profile')
  }, [currentScreen])

  const canAccessDashboard = Boolean(mockUser) || hasAuthSession

  const matchScore = useMemo(() => {
    if (progress.matchScore) return progress.matchScore
    if (gapMap?.matchScore) return gapMap.matchScore
    return 0
  }, [gapMap, progress.matchScore])

  const confidenceScore = useMemo(() => jobData?.confidenceScore ?? 0, [jobData])

  const userName = useMemo(() => {
    if (mockUser) return mockUser.name
    if (isMockMode) return 'Demo User'
    return userAnswers.currentRole || 'Signed-in User'
  }, [isMockMode, mockUser, userAnswers.currentRole])

  // Auto-save: all three effects placed after matchScore is declared (FIX 4)
  useEffect(() => {
    if (!mockUser || !roadmap.length) return
    saveUserData({
      roadmapMonths: roadmap,
      weeklyView,
      dailyView,
      jobTitle,
      sessionId,
      jobData,
      skillTree,
      gapMap,
      skillFrequency,
      compensationTiers
    })
  }, [roadmap, weeklyView, dailyView, jobTitle, sessionId, jobData, skillTree, gapMap, skillFrequency, compensationTiers]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mockUser || !matchScore) return
    saveUserData({ matchScore })
  }, [matchScore]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mockUser) return
    saveUserData({ completedTasks: completedTaskIds })
  }, [completedTaskIds]) // eslint-disable-line react-hooks/exhaustive-deps

  // Helper function to categorize job titles for the dashboard colors
  const getRoleCategory = useCallback((title: string): string => {
    const t = title.toLowerCase()
    if (t.includes('machine learning') || t.includes('ml') || t.includes('ai') || t.includes('artificial intelligence')) return 'ML Engineering'
    if (t.includes('data science') || t.includes('data scientist') || t.includes('analyst') || t.includes('analytics')) return 'Data Science'
    if (t.includes('frontend') || t.includes('react') || t.includes('ui') || t.includes('web')) return 'Frontend'
    if (t.includes('backend') || t.includes('node') || t.includes('django') || t.includes('api') || t.includes('python')) return 'Backend'
    if (t.includes('devops') || t.includes('cloud') || t.includes('kubernetes') || t.includes('aws') || t.includes('infrastructure')) return 'DevOps'
    if (t.includes('design') || t.includes('ux') || t.includes('product designer') || t.includes('figma')) return 'Design'
    if (t.includes('marketing') || t.includes('growth') || t.includes('seo')) return 'Marketing'
    if (t.includes('finance') || t.includes('accounting') || t.includes('investment')) return 'Finance'
    return 'General'
  }, [])

  // Sync active roadmap state changes to the savedRoadmaps list and localStorage
  useEffect(() => {
    if (!mockUser || !sessionId || !jobTitle) return

    let totalTasks = 0
    if (roadmap) {
      for (const month of roadmap) {
        for (const week of month.weeks) {
          if (week.tasks) {
            totalTasks += week.tasks.length
          }
        }
      }
    }
    const completedTasks = completedTaskIds.length
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    setSavedRoadmaps(prev => {
      const index = prev.findIndex(r => r.id === sessionId)
      const updatedRoadmap: SavedRoadmap = {
        id: sessionId,
        jobTitle,
        roleCategory: getRoleCategory(jobTitle),
        matchScore,
        totalTasks,
        completedTasks,
        progressPercentage,
        lastActive: new Date().toISOString().split('T')[0],
        createdAt: index > -1 ? (prev[index].createdAt || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
      }

      let nextList: SavedRoadmap[]
      if (index > -1) {
        const existing = prev[index]
        // Prevent unnecessary state updates if values haven't changed
        if (
          existing.jobTitle === updatedRoadmap.jobTitle &&
          existing.matchScore === updatedRoadmap.matchScore &&
          existing.totalTasks === updatedRoadmap.totalTasks &&
          existing.completedTasks === updatedRoadmap.completedTasks &&
          existing.progressPercentage === updatedRoadmap.progressPercentage
        ) {
          return prev
        }
        nextList = [
          ...prev.slice(0, index),
          updatedRoadmap,
          ...prev.slice(index + 1),
        ]
      } else {
        nextList = [...prev, updatedRoadmap]
      }

      try {
        localStorage.setItem(`pathforge_roadmaps_${mockUser.email}`, JSON.stringify(nextList))
      } catch (e) {
        console.error('Failed to save roadmaps list to localStorage', e)
      }
      return nextList
    })
  }, [mockUser, sessionId, jobTitle, matchScore, roadmap, completedTaskIds, getRoleCategory])

  if (currentScreen === 'auth') {
    return <AuthScreen fullPage onSignIn={handleMockSignIn} onClose={() => {}} />
  }

  if (currentScreen === 'jobInput') {
    return (
      <JobInput
        onSubmit={handleJobSubmit}
        authRequired={authRequired}
        onLogout={handleLogout}
        onNavigateToDashboard={handleNavigateToDashboard}
      />
    )
  }

  if (currentScreen === 'agentChat') {
    return (
      <AgentChat
        jobTitle={jobTitle}
        onComplete={handleChatComplete}
        onSkip={handleChatSkip}
        onEditJob={handleEditJob}
      />
    )
  }

  if (currentScreen === 'loadingScreen') {
    return <LoadingScreen sessionId={sessionId} phases={phaseData} onConnect={beginStreaming} />
  }

  if (currentScreen === 'dashboard') {
    return (
      <Dashboard
        savedRoadmaps={savedRoadmaps}
        userName={userName}
        userEmail={mockUser?.email ?? ''}
        onContinue={handleContinueRoadmap}
        onNewAnalysis={handleNewAnalysis}
        onDelete={handleDeleteRoadmap}
        onNavigateToProfile={handleProfileClick}
        onLogout={handleLogout}
      />
    )
  }

  if (!canAccessDashboard || !jobData || !skillTree || !gapMap) {
    return (
      <JobInput
        onSubmit={handleJobSubmit}
        authRequired={!canAccessDashboard}
        onLogout={handleLogout}
        onNavigateToDashboard={handleNavigateToDashboard}
      />
    )
  }

  if (currentScreen === 'profile' && mockUser) {
    return (
      <ProfileScreen
        user={mockUser}
        activeTab={activeTab}
        onTabChange={tab => { setActiveTab(tab); setCurrentScreen(previousScreen) }}
        currentStreak={progress.currentStreak}
        jobTitle={jobTitle}
        onBack={() => setCurrentScreen(previousScreen)}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
        previousScreen={previousScreen}
        sidebarContext={previousScreen === 'dashboard' ? 'dashboard' : 'analysis'}
        savedRoadmapsCount={savedRoadmaps.length}
        tasksCompleted={savedRoadmaps.reduce((sum, r) => sum + r.completedTasks, 0)}
        avgMatchScore={savedRoadmaps.length ? Math.round(savedRoadmaps.reduce((sum, r) => sum + r.matchScore, 0) / savedRoadmaps.length) : 0}
        onNewAnalysis={handleNewAnalysis}
        stats={{
          roadmapsCreated: 1,
          tasksCompleted: completedTaskIds.length,
          currentStreak: progress.currentStreak,
          bestStreak: progress.bestStreak,
          avgMatchScore: matchScore,
          skillsLearned: (gapMap?.categories ?? []).reduce((acc, cat) => acc + cat.skills.filter(s => s.status === 'good').length, 0),
        }}
      />
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        jobTitle={jobTitle}
        onBack={handleBack}
        userName={userName}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
        sidebarContext="analysis"
        onNewAnalysis={() => {
          setCurrentScreen('jobInput')
          setJobData(null)
          setSkillTree(null)
          setRoadmap(null)
          setMatchScore(0)
        }}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'intelligence' && (
          <IntelligenceReport
            jobData={jobData}
            skillFrequency={skillFrequency}
            compensationTiers={compensationTiers}
            matchScore={{ overall: matchScore, confidence: confidenceScore } as MatchScore}
            userProfile={userAnswers}
          />
        )}

        {activeTab === 'skills' && (
          <SkillMap
            categories={gapMap.categories}
            selectedSkill={selectedSkill}
            onSelectSkill={handleSelectSkill}
            roadmapId={sessionId}
            isMockMode={isMockMode}
            onOpenQuiz={() => setQuizOpen(true)}
          />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapProgress
            roadmap={roadmap}
            weeklyView={weeklyView}
            dailyView={dailyView}
            progress={progress}
            completedTaskIds={completedTaskIds}
            onToggleTask={handleToggleTask}
            jobTitle={jobTitle}
            userName={userName}
            userProfile={userAnswers}
          />
        )}
      </main>

      {/* Skill Assessment Quiz overlay */}
      {quizOpen && (
        <SkillQuiz
          onUpdate={handleUpdateSkillsFromQuiz}
          onClose={() => setQuizOpen(false)}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-5 py-3 bg-[#111827] text-white text-sm font-medium rounded-xl shadow-lg pointer-events-none">
          <Check className="w-4 h-4 text-[#10B981] flex-shrink-0" />
          {toast}
        </div>
      )}
    </div>
  )
}
