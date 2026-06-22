// ─── Loading ─────────────────────────────────────────────────────────────────

export interface LoadingStep {
  id: number
  label: string
  status: string
  state: 'pending' | 'running' | 'done'
}

// ─── User / Chat ──────────────────────────────────────────────────────────────

export interface UserProfile {
  hasResume: boolean
  resumeSkills: string[]
  currentRole: string
  // legacy fields kept for backward compat
  timeAvailable: string
  mainGoal: string
  // new 8-question fields
  experienceLevel: string
  hoursPerDay: number
  targetTimeline: string
  targetTimelineMonths: number
  learningStyle: string[]
  budget: string
  targetCompanyType: string
  biggestChallenge: string
  roleType: string
}

// ─── Intelligence Report ──────────────────────────────────────────────────────

export interface MarketSignal {
  value: number
  trend: 'up' | 'down' | 'flat'
}

export interface JobData {
  title: string
  role?: string
  tags: string[]
  description: string
  dailyOps: string[]
  marketSignal: MarketSignal
  agentAnalysis: string
  confidenceScore: number
  marketTrendSparkline: number[]
  demandTrend?: string
}

export interface SkillFrequencyItem {
  skill: string
  percentage: number
}

export interface CompensationTier {
  level: string
  range: string
}

// ─── Skill Map ────────────────────────────────────────────────────────────────

export interface Skill {
  name: string
  proficiency: number   // 0-100
  match: number
  status: 'learn' | 'partial' | 'good'
  id?: string
  description?: string
}

export interface SkillTree {
  name: string
  skills: Skill[]
}

export interface ResourceScores {
  quality: number
  recency: number
  trust: number
  relevance: number
  access: number
  fit: number
}

export interface Resource {
  title: string
  provider: string
  tags: string[]
  rank: 'gold' | 'silver' | 'bronze'
  scores: ResourceScores
  url?: string
  duration?: string
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────

export interface RoadmapTask {
  id: string
  skillId?: string
  title: string
  source: string
  duration: string
  completed: boolean
  badges?: string[]
  isToday?: boolean
}

export interface RoadmapWeek {
  label: string
  skill: string
  tasks: RoadmapTask[]
}

export interface Roadmap {
  title: string
  weeks: RoadmapWeek[]
}

// ─── Roadmap Weekly View ──────────────────────────────────────────────────────

export interface WeeklyTask {
  id: string
  skillId?: string
  title: string
  description: string
  resource: string
  duration: string
  type: 'Video' | 'Reading' | 'Project' | 'Practice'
  completed: boolean
}

export interface WeeklyViewWeek {
  weekNumber: number
  dateRange: string
  skill: string
  tasks: WeeklyTask[]
  completionPercentage: number
}

// ─── Roadmap Daily View ───────────────────────────────────────────────────────

export interface DailyTask {
  id: string
  skillId?: string
  title: string
  source: string
  duration: string
  type: 'Video' | 'Reading' | 'Project' | 'Practice'
  completed: boolean
}

export interface DailyViewDay {
  dayName: string
  date: string
  isToday: boolean
  isPast: boolean
  tasks: DailyTask[]
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface SkillProgressItem {
  skillId: string
  name: string
  currentProficiency: number
  requiredProficiency: number
  totalTasks: number
  completedTasks: number
  percentage: number
}

export interface TodayTask {
  id: string
  skillId?: string
  title: string
  completed: boolean
}

export interface ProgressData {
  matchScore: number
  currentStreak: number
  bestStreak: number
  skillProgress: SkillProgressItem[]
  todaysTasks: TodayTask[]
}

// ─── Match Score ──────────────────────────────────────────────────────────────

export interface MatchScore {
  overall: number
  confidence: number
}
