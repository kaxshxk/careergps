import type {
  DailyViewDay,
  LoadingStep,
  UserProfile,
  JobData,
  SkillFrequencyItem,
  CompensationTier,
  SkillTree,
  Resource,
  Roadmap,
  ProgressData,
  MatchScore,
  WeeklyViewWeek,
} from './types'

// ─── Loading Screen ───────────────────────────────────────────────────────────

export const LOADING_STEPS: LoadingStep[] = [
  { id: 1, label: 'Reading your profile',  status: 'Analyzing resume and answers...', state: 'pending' },
  { id: 2, label: 'Scanning job market',   status: 'Searching 24 live postings...',   state: 'pending' },
  { id: 3, label: 'Building skill tree',   status: 'Mapping required skills...',       state: 'pending' },
  { id: 4, label: 'Finding resources',     status: 'Ranking 200+ learning sources...',state: 'pending' },
  { id: 5, label: 'Assembling roadmap',    status: 'Creating your personalized plan...', state: 'pending' },
]

// ─── Agent Chat ───────────────────────────────────────────────────────────────

export const TIME_OPTIONS: string[] = ['1 hour', '2 hours', '3 hours', '4+ hours']

export const GOAL_OPTIONS: string[] = ['Get hired fast', 'Switch careers', 'Upskill in current role']

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

// ─── Intelligence Report ──────────────────────────────────────────────────────

export const jobData: JobData = {
  title: 'Senior ML Engineer',
  tags: ['Remote', 'Series B', 'High Demand'],
  description:
    'Lead the development and deployment of production ML systems. Collaborate with cross-functional teams to design and implement scalable machine learning solutions that drive business impact.',
  dailyOps: [
    'Design and implement ML pipelines',
    'Collaborate with product teams on feature prioritization',
    'Review and mentor junior engineers',
    'Monitor model performance and drift',
    'Research and evaluate new ML techniques',
  ],
  marketSignal: { value: 34, trend: 'up' },
  agentAnalysis:
    'Based on analysis of 24 active job postings, this role requires a strong foundation in Python and deep learning frameworks. The emphasis on MLOps indicates companies are prioritizing production-ready engineers over research-focused candidates.\n\nKey insight: 71% of postings mention containerization skills, suggesting a shift toward platform-oriented ML roles.',
  confidenceScore: 94.2,
  marketTrendSparkline: [30, 35, 32, 40, 45, 42, 55, 60, 58, 72, 78, 85],
}

export const skillFrequency: SkillFrequencyItem[] = [
  { skill: 'Python',             percentage: 96 },
  { skill: 'PyTorch/TensorFlow', percentage: 88 },
  { skill: 'MLOps',              percentage: 76 },
  { skill: 'Docker/K8s',         percentage: 71 },
  { skill: 'SQL',                percentage: 68 },
  { skill: 'Cloud (AWS/GCP)',    percentage: 65 },
  { skill: 'Feature Engineering',percentage: 58 },
  { skill: 'A/B Testing',        percentage: 42 },
]

export const compensationTiers: CompensationTier[] = [
  { level: 'Entry',  range: '$120K - $150K' },
  { level: 'Mid',    range: '$150K - $200K' },
  { level: 'Senior', range: '$200K - $280K' },
]

// ─── Skill Map ────────────────────────────────────────────────────────────────

