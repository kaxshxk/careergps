import { z } from "zod";

export const financialTierSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

const knownFieldSchema = z.enum(["TECH", "SCIENCE", "COMMERCE", "ARTS", "LAW", "MEDICINE", "DESIGN"]);

export const studentProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  stage: z.enum(["CLASS_7_8", "CLASS_9_10", "CLASS_11_12", "UNDERGRADUATE", "POSTGRADUATE", "WORKING"]),
  age: z.number().int().min(12).max(40),
  field: z.union([
    z.object({
      type: knownFieldSchema,
      customValue: z.string().trim().optional().default(""),
    }),
    z.object({
      type: z.literal("OTHER"),
      customValue: z.string().trim().min(1, "Custom field is required"),
    }),
  ]),
  skills: z.array(z.string().trim().min(1)).min(1).refine(
    (skills) => !(skills.includes("None yet") && skills.length > 1),
    "None yet cannot be selected with other skills",
  ),
  goal: z.object({
    type: z.enum(["JOB_ROLE", "STARTUP", "HIGHER_STUDIES", "NOT_SURE"]),
    description: z.string().trim().min(1),
  }),
  financialTier: financialTierSchema,
  preferences: z.array(z.string().trim().min(1)),
  onboardingPhase: z.number().int().min(1).max(4).optional().default(1),
  academicFocus: z.string().optional(),
  timeCommitment: z.string().optional(),
  tenthPath: z.string().optional(),
  streamElectives: z.string().optional(),
  prepStyle: z.string().optional(),
  collegeDegree: z.string().optional(),
  collegeEnvironment: z.string().optional(),
  collegeFocus: z.string().optional(),
  postCollegeChoice: z.string().optional(),
  mastersPreference: z.string().optional(),
  enableLongTerm: z.boolean().optional(),
  startedInPhase1: z.boolean().optional(),
  startedInPhase2: z.boolean().optional(),
  startedInPhase3: z.boolean().optional(),
  startStage: z.string().optional(),
});

const milestoneSchema = z.lazy(() => z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  detail: z.string().trim().min(1),
  phase: z.enum(["shortTerm", "longTerm", "certifications", "internships", "goalsToAchieve"]),
  timeframe: z.string().trim().min(1),
  prerequisites: z.lazy(() => z.array(milestoneSchema).optional().default([])),
}));

const goalsToAchieveSchema = z.object({
  description: z.string().trim().min(1),
  milestones: z.array(milestoneSchema).min(1),
});


const tieredItemBaseSchema = z.object({
  id: z.string().trim().min(1),
  financialTiers: z.array(financialTierSchema).min(1),
});

const collegeCourseSchema = tieredItemBaseSchema.extend({
  name: z.string().trim().min(1),
  semester: z.string().trim().min(1),
  reason: z.string().trim().min(1),
});

const internshipSchema = tieredItemBaseSchema.extend({
  role: z.string().trim().min(1),
  when: z.string().trim().min(1),
  platforms: z.array(z.string().trim().min(1)).min(1),
  stipendNote: z.string().trim().min(1),
});

const certificationSchema = tieredItemBaseSchema.extend({
  name: z.string().trim().min(1),
  platform: z.string().trim().min(1),
  cost: z.string().trim().min(1),
  duration: z.string().trim().min(1),
  impact: z.string().trim().min(1),
});

const alternatePathSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  salaryRange: z.string().trim().min(1),
  skillOverlap: z.number().int().min(0).max(100),
  pivotRequired: z.string().trim().min(1),
});

export const decisionTreeNodeSchema = z.lazy(() =>
  z.object({
    id: z.string().trim().min(1),
    label: z.string().trim().min(1),
    type: z.enum(["milestone", "decision", "goal", "alternate"]),
    month: z.string().trim().min(1),
    detail: z.string().trim().min(1),
    financialTiers: z.array(financialTierSchema).min(1),
    status: z.enum(["not_started", "in_progress", "done"]),
    children: z.array(decisionTreeNodeSchema).default([]),
  }),
);

const skillGapSchema = z.object({
  have: z.array(z.string().trim().min(1)),
  need: z.array(z.object({
    skill: z.string().trim().min(1),
    milestoneId: z.string().trim().min(1),
  })),
  bridgingSteps: z.array(z.string().trim().min(1)).min(1),
});

export const roadmapSchema = z.object({
  goalsToAchieve: goalsToAchieveSchema,
  collegeCourses: z.array(collegeCourseSchema),
  internships: z.array(internshipSchema),
  certifications: z.array(certificationSchema),
  alternatePaths: z.array(alternatePathSchema),
  decisionTree: decisionTreeNodeSchema,
  skillGap: skillGapSchema,
});

export function parseStudentProfile(profile) {
  return studentProfileSchema.parse(profile);
}

export function parseRoadmap(roadmap) {
  return roadmapSchema.parse(roadmap);
}

export const deepQuestionSchema = z.object({
  id: z.string().trim().min(1),
  questionText: z.string().trim().min(1),
  options: z.array(z.string().trim().min(1)).min(2),
});

export const deepQuestionsResponseSchema = z.object({
  questions: z.array(deepQuestionSchema).min(3),
});

export const deepRoadmapDetailsSchema = z.object({
  weeklyStudyPlan: z.array(z.object({
    week: z.string().trim().min(1),
    topic: z.string().trim().min(1),
    resource: z.string().trim().min(1),
    actionItem: z.string().trim().min(1),
  })).min(3),
  targetProjects: z.array(z.object({
    title: z.string().trim().min(1),
    techStack: z.string().trim().min(1),
    description: z.string().trim().min(1),
    phases: z.array(z.string().trim().min(1)).min(2),
  })).min(2),
  strategicAdvice: z.string().trim().min(1),
});

export function parseDeepQuestions(data) {
  return deepQuestionsResponseSchema.parse(data);
}

export function parseDeepRoadmap(data) {
  return deepRoadmapDetailsSchema.parse(data);
}
