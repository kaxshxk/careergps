export interface SavedRoadmap {
  id: string
  jobTitle: string
  roleCategory: string
  matchScore: number
  totalTasks: number
  completedTasks: number
  progressPercentage: number
  lastActive: string
  createdAt: string
}

export const mockSavedRoadmaps: SavedRoadmap[] = []
