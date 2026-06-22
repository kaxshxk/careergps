import type { LoadingStep, UserProfile } from './types'

export const LOADING_STEPS: LoadingStep[] = [
  { id: 1, label: 'Reading your profile', status: 'Analyzing resume and answers...', state: 'pending' },
  { id: 2, label: 'Scanning job market', status: 'Searching 24 live postings...', state: 'pending' },
  { id: 3, label: 'Building skill tree', status: 'Mapping required skills...', state: 'pending' },
  { id: 4, label: 'Finding resources', status: 'Ranking 200+ learning sources...', state: 'pending' },
  { id: 5, label: 'Assembling roadmap', status: 'Creating your personalized plan...', state: 'pending' },
]

export const TIME_OPTIONS = ['1 hour', '2 hours', '3 hours', '4+ hours']
export const GOAL_OPTIONS = ['Get hired fast', 'Switch careers', 'Upskill in current role']

export const DEFAULT_USER_PROFILE: UserProfile = {
  hasResume: false,
  resumeSkills: [],
  currentRole: '',
  timeAvailable: '',
  mainGoal: '',
  experienceLevel: '',
  hoursPerDay: 1,
  targetTimeline: '',
  targetTimelineMonths: 3,
  learningStyle: [],
  budget: '',
  targetCompanyType: '',
  biggestChallenge: '',
  roleType: '',
}
