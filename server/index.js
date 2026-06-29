import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import pdfParse from "pdf-parse";

function cleanGeminiJsonResponse(text) {
  if (!text) return "{}";
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

// ESM equivalent of __filename / __dirname (module-scoped so all routes can use them)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are supported for resume analysis."), false);
    }
  }
});

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_ACTUAL_GEMINI_API_KEY") {
  throw new Error("GEMINI_API_KEY is not configured. Set it in your .env file before starting the server.");
}
// The user asked to use gemini-3.1-flash, or a similar standard model name.
// We default to "gemini-2.5-flash" (or "gemini-1.5-flash" if 2.5-flash is not available).
// This env variable allows the user to override the model if they want (e.g. to gemini-1.5-flash or gemini-2.5-flash).
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Programmatically build the decision tree nodes linearly from milestones to ensure absolute Zod compliance
function buildTreeFromGoals(goalText, goalsToAchieve, collegeCourses, internships, certifications, alternatePaths) {
  const milestones = [];
  goalsToAchieve.milestones.forEach((ms) => {
    milestones.push({
      id: ms.id,
      label: ms.title,
      type: ms.timeframe.toLowerCase().includes("month") ? "milestone" : "goal",
      month: ms.timeframe,
      detail: ms.detail,
      financialTiers: ["LOW", "MEDIUM", "HIGH"],
      status: "not_started",
      children: [],
    });
  });

  // Attach a few certifications or alternate paths to goalsToAchieve branch
  if (milestones.length > 2 && certifications[0]) {
    milestones[2].children.push({
      id: "cert-1",
      label: certifications[0].name.split(" ").slice(0, 4).join(" "),
      type: "milestone",
      month: milestones[2].month,
      detail: certifications[0].impact,
      financialTiers: certifications[0].financialTiers || ["LOW", "MEDIUM", "HIGH"],
      status: "not_started",
      children: [],
    });
  }
  if (milestones.length > 4 && alternatePaths[0]) {
    milestones[4].children.push({
      id: "tree-alt-1",
      label: `Alternate: ${alternatePaths[0].title}`,
      type: "alternate",
      month: milestones[4].month,
      detail: alternatePaths[0].pivotRequired,
      financialTiers: ["LOW", "MEDIUM", "HIGH"],
      status: "not_started",
      children: [],
    });
  }
  if (milestones.length > 5 && certifications[1]) {
    milestones[5].children.push({
      id: "cert-2",
      label: certifications[1].name.split(" ").slice(0, 4).join(" "),
      type: "milestone",
      month: milestones[5].month,
      detail: certifications[1].impact,
      financialTiers: certifications[1].financialTiers || ["LOW", "MEDIUM", "HIGH"],
      status: "not_started",
      children: [],
    });
  }

  // Link milestones linearly
  for (let i = 0; i < milestones.length - 1; i++) {
    milestones[i].children.push(milestones[i + 1]);
  }

  const rootPath = {
    id: "goals-root",
    label: "Goals Path",
    type: "decision",
    month: "Chronological Path",
    detail: "Follow these immediate and long-term milestones sequentially.",
    financialTiers: ["LOW", "MEDIUM", "HIGH"],
    status: "not_started",
    children: milestones.length > 0 ? [milestones[0]] : [],
  };

  return {
    id: "root-now",
    label: "You are here",
    type: "decision",
    month: "Now",
    detail: `Start from your current stage toward: ${goalText}`,
    financialTiers: ["LOW", "MEDIUM", "HIGH"],
    status: "in_progress",
    children: [rootPath],
  };
}

function inferCollegeDegree(profile) {
  if (profile.collegeDegree && profile.collegeDegree.trim()) {
    return profile.collegeDegree.trim();
  }

  const fieldType = profile.field?.type;
  const customField = (profile.field?.customValue || "").toLowerCase();
  const goalDesc = (profile.goal?.description || "").toLowerCase();

  if (
    customField.includes("chef") || customField.includes("culinary") || customField.includes("cook") || 
    customField.includes("bakery") || customField.includes("pastry") || customField.includes("hotel") || 
    customField.includes("restaurant") || customField.includes("hospitality") || customField.includes("catering") ||
    goalDesc.includes("chef") || goalDesc.includes("culinary") || goalDesc.includes("cook") || 
    goalDesc.includes("bakery") || goalDesc.includes("pastry") || goalDesc.includes("hotel") || 
    goalDesc.includes("restaurant") || goalDesc.includes("hospitality") || goalDesc.includes("catering")
  ) {
    return "Bachelor's in Culinary Arts / Culinary Science";
  }

  if (fieldType === "TECH") {
    if (goalDesc.includes("data analyst") || goalDesc.includes("analytics")) {
      return "B.Sc in Data Science / BCA";
    }
    return "B.Tech Computer Science / Information Technology";
  }
  if (fieldType === "SCIENCE") {
    return "B.Sc (Bachelor of Science)";
  }
  if (fieldType === "COMMERCE") {
    if (goalDesc.includes("chartered accountant") || goalDesc.includes("audit") || goalDesc.includes("finance")) {
      return "B.Com / B.B.A. Finance";
    }
    return "B.Com (Bachelor of Commerce)";
  }
  if (fieldType === "ARTS") {
    return "Bachelor of Arts (B.A.)";
  }
  if (fieldType === "LAW") {
    return "B.A. LL.B. (Integrated Law)";
  }
  if (fieldType === "MEDICINE") {
    return "M.B.B.S. (Bachelor of Medicine, Bachelor of Surgery)";
  }
  if (fieldType === "DESIGN") {
    return "B.Des (Bachelor of Design)";
  }

  return "Bachelor's Degree Program";
}