export const skillCategories: SkillTree[] = [
  {
    name: 'Technical Skills',
    skills: [
      { name: 'Python',     proficiency: 4, match: 96, status: 'good'    },
      { name: 'PyTorch',    proficiency: 2, match: 88, status: 'partial'  },
      { name: 'TensorFlow', proficiency: 1, match: 85, status: 'learn'   },
      { name: 'MLOps',      proficiency: 2, match: 76, status: 'partial'  },
      { name: 'Docker',     proficiency: 3, match: 71, status: 'good'    },
      { name: 'Kubernetes', proficiency: 1, match: 68, status: 'learn'   },
    ],
  },
  {
    name: 'Data Skills',
    skills: [
      { name: 'SQL',                proficiency: 4, match: 68, status: 'good'   },
      { name: 'Feature Engineering',proficiency: 2, match: 58, status: 'partial'},
      { name: 'Data Pipelines',     proficiency: 2, match: 52, status: 'partial'},
      { name: 'Spark',              proficiency: 1, match: 45, status: 'learn'  },
    ],
  },
  {
    name: 'Cloud & Infrastructure',
    skills: [
      { name: 'AWS',   proficiency: 3, match: 65, status: 'good'   },
      { name: 'GCP',   proficiency: 1, match: 55, status: 'learn'  },
      { name: 'CI/CD', proficiency: 2, match: 48, status: 'partial'},
    ],
  },
]

export const resources: Resource[] = [
  {
    title:    'Deep Learning Specialization',
    provider: 'deeplearning.ai',
    tags:     ['Video', 'Paid', '40H'],
    rank:     'gold',
    scores:   { quality: 95, recency: 88, trust: 92, relevance: 96, access: 70,  fit: 94 },
  },
  {
    title:    'Fast.ai Practical Deep Learning',
    provider: 'fast.ai',
    tags:     ['Video', 'Free', '25H'],
    rank:     'silver',
    scores:   { quality: 90, recency: 92, trust: 88, relevance: 90, access: 100, fit: 88 },
  },
  {
    title:    'PyTorch Documentation',
    provider: 'pytorch.org',
    tags:     ['Docs', 'Free', 'Ref'],
    rank:     'bronze',
    scores:   { quality: 85, recency: 98, trust: 95, relevance: 85, access: 100, fit: 75 },
  },
]

// ─── Roadmap ──────────────────────────────────────────────────────────────────

export const roadmapData: Roadmap[] = [
  {
    title: 'Month 01 — Python Foundations',
    weeks: [
      {
        label: 'Week 01',
        skill: 'Python',
        tasks: [
          { id: '1', title: 'Complete Python basics module',  source: 'Codecademy', duration: '~4H', completed: true  },
          { id: '2', title: 'Build CLI todo app project',     source: 'Project',    duration: '~3H', completed: true, badges: ['Project'] },
          { id: '3', title: 'Practice data structures',       source: 'LeetCode',   duration: '~2H', completed: false },
        ],
      },
      {
        label: 'Week 02',
        skill: 'NumPy/Pandas',
        tasks: [
          { id: '4', title: 'NumPy fundamentals course',   source: 'DataCamp', duration: '~3H', completed: false, isToday: true },
          { id: '5', title: 'Pandas data manipulation',    source: 'DataCamp', duration: '~4H', completed: false },
          { id: '6', title: 'Analyze real dataset project',source: 'Kaggle',   duration: '~5H', completed: false, badges: ['Project', 'Resume+'] },
        ],
      },
    ],
  },
  {
    title: 'Month 02 — Machine Learning Core',
    weeks: [
      {
        label: 'Week 05',
        skill: 'Scikit-learn',
        tasks: [
          { id: '7', title: 'ML fundamentals course',           source: 'Fast.ai',  duration: '~6H', completed: false },
          { id: '8', title: 'Classification algorithms deep dive',source: 'Coursera',duration: '~4H', completed: false },
          { id: '9', title: 'Build ML pipeline project',        source: 'Project',  duration: '~8H', completed: false, badges: ['Project', 'Resume+'] },
        ],
      },
    ],
  },
]

// ─── Progress ─────────────────────────────────────────────────────────────────

