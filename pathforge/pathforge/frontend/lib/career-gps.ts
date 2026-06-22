import type { Roadmap, RoadmapTask, UserProfile, WeeklyViewWeek } from './types'

export type FinancialTier = 'free' | 'affordable' | 'flexible'

export interface GpsResourceSignal {
  tier: FinancialTier
  label: string
  description: string
}

export interface GpsMilestone {
  id: string
  title: string
  timeframe: string
  skill: string
  tasks: RoadmapTask[]
}

export interface GpsAlternatePath {
  title: string
  overlap: number
  pivot: string
  firstMove: string
}

export interface GpsDeepSprint {
  week: string
  topic: string
  action: string
}

const FREE_SOURCES = [
  'docs',
  'documentation',
  'kaggle',
  'leetcode',
  'freecodecamp',
  'youtube',
  'project',
  'github',
  'mdn',
]

const PAID_SOURCES = ['coursera', 'datacamp', 'codecademy', 'udemy', 'bootcamp', 'certification']

export function financialTierFromProfile(profile?: UserProfile | null): FinancialTier {
  const budget = profile?.budget?.toLowerCase() ?? ''
  if (budget.includes('free')) return 'free'
  if (budget.includes('under') || budget.includes('$50')) return 'affordable'
  return 'flexible'
}

export function getResourceSignal(task: Pick<RoadmapTask, 'source' | 'title'>): GpsResourceSignal {
  const text = `${task.source} ${task.title}`.toLowerCase()
  if (FREE_SOURCES.some(source => text.includes(source))) {
    return {
      tier: 'free',
      label: 'Free',
      description: 'Fits a no-cost learning path.',
    }
  }
  if (PAID_SOURCES.some(source => text.includes(source))) {
    return {
      tier: 'affordable',
      label: 'Paid',
      description: 'Worth considering if it saves time or adds structure.',
    }
  }
  return {
    tier: 'flexible',
    label: 'Flexible',
    description: 'Keep if it directly supports the target role.',
  }
}

export function taskFitsTier(task: Pick<RoadmapTask, 'source' | 'title'>, tier: FinancialTier) {
  const signal = getResourceSignal(task)
  if (tier === 'free') return signal.tier === 'free'
  if (tier === 'affordable') return signal.tier !== 'flexible'
  return true
}

export function buildGpsMilestones(roadmap: Roadmap[], completedTaskIds: string[]): GpsMilestone[] {
  const completed = new Set(completedTaskIds)
  return roadmap.slice(0, 6).map((month, index) => {
    const tasks = month.weeks.flatMap(week => week.tasks ?? [])
    const openTasks = tasks.filter(task => !task.completed && !completed.has(task.id))
    const focusTasks = openTasks.length ? openTasks.slice(0, 3) : tasks.slice(0, 3)
    const primarySkill = month.weeks.find(week => week.skill)?.skill ?? 'Core skills'
    const cleanTitle = month.title.split('—').pop()?.trim() || month.title

    return {
      id: `${month.title}-${index}`,
      title: cleanTitle,
      timeframe: `Month ${index + 1}`,
      skill: primarySkill,
      tasks: focusTasks,
    }
  })
}

export function buildAlternatePaths(jobTitle: string, roadmap: Roadmap[]): GpsAlternatePath[] {
  const title = jobTitle.toLowerCase()
  const coreSkills = Array.from(new Set(roadmap.flatMap(month => month.weeks.map(week => week.skill)).filter(Boolean)))
  const firstSkill = coreSkills[0] ?? 'portfolio proof'
  const secondSkill = coreSkills[1] ?? 'interview practice'

  if (title.includes('data') || title.includes('ml') || title.includes('machine learning') || title.includes('ai')) {
    return [
      {
        title: 'Analytics Engineer',
        overlap: 78,
        pivot: 'Lean harder into SQL, dashboards, and data modeling.',
        firstMove: `Ship one ${firstSkill} project with clean metrics and a written case study.`,
      },
      {
        title: 'MLOps Engineer',
        overlap: 72,
        pivot: 'Add deployment, monitoring, and cloud infrastructure proof.',
        firstMove: `Package a model behind an API and document the ${secondSkill} workflow.`,
      },
    ]
  }

  if (title.includes('design') || title.includes('ux') || title.includes('ui')) {
    return [
      {
        title: 'Product Designer',
        overlap: 81,
        pivot: 'Frame your work around product decisions and measurable outcomes.',
        firstMove: `Turn a ${firstSkill} exercise into a before/after case study.`,
      },
      {
        title: 'UX Researcher',
        overlap: 68,
        pivot: 'Add interview synthesis, usability testing, and research operations.',
        firstMove: 'Run a lightweight study and publish the findings as portfolio evidence.',
      },
    ]
  }

  if (title.includes('marketing') || title.includes('growth')) {
    return [
      {
        title: 'Growth Strategist',
        overlap: 76,
        pivot: 'Connect campaign work to funnel metrics and experimentation.',
        firstMove: `Use ${firstSkill} to build a small acquisition experiment.`,
      },
      {
        title: 'Product Marketing Manager',
        overlap: 70,
        pivot: 'Add positioning, launch planning, and customer research evidence.',
        firstMove: 'Write a launch brief for a real product and include competitive analysis.',
      },
    ]
  }

  return [
    {
      title: 'Specialist Track',
      overlap: 75,
      pivot: `Go deeper on ${firstSkill} and turn practice into visible proof-of-work.`,
      firstMove: `Complete the next ${firstSkill} milestone and publish the result.`,
    },
    {
      title: 'Adjacent Operator Track',
      overlap: 64,
      pivot: `Pair ${firstSkill} with communication, process, and delivery ownership.`,
      firstMove: 'Write a short operating playbook based on the roadmap work you complete.',
    },
  ]
}

export function buildDeepSprint(weeklyView: WeeklyViewWeek[], roadmap: Roadmap[]): GpsDeepSprint[] {
  const fromWeekly = weeklyView.slice(0, 6).map(week => ({
    week: `Week ${week.weekNumber}`,
    topic: week.skill,
    action: week.tasks.find(task => task.type === 'Project')?.title ?? week.tasks[0]?.title ?? 'Complete the highest leverage task',
  }))

  if (fromWeekly.length) return fromWeekly

  return roadmap.slice(0, 6).map((month, index) => {
    const week = month.weeks[0]
    return {
      week: `Week ${index + 1}`,
      topic: week?.skill ?? month.title,
      action: week?.tasks?.find(task => task.badges?.includes('Project'))?.title ?? week?.tasks?.[0]?.title ?? 'Complete one portfolio-ready proof point',
    }
  })
}