// Generate the prompt to send to Gemini
function constructPrompt(profile) {
  const fieldLabel = profile.field.type === "OTHER" ? profile.field.customValue : profile.field.type;
  const degree = inferCollegeDegree(profile);
  const collegeEnv = profile.collegeEnvironment || "College";
  const collegeFocus = profile.collegeFocus || "Campus Placements";
  const timeCommit = profile.timeCommitment || "Balanced";
  const longTerm = profile.enableLongTerm !== false;

  let extraContext = "";
  let stageRulesPrompt = "";
  let goalsToAchieveInstructions = "";

  let guardrailsPrompt = `
### STRICT DOMAIN & LOCALIZATION GUARDRAILS:

1. **Prerequisite Chronology Rule**: You MUST schedule basic foundations before advanced frameworks. For example, "Foundations" (e.g., Statistics, Mathematics, Basic Excel, programming syntax) MUST always be placed in an earlier milestone bucket than "Advanced Frameworks & Tools" (e.g., Pandas, NumPy, Power BI, SQL databases, advanced frameworks) which belong in subsequent buckets.
2. **Regional Platform Standardization**: To keep suggestions practical and localized for the Indian educational ecosystem:
   - For **College Courses/Classes**: Suggest and prioritize **NPTEL** or **SWAYAM** for online credits and courses.
   - For **Internships & Jobs search**: Suggest and prioritize **Internshala** or **Naukri** as platforms.
   - For **Certifications**: Suggest and prioritize **NASSCOM**, **FutureSkills Prime**, or **SWAYAM** certifications rather than expensive Western platforms.
3. **Current Skill Adaptation**: Analyze the user's "Current Skills". If they already possess foundational skills, DO NOT repeat them in the first milestones; instead, start their roadmap at an appropriately advanced level.
`;

  if (profile.financialTier === "LOW") {
    guardrailsPrompt += `
3. **Strict Low-Budget Stipend Rule**: The user has selected a LOW financial budget tier. You MUST NOT suggest any unpaid, volunteer, or open-ended portfolio roles. Every recommended internship role MUST be immediately actionable and guaranteed to pay a monthly stipend. Prioritize internship listings found directly on **Internshala** or **Naukri** that pay a guaranteed stipend.
`;
  } else {
    guardrailsPrompt += `
3. **Stipend Guidance**: Ensure suggested internships have realistic budget context (e.g. paid vs stipend-based platform options) matching their budget tier: ${profile.financialTier}.
`;
  }

  // 1. Determine timeline phases based on user's current stage
  let milestoneTimeframes = [];
  
  if (profile.stage === "CLASS_7_8") {
    milestoneTimeframes = [
      "Grade 8 (Months 1-6)",
      "Grade 8 (Months 7-12)",
      "Grade 9 (Year 2)",
      "Grade 10 (Year 3 - Board Exams)",
      "Grade 11 (Year 4 - Stream Start)",
      "Grade 12 (Year 5 - Final Boards)",
      "College Year 1",
      "College Year 2",
      "College Year 3",
      "College Year 4",
      "Year 5 (Junior Role)",
      "Year 6-7 (Mid-Level Role)",
      "Year 8-9 (Senior Role)",
      "Year 10+ (Lead / Specialist)"
    ];
    stageRulesPrompt = `
### STAGE-SPECIFIC INSTRUCTIONS FOR CLASS_7_8 (Middle School):
- You are starting from Middle School (Grade 8). You must generate milestones for every academic year from Grade 8 all the way to college graduation and career progression.
- For Grade 8 and 9, focus purely on school academics, visual/block coding (Scratch), basic logic, math games, hobbies, physical activity, and family dinners. Keep study load under 1-2 hours/week. Do NOT assign advanced subjects or cloud/framework tools.
- For Grade 10, focus on Board Exams preparation and stream/track choices.
- For Grade 11 and 12, focus on stream adaptation (PCM, PCB, Commerce, or Humanities) and college entrance exam preparation.
- For College Years 1-4, focus on academics in Year 1, upskilling and internships in Years 2-3, and placements/graduation in Year 4.
- For Years 5+, focus on job onboarding, mid-level progression, and senior leadership.
`;
  } else if (profile.stage === "CLASS_9_10") {
    milestoneTimeframes = [
      "Grade 9 (Months 1-12)",
      "Grade 10 (Year 2 - Board Exams)",
      "Grade 11 (Year 3 - Stream Start)",
      "Grade 12 (Year 4 - Final Boards)",
      "College Year 1",
      "College Year 2",
      "College Year 3",
      "College Year 4",
      "Year 5 (Junior Role)",
      "Year 6-7 (Mid-Level Role)",
      "Year 8-9 (Senior Role)",
      "Year 10+ (Lead / Specialist)"
    ];
    stageRulesPrompt = `
### STAGE-SPECIFIC INSTRUCTIONS FOR CLASS_9_10 (High School):
- You are starting from High School (Grade 9). You must generate milestones for every academic year from Grade 9 all the way to college graduation and career progression.
- For Grade 9, focus on coding basics, mathematics, science, hobbies, and sports.
- For Grade 10, focus on 10th Board Exams and stream selection (CBSE, State Board, or Polytechnic Diploma).
- For Grade 11 and 12, focus on stream adaptation, boards, and entrance exams.
- For College Years 1-4, focus on academics in Year 1, upskilling and internships in Years 2-3, and placements/graduation in Year 4.
- For Years 5+, focus on job onboarding, mid-level progression, and senior leadership.
`;
  } else if (profile.stage === "CLASS_11_12") {
    milestoneTimeframes = [
      "Grade 11 (Stream Start)",
      "Grade 12 (Final Boards)",
      "College Year 1",
      "College Year 2",
      "College Year 3",
      "College Year 4",
      "Year 5 (Junior Role)",
      "Year 6-7 (Mid-Level Role)",
      "Year 8-9 (Senior Role)",
      "Year 10+ (Lead / Specialist)"
    ];
    stageRulesPrompt = `
### STAGE-SPECIFIC INSTRUCTIONS FOR CLASS_11_12 (Higher Secondary):
- You are starting from Higher Secondary (Grade 11). You must generate milestones for every academic year from Grade 11 all the way to college graduation and career progression.
- For Grade 11, focus on stream adaptation and academic study habits.
- For Grade 12, focus on 12th Board Exams and college entrance exams.
- For College Years 1-4, focus on academics in Year 1, upskilling and internships in Years 2-3, and placements/graduation in Year 4.
- For Years 5+, focus on job onboarding, mid-level progression, and senior leadership.
`;
  } else if (profile.stage === "UNDERGRADUATE") {
    milestoneTimeframes = [
      "College Year 1",
      "College Year 2",
      "College Year 3",
      "College Year 4",
      "Year 5 (Junior Role)",
      "Year 6-7 (Mid-Level Role)",
      "Year 8-9 (Senior Role)",
      "Year 10+ (Lead / Specialist)"
    ];
    stageRulesPrompt = `
### STAGE-SPECIFIC INSTRUCTIONS FOR UNDERGRADUATE (College):
- You are starting from College. You must generate milestones for every year of college and career progression.
- For College Year 1, focus purely on academics, GPA, and campus clubs. Do NOT recommend internships or heavy job hunt.
- For College Years 2-3, recommend certifications, mini-projects, and stipend-based internships.
- For College Year 4, focus on capstone projects, placement drives, and graduation.
- For Years 5+, focus on job onboarding, mid-level progression, and senior leadership.
`;
  } else if (profile.stage === "POSTGRADUATE") {
    milestoneTimeframes = [
      "Postgrad Year 1",
      "Postgrad Year 2",
      "Year 3 (Junior Role)",
      "Year 4-5 (Mid-Level Role)",
      "Year 6-7 (Senior Role)",
      "Year 8+ (Lead / Specialist)"
    ];
    stageRulesPrompt = `
### STAGE-SPECIFIC INSTRUCTIONS FOR POSTGRADUATE (Masters):
- You are starting from Postgraduate studies. You must generate milestones for Postgraduate Year 1, Year 2, and career progression.
- For Year 1, focus on advanced specialization coursework, research methodologies, and specialized certifications.
- For Year 2, focus on thesis/project, internships, and placements.
- For Years 3+, focus on career progression from junior to senior lead roles.
`;
  } else {
    // WORKING
    milestoneTimeframes = [
      "Working Year 1",
      "Working Year 2",
      "Year 3 (Junior Role)",
      "Year 4-5 (Mid-Level Role)",
      "Year 6-7 (Senior Role)",
      "Year 8+ (Lead / Specialist)"
    ];
    stageRulesPrompt = `
### STAGE-SPECIFIC INSTRUCTIONS FOR WORKING (Professional):
- You are starting from a Working position. You must generate milestones for Working Year 1, Year 2, and career progression.
- For Year 1, focus on intensive upskilling, mastering core tools, and earning professional certifications to build career credibility.
- For Year 2, focus on portfolio building, lateral transitions, or owning larger projects.
- For Years 3+, focus on career progression from junior to senior lead roles.
`;
  }

  extraContext += `\n- **College Degree & Branch**: ${degree}`;
  extraContext += `\n- **College Environment**: ${collegeEnv}`;
  extraContext += `\n- **Graduation Focus**: ${collegeFocus}`;
  extraContext += `\n- **Spare Time Commitment**: ${timeCommit}`;
  extraContext += `\n- **Enable Long-Term Career Path**: ${longTerm ? "Yes" : "No"}`;

  goalsToAchieveInstructions = `
- **description**: A comprehensive chronological pathway mapped to your career objectives.
- **milestones**: A chronological array of exactly ${milestoneTimeframes.length} sequential milestone objects. You MUST include exactly the following timeframe markers sequentially:
  ${milestoneTimeframes.map((tf, i) => `${i + 1}. "${tf}"`).join("\n  ")}

  CRITICAL TIMEFRAME RULE: The "timeframe" field of each milestone MUST be copied character-for-character from the list above. Do NOT paraphrase, abbreviate, or reword the timeframe strings. Each milestone's title and detail MUST describe activities ONLY appropriate for that SPECIFIC year/stage (e.g., Grade 8 activities must not mention internships or certifications; College Year 1 must not mention Grade 11 board exams).

  - Each milestone has:
    - **id**: string (e.g. "goal-1", "goal-2", ..., "goal-${milestoneTimeframes.length}")
    - **title**: string (Highly specific title relevant ONLY to that specific year/stage and target goal — never mix content from a different stage)
    - **detail**: string (Detailed action items relevant ONLY to that specific year/stage — must be age/stage-appropriate)
    - **timeframe**: string (MUST be copied exactly from the timeframe list above — do not modify it)
    - **phase**: always the literal string "goalsToAchieve"
    - **prerequisites**: An array of 2-3 sub-task objects. Each sub-task has: id (string), title (string), detail (string), phase ("goalsToAchieve"), timeframe (same as parent), prerequisites (empty array []).
`;

  const promptText = `You are an expert career consultant and academic advisor specializing in school/college education systems, polytechnic diplomas, and postgraduate pathways. Create a highly customized, realistic, and detailed career roadmap for a student/professional with the following profile:

- **Name**: ${profile.name}
- **Stage**: ${profile.stage} (options: CLASS_7_8, CLASS_9_10, CLASS_11_12, UNDERGRADUATE, POSTGRADUATE, WORKING)${extraContext}
- **Age**: ${profile.age} years old
- **Field/Discipline**: ${fieldLabel}
- **Current Skills**: ${profile.skills.join(", ")}
- **Career Goal Type**: ${profile.goal.type} (options: JOB_ROLE, STARTUP, HIGHER_STUDIES, NOT_SURE)
- **Career Goal Description**: "${profile.goal.description}"
- **Financial Status/Budget Tier**: ${profile.financialTier} (options: LOW - requires free resources, MEDIUM - moderate budget, HIGH - can afford premium bootcamps/exams)
- **Personal Preferences**: ${profile.preferences.join(", ") || "None specified"}${stageRulesPrompt}${guardrailsPrompt}

Your output must be a single, raw, valid JSON object that adheres PRECISELY to the structure described below. Do not wrap the JSON in markdown code blocks like \`\`\`json. Return only the JSON object.

### JSON Structure Requirements:

1. **goalsToAchieve**: A unified, chronological career and academic progression path.
${goalsToAchieveInstructions}

2. **collegeCourses**: An array of 3 recommended college courses or classes to take.
   - Each course object has:
     - **id**: string (e.g. "course-1", "course-2", "course-3")
     - **name**: string (name of course)
     - **semester**: string (e.g. "Next available semester" or "Within 2 semesters")
     - **reason**: string (why this is relevant based on their profile)
     - **financialTiers**: array of strings, containing at least one of ["LOW", "MEDIUM", "HIGH"] (who this is suitable for financially)

3. **internships**: An array of 3 recommended internship targets or roles.
   - Each internship object has:
     - **id**: string (e.g. "intern-1", "intern-2", "intern-3")
     - **role**: string (intern role title)
     - **when**: string (e.g. "Months 6-10" or "Year 2")
     - **platforms**: array of strings (where to look, e.g. ["LinkedIn", "Internshala", "Glassdoor"])
     - **stipendNote**: string (practical financial/compensation context)
     - **financialTiers**: array of strings, containing at least one of ["LOW", "MEDIUM", "HIGH"]

4. **certifications**: An array of 4 industry-recognized certifications.
   - Each certification object has:
     - **id**: string (e.g. "cert-1", "cert-2", "cert-3", "cert-4")
     - **name**: string (certification name)
     - **platform**: string (provider, e.g. "Coursera", "AWS", "Google")
     - **cost**: string (e.g. "Free", "$150", or "Paid subscription")
     - **duration**: string (e.g. "4-6 weeks")
     - **impact**: string (how it advances their resume/career)
     - **financialTiers**: array of strings, containing at least one of ["LOW", "MEDIUM", "HIGH"]

5. **alternatePaths**: An array of 3 alternative career paths if they pivot.
   - Each alternatePath object has:
     - **id**: string (e.g. "alt-1", "alt-2", "alt-3")
     - **title**: string (alternative career title, e.g. "Data Engineer")
     - **salaryRange**: string (estimated salary range)
     - **skillOverlap**: number (integer percentage between 0 and 100 representing overlap with current skills)
     - **pivotRequired**: string (what skills or qualifications they would need to add to pivot)

6. **skillGap**:
   - **have**: array of strings (skills they already possess, extracted and verified from their profile)
   - **need**: array of objects, mapping skills they lack to a milestone. Each object has:
     - **skill**: string (the skill they need to learn, e.g. "SQL" or "Cloud infrastructure")
     - **milestoneId**: string (must correspond to one of the goalsToAchieve milestones 'id' they will learn it at, e.g. "goal-1" or "goal-2")
   - **bridgingSteps**: array of 3 strings (actionable steps they can take starting today to bridge their skill gaps)

Crucial Rule: All JSON key names must match the exact casing specified above. Do not include a "decisionTree" key in your JSON, as the system will build it programmatically from your milestones. Ensure the milestones in skillGap.need list a milestoneId that matches one of the ids in goalsToAchieve.milestones.`;

  // Return both the prompt text AND the canonical timeframe list.
  // The endpoint uses milestoneTimeframes to forcibly re-stamp each milestone's
  // timeframe by its index position, fixing Gemini hallucinating wrong timeframes.
  return { prompt: promptText, milestoneTimeframes };
}