export const progressData: ProgressData = {
  matchScore:     67,
  currentStreak:  7,
  bestStreak:     14,
  skillProgress: [
    { name: 'Python',          percentage: 68 },
    { name: 'NumPy/Pandas',    percentage: 45 },
    { name: 'Machine Learning',percentage: 22 },
    { name: 'PyTorch',         percentage: 15 },
    { name: 'MLOps',           percentage:  8 },
  ],
  todaysTasks: [
    { id: 't1', title: 'Complete NumPy basics',       completed: false },
    { id: 't2', title: "Review yesterday's notes",    completed: true  },
    { id: 't3', title: 'Practice 3 array exercises',  completed: false },
  ],
}

// ─── Match Score ──────────────────────────────────────────────────────────────

export const matchScore: MatchScore = {
  overall:    67,
  confidence: 94.2,
}

// ─── Roadmap Weekly View (ML profile, May 2026) ───────────────────────────────

export const weeklyViewData: WeeklyViewWeek[] = [
  {
    weekNumber: 1, dateRange: 'May 4 - May 10', skill: 'Python', completionPercentage: 100,
    tasks: [
      { id: 'mw1-1', title: 'Complete Python basics module', description: 'Variables, functions, loops, OOP fundamentals', resource: 'Codecademy', duration: '4h', type: 'Video', completed: true },
      { id: 'mw1-2', title: 'Build CLI data processor', description: 'Apply Python by building a command-line data processing tool', resource: 'Project', duration: '3h', type: 'Project', completed: true },
      { id: 'mw1-3', title: 'Practice data structures', description: 'Lists, dicts, sets — know when to use each for ML preprocessing', resource: 'LeetCode', duration: '2h', type: 'Practice', completed: true },
      { id: 'mw1-4', title: 'File I/O and error handling', description: 'Reading/writing files, try/except patterns for robust pipelines', resource: 'Real Python', duration: '2h', type: 'Reading', completed: true },
    ],
  },
  {
    weekNumber: 2, dateRange: 'May 11 - May 17', skill: 'NumPy/Pandas', completionPercentage: 50,
    tasks: [
      { id: 'mw2-1', title: 'NumPy fundamentals course', description: 'Arrays, broadcasting, vectorized operations', resource: 'DataCamp', duration: '3h', type: 'Video', completed: true },
      { id: 'mw2-2', title: 'Pandas data manipulation', description: 'DataFrames, groupby, merges, and time series basics', resource: 'DataCamp', duration: '4h', type: 'Video', completed: true },
      { id: 'mw2-3', title: 'Analyze real dataset project', description: 'Download a Kaggle dataset and produce 5 actionable insights', resource: 'Kaggle', duration: '5h', type: 'Project', completed: false },
      { id: 'mw2-4', title: 'Data visualization with Matplotlib', description: 'Histograms, scatter plots, and correlation heatmaps for EDA', resource: 'Matplotlib Docs', duration: '2h', type: 'Practice', completed: false },
    ],
  },
  {
    weekNumber: 3, dateRange: 'May 18 - May 24', skill: 'Scikit-learn', completionPercentage: 0,
    tasks: [
      { id: 'mw3-1', title: 'ML fundamentals with scikit-learn', description: 'Understand the fit/predict API and build sklearn pipelines', resource: 'Fast.ai', duration: '3h', type: 'Video', completed: false },
      { id: 'mw3-2', title: 'Train first classification model', description: 'Logistic regression and SVM on iris dataset', resource: 'Kaggle Learn', duration: '2h', type: 'Practice', completed: false },
      { id: 'mw3-3', title: 'Model evaluation techniques', description: 'Confusion matrix, precision-recall, ROC curves, and AUC', resource: 'Towards Data Science', duration: '2h', type: 'Reading', completed: false },
      { id: 'mw3-4', title: 'Cross-validation and hyperparameter tuning', description: 'GridSearchCV and RandomizedSearchCV in practice', resource: 'Scikit-learn Docs', duration: '3h', type: 'Practice', completed: false },
      { id: 'mw3-5', title: 'Build end-to-end ML pipeline project', description: 'Ingest → clean → feature engineer → train → evaluate → save', resource: 'Project', duration: '4h', type: 'Project', completed: false },
    ],
  },
  {
    weekNumber: 4, dateRange: 'May 25 - May 31', skill: 'Deep Learning', completionPercentage: 0,
    tasks: [
      { id: 'mw4-1', title: 'Neural network fundamentals', description: 'Forward pass, backpropagation, activation functions', resource: '3Blue1Brown', duration: '3h', type: 'Video', completed: false },
      { id: 'mw4-2', title: 'PyTorch basics workshop', description: 'Tensors, autograd, and building your first nn.Module', resource: 'PyTorch Tutorials', duration: '4h', type: 'Practice', completed: false },
      { id: 'mw4-3', title: 'Train MNIST image classifier', description: 'CNN project to solidify PyTorch fundamentals', resource: 'Project', duration: '3h', type: 'Project', completed: false },
      { id: 'mw4-4', title: 'Fast.ai practical deep learning lecture 1', description: 'Top-down approach to modern deep learning', resource: 'Fast.ai', duration: '2h', type: 'Video', completed: false },
    ],
  },
]

