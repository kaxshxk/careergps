import type {
  CompensationTier,
  DailyViewDay,
  JobData,
  ProgressData,
  Resource,
  Roadmap,
  SkillFrequencyItem,
  SkillTree,
  UserProfile,
  WeeklyViewWeek,
} from './types'
import { getAccessToken } from './supabase'
import {
  compensationTiers,
  dailyViewData,
  jobData,
  progressData,
  roadmapData,
  skillCategories,
  skillFrequency,
  weeklyViewData,
} from './mockData'

export interface JobInputPayload {
  jobTitle: string
  jobText?: string
  jobUrl?: string
  pdfBase64?: string
  imageBase64?: string
}

export interface AnalyzeResponse {
  session_id: string
}

export interface RoadmapRecord {
  id: string
  user_id: string
  job_title: string
  job_data: JobData & { compensationTiers?: CompensationTier[] }
  user_profile: UserProfile
  market_skills?: SkillFrequencyItem[]
  skill_tree: { matchScore: number; categories: SkillTree[] }
  gap_map: { matchScore: number; categories: SkillTree[] }
  resources: Record<string, Resource[]>
  roadmap: { months: Roadmap[]; weeklyView?: WeeklyViewWeek[]; dailyView?: DailyViewDay[]; progress: ProgressData }
  match_score: number
}

export interface CompletedTask {
  roadmap_id: string
  task_id: string
  skill_id: string
  completed_at: string
}

export interface CombinedProgress {
  completed: CompletedTask[]
  streak: {
    current_streak: number
    longest_streak: number
    total_tasks_done?: number
  }
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'
const MOCK_ROADMAP_ID = 'mock-roadmap-local'

function buildUrl(path: string) {
  return `${backendUrl.replace(/\/$/, '')}${path}`
}

async function request<T>(path: string, init: RequestInit = {}, forceMock = false): Promise<T> {
  const token = await getAccessToken(forceMock)
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const message = await response.text()
    if (response.status === 401) throw new ApiError(401, 'Please sign in to continue.')
    if (response.status === 404) throw new ApiError(404, 'We could not find that PathForge session.')
    if (response.status >= 500) throw new ApiError(500, 'The PathForge backend hit an error. Please try again.')
    throw new ApiError(response.status, message || 'The request could not be completed.')
  }

  return response.json() as Promise<T>
}

export async function getMockStatus() {
  if (backendUrl.includes('localhost:8001') || backendUrl.includes('127.0.0.1:8001')) {
    return { mock_mode: true, message: 'Local mock mode' }
  }

  try {
    const response = await fetch(buildUrl('/api/mock-status'), { cache: 'no-store' })
    if (!response.ok) return { mock_mode: true, message: 'Local mock mode' }
    return response.json() as Promise<{ mock_mode: boolean; message: string }>
  } catch {
    return { mock_mode: true, message: 'Local mock mode' }
  }
}

export async function analyzeRole(jobInput: JobInputPayload, userProfile: UserProfile, forceMock = false) {
  if (forceMock) {
    const suffix = `${jobInput.jobTitle}-${userProfile.currentRole}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return { session_id: suffix ? `${MOCK_ROADMAP_ID}-${suffix}` : MOCK_ROADMAP_ID }
  }

  return request<AnalyzeResponse>(
    '/api/analyze',
    {
      method: 'POST',
      body: JSON.stringify({
        job_title: jobInput.jobTitle,
        job_text: jobInput.jobText,
        job_url: jobInput.jobUrl,
        pdf_base64: jobInput.pdfBase64,
        image_base64: jobInput.imageBase64,
        user_profile: userProfile,
      }),
    },
    forceMock
  )
}

export async function getRoadmap(id: string, forceMock = false) {
  if (forceMock) {
    return {
      id,
      user_id: 'mock-user-001',
      job_title: jobData.title,
      job_data: { ...jobData, compensationTiers },
      user_profile: {
        hasResume: false,
        resumeSkills: [],
        currentRole: '',
        timeAvailable: '1 hour',
        mainGoal: 'Get hired fast',
        experienceLevel: 'Intermediate',
        hoursPerDay: 1,
        targetTimeline: '3 months',
        targetTimelineMonths: 3,
        learningStyle: ['Hands-on projects'],
        budget: 'Free only',
        targetCompanyType: 'Any company',
        biggestChallenge: 'Knowing what to focus on',
        roleType: 'it',
      },
      market_skills: skillFrequency,
      skill_tree: { matchScore: progressData.matchScore, categories: skillCategories },
      gap_map: { matchScore: progressData.matchScore, categories: skillCategories },
      resources: {},
      roadmap: {
        months: roadmapData,
        weeklyView: weeklyViewData,
        dailyView: dailyViewData,
        progress: progressData,
      },
      match_score: progressData.matchScore,
    } satisfies RoadmapRecord
  }

  return request<RoadmapRecord>(`/api/roadmaps/${id}`, {}, forceMock)
}

export async function getSkills(id: string, forceMock = false) {
  return request<SkillTree[]>(`/api/roadmaps/${id}/skills`, {}, forceMock)
}

export async function getResources(id: string, skillId: string, forceMock = false) {
  return request<Resource[]>(`/api/roadmaps/${id}/resources/${encodeURIComponent(skillId)}`, {}, forceMock)
}

export async function completeTask(roadmapId: string, taskId: string, skillId: string, forceMock = false) {
  if (forceMock) {
    return {
      progress: { roadmap_id: roadmapId, task_id: taskId, skill_id: skillId },
      matchScore: Math.min(100, progressData.matchScore + 1),
      completed: [{ roadmap_id: roadmapId, task_id: taskId, skill_id: skillId, completed_at: new Date().toISOString() }],
    }
  }

  return request<{ progress: unknown; matchScore: number; completed: CompletedTask[] }>(
    '/api/progress/complete',
    {
      method: 'POST',
      body: JSON.stringify({ roadmap_id: roadmapId, task_id: taskId, skill_id: skillId }),
    },
    forceMock
  )
}

export async function getProgress(roadmapId: string, forceMock = false): Promise<CombinedProgress> {
  if (forceMock) {
    return {
      completed: [],
      streak: {
        current_streak: progressData.currentStreak,
        longest_streak: progressData.bestStreak,
        total_tasks_done: 0,
      },
    }
  }

  const [completed, streak] = await Promise.all([
    request<CompletedTask[]>(`/api/progress/${roadmapId}`, {}, forceMock),
    request<CombinedProgress['streak']>('/api/progress/streak', {}, forceMock),
  ])
  return { completed, streak }
}

export async function sendMessage(roadmapId: string, message: string, forceMock = false) {
  return request<{ response: string }>(
    `/api/chat/${roadmapId}`,
    {
      method: 'POST',
      body: JSON.stringify({ message }),
    },
    forceMock
  )
}