function normalizeRoadmapData(data, expectedTimeframes = []) {
  if (!data) return data;


  if (data.goalsToAchieve) {
    if (!data.goalsToAchieve.description || typeof data.goalsToAchieve.description !== 'string' || !data.goalsToAchieve.description.trim()) {
      data.goalsToAchieve.description = "A customized pathway mapped to your career objectives.";
    }
  } else {
    data.goalsToAchieve = {
      description: "A customized pathway mapped to your career objectives.",
      milestones: []
    };
  }

  if (Array.isArray(data.goalsToAchieve.milestones)) {
    data.goalsToAchieve.milestones = data.goalsToAchieve.milestones.map((ms, index) => {
      // CRITICAL FIX: Force the canonical timeframe by index position.
      // Gemini sometimes ignores our timeframe instructions and generates month-based
      // strings like "Month 12 (Board / Exam Focus)" instead of "Grade 12 (Final Boards)".
      // By re-stamping from our expectedTimeframes list, we guarantee correct classification.
      const canonicalTimeframe = (expectedTimeframes.length > index)
        ? expectedTimeframes[index]
        : (ms.timeframe || "Goal");

      let pre = [];
      if (Array.isArray(ms.prerequisites)) {
        pre = ms.prerequisites.map((p, pIdx) => ({
          id: p.id || `pre-${index + 1}-${pIdx + 1}`,
          title: p.title || "Prerequisite Step",
          detail: p.detail || "Build foundational/intermediate skills.",
          phase: "goalsToAchieve",
          timeframe: canonicalTimeframe, // prerequisites share the parent's canonical timeframe
          prerequisites: []
        }));
      }
      return {
        ...ms,
        id: ms.id || `goal-${index + 1}`,
        title: ms.title || "Career Goal Milestone",
        detail: ms.detail || "Work toward your career aspirations.",
        phase: "goalsToAchieve",
        timeframe: canonicalTimeframe, // ← always use the canonical timeframe
        prerequisites: pre
      };
    });
  }

  // Clean up alternatePaths
  if (Array.isArray(data.alternatePaths)) {
    data.alternatePaths = data.alternatePaths.map((p, index) => {
      const cleaned = {
        id: p.id || `alt-${index + 1}`,
        title: p.title || "Alternative Path",
        salaryRange: p.salaryRange || "Competitive",
        skillOverlap: p.skillOverlap || 50,
        pivotRequired: p.pivotRequired || "Learn specialized skills."
      };
      if (typeof cleaned.skillOverlap === 'string') {
        const parsed = parseInt(cleaned.skillOverlap.replace(/\D/g, ""), 10);
        cleaned.skillOverlap = isNaN(parsed) ? 50 : parsed;
      }
      return cleaned;
    });
  }

  // Clean up skillGap
  if (data.skillGap) {
    if (!Array.isArray(data.skillGap.have)) {
      data.skillGap.have = [];
    }
    if (!Array.isArray(data.skillGap.bridgingSteps)) {
      data.skillGap.bridgingSteps = ["Explore related courses and study daily."];
    } else {
      // Bug #17 fix: filter empty strings so Zod min(1) per-item check doesn't fail
      data.skillGap.bridgingSteps = data.skillGap.bridgingSteps.filter(
        (s) => typeof s === "string" && s.trim().length > 0
      );
      if (data.skillGap.bridgingSteps.length === 0) {
        data.skillGap.bridgingSteps = ["Explore related courses and study daily."];
      }
    }
    if (Array.isArray(data.skillGap.need)) {
      // Collect valid milestone IDs from goalsToAchieve to ensure matching
      const validShortTermIds = new Set();
      if (data.goalsToAchieve && Array.isArray(data.goalsToAchieve.milestones)) {
        data.goalsToAchieve.milestones.forEach(ms => {
          if (ms.id) validShortTermIds.add(ms.id);
          if (Array.isArray(ms.prerequisites)) {
            ms.prerequisites.forEach(p => {
              if (p.id) validShortTermIds.add(p.id);
            });
          }
        });
      }

      // Default fallback id if empty
      const defaultId = validShortTermIds.size > 0 ? Array.from(validShortTermIds)[0] : "goal-1";

      data.skillGap.need = data.skillGap.need.map(n => {
        let mId = n.milestoneId;
        if (!mId || !validShortTermIds.has(mId)) {
          mId = defaultId;
        }
        return {
          skill: n.skill || "Technical Skill",
          milestoneId: mId
        };
      });
    } else {
      data.skillGap.need = [];
    }
  } else {
    data.skillGap = {
      have: [],
      need: [],
      bridgingSteps: ["Explore related courses and study daily."]
    };
  }

  // Ensure all course / internship / cert IDs and arrays are correct
  if (!Array.isArray(data.collegeCourses)) data.collegeCourses = [];
  data.collegeCourses = data.collegeCourses.map((c, i) => ({
    id: c.id || `course-${i + 1}`,
    name: c.name || "Recommended Course",
    semester: c.semester || "Next semester",
    reason: c.reason || "Highly recommended for your profile.",
    financialTiers: Array.isArray(c.financialTiers) && c.financialTiers.length > 0 ? c.financialTiers : ["LOW", "MEDIUM", "HIGH"]
  }));

  if (!Array.isArray(data.internships)) data.internships = [];
  data.internships = data.internships.map((int, i) => ({
    id: int.id || `intern-${i + 1}`,
    role: int.role || "Internship Role",
    when: int.when || "Year 2",
    platforms: Array.isArray(int.platforms) && int.platforms.length > 0 ? int.platforms : ["LinkedIn"],
    stipendNote: int.stipendNote || "Paid or stipend-based options.",
    financialTiers: Array.isArray(int.financialTiers) && int.financialTiers.length > 0 ? int.financialTiers : ["LOW", "MEDIUM", "HIGH"]
  }));

  if (!Array.isArray(data.certifications)) data.certifications = [];
  data.certifications = data.certifications.map((cert, i) => ({
    id: cert.id || `cert-${i + 1}`,
    name: cert.name || "Professional Certification",
    platform: cert.platform || "Online Provider",
    cost: cert.cost || "Free / Paid",
    duration: cert.duration || "4 weeks",
    impact: cert.impact || "Boosts your profile credentials.",
    financialTiers: Array.isArray(cert.financialTiers) && cert.financialTiers.length > 0 ? cert.financialTiers : ["LOW", "MEDIUM", "HIGH"]
  }));

  return data;
}