// ─── Roadmap Daily View (ML profile, week of May 18-24) ──────────────────────

export const dailyViewData: DailyViewDay[] = [
  {
    dayName: 'Monday', date: 'May 18', isToday: false, isPast: true,
    tasks: [
      { id: 'md1-1', title: 'Read scikit-learn docs intro', source: 'Scikit-learn Docs', duration: '45m', type: 'Reading', completed: true },
      { id: 'md1-2', title: 'Watch ML fundamentals lecture', source: 'Fast.ai', duration: '1h', type: 'Video', completed: true },
    ],
  },
  {
    dayName: 'Tuesday', date: 'May 19', isToday: false, isPast: true,
    tasks: [
      { id: 'md2-1', title: 'Train logistic regression on iris', source: 'Kaggle Learn', duration: '1h', type: 'Practice', completed: true },
      { id: 'md2-2', title: 'Plot confusion matrix', source: 'Towards Data Science', duration: '30m', type: 'Practice', completed: false },
    ],
  },
  {
    dayName: 'Wednesday', date: 'May 20', isToday: true, isPast: false,
    tasks: [
      { id: 'md3-1', title: 'Study ROC curves and AUC metric', source: 'Towards Data Science', duration: '45m', type: 'Reading', completed: false },
      { id: 'md3-2', title: 'Implement cross-validation loop', source: 'Scikit-learn Docs', duration: '1h', type: 'Practice', completed: false },
      { id: 'md3-3', title: 'Watch hyperparameter tuning video', source: 'Fast.ai', duration: '45m', type: 'Video', completed: false },
    ],
  },
  {
    dayName: 'Thursday', date: 'May 21', isToday: false, isPast: false,
    tasks: [
      { id: 'md4-1', title: 'GridSearchCV deep dive', source: 'Scikit-learn Docs', duration: '1h', type: 'Practice', completed: false },
      { id: 'md4-2', title: 'RandomizedSearchCV vs Grid', source: 'Real Python', duration: '30m', type: 'Reading', completed: false },
    ],
  },
  {
    dayName: 'Friday', date: 'May 22', isToday: false, isPast: false,
    tasks: [
      { id: 'md5-1', title: 'Start ML pipeline project', source: 'Project', duration: '2h', type: 'Project', completed: false },
      { id: 'md5-2', title: 'Data ingestion and cleaning step', source: 'Kaggle', duration: '1h', type: 'Practice', completed: false },
    ],
  },
  {
    dayName: 'Saturday', date: 'May 23', isToday: false, isPast: false,
    tasks: [
      { id: 'md6-1', title: 'Model training and evaluation', source: 'Project', duration: '1.5h', type: 'Project', completed: false },
    ],
  },
  {
    dayName: 'Sunday', date: 'May 24', isToday: false, isPast: false,
    tasks: [],
  },
]