app.post("/api/generate-roadmap", async (req, res) => {
  // Bug #12 fix: declare profile OUTSIDE the try block so the catch handler
  // can safely reference it without throwing a secondary TypeError.
  const profile = req.body;
  try {
    // Quick validation of the profile object structure
    if (!profile || !profile.name || !profile.goal || !profile.goal.description) {
      return res.status(400).json({ error: "Invalid profile data provided. Profile name and goal description are required." });
    }

    if (!genAI) {
      return res.status(503).json({
        error: "Gemini API client is not configured.",
        details: "The GEMINI_API_KEY environment variable is missing on the server. Please check the setup instructions in the .env file."
      });
    }

    console.log(`[Backend] Generating real Gemini roadmap for: ${profile.name} (Goal: ${profile.goal.description})...`);

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const { prompt, milestoneTimeframes } = constructPrompt(profile);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the generated JSON response
    let generatedData;
    try {
      generatedData = JSON.parse(cleanGeminiJsonResponse(responseText));
    } catch (parseErr) {
      console.error("[Backend] Failed to parse JSON from Gemini response. Raw response was:\n", responseText);
      throw new Error("Gemini returned invalid JSON content.");
    }

    // Sanitize and normalize. Pass milestoneTimeframes so each milestone's timeframe
    // is forcibly re-stamped by index — fixing Gemini hallucinating wrong timeframes.
    generatedData = normalizeRoadmapData(generatedData, milestoneTimeframes);

    // Future college-related certifications and internships can be recommended and will be filtered appropriately by stage on the client side.

    console.log("[Backend] Gemini generation complete. Programmatically assembling decision tree...");

    // Build the decision tree from generated goals programmatically
    const decisionTree = buildTreeFromGoals(
      profile.goal.description,
      generatedData.goalsToAchieve,
      generatedData.collegeCourses || [],
      generatedData.internships || [],
      generatedData.certifications || [],
      generatedData.alternatePaths || []
    );

    // Merge decisionTree into the generated data to construct the full roadmap object
    const finalRoadmap = {
      ...generatedData,
      decisionTree
    };

    console.log("[Backend] Roadmap fully assembled and verified. Sending to client.");
    res.json(finalRoadmap);

  } catch (error) {
    console.error("[Backend Error] Failed to generate roadmap via Gemini API:", error);
    console.warn("[Backend] API error occurred. Generating robust, high-fidelity local fallback roadmap. Details:", error.message);
    
    const field = profile.field?.type || "TECH";
    const goalDesc = profile.goal?.description || "Professional Career";
    const degree = inferCollegeDegree(profile);
    
    const mockGoalsToAchieve = {
      description: `A customized, structured progression roadmap for pursuing a degree in ${degree} toward becoming a ${goalDesc}.`,
      milestones: [
        {
          id: "goal-1",
          title: "Foundations & Baseline Skills Mastery",
          detail: "Establish core theoretical building blocks, enroll in introductory courses, and set up your development workspace.",
          timeframe: "Month 3",
          phase: "goalsToAchieve",
          prerequisites: [
            { id: "pre-1-1", title: "Complete introductory specialization course", detail: "Focus on syntax, core definitions, and structural concepts.", phase: "goalsToAchieve", timeframe: "Month 3", prerequisites: [] },
            { id: "pre-1-2", title: "Configure local workspace tools", detail: "Install code editors, IDEs, or relevant local platforms.", phase: "goalsToAchieve", timeframe: "Month 3", prerequisites: [] }
          ]
        },
        {
          id: "goal-2",
          title: "Intermediate Frameworks & Practice Projects",
          detail: "Build simple practical proof-of-work examples, configure collaborative version control, and join student clubs.",
          timeframe: "Month 6",
          phase: "goalsToAchieve",
          prerequisites: [
            { id: "pre-2-1", title: "Develop three simple mini-projects", detail: "Apply theoretical concepts to solve basic problems.", phase: "goalsToAchieve", timeframe: "Month 6", prerequisites: [] },
            { id: "pre-2-2", title: "Initialize version control repositories", detail: "Share your code on GitHub or local portfolio backups.", phase: "goalsToAchieve", timeframe: "Month 6", prerequisites: [] }
          ]
        },
        {
          id: "goal-3",
          title: "Industry Credentialing & Local Placements Prep",
          detail: "Earn industry-recognized certifications, prepare a professional resume, and apply for junior internships.",
          timeframe: "Month 12",
          phase: "goalsToAchieve",
          prerequisites: [
            { id: "pre-3-1", title: "Obtain verified NASSCOM/SWAYAM certification", detail: "Acquire credible third-party evidence of skill mastery.", phase: "goalsToAchieve", timeframe: "Month 12", prerequisites: [] },
            { id: "pre-3-2", title: "Submit applications on Internshala", detail: "Target roles paying standard monthly stipends.", phase: "goalsToAchieve", timeframe: "Month 12", prerequisites: [] }
          ]
        },
        {
          id: "goal-4",
          title: "Advanced Engineering & Capstone Launch",
          detail: "Build a production-grade portfolio project, participate in mock interviews, and secure placement offers.",
          timeframe: "Year 2",
          phase: "goalsToAchieve",
          prerequisites: [
            { id: "pre-4-1", title: "Publish full-stack portfolio website", detail: "Deploy live code showing database and interface integration.", phase: "goalsToAchieve", timeframe: "Year 2", prerequisites: [] },
            { id: "pre-4-2", title: "Conduct mock technical interview sessions", detail: "Refine verbal articulation, coding explanations, and logic.", phase: "goalsToAchieve", timeframe: "Year 2", prerequisites: [] }
          ]
        }
      ]
    };

    const mockCollegeCourses = [
      { id: "course-1", name: "Data Structures & Structural Logic", semester: "Next semester", reason: "Establishes baseline algorithm concepts.", financialTiers: ["LOW", "MEDIUM", "HIGH"] },
      { id: "course-2", name: "Relational Database Management Systems", semester: "Within 2 semesters", reason: "Crucial for handling data metrics.", financialTiers: ["LOW", "MEDIUM", "HIGH"] }
    ];

    const mockInternships = [
      { id: "intern-1", role: `Junior ${field.toLowerCase()} Developer Intern`, when: "Month 6-12", platforms: ["Internshala", "LinkedIn"], stipendNote: "Guaranteed monthly stipend options.", financialTiers: ["LOW", "MEDIUM", "HIGH"] }
    ];

    const mockCertifications = [
      { id: "cert-1", name: "Google Professional Specialization Certificate", platform: "Coursera", cost: "Free Audit Available", duration: "4-6 weeks", impact: "Highly recognizable by IT recruiters.", financialTiers: ["LOW", "MEDIUM", "HIGH"] },
      { id: "cert-2", name: "Programming Foundations Exam", platform: "SWAYAM / NPTEL", cost: "₹1000", duration: "12 weeks", impact: "Indian university credit transfer eligible.", financialTiers: ["LOW", "MEDIUM", "HIGH"] }
    ];

    const mockAlternatePaths = [
      { id: "alt-1", title: "Systems Administrator", salaryRange: "₹4,00,000 - ₹7,00,000", skillOverlap: 65, pivotRequired: "Learn Linux terminal commands and scripting." }
    ];

    const mockSkillGap = {
      have: profile.skills.filter(s => s !== "None yet"),
      need: [
        { skill: "Structured Query Language (SQL)", milestoneId: "goal-1" },
        { skill: "Collaborative Git Pipelines", milestoneId: "goal-2" }
      ],
      bridgingSteps: [
        "Complete free SQL interactive tutorials on W3Schools.",
        "Host three personal repositories publicly on GitHub.",
        "Participate in local community developer hackathons."
      ]
    };

    const generatedData = {
      goalsToAchieve: mockGoalsToAchieve,
      collegeCourses: mockCollegeCourses,
      internships: mockInternships,
      certifications: mockCertifications,
      alternatePaths: mockAlternatePaths,
      skillGap: mockSkillGap
    };

    const decisionTree = buildTreeFromGoals(
      profile.goal.description,
      generatedData.goalsToAchieve,
      generatedData.collegeCourses,
      generatedData.internships,
      generatedData.certifications,
      generatedData.alternatePaths
    );

    const finalRoadmap = {
      ...generatedData,
      decisionTree,
      isMock: true,
      warning: "Google Gemini API error (Rate Limit/Invalid Key/Quota). Automatically serving high-fidelity local fallback data."
    };

    return res.json(finalRoadmap);
  }
});

// Fallback dynamic questions if API is offline
const fallbackQuestions = {
  questions: [
    {
      id: "q1",
      questionText: "Which specific focus area matches your interest best?",
      options: ["Technical Core & Engineering", "Data, Metrics & Analytics", "Product Strategy & Operations"]
    },
    {
      id: "q2",
      questionText: "How many hours per week can you realistically dedicate?",
      options: ["3-5 hours (Moderate pace)", "6-12 hours (Accelerated learning)", "15+ hours (Intensive preparation)"]
    },
    {
      id: "q3",
      questionText: "What type of employer environment do you want to target?",
      options: ["Agile Early-Stage Startups", "Established Corporations & Brands", "Freelancing / Independent Remote Work"]
    }
  ]
};

// Fallback detailed roadmap plans
const fallbackDeepRoadmap = {
  weeklyStudyPlan: [
    { week: "Week 1", topic: "Workspace Configuration & Core Fundamentals", resource: "freeCodeCamp & MDN Guides", actionItem: "Configure local development environment and run a basic application prototype." },
    { week: "Week 2", topic: "Advanced Data Manipulation & API Calls", resource: "MDN Web Docs / Platform References", actionItem: "Write a script that pulls data from a public API, parses it, and logs the output." },
    { week: "Week 3", topic: "Collaborative Git Workflows & Version Control", resource: "GitHub Learning Labs", actionItem: "Initialize a local Git repository, make 3 sequential feature commits, and push to GitHub." },
    { week: "Week 4", topic: "Component Styling & UI Layouts", resource: "TailwindCSS Docs & CSS Tricks", actionItem: "Create a fully responsive, interactive flexbox grid showing data metrics." },
    { week: "Week 5", topic: "Automated Testing & Code Refactoring", resource: "Jest/Mocha Documentation", actionItem: "Write 3 unit tests for your data manipulation modules to verify boundary values." },
    { week: "Week 6", topic: "Static/Server Deployment & Resume Linking", resource: "Vercel / Netlify / Render Documentation", actionItem: "Deploy your project live to Vercel or Render, add it to your LinkedIn, and share." }
  ],
  targetProjects: [
    {
      title: "Interactive Professional Portfolio",
      techStack: "React.js, TailwindCSS, GitHub Pages",
      description: "A gorgeous, responsive portfolio website highlighting your onboarding achievements, projects, and certifications.",
      phases: ["Phase 1: Design clean structural layouts with grid systems", "Phase 2: Code responsive micro-animations for card details", "Phase 3: Publish live to GitHub Pages and share on LinkedIn"]
    },
    {
      title: "Collaborative Personal Task Board",
      techStack: "Vite, Local Storage API, Vanilla CSS",
      description: "A robust developer application that allows users to manage objectives, check milestones, and track timelines.",
      phases: ["Phase 1: Implement React state management for checklist items", "Phase 2: Integrate localStorage for offline database backups", "Phase 3: Deploy on a secure hosting environment"]
    }
  ],
  strategicAdvice: "Consistency is your greatest advantage. Set aside 45 minutes every single morning to study before distractions arise. Update your public portfolio live as you finish goals, and connect with developers inside your target niche on LinkedIn."
};

function constructDeepQuestionsPrompt(profile, roadmap) {
  const fieldLabel = profile.field.type === "OTHER" ? profile.field.customValue : profile.field.type;
  
  return `You are a professional career coach. The user named ${profile.name} has onboarded with:
- Stage: ${profile.stage}
- Age: ${profile.age}
- Field: ${fieldLabel}
- Skills: ${profile.skills.join(", ")}
- Goal: "${profile.goal.description}"
- Budget Tier: ${profile.financialTier}
- Preferences: ${profile.preferences.join(", ") || "None"}

We generated an initial roadmap. Here is the objective summary:
- Goals Summary: "${roadmap.goalsToAchieve.description}"

Generate exactly 3 highly personalized, context-specific multiple-choice questions to help us deep-dive into their specific preferences.
For example, ask about:
1. A specific sub-specialization choice that fits their field (e.g. frontend vs backend, corporate accounting vs startup finance, etc.).
2. Their weekly time commitment (e.g. 5, 10, 15+ hours) or favorite learning style (video vs reading vs build-first).
3. The type of industry or employer they want to target (e.g. early-stage startup, corporate brand, research lab, global remote, freelance).

Your output must be a single, raw, valid JSON object containing exactly 3 objects. Do not wrap the JSON in markdown code blocks. Return only the JSON.

### JSON Structure Casing:
{
  "questions": [
    {
      "id": "q1",
      "questionText": "Question 1 text...",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    },
    {
      "id": "q2",
      "questionText": "Question 2 text...",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    },
    {
      "id": "q3",
      "questionText": "Question 3 text...",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    }
  ]
}`;
}

function constructDeepRoadmapPrompt(profile, roadmap, answers) {
  const fieldLabel = profile.field.type === "OTHER" ? profile.field.customValue : profile.field.type;
  const answersFormatted = answers.map((a, i) => `Question: ${a.questionText}\nAnswer Selected: ${a.answerText}`).join("\n\n");

  return `You are an elite career strategist. The user named ${profile.name} (Stage: ${profile.stage}, Goal: ${profile.goal.description}) completed our Phase 2 Onboarding. Here are their specific answers:

${answersFormatted}

Based on these answers, their original roadmap, and their budget tier (${profile.financialTier}), construct a highly detailed Deep Optimization Study & Project Plan.

Your output must be a single, raw, valid JSON object matching the exact structure below. Do not wrap the JSON in markdown code blocks. Return only the JSON.

### JSON Structure Casing:
{
  "weeklyStudyPlan": [
    {
      "week": "Week 1",
      "topic": "Topic Name",
      "resource": "Specific Resource Name (Free/Paid based on budget)",
      "actionItem": "Practical Action Item"
    },
    ... (exactly 6 items for Week 1 to Week 6)
  ],
  "targetProjects": [
    {
      "title": "Project Title",
      "techStack": "Languages & frameworks used",
      "description": "Short explanation of the project",
      "phases": ["Phase 1 description", "Phase 2 description", "Phase 3 description"] (exactly 3 phases)
    },
    ... (exactly 2 projects)
  ],
  "strategicAdvice": "3-4 sentences of customized professional coaching advice on how they can network and position themselves for interviews."
}`;
}

app.post("/api/generate-deep-questions", async (req, res) => {
  try {
    const { profile, roadmap } = req.body;
    
    if (!profile || !roadmap) {
      return res.status(400).json({ error: "Profile and roadmap data are required." });
    }

    if (!genAI) {
      console.warn("[Backend] Gemini API client missing. Returning fallback questions.");
      return res.json(fallbackQuestions);
    }

    console.log(`[Backend] Generating dynamic Phase 2 questions for: ${profile.name}...`);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    const promptText = constructDeepQuestionsPrompt(profile, roadmap);
    const result = await model.generateContent(promptText);
    const responseText = result.response.text();

    let parsedQuestions = JSON.parse(cleanGeminiJsonResponse(responseText));
    res.json(parsedQuestions);

  } catch (error) {
    console.error("[Backend Error] Failed to generate dynamic questions, using fallback:", error);
    res.json(fallbackQuestions);
  }
});

app.post("/api/generate-deep-roadmap", async (req, res) => {
  try {
    const { profile, roadmap, answers } = req.body;

    if (!profile || !roadmap || !answers) {
      return res.status(400).json({ error: "Profile, roadmap, and answers are required." });
    }

    if (!genAI) {
      console.warn("[Backend] Gemini API client missing. Returning fallback deep plan.");
      return res.json(fallbackDeepRoadmap);
    }

    console.log(`[Backend] Generating Deep Roadmap details for: ${profile.name}...`);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    const promptText = constructDeepRoadmapPrompt(profile, roadmap, answers);
    const result = await model.generateContent(promptText);
    const responseText = result.response.text();

    let parsedDeepRoadmap = JSON.parse(cleanGeminiJsonResponse(responseText));
    res.json(parsedDeepRoadmap);

  } catch (error) {
    console.error("[Backend Error] Failed to generate deep roadmap, using fallback:", error);
    res.json(fallbackDeepRoadmap);
  }
});

function constructSuggestSkillsPrompt(fieldType, customFieldValue) {
  const fieldLabel = fieldType === "OTHER" ? customFieldValue : fieldType;
  return `You are a professional career coach and syllabus designer. The user has selected a discipline or field of study named "${fieldLabel}".
Suggest exactly 6-8 highly specific, modern, and practical technical, professional, or domain skills (one or two words each) that someone entering this field must learn.
For example, if the field is "Culinary Arts" or "Cooking", suggest skills like: "Knife skills", "Food safety", "Plating techniques", "Menu planning", "Garde manger", "Baking/Pastry".
Do NOT suggest soft skills like "Communication", "Teamwork", "Documentation", or "Leadership". Suggest ONLY specialized, domain-specific skills.

Your output must be a single, raw, valid JSON object containing an array of strings. Do not wrap the JSON in markdown code blocks. Return only the JSON.

### JSON Structure Casing:
{
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6"]
}`;
}

app.post("/api/suggest-skills", async (req, res) => {
  try {
    const { fieldType, customFieldValue } = req.body;

    if (!fieldType) {
      return res.status(400).json({ error: "fieldType is required." });
    }

    if (!genAI) {
      console.warn("[Backend] Gemini API client missing. Returning empty skills array.");
      return res.json({ skills: [] });
    }

    console.log(`[Backend] Generating dynamic skills for field: ${fieldType} (${customFieldValue})...`);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    const promptText = constructSuggestSkillsPrompt(fieldType, customFieldValue);
    const result = await model.generateContent(promptText);
    const responseText = result.response.text();

    let parsed = JSON.parse(cleanGeminiJsonResponse(responseText));
    res.json(parsed);

  } catch (error) {
    console.error("[Backend Error] Failed to generate dynamic skills:", error);
    res.json({ skills: [] });
  }
});

app.post("/api/analyze-resume", (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: "File size limit exceeded. Max size allowed is 10MB." });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const file = req.file;
    const profile = JSON.parse(req.body.profile || "{}");

    if (!file) {
      return res.status(400).json({ error: "No resume file uploaded." });
    }

    if (!genAI) {
      return res.status(503).json({
        error: "Gemini API client is not configured.",
        details: "The GEMINI_API_KEY environment variable is missing on the server."
      });
    }

    console.log(`[Backend] Analyzing resume for ${profile.name || "User"}...`);

    // Parse the PDF buffer
    let pdfText = "";
    try {
      const data = await pdfParse(file.buffer);
      pdfText = data.text;
    } catch (parseErr) {
      console.error("[Backend] Failed to parse PDF resume:", parseErr);
      return res.status(400).json({ error: "Failed to parse PDF resume. Make sure it is a valid PDF." });
    }

    if (!pdfText || pdfText.trim() === "") {
      pdfText = "[No selectable text extracted from PDF. This may be a scanned image. Please analyze based on the self-reported profile skills and goal only.]";
    }

    // Build Gemini model
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are an expert HR recruiter and career progression advisor.
Analyze the following candidate's PDF resume and their career profile.
Compare their skills, experience, and education against their target career goal.

Candidate Profile:
- Name: ${profile.name || "User"}
- Stage: ${profile.stage || "Not specified"}
- Field: ${profile.field?.type || "Not specified"}
- Career Goal Type: ${profile.goal?.type || "Not specified"}
- Career Goal Description: "${profile.goal?.description || "Not specified"}"
- Current Self-Reported Skills: ${(profile.skills || []).join(", ") || "None"}

Resume Extracted Text:
"""
${pdfText}
"""

Analyze this carefully and identify:
1. "skills": An array of extracted technical or domain skills from the resume. For each skill, include a match percentage (0 to 100) representing how well it aligns with their target career goal, e.g. { "name": "SQL", "match": 80 }.
2. "experience": An array of experience items parsed from the resume, e.g. { "role": "Junior Analyst", "company": "Tech Corp", "duration": "1 year" }.
3. "education": An array of education items parsed from the resume, e.g. { "degree": "B.Tech", "field": "Computer Science", "school": "University", "year": "2024" }.
4. "strengths": An array of 3-4 strengths from their resume that will help them achieve their career goal.
5. "gaps": An array of 3-4 skill or experience gaps compared to their target career goal.
6. "recommendations": An array of 3-4 highly actionable recommendations to bridge these gaps.

Your output must be a single, raw, valid JSON object matching the exact structure below. Do not wrap the JSON in markdown code blocks. Return only the JSON.

### JSON Structure Casing:
{
  "skills": [
    { "name": "Skill Name", "match": 85 }
  ],
  "experience": [
    { "role": "Role Title", "company": "Company Name", "duration": "Duration" }
  ],
  "education": [
    { "degree": "Degree", "field": "Field of Study", "school": "Institution", "year": "Year" }
  ],
  "strengths": [
    "Strength detail..."
  ],
  "gaps": [
    "Gap detail..."
  ],
  "recommendations": [
    "Actionable recommendation..."
  ]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    let analysisResult = JSON.parse(cleanGeminiJsonResponse(responseText));

    res.json(analysisResult);
  } catch (error) {
    console.error("[Backend Error] Resume analysis failed:", error);
    console.warn("[Backend] API error occurred. Returning high-fidelity mock resume analysis. Details:", error.message);
    return res.json({
      skills: [
        { name: "Python", match: 85 },
        { name: "SQL", match: 70 },
        { name: "Git", match: 90 },
        { name: "Communication", match: 80 }
      ],
      experience: [
        { role: "Junior Developer Intern", company: "Software Lab", duration: "6 Months" },
        { role: "Research Assistant", company: "Tech University", duration: "3 Months" }
      ],
      education: [
        { degree: "B.Tech Computer Science", field: "Software Engineering", school: "National Institute", year: "2024" }
      ],
      strengths: [
        "Solid understanding of core object-oriented Python scripting.",
        "Hands-on experience configuring collaborative branch operations in Git.",
        "Clear, confident presentation skills demonstrated in academic projects."
      ],
      gaps: [
        "Lacks experience with advanced relational database optimization.",
        "No professional cloud deployment credentials (e.g., AWS, Azure).",
        "Needs to build visual frontend React interface credentials."
      ],
      recommendations: [
        "Prioritize taking an advanced SQL certification course on Swayam/NPTEL.",
        "Build a responsive web application and host it publicly on Vercel/Netlify.",
        "Complete a foundational Cloud Practitioner certification course."
      ],
      isMock: true,
      warning: "Google Gemini API error (Rate Limit/Invalid Key/Quota). Automatically serving high-fidelity local fallback data."
    });
  }
});

app.post("/api/market-intelligence", async (req, res) => {
  try {
    const { jobTitle, field, location } = req.body;

    if (!jobTitle) {
      return res.status(400).json({ error: "jobTitle is required." });
    }

    if (!genAI) {
      return res.status(503).json({
        error: "Gemini API client is not configured.",
        details: "The GEMINI_API_KEY environment variable is missing."
      });
    }

    console.log(`[Backend] Fetching market intelligence for: ${jobTitle}...`);

    let searchResults = "";
    const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

    if (TAVILY_API_KEY && TAVILY_API_KEY.trim() !== "") {
      try {
        console.log(`[Backend] Searching Tavily for live market data on: ${jobTitle} ${location || ""}`);
        const response = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            api_key: TAVILY_API_KEY,
            query: `current job market demand salary trend top skills hiring companies for "${jobTitle}" ${location || "India"} 2026`,
            search_depth: "basic",
            max_results: 5
          })
        });
        if (response.ok) {
          const data = await response.json();
          searchResults = JSON.stringify(data.results);
          console.log(`[Backend] Tavily search successful with ${data.results?.length} results.`);
        } else {
          console.warn("[Backend] Tavily API returned status:", response.status);
        }
      } catch (searchErr) {
        console.warn("[Backend] Tavily search failed, falling back to Gemini knowledge:", searchErr);
      }
    } else {
      console.log("[Backend] No Tavily API key configured. Utilizing Gemini's internal knowledge.");
    }

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are a job market research analyst and recruiter.
Analyze the current job market demand, salary, trending skills, top companies, and realistic job listings for the role of "${jobTitle}" in the field of "${field || 'General'}".
${location ? `Focus on the location: ${location}` : "Prioritize the Indian educational and professional market, but make it globally context-aware."}

${searchResults ? `Here is live web search results about the current market:
"""
${searchResults}
"""` : "Utilize your deep, up-to-date knowledge about the current industry trends."}

Generate a comprehensive market intelligence report in JSON format.

Your output must be a single, raw, valid JSON object matching the exact structure below. Do not wrap the JSON in markdown code blocks. Return only the JSON.

### JSON Structure Casing:
{
  "demandLevel": "HIGH", // Options: "LOW", "MEDIUM", "HIGH", "VERY_HIGH"
  // Bug #13 fix: corrected salary format (₹6,00,000 not ₹6,0,000)
  "avgSalary": "₹6,00,000 - ₹12,00,000 per annum", // or equivalent local salary range
  "trendingSkills": [
    "Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"
  ],
  "topCompanies": [
    "Company 1", "Company 2", "Company 3"
  ],
  "jobListings": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "Location",
      "salary": "Stipend / Salary",
      "url": "https://internshala.com or similar relevant portal link"
    },
    {
      "title": "Job Title 2",
      "company": "Company Name 2",
      "location": "Location 2",
      "salary": "Salary 2",
      "url": "https://naukri.com or similar relevant portal link"
    }
  ],
  "marketInsights": "A detailed 3-4 sentence paragraph summarizing the current hiring outlook, industry shifts, and critical career growth vectors for this role in the near future."
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    let marketIntelResult = JSON.parse(cleanGeminiJsonResponse(responseText));

    res.json(marketIntelResult);
  } catch (error) {
    console.error("[Backend Error] Market intelligence fetch failed:", error);
    console.warn("[Backend] API error occurred. Returning high-fidelity mock market intelligence. Details:", error.message);
    return res.json({
      demandLevel: "HIGH",
      avgSalary: "₹6,00,000 - ₹11,00,000 per annum",  // Bug #13 fix: corrected comma formatting
      trendingSkills: [
        "Python", "SQL", "Git", "React.js", "Docker"
      ],
      topCompanies: [
        "TCS", "Infosys", "Wipro", "Cognizant", "Tech Mahindra"
      ],
      jobListings: [
        {
          title: "Junior Python Developer Intern",
          company: "Cognizant Technology Solutions",
          location: "Bengaluru (Hybrid)",
          salary: "₹15,000/month",
          url: "https://internshala.com"
        },
        {
          title: "Associate SQL Analyst",
          company: "Infosys Ltd",
          location: "Hyderabad",
          salary: "₹4,50,000/annum",
          url: "https://naukri.com"
        }
      ],
      marketInsights: "Hiring velocity remains high for candidates with verifiable coding experience. Standard corporate teams prioritize candidates who can show public Git portfolios and have completed foundational NASSCOM/SWAYAM certifications.",
      isMock: true,
      warning: "Google Gemini API error (Rate Limit/Invalid Key/Quota). Automatically serving high-fidelity local fallback data."
    });
  }
});

app.post("/api/career-chat", async (req, res) => {
  try {
    const { messages, profile, roadmap, resumeAnalysis } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required." });
    }

    if (!genAI) {
      return res.status(503).json({
        error: "Gemini API client is not configured.",
        details: "The GEMINI_API_KEY environment variable is missing."
      });
    }

    console.log(`[Backend] Handling career chat session...`);

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    // Construct the context prompt containing user details
    const contextPrompt = `You are "Antigravity Career Advisor", a helpful, empathetic, and highly knowledgeable career guide.
You are having an interactive career advisory conversation with a user.

User Context:
- Name: ${profile?.name || "User"}
- Stage: ${profile?.stage || "Not specified"}
- Field: ${profile?.field?.type || "Not specified"}
- Career Goal Type: ${profile?.goal?.type || "Not specified"}
- Career Goal Description: "${profile?.goal?.description || "Not specified"}"
- Current Skills: ${(profile?.skills || []).join(", ") || "None"}
${roadmap ? `- Current Roadmap Summary: "${roadmap.goalsToAchieve?.description || 'Active roadmap generated'}"` : ""}
${resumeAnalysis ? `- Resume Extracted Skills: ${(resumeAnalysis.skills || []).map(s => s.name).join(", ") || "None"}` : ""}
${resumeAnalysis ? `- Resume Strengths: ${(resumeAnalysis.strengths || []).join("; ") || "None"}` : ""}
${resumeAnalysis ? `- Resume Gaps: ${(resumeAnalysis.gaps || []).join("; ") || "None"}` : ""}

Answer the user's latest query inside the conversation. Be extremely helpful, encouraging, and provide concrete steps.
You MUST output your response in JSON format. Provide the conversational markdown response and exactly 2-3 suggested quick-reply actions the user might take next.

Ensure your response answers their query directly, using Markdown for formatting (bolding, lists, etc.) inside the "response" field.

Your output must be a single, raw, valid JSON object matching the exact structure below. Do not wrap the JSON in markdown code blocks. Return only the JSON.

### JSON Structure Casing:
{
  "response": "Your markdown-formatted message here...",
  "suggestedActions": [
    "Suggested action/question 1",
    "Suggested action/question 2"
  ]
}

Conversation History:
${messages.map(m => `${m.role === 'user' ? 'User' : 'Advisor'}: ${m.content}`).join("\n")}
`;

    const result = await model.generateContent(contextPrompt);
    const responseText = result.response.text();
    let chatResult = JSON.parse(cleanGeminiJsonResponse(responseText));

    res.json(chatResult);
  } catch (error) {
    console.error("[Backend Error] Career chat failed:", error);
    console.warn("[Backend] API error occurred. Returning high-fidelity mock chat response. Details:", error.message);
    return res.json({
      response: `Hello! I am currently operating in **High-Fidelity AI Mock Mode** because your Google Gemini API key returned an error or is throttled. 

Based on your profile and target goals, I recommend focusing on your core **roadmap milestones**, practicing coding daily, and building a public GitHub profile. 

Ask me any specific career query, and I will do my best to guide you!`,
      suggestedActions: [
        "How can I improve my SQL skills?",
        "What projects should I host on GitHub?",
        "Curate a list of free certifications"
      ],
      isMock: true,
      warning: "Google Gemini API error (Rate Limit/Invalid Key/Quota). Automatically serving high-fidelity local fallback data."
    });
  }
});

// ─────────────────────────────────────────────────────────
// NODE CONTENT — lazy per-node AI generation
// Called when a node reaches 80% parent completion
// ─────────────────────────────────────────────────────────

const AGE_CONTENT_RULES = {
  CLASS_7_8:     { age: "12–14", rules: "Use ONLY: curiosity building, logical puzzles, basic math, intro hobby projects, reading about the field, simple block-based tools (Scratch, basic Excel). NEVER suggest SQL, APIs, frameworks, internships, or certifications." },
  CLASS_9_10:    { age: "14–16", rules: "Use: reasoning challenges, beginner tools (Python basics, Excel), foundational concepts, light project-based learning, career exploration. NEVER suggest advanced frameworks, real internships, or professional certifications." },
  CLASS_11_12:   { age: "16–18", rules: "Use: intermediate concepts, relevant subject focus, board prep, beginner certifications (NPTEL/SWAYAM free tier only), first small portfolio project. NEVER suggest production-level projects or paid internships." },
  UNDERGRADUATE: { age: "18–22", rules: "Yr1-2: beginner-to-intermediate tools, first internship prep, beginner free certifications. Yr3-4: advanced projects, real internships, intermediate certifications, placement prep." },
  POSTGRADUATE:  { age: "22–24", rules: "Use: research-level depth, specialization topics, advanced certifications, publications or thesis work where relevant, industry networking." },
  WORKING:       { age: "22+",   rules: "Use: skill gap bridging, industry certifications, leadership skills, portfolio refinement, networking, promotion milestones. NO semester structure — use quarterly blocks." }
};

function getOfflineMockNodeContent(nodeId, nodeLabel, profile) {
  const stage = profile?.stage || "UNDERGRADUATE";
  const fieldType = profile?.field?.type || "TECH";
  const careerGoal = profile?.goal?.description || "your career goal";
  
  // Default values
  let goals = [
    `Master the key concepts and tools relevant to ${nodeLabel}`,
    `Build a practical mini-project demonstrating skills from this stage`,
    `Document your progress and reflect on learning from this period`
  ];
  let skills = ["Critical thinking", "Domain knowledge", "Time management"];
  let summary = `This stage focuses on ${nodeLabel}, building the foundation you need to reach your goal of becoming a ${careerGoal}.`;
  
  const lowId = nodeId.toLowerCase();
  
  if (lowId.includes("root")) {
    goals = [
      `Define your career aspirations and identify target fields (e.g. Software, Finance, Design)`,
      `Conduct informational interviews or research professionals working in your target role`,
      `Assess your current skill strengths and map out learning gaps`
    ];
    skills = ["Career planning", "Market research", "Self-assessment"];
    summary = "Welcome to your roadmap! This initial step is about self-discovery, target setting, and mapping your current capabilities.";
  } else if (lowId.includes("grade-9")) {
    goals = [
      `Build solid mathematical foundations (Algebra, Statistics) essential for analytical fields`,
      `Explore introductory coding resources (e.g. Scratch, Python) or basic logic puzzle solving`,
      `Maintain a consistent study schedule and master active recall study techniques`
    ];
    skills = ["Algorithmic logic", "Basic arithmetic", "Active learning"];
    summary = "Grade 9 is the perfect time to build strong study habits and explore fundamental scientific and mathematical principles.";
  } else if (lowId.includes("grade-10")) {
    goals = [
      `Excel in 10th Grade board examinations to keep high-school option pathways open`,
      `Examine boards (CBSE, State, Diploma) and stream branch specializations (Science, Commerce, Arts)`,
      `Develop public speaking and collaboration skills through school presentations and group work`
    ];
    skills = ["Exam preparation", "Academic planning", "Public speaking"];
    summary = "Grade 10 is a major milestone year focused on boards and stream selection. Excel in exams and plan your next academic stage.";
  } else if (lowId.includes("grade-11")) {
    goals = [
      `Deep dive into selected stream subjects (e.g. Physics, Chemistry, Math or Accounts/Economics)`,
      `Learn core computing concepts (basic variables, loops) or business fundamentals depending on stream`,
      `Research top universities and admission criteria for target undergraduate degrees`
    ];
    skills = ["Advanced sciences", "Logical thinking", "University research"];
    summary = "Grade 11 marks the start of your specialization stream. Lay down deep academic roots in your chosen subjects.";
  } else if (lowId.includes("grade-12")) {
    goals = [
      `Achieve competitive scores in 12th Grade boards and college entrance examinations`,
      `Prepare college applications, personal statements, and draft a high-school resume`,
      `Learn personal finance basics (budgeting, saving) before transitioning to college`
    ];
    skills = ["Time management under pressure", "College writing", "Financial literacy"];
    summary = "Grade 12 is the final board exam year. Focus heavily on entrance tests, boards, and securing college admissions.";
  } else if (lowId.includes("sem-1") || lowId.includes("sem-2") || lowId.includes("semester-1") || lowId.includes("semester-2")) {
    if (fieldType === "TECH" || fieldType === "SCIENCE") {
      goals = [
        `Maintain a strong first-year GPA (GPA > 8.0/10) to secure future elective options`,
        `Master programming fundamentals (basic Python, C++, or Java syntax) and OOP principles`,
        `Join campus technical clubs and coding societies to meet peers and build networks`
      ];
      skills = ["Object-Oriented Programming", "Algorithm basics", "Networking"];
    } else {
      goals = [
        `Maintain a strong first-year GPA (GPA > 8.0/10) to build a solid academic record`,
        `Master core principles of microeconomics, financial accounting, and business laws`,
        `Join campus business, commerce, or debating clubs to develop leadership skills`
      ];
      skills = ["Accounting principles", "Economic analysis", "Group discussion"];
    }
    summary = "Your first year of college is about adjusting to university life, maintaining a strong GPA, and learning core fundamentals.";
  } else if (lowId.includes("sem-3") || lowId.includes("sem-4") || lowId.includes("semester-3") || lowId.includes("semester-4")) {
    if (fieldType === "TECH" || fieldType === "SCIENCE") {
      goals = [
        `Master Data Structures & Algorithms (Arrays, Linked Lists, Trees, Stacks, Queues)`,
        `Build 2-3 mini-projects using your core programming language and host them on GitHub`,
        `Learn relational database concepts and write SQL queries for data management`
      ];
      skills = ["Data Structures & Algorithms", "SQL Databases", "Git & GitHub"];
    } else {
      goals = [
        `Master financial accounting, corporate governance, and cost analysis principles`,
        `Build spreadsheet models (Excel/Google Sheets) for basic corporate budgets`,
        `Participate in national-level case study competitions and business simulations`
      ];
      skills = ["Advanced Excel", "Financial modeling", "Case analysis"];
    }
    summary = "Second year is critical for domain depth. Build projects, master core technical subjects, and start using source control.";
  } else if (lowId.includes("sem-5") || lowId.includes("sem-6") || lowId.includes("semester-5") || lowId.includes("semester-6")) {
    if (fieldType === "TECH" || fieldType === "SCIENCE") {
      goals = [
        `Learn advanced framework development (e.g. React/Node.js or Python backend frameworks)`,
        `Apply for summer software developer or technical internships via Internshala and LinkedIn`,
        `Solve 100+ coding problems on platforms like LeetCode or HackerRank to prepare for placements`
      ];
      skills = ["Web Development", "LeetCode practice", "Internship prep"];
    } else {
      goals = [
        `Master financial management, income tax laws, and business analytics methods`,
        `Secure a summer internship in marketing, corporate finance, or business operations`,
        `Prepare case studies and brush up on group discussions and business writing`
      ];
      skills = ["Corporate Finance", "Business writing", "Interview skills"];
    }
    summary = "Third year focuses on internships and upskilling. Build real projects, practice interview questions, and secure summer roles.";
  } else if (lowId.includes("sem-7") || lowId.includes("sem-8") || lowId.includes("semester-7") || lowId.includes("semester-8")) {
    if (fieldType === "TECH" || fieldType === "SCIENCE") {
      goals = [
        `Complete a high-impact final year Capstone project demonstrating end-to-end implementation`,
        `Prepare for technical interviews (System Design, OS, DBMS) and solve mock challenges`,
        `Participate in campus placement drives and apply to target software graduate programs`
      ];
      skills = ["System Design", "Final capstone project", "Technical interviewing"];
    } else {
      goals = [
        `Complete a comprehensive final year dissertation or industry consulting capstone project`,
        `Prepare for quantitative aptitude, logical reasoning tests, and behavioral interviews`,
        `Secure a graduate associate position or apply to target postgraduate MBA programs`
      ];
      skills = ["Aptitude testing", "Behavioral interviewing", "Strategic analysis"];
    }
    summary = "Your final year is all about placements and graduation. Complete your capstone project and secure your transition to career or masters.";
  } else if (lowId.includes("pg")) {
    goals = [
      `Master advanced specialization coursework (AI/ML algorithms, Advanced Corporate Strategy, or clinical diagnostics)`,
      `Conduct thesis or specialized research and aim to publish at least one peer-reviewed conference paper`,
      `Prepare for post-graduate final placements and apply to senior leadership associate roles`
    ];
    skills = ["Research methodology", "Specialized domain tools", "Leadership prep"];
    summary = "Your Master's degree is about advanced mastery. Publish research, complete specialized internships, and transition into senior industry roles.";
  }
  
  // Build goal_reasons
  const goal_reasons = {};
  goals.forEach(g => {
    goal_reasons[g] = `Achieving this goal helps you build the necessary foundation to become a successful ${careerGoal}.`;
  });
  
  return {
    goals,
    skills,
    milestones: [{
      id: `${nodeId}-ms-1`,
      title: `Complete ${nodeLabel} objectives`,
      detail: `Lay down solid foundations in ${nodeLabel} to progress toward ${careerGoal}.`,
      timeframe: nodeLabel
    }],
    summary,
    goal_reasons,
    stageGoals: goals.slice(0, 2),
    isMock: true
  };
}

app.post("/api/node-content", async (req, res) => {
  const { profile, nodeType, nodeId, nodeLabel, parentNodeLabel, completedMilestones, userSelections, allCompletedGoals } = req.body;

  try {
    if (!profile || !nodeId || !nodeType) {
      return res.status(400).json({ error: "profile, nodeId, and nodeType are required." });
    }
    if (!genAI) {
      return res.status(503).json({ error: "Gemini API not configured." });
    }

    const stage = profile.stage || "UNDERGRADUATE";
    const ageRule = AGE_CONTENT_RULES[stage] || AGE_CONTENT_RULES.UNDERGRADUATE;
    const careerGoal = profile.goal?.description || "their career goal";
    const fieldLabel = profile.field?.type === "OTHER" ? profile.field?.customValue : profile.field?.type;
    const completedGoalsList = (allCompletedGoals || []).join(", ") || "None yet";

    const boardSelectVal = userSelections?.["node-board-select"] || "";
    const ugSelectVal = userSelections?.["node-ug-select"] || "";
    const mastersSelectVal = userSelections?.["node-masters-select"] || "";

    const prompt = `You are an expert career advisor generating content for ONE specific node in an interactive career mindmap.

## User Profile
- Name: ${profile.name}
- Current Stage: ${stage} (age ${ageRule.age})
- Field: ${fieldLabel}
- Career Goal: "${careerGoal}"
- Financial Tier: ${profile.financialTier}
- Current Skills: ${(profile.skills || []).join(", ")}
${boardSelectVal ? `- Selected Board & Stream: ${boardSelectVal}` : ""}
${ugSelectVal ? `- Selected UG Degree: ${ugSelectVal}` : ""}
${mastersSelectVal ? `- Selected Post-grad Pathway: ${mastersSelectVal}` : ""}

## Node Being Generated
- Node ID: ${nodeId}
- Node Type: ${nodeType}
- Node Label: "${nodeLabel}"
- Parent Node: "${parentNodeLabel || "Root"}"
- Already completed goals in this journey: ${completedGoalsList}

## Age-Appropriate Content Rule (STRICTLY ENFORCED)
Stage: ${stage} — ${ageRule.rules}

## ZERO REPETITION RULE
Do NOT repeat any goal, skill, or milestone that appears in the already-completed list: [${completedGoalsList}]

## Task
Generate content specifically for THIS node ("${nodeLabel}") that directly helps ${profile.name} reach their goal of becoming a "${careerGoal}".

## Output Format (raw JSON only, no markdown)
{
  "goals": [
    "Goal sentence 1 (specific, age-appropriate, tied to ${careerGoal})",
    "Goal sentence 2",
    "Goal sentence 3"
  ],
  "skills": [
    "Skill 1 (never repeat from completed list)",
    "Skill 2",
    "Skill 3"
  ],
  "milestones": [
    {
      "id": "${nodeId}-ms-1",
      "title": "Specific milestone title",
      "detail": "What to do and why it matters for reaching ${careerGoal}",
      "timeframe": "${nodeLabel}"
    }
  ],
  "summary": "One paragraph: what this stage is about and why it matters for reaching ${careerGoal}",
  "goal_reasons": {
    "Goal sentence 1": "One sentence connecting this goal directly to becoming a ${careerGoal}",
    "Goal sentence 2": "One sentence reason",
    "Goal sentence 3": "One sentence reason"
  },
  "stageGoals": [
    "Short actionable goal 1 for this specific stage",
    "Short actionable goal 2",
    "Short actionable goal 3"
  ]
}

Rules:
1. Every goal in "goals" MUST have a matching entry in "goal_reasons" with exactly the same text as the key
2. goal_reasons values must be SPECIFIC to this goal AND to "${careerGoal}" — never generic
3. Skills must be deduplicated from: [${completedGoalsList}]
4. Content difficulty must match age ${ageRule.age} exactly
5. Return ONLY the JSON object — no markdown, no preamble`;

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    console.log(`[Backend] Generating node content for: "${nodeLabel}" (${nodeType}, stage: ${stage})`);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(cleanGeminiJsonResponse(responseText));

    // Normalize output
    const normalized = {
      goals: Array.isArray(parsed.goals) ? parsed.goals.filter(g => typeof g === "string" && g.trim()) : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills.filter(s => typeof s === "string" && s.trim()) : [],
      milestones: Array.isArray(parsed.milestones) ? parsed.milestones.map((m, i) => ({
        id: m.id || `${nodeId}-ms-${i + 1}`,
        title: m.title || "Milestone",
        detail: m.detail || "Work toward this stage.",
        timeframe: m.timeframe || nodeLabel
      })) : [],
      summary: typeof parsed.summary === "string" ? parsed.summary : `Focus on ${nodeLabel} to progress toward ${careerGoal}.`,
      goal_reasons: (typeof parsed.goal_reasons === "object" && !Array.isArray(parsed.goal_reasons)) ? parsed.goal_reasons : {},
      stageGoals: Array.isArray(parsed.stageGoals) ? parsed.stageGoals : []
    };

    console.log(`[Backend] Node content generated: ${normalized.goals.length} goals, ${normalized.skills.length} skills`);
    res.json(normalized);

  } catch (error) {
    console.error("[Backend Error] node-content failed:", error.message);
    const nodeLabel_ = nodeLabel || nodeId;
    const mockContent = getOfflineMockNodeContent(nodeId, nodeLabel_, profile);
    res.json(mockContent);
  }
});

// ─────────────────────────────────────────────────────────
// CHECKPOINT — narrative summary + mini resume
// Called when user opens a gold checkpoint node
// ─────────────────────────────────────────────────────────

app.post("/api/checkpoint", async (req, res) => {
  const { profile, checkpointLabel, completedGoals, completedSkills, completedCerts, completedInternships } = req.body;

  try {
    if (!profile) {
      return res.status(400).json({ error: "profile is required." });
    }
    if (!genAI) {
      return res.status(503).json({ error: "Gemini API not configured." });
    }

    const careerGoal = profile.goal?.description || "their career goal";
    const stage = profile.stage || "UNDERGRADUATE";
    const completedGoalsList = (completedGoals || []).join("\n- ");
    const skillsList = (completedSkills || []).join(", ");
    const certsList = (completedCerts || []).join(", ") || "None yet";
    const internList = (completedInternships || []).join(", ") || "None yet";

    const prompt = `You are a career advisor generating a checkpoint summary for ${profile.name}.

## Context
- Career Goal: "${careerGoal}"
- Current Stage: ${stage}
- Checkpoint: "${checkpointLabel}"

## What They Have Completed So Far
Goals achieved:
- ${completedGoalsList || "Starting out"}

Skills acquired: ${skillsList || "Building foundations"}
Certifications: ${certsList}
Internships: ${internList}

## Output (raw JSON only, no markdown)
{
  "narrative": "2-3 paragraph inspiring narrative about what ${profile.name} has built so far and exactly why they are on track for ${careerGoal}. Reference their actual completed items. Be specific and encouraging.",
  "skills_earned": ["deduplicated list of all skills earned so far"],
  "certifications": ["list of certs completed"],
  "internships": ["list of internships attempted"],
  "mini_resume": "Formatted resume-style text block the user can copy. Include: Name, Career Goal, Education Stage, Skills (comma-separated), Certifications, Internships, Key Achievements. Use clean formatting with section headers."
}`;

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    console.log(`[Backend] Generating checkpoint summary for: ${checkpointLabel}`);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(cleanGeminiJsonResponse(responseText));

    res.json({
      narrative: parsed.narrative || `You have made excellent progress toward becoming a ${careerGoal}. Keep going!`,
      skills_earned: Array.isArray(parsed.skills_earned) ? parsed.skills_earned : (completedSkills || []),
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      internships: Array.isArray(parsed.internships) ? parsed.internships : [],
      mini_resume: parsed.mini_resume || `${profile.name}\nGoal: ${careerGoal}\nSkills: ${skillsList}`
    });

  } catch (error) {
    console.error("[Backend Error] checkpoint failed:", error.message);
    const careerGoal = profile?.goal?.description || "your career goal";
    res.json({
      narrative: `You have made great progress on your journey toward becoming a ${careerGoal}. The skills and experiences you have gathered so far form a strong foundation. Keep pushing forward — you are on track!`,
      skills_earned: completedSkills || [],
      certifications: completedCerts || [],
      internships: completedInternships || [],
      mini_resume: `${profile?.name || "Student"}\nCareer Goal: ${careerGoal}\nStage: ${profile?.stage || ""}\nSkills: ${(completedSkills || []).join(", ")}`,
      isMock: true
    });
  }
});

// ─────────────────────────────────────────────────────────
// INIT ROADMAP — lightweight first-node initialization
// ─────────────────────────────────────────────────────────

app.post("/api/init-roadmap", async (req, res) => {
  const profile = req.body;
  try {
    if (!profile || !profile.name || !profile.goal || !profile.goal.description) {
      return res.status(400).json({ error: "Invalid profile data. Name and goal description are required." });
    }
    if (!genAI) {
      return res.status(503).json({ error: "Gemini API client is not configured." });
    }

    const stage = profile.stage || "UNDERGRADUATE";
    const ageRule = AGE_CONTENT_RULES[stage] || AGE_CONTENT_RULES.UNDERGRADUATE;
    const careerGoal = profile.goal.description;
    const fieldLabel = profile.field?.type === "OTHER" ? profile.field?.customValue : profile.field?.type;

    console.log(`[Backend] Initializing roadmap scaffold for: ${profile.name} (Stage: ${stage})`);

    const prompt = `You are a career consultant initializing a personalized career path.
Generate a minimal starting roadmap JSON for:
- Name: ${profile.name}
- Current Stage: ${stage} (age ${ageRule.age})
- Field: ${fieldLabel}
- Career Goal: "${careerGoal}"
- Financial Tier: ${profile.financialTier}
- Current Skills: ${(profile.skills || []).join(", ")}

Generate only the starting milestone content, plus initial recommendations for courses, certs, and alternates.

Output format (raw JSON only, no markdown):
{
  "goalsToAchieve": {
    "description": "Chronological pathway from ${stage} to ${careerGoal}",
    "milestones": [
      {
        "id": "node-root-ms-1",
        "title": "Initial Stage: ${stage} Focus",
        "detail": "Actionable focus items for your current stage matching age ${ageRule.age}.",
        "timeframe": "NOW",
        "phase": "goalsToAchieve",
        "prerequisites": []
      }
    ]
  },
  "collegeCourses": [
    {
      "id": "course-1",
      "name": "Foundational Course Name",
      "semester": "Semester 1",
      "reason": "Why this builds core concepts for ${careerGoal}",
      "financialTiers": ["LOW", "MEDIUM", "HIGH"]
    }
  ],
  "internships": [],
  "certifications": [
    {
      "id": "cert-1",
      "name": "Introductory Certification Name",
      "platform": "Coursera or NASSCOM",
      "cost": "Free",
      "duration": "4 weeks",
      "impact": "Builds baseline credibility for ${careerGoal}",
      "financialTiers": ["LOW", "MEDIUM", "HIGH"]
    }
  ],
  "alternatePaths": [
    {
      "id": "alt-1",
      "title": "Alternative Role Name",
      "salaryRange": "Competitive",
      "skillOverlap": 70,
      "pivotRequired": "What is needed to pivot"
    }
  ],
  "skillGap": {
    "have": ${profile.skills && profile.skills.length > 0 ? JSON.stringify(profile.skills) : '[]'},
    "need": [
      { "skill": "Core skill to learn", "milestoneId": "node-root-ms-1" }
    ],
    "bridgingSteps": [
      "Dedicate weekly time to recommended study plan.",
      "Complete introductory certificates."
    ]
  }
}`;

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(cleanGeminiJsonResponse(responseText));

    // Form programmatically a dummy decisionTree to make parsed object pass parseRoadmap
    parsed.decisionTree = {
      id: "node-root",
      label: "You Are Here",
      type: "decision",
      month: "Now",
      detail: "Start of your path.",
      financialTiers: ["LOW", "MEDIUM", "HIGH"],
      status: "in_progress",
      children: []
    };

    res.json(parsed);

  } catch (error) {
    console.error("[Backend Error] init-roadmap failed:", error.message);
    // Return minimal valid roadmap matching schema
    res.json({
      goalsToAchieve: {
        description: `Your custom pathway to becoming a ${profile.goal?.description || "Professional"}.`,
        milestones: [
          {
            id: "node-root-ms-1",
            title: `Adapt to ${profile.stage}`,
            detail: `Focus on mastering the core principles at your current stage.`,
            timeframe: "NOW",
            phase: "goalsToAchieve",
            prerequisites: []
          }
        ]
      },
      collegeCourses: [],
      internships: [],
      certifications: [],
      alternatePaths: [],
      decisionTree: {
        id: "node-root",
        label: "You Are Here",
        type: "decision",
        month: "Now",
        detail: "Start of your path.",
        financialTiers: ["LOW", "MEDIUM", "HIGH"],
        status: "in_progress",
        children: []
      },
      skillGap: {
        have: profile.skills || [],
        need: [],
        bridgingSteps: ["Begin with the starting milestone."]
      },
      isMock: true
    });
  }
});

// Serve frontend assets in production
app.use(express.static(path.join(__dirname, "../dist")));

// Bug #14 fix: SPA catch-all — any unmatched GET request returns index.html
// so that React Router deep links work correctly in production.
// Note: Express 5 requires '/{*path}' instead of '*' due to path-to-regexp v8.
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Career GPS Secure Proxy running on port ${PORT}`);
  console.log(` Environment: Local Development Proxy`);
  console.log(` Target Gemini Model: ${GEMINI_MODEL}`);
  console.log(`==================================================`);
});
