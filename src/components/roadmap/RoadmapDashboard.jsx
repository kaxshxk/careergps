import { useMemo, useState, useCallback, useEffect } from "react";
import { GradientBackground } from "@/components/ui/gradient-background";
import {
  clearCareerGpsStorage,
  loadCompletedMilestones,
  saveCompletedMilestones,
  saveFinancialTier,
  loadDeepRoadmap,
  saveDeepRoadmap,
  loadResumeAnalysis,
  loadCompletedDeepWeeks,
  saveCompletedDeepWeeks,
  // New local storage cache and states
  loadNodeCache,
  saveNodeCache,
  loadNodeStates,
  saveNodeStates,
  loadCompletedGoalsList,
  saveCompletedGoalsList
} from "../../services/localStorageService";

import {
  filterByFinancialTier,
  getAllMilestones,
  getFieldLabel,
  getProgressStats,
  getStageLabel,
} from "../../utils/roadmapHelpers";
import { buildMindmapScaffold, flattenScaffold, calculateProgress } from "../../data/scaffoldBuilder";
import DeepOptimizationWizard from "./DeepOptimizationWizard";
import ResumeAnalyzer from "../pathforge/ResumeAnalyzer";
import MarketIntelligence from "../pathforge/MarketIntelligence";
import CareerChat from "../pathforge/CareerChat";
import SkillMap from "../pathforge/SkillMap";

const sections = [
  ["goals", "Goals"],
  ["courses", "Courses"],
  ["internships", "Internships"],
  ["certifications", "Certifications"],
  ["alternates", "Alternate Paths"],
  ["skills", "Skill Gap"],
  ["resume", "Resume Analyzer"],
  ["market", "Market Intel"],
  ["chat", "AI Career Chat"],
  ["deep", "Deep Insights"],
];

const tierLabels = {
  HIGH: "Self-funded",
  MEDIUM: "Affordable",
  LOW: "Free only",
};

const tierAccent = {
  HIGH: "bg-coral text-white",
  MEDIUM: "bg-ocean text-white",
  LOW: "bg-emerald-600 text-white",
};

export default function RoadmapDashboard({ profile, roadmap, initialFinancialTier, onReset, onViewTimeline, onViewMindmap, onProfileUpdate }) {
  const [activeSection, setActiveSection] = useState("goals");
  const [financialTier, setFinancialTier] = useState(initialFinancialTier || profile.financialTier);
  const [selectedAlternate, setSelectedAlternate] = useState(null);
  const [completedMilestones, setCompletedMilestones] = useState(() => new Set(loadCompletedMilestones()));
  const [deepRoadmap, setDeepRoadmap] = useState(() => loadDeepRoadmap());
  const [resumeAnalysis, setResumeAnalysis] = useState(() => loadResumeAnalysis());
  const [showWizard, setShowWizard] = useState(false);
  const [completedDeepWeeks, setCompletedDeepWeeks] = useState(() => loadCompletedDeepWeeks());

  // Mindmap stage-locked lazy state loaded from storage
  const [completedGoals, setCompletedGoals] = useState(() => new Set(loadCompletedGoalsList()));
  const [nodeCache, setNodeCache] = useState(() => loadNodeCache());
  const [nodeStates, setNodeStates] = useState(() => loadNodeStates());
  const [userSelections, setUserSelections] = useState(() => {
    try {
      const raw = localStorage.getItem("career-gps:user-selections");
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  });

  // Reevaluate node states
  const reevaluateStates = useCallback((currentGoals, currentSelections, currentCache) => {
    const root = buildMindmapScaffold(profile, {});
    const flat = flattenScaffold(root);
    const nextStates = {};

    nextStates["node-root"] = "completed";

    const startNode = flat.find(n => n.isCurrentStage);
    if (startNode) {
      nextStates[startNode.id] = "unlocked";
    }

    const safeCache = currentCache || {};
    const safeStates = nodeStates || {};

    function walk(node) {
      const state = nextStates[node.id] || "locked";
      const content = safeCache[node.id];
      const goalsList = content?.goals || [];
      const completedList = goalsList.filter(g => currentGoals.has(g));
      const percentComplete = goalsList.length ? (completedList.length / goalsList.length) : 0;
      
      const isParentCompleted = state === "completed" || percentComplete >= 1.0;
      const isParent80Percent = percentComplete >= 0.8;

      for (const child of node.children) {
        if (child.isSelectionPoint) {
          const selection = currentSelections[child.id];
          if (selection) {
            nextStates[child.id] = "completed";
          } else {
            nextStates[child.id] = (isParent80Percent || isParentCompleted) ? "unlocked" : "locked";
          }
        } else if (child.isCheckpoint) {
          nextStates[child.id] = (isParent80Percent || isParentCompleted) ? "completed" : "locked";
        } else {
          const nextState = (isParent80Percent || isParentCompleted) ? "unlocked" : "locked";
          const oldState = safeStates[child.id] || "locked";
          if (oldState === "completed" && nextState !== "locked") {
            nextStates[child.id] = "completed";
          } else if (oldState === "in_progress" && nextState !== "locked") {
            nextStates[child.id] = "in_progress";
          } else {
            nextStates[child.id] = nextState;
          }
        }
        walk(child);
      }
    }

    walk(root);
    return nextStates;
  }, [profile, nodeStates]);

  const handleToggleGoal = useCallback((goalText) => {
    setCompletedGoals(prev => {
      const next = new Set(prev);
      if (next.has(goalText)) {
        next.delete(goalText);
      } else {
        next.add(goalText);
      }
      
      const list = Array.from(next);
      saveCompletedGoalsList(list);

      // Propagate locks / unlocks downwards
      const updatedStates = reevaluateStates(next, userSelections, nodeCache);
      setNodeStates(updatedStates);
      saveNodeStates(updatedStates);
      return next;
    });
  }, [nodeCache, nodeStates, userSelections, reevaluateStates]);

  const currentPhase = profile.onboardingPhase || 1;
  const phaseCompleted = useMemo(() => {
    const milestones = roadmap.goalsToAchieve?.milestones || [];
    if (!milestones.length) return false;
    return milestones.every((ms) => completedMilestones.has(ms.id));
  }, [roadmap, completedMilestones]);

  const filtered = useMemo(
    () => ({
      courses: filterByFinancialTier(roadmap.collegeCourses, financialTier),
      internships: filterByFinancialTier(roadmap.internships, financialTier),
      certifications: filterByFinancialTier(roadmap.certifications, financialTier),
    }),
    [roadmap, financialTier],
  );

  const filteredSections = useMemo(() => {
    const isSchool = profile.stage === "CLASS_7_8" || profile.stage === "CLASS_9_10";
    if (isSchool) {
      return sections.filter(([id]) => id !== "courses" && id !== "internships" && id !== "certifications");
    }
    return sections;
  }, [profile.stage]);

  const milestoneCount = getAllMilestones(roadmap).length;
  
  // Calculate progress statistics relative to the unlocked mindmap path
  const progressStats = useMemo(() => {
    const root = buildMindmapScaffold(profile, nodeStates);
    const mmStats = calculateProgress(root, nodeCache, nodeStates, completedGoals);
    
    // Add deep assessment progression if active
    if (!deepRoadmap || !deepRoadmap.weeklyStudyPlan || !deepRoadmap.weeklyStudyPlan.length) {
      return {
        total: mmStats.totalCount || 1,
        completed: mmStats.completedCount,
        percentage: mmStats.percent,
        byPhase: []
      };
    }

    const deepWeeks = deepRoadmap.weeklyStudyPlan;
    const deepTotal = deepWeeks.length;
    const deepCompleted = deepWeeks.filter((w) => completedDeepWeeks.includes(w.week)).length;

    const total = (mmStats.totalCount || 0) + deepTotal;
    const completed = mmStats.completedCount + deepCompleted;
    const percentage = total ? Math.round((completed / total) * 100) : 0;

    const byPhase = [
      ...baseStats.byPhase,
      {
        phase: "deepStudy",
        total: deepTotal,
        completed: deepCompleted,
        percentage: deepPercentage,
      },
    ];

    return {
      ...baseStats,
      total,
      completed,
      percentage,
      byPhase,
    };
  }, [roadmap, completedMilestones, deepRoadmap, completedDeepWeeks]);

  function toggleMilestone(milestoneId) {
    setCompletedMilestones((current) => {
      const next = new Set(current);
      if (next.has(milestoneId)) {
        // Unchecking
        next.delete(milestoneId);
        
        // Cascade uncheck: if this is a main milestone, uncheck all subsequent ones
        const mainMilestones = roadmap?.goalsToAchieve?.milestones || [];
        const index = mainMilestones.findIndex(m => m.id === milestoneId);
        
        if (index !== -1) {
          for (let i = index + 1; i < mainMilestones.length; i++) {
            next.delete(mainMilestones[i].id);
            if (mainMilestones[i].prerequisites) {
              mainMilestones[i].prerequisites.forEach(pre => next.delete(pre.id));
            }
          }
        }
      } else {
        // Checking
        next.add(milestoneId);
      }
      saveCompletedMilestones(next);
      return next;
    });
  }

  const toggleDeepWeek = (weekId) => {
    setCompletedDeepWeeks((current) => {
      const next = current.includes(weekId)
        ? current.filter((id) => id !== weekId)
        : [...current, weekId];
      saveCompletedDeepWeeks(next);
      return next;
    });
  };


  function updateTier(nextTier) {
    setFinancialTier(nextTier);
    saveFinancialTier(nextTier);
  }

  function handleReset() {
    // clearCareerGpsStorage() now covers career-gps:completed-deep-weeks too
    clearCareerGpsStorage();
    onReset();
  }


  return (
    <GradientBackground
      className="min-h-screen bg-transparent text-slate-900 animate-fade-in"
      overlay={false}
      enableCenterContent={false}
    >
      <section className="border-b border-black/8 bg-white/55 text-slate-800 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-5 py-5 md:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Career GPS dashboard</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl text-slate-900">Your roadmap, {profile.name}</h1>
            <p className="mt-2 max-w-3xl text-slate-600">
              Showing a tailored, AI-generated career roadmap for {getStageLabel(profile.stage)} in {getFieldLabel(profile.field)}.
            </p>
            <p className="mt-2 max-w-3xl text-sm font-semibold text-slate-700">
              Goal direction: {formatGoalType(profile.goal.type)} - {profile.goal.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            <button
              className="focus-ring rounded-md bg-gradient-to-r from-[#28b7a5] to-emerald-600 px-4 py-2 text-sm font-semibold text-[#0b463b] hover:from-[#39cbba] hover:to-emerald-500 transition transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-emerald-200 print:hidden font-bold"
              type="button"
              onClick={onViewTimeline}
            >
              Journey Timeline
            </button>

            <button
              className="focus-ring rounded-md bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white hover:from-violet-400 hover:to-purple-500 transition transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-purple-200 print:hidden font-bold"
              type="button"
              id="open-career-mindmap"
              onClick={onViewMindmap}
            >
              Career Mindmap
            </button>
            <button
              className="focus-ring rounded-md bg-[#286f8f]/10 border border-[#286f8f]/20 px-4 py-2 text-sm font-semibold text-[#286f8f] hover:bg-[#286f8f]/20 transition transform hover:scale-[1.02] active:scale-[0.98] print:hidden"
              type="button"
              onClick={() => window.print()}
            >
              Download PDF
            </button>
            <button
              className="focus-ring rounded-md border border-black/10 bg-black/5 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-black/10 hover:text-slate-950 transition transform hover:scale-[1.02] active:scale-[0.98] print:hidden"
              type="button"
              onClick={handleReset}
            >
              Edit Profile / Restart
            </button>
          </div>
        </div>
      </section>

      <div className="hidden print:block print:p-8">
        <h2 className="mb-6 text-2xl font-bold text-ink">Short-Term & Long-Term Goals</h2>
        <Goals
          profile={profile}
          roadmap={roadmap}
          completedMilestones={completedMilestones}
          onToggleMilestone={toggleMilestone}
        />
      </div>

      <section className="mx-auto grid max-w-[1600px] gap-5 px-5 py-5 md:px-8 lg:grid-cols-[240px_minmax(0,1fr)_280px] print:hidden">
        <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start">
          <Panel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Financial view</p>
            <div className="mt-4 grid gap-2">
              {Object.entries(tierLabels).map(([tier, label]) => (
                <button
                  key={tier}
                  className={`focus-ring rounded-md px-3 py-2 text-left text-sm font-semibold transition-all duration-200 ${
                    financialTier === tier 
                      ? tierAccent[tier] 
                      : "bg-black/5 text-slate-700 hover:bg-black/10 hover:text-slate-900"
                  }`}
                  type="button"
                  onClick={() => updateTier(tier)}
                >
                  {label}
                </button>
              ))}
            </div>
          </Panel>

          <Panel>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Sections</p>
            <nav className="mt-4 grid gap-2">
              {filteredSections.map(([id, label]) => {
                const isDeep = id === "deep";
                const isUnlocked = !!deepRoadmap;
                return (
                  <button
                    key={id}
                    className={`focus-ring rounded-md px-3 py-2 text-left text-sm font-semibold transition-all duration-200 flex items-center justify-between ${
                      isDeep && !isUnlocked ? "lock-glow-pulse border border-emerald-500/20" : ""
                    } ${
                      activeSection === id
                        ? isDeep
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200"
                          : "bg-emerald-500/10 text-emerald-800 border border-emerald-500/20"
                        : "text-slate-600 hover:bg-black/5 hover:text-slate-900"
                    }`}
                    type="button"
                    onClick={() => setActiveSection(id)}
                  >
                    <span>{label}</span>
                    {isDeep && (
                      isUnlocked ? (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                          Active
                        </span>
                      ) : (
                        <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Locked
                        </span>
                      )
                    )}
                  </button>
                );
              })}
            </nav>
          </Panel>
        </aside>

        <section className="min-w-0">
          <div className="mb-5 grid gap-4 md:grid-cols-3">
            <MetricCard label="Milestones" value={milestoneCount} color="bg-[#f7d06b]" />
            <MetricCard label="Certs for tier" value={filtered.certifications.length} color="bg-[#8fd5c0]" />
            <MetricCard label="Alternate paths" value={roadmap.alternatePaths.length} color="bg-[#f4a38f]" />
          </div>

          <ActiveSection
            activeSection={activeSection}
            profile={profile}
            roadmap={roadmap}
            filtered={filtered}
            financialTier={financialTier}
            selectedAlternate={selectedAlternate}
            onSelectAlternate={setSelectedAlternate}
            completedMilestones={completedMilestones}
            onToggleMilestone={toggleMilestone}
            deepRoadmap={deepRoadmap}
            onTriggerDeepWizard={() => setShowWizard(true)}
            completedDeepWeeks={completedDeepWeeks}
            onToggleDeepWeek={toggleDeepWeek}
            setDeepRoadmap={setDeepRoadmap}
            saveDeepRoadmap={saveDeepRoadmap}
            setCompletedDeepWeeks={setCompletedDeepWeeks}
            phaseCompleted={phaseCompleted}
            currentPhase={currentPhase}
            resumeAnalysis={resumeAnalysis}
            setResumeAnalysis={setResumeAnalysis}
            completedGoals={completedGoals}
            onToggleGoal={handleToggleGoal}
            nodeCache={nodeCache}
            nodeStates={nodeStates}
          />
        </section>

        <ProgressShell roadmap={roadmap} financialTier={financialTier} progressStats={progressStats} deepRoadmap={deepRoadmap} />
      </section>

      {showWizard && (
        <DeepOptimizationWizard
          profile={profile}
          roadmap={roadmap}
          onComplete={(data) => {
            setDeepRoadmap(data);
            saveDeepRoadmap(data);
            setShowWizard(false);
            setActiveSection("deep");
          }}
          onClose={() => setShowWizard(false)}
        />
      )}



    </GradientBackground>
  );
}

function getOverlapReason(itemName, itemImpactReason, gaps) {
  if (!gaps || gaps.length === 0) return null;
  const nameLower = itemName.toLowerCase();
  const descLower = (itemImpactReason || "").toLowerCase();
  
  for (const gap of gaps) {
    const gapLower = gap.toLowerCase().trim();
    if (gapLower && (nameLower.includes(gapLower) || descLower.includes(gapLower))) {
      return `Bridges resume gap: ${gap}`;
    }
  }
  return null;
}

function AICoachPanel({ profile, resumeAnalysis }) {
  if (!resumeAnalysis) return null;
  
  const gaps = resumeAnalysis.gaps || [];
  const recommendations = resumeAnalysis.recommendations || [];
  const stage = profile.stage;
  const goal = profile.goal?.description || "your career goal";

  let stageAdvice = "";
  if (stage === "CLASS_7_8" || stage === "CLASS_9_10") {
    stageAdvice = "Since you are in middle/high school, keep your focus on interactive, visual coding or foundational concepts. Avoid paying for high-cost enterprise cloud certs for now. Opt for free bootcamps or beginner projects.";
  } else if (stage === "CLASS_11_12") {
    stageAdvice = "As a high school student preparing for college/university, focus on learning core programming fundamentals (Python, HTML/JS) and building small, visual tools that can act as portfolio anchors.";
  } else if (stage === "UNDERGRADUATE" || stage === "POSTGRADUATE") {
    stageAdvice = "As a college student aiming for placement/internships, you should prioritize industry-recognized certs (AWS, Google, Coursera) and build complex, end-to-end applications to bridge your gaps.";
  } else {
    stageAdvice = "As a working professional looking to transition, focus on production-grade projects demonstrating real-world applications of your target skills, and align your certifications directly with recruiter profiles.";
  }

  return (
    <div className="rounded-xl border border-[#28b7a5]/30 bg-gradient-to-r from-emerald-50/40 to-teal-50/40 p-5 shadow-sm border-l-4 border-l-[#28b7a5] mb-6 animate-fade-in print:hidden">
      <div className="flex gap-4 flex-col sm:flex-row items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#28b7a5]/10 border border-[#28b7a5]/20 text-[#0b463b] shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-5 h-5 text-teal-700">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v1m0-12a5 5 0 00-5 5c0 1.637.78 3.09 2 4v2a2 2 0 004 0v-2c1.22-1.91 2-3.363 2-4a5 5 0 00-5-5z" />
          </svg>
        </div>
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-extrabold text-[#0b463b]">AI Resume Coach: Bridging Insights</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Based on your parsed resume, your stage as a <strong>{stage.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</strong>, and your goal as a <strong>{goal}</strong>.
            </p>
          </div>
          
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {stageAdvice}
          </p>

          {gaps.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800">Gaps to Bridge</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {gaps.map((gap, i) => (
                  <span key={i} className="rounded bg-rose-50 border border-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 shadow-sm">
                    {gap}
                  </span>
                ))}
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="space-y-1 border-t border-slate-200/50 pt-2.5 mt-2.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#28b7a5]">Top Bridging Actions</span>
              <ul className="mt-1.5 space-y-1.5">
                {recommendations.slice(0, 3).map((rec, i) => (
                  <li key={i} className="flex gap-2 items-start text-xs text-slate-600">
                    <span className="text-[#28b7a5] font-extrabold">→</span>
                    <span className="font-semibold">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActiveSection({
  activeSection,
  profile,
  roadmap,
  filtered,
  financialTier,
  selectedAlternate,
  onSelectAlternate,
  completedMilestones,
  onToggleMilestone,
  deepRoadmap,
  onTriggerDeepWizard,
  completedDeepWeeks,
  onToggleDeepWeek,
  setDeepRoadmap,
  saveDeepRoadmap,
  setCompletedDeepWeeks,
  phaseCompleted,
  resumeAnalysis,
  setResumeAnalysis,
  completedGoals,
  onToggleGoal,
  nodeCache,
  nodeStates,
}) {
  const [deepTab, setDeepTab] = useState("study");


  if (activeSection === "courses") {
    return (
      <div className="space-y-4 animate-fade-in">
        <AICoachPanel profile={profile} resumeAnalysis={resumeAnalysis} />
        <TieredList
          title="College Courses"
          items={filtered.courses}
          renderItem={(item) => {
            const overlap = getOverlapReason(item.name, item.reason, resumeAnalysis?.gaps);
            return <CourseCard item={item} overlapReason={overlap} />;
          }}
        />
      </div>
    );
  }
  if (activeSection === "internships") return <TieredList title="Internships" items={filtered.internships} renderItem={(item) => <InternshipCard item={item} />} />;
  if (activeSection === "certifications") {
    return (
      <div className="space-y-4 animate-fade-in">
        <AICoachPanel profile={profile} resumeAnalysis={resumeAnalysis} />
        <Panel className="border-l-4 border-l-ocean">
          <SectionHeader kicker="Filtered by financial tier" title="Certifications" description="These update instantly when the tier toggle changes. Check off certifications to track progress." />
          <div className="mt-5 grid gap-3">
            {filtered.certifications.map((item) => {
              const overlap = getOverlapReason(item.name, item.impact, resumeAnalysis?.gaps);
              return (
                <CertificationCard
                  key={item.id}
                  item={item}
                  checked={completedMilestones.has(item.id)}
                  onToggle={onToggleMilestone}
                  overlapReason={overlap}
                />
              );
            })}
          </div>
        </Panel>
      </div>
    );
  }
  if (activeSection === "alternates") {
    return (
      <AlternatePaths
        paths={roadmap.alternatePaths}
        selectedAlternate={selectedAlternate}
        onSelectAlternate={onSelectAlternate}
      />
    );
  }
  if (activeSection === "skills") {
    const need = [];
    const rootScaffold = buildMindmapScaffold(profile, nodeStates);
    const flatScaffold = flattenScaffold(rootScaffold);
    
    flatScaffold.forEach(node => {
      const state = nodeStates[node.id] || node.state;
      if (state !== "locked") {
        const content = nodeCache[node.id];
        if (content && content.skills) {
          content.skills.forEach(skill => {
            need.push({ skill, milestoneId: node.id });
          });
        }
      }
    });

    const dynamicSkillGap = {
      have: profile.skills || [],
      need,
      bridgingSteps: roadmap.skillGap?.bridgingSteps || [
        "Follow the active mindmap milestone objectives.",
        "Practice target technical skills daily."
      ]
    };

    return <SkillMap skillGap={dynamicSkillGap} profile={profile} completedMilestones={completedMilestones} resumeAnalysis={resumeAnalysis} />;
  }
  if (activeSection === "resume") return <ResumeAnalyzer profile={profile} onAnalysisComplete={setResumeAnalysis} />;
  if (activeSection === "market") return <MarketIntelligence profile={profile} />;
  if (activeSection === "chat") return <CareerChat profile={profile} />;

  if (activeSection === "deep") {
    if (!deepRoadmap) {
      return (
        <div className="animate-slide-up space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1524] to-[#12253f] p-8 text-white shadow-2xl border border-emerald-500/20">
            {/* Abstract background shapes */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-ocean/20 blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
                ⚡ AI Advanced Optimization
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
                Deepen Your Career Roadmap
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-300">
                Ready to take this roadmap to the next level? Unlock a highly-specialized **Deep Study & Project Blueprint** custom-synthesized by Google Gemini specifically for your profile.
              </p>
              
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm card-hover-dynamic">
                  <span className="text-2xl">📅</span>
                  <h3 className="mt-3 font-bold text-emerald-300 text-[15px]">6-Week Study Plan</h3>
                  <p className="mt-2 text-xs text-slate-400">A rigorous daily/weekly schedule with curated online study topics and top learning resources.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm card-hover-dynamic">
                  <span className="text-2xl">🛠️</span>
                  <h3 className="mt-3 font-bold text-emerald-300 text-[15px]">2 Custom Portfolio Projects</h3>
                  <p className="mt-2 text-xs text-slate-400">Step-by-step production project specs with recommended frameworks to prove your work.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm card-hover-dynamic">
                  <span className="text-2xl">💡</span>
                  <h3 className="mt-3 font-bold text-emerald-300 text-[15px]">Coaching & Strategy Corner</h3>
                  <p className="mt-2 text-xs text-slate-400">Exclusive advice on niche-positioning, resume hooks, and direct networking tactics.</p>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center border-t border-white/15 pt-6">
                <button
                  type="button"
                  onClick={onTriggerDeepWizard}
                  className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[15px] font-bold text-white shadow-lg animate-emerald-glow transition transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Launch Deep Optimization Wizard
                </button>
                <p className="text-xs text-slate-400 text-center sm:text-left">
                  Takes 2 minutes. Gemini dynamically designs custom questions based on your Stage, Field, and Career Goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="animate-slide-up space-y-6">
        <Panel className="border-l-4 border-l-emerald-500 animate-fade-in">
          <SectionHeader
            kicker="AI-Powered Optimization"
            title="Your Deep Career Insights"
            description="Your premium Phase 2 study plans, custom-tailored projects, and strategic networking blueprints are unlocked."
          />
          
          <div className="flex gap-6 border-b border-slate-200 pb-1 mt-6 mb-6 overflow-x-auto print:hidden">
            <button
              type="button"
              onClick={() => setDeepTab("study")}
              className={`pb-3 font-bold text-sm transition-all duration-200 shrink-0 tab-glow-under ${
                deepTab === "study"
                  ? "text-emerald-700 active font-extrabold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              📅 6-Week Study Schedule
            </button>
            <button
              type="button"
              onClick={() => setDeepTab("projects")}
              className={`pb-3 font-bold text-sm transition-all duration-200 shrink-0 tab-glow-under ${
                deepTab === "projects"
                  ? "text-emerald-700 active font-extrabold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🛠️ Portfolio Blueprints
            </button>
            <button
              type="button"
              onClick={() => setDeepTab("coaching")}
              className={`pb-3 font-bold text-sm transition-all duration-200 shrink-0 tab-glow-under ${
                deepTab === "coaching"
                  ? "text-emerald-700 active font-extrabold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              💡 Strategic Coaching Corner
            </button>
          </div>

          {deepTab === "study" && (
            <div className="space-y-4 animate-fade-in">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-ink">Your Custom 6-Week Intensive Study Plan</h3>
                <p className="text-sm text-slate-600">Track your weekly learning progression. Mark each week as completed to check off your milestones.</p>
              </div>
              <div className="grid gap-4">
                {deepRoadmap.weeklyStudyPlan.map((weekItem, idx) => {
                  const isCompleted = completedDeepWeeks.includes(weekItem.week);
                  return (
                    <label
                      key={weekItem.week}
                      onClick={() => onToggleDeepWeek(weekItem.week)}
                      className={`flex cursor-pointer gap-4 rounded-xl p-5 ${
                        isCompleted
                          ? "border border-emerald-200 bg-emerald-50/40 shadow-inner"
                          : "card-emerald-glow"
                      }`}
                    >
                      <div
                        className={`mt-1 custom-checkbox shrink-0 ${isCompleted ? "checked" : ""}`}
                      >
                        <div className="custom-checkbox-checkmark" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className={`text-xs font-extrabold uppercase tracking-widest ${
                            isCompleted ? "text-emerald-700" : "text-emerald-600"
                          }`}>
                            {weekItem.week}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200">
                            📖 Resource: {weekItem.resource}
                          </span>
                        </div>
                        <h4 className={`mt-2 text-lg font-bold transition-all duration-200 ${
                          isCompleted ? "text-emerald-900 line-through opacity-70" : "text-ink"
                        }`}>
                          {weekItem.topic}
                        </h4>
                        <p className={`mt-2 text-sm leading-relaxed transition-all duration-200 ${
                          isCompleted ? "text-emerald-800/80 opacity-60" : "text-slate-600"
                        }`}>
                          <strong className="text-ink">Weekly Task:</strong> {weekItem.actionItem}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {deepTab === "projects" && (
            <div className="space-y-6 animate-fade-in">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-ink">Custom Portfolio Blueprints</h3>
                <p className="text-sm text-slate-600">High-impact, proof-of-work project templates. Add these to your public profile to catch recruiters' attention.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {deepRoadmap.targetProjects.map((project, index) => (
                  <div
                    key={index}
                    className="flex flex-col rounded-xl card-premium-glow p-6 shadow-sm"
                  >
                    <div className="flex-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-ocean/10 px-2.5 py-1 text-xs font-bold text-ocean">
                        🔨 Blueprint #{index + 1}
                      </span>
                      <h4 className="mt-3 text-xl font-extrabold text-ink">{project.title}</h4>
                      
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.techStack.split(",").map((tech, tIdx) => (
                          <span key={tIdx} className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                      
                      <p className="mt-4 text-sm leading-relaxed text-slate-600">{project.description}</p>
                      
                      <div className="mt-5 border-t border-slate-100 pt-5">
                        <h5 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Implementation Phases</h5>
                        <ol className="mt-3 space-y-3">
                          {project.phases.map((phase, pIdx) => (
                            <li key={pIdx} className="flex gap-2.5 items-start text-sm text-slate-600">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dff3e8] text-xs font-extrabold text-emerald-800">
                                {pIdx + 1}
                              </span>
                              <span>{phase}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {deepTab === "coaching" && (
            <div className="space-y-6 animate-fade-in">
              <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 p-8 shadow-sm">
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-200/20 blur-2xl pointer-events-none" />
                
                <div className="relative z-10 flex gap-4 flex-col sm:flex-row items-start">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-xl shadow-md text-center">
                    💡
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-950">Gemini Career Coaching Insights</h3>
                    <p className="mt-3 text-[15px] font-medium leading-relaxed text-slate-800 italic">
                      "{deepRoadmap.strategicAdvice}"
                    </p>
                    <div className="mt-6 border-t border-emerald-200/50 pt-5">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">Recommended Daily Routine</h4>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                        <li className="flex gap-2 items-center">
                          <span className="text-emerald-600 font-bold">✓</span> <span>Dedicate your selected time slots in a distraction-free space.</span>
                        </li>
                        <li className="flex gap-2 items-center">
                          <span className="text-emerald-600 font-bold">✓</span> <span>Write code or build visual mockups every single day.</span>
                        </li>
                        <li className="flex gap-2 items-center">
                          <span className="text-emerald-600 font-bold">✓</span> <span>Write brief learning updates on LinkedIn to build public evidence.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Dynamic Reset Button for Deep Roadmap */}
              <div className="flex justify-end pt-4 border-t border-slate-100 print:hidden">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Are you sure you want to reset your Phase 2 assessment? This will delete your current deep study plan.")) {
                      setDeepRoadmap(null);
                      saveDeepRoadmap(null);
                      localStorage.removeItem("career-gps:completed-deep-weeks");
                      setCompletedDeepWeeks([]);
                    }
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-rose-600 transition"
                >
                  Reset Deep Optimization Assessment
                </button>
              </div>
            </div>
          )}
        </Panel>
      </div>
    );
  }

  return (
    <Goals
      profile={profile}
      completedGoals={completedGoals}
      onToggleGoal={onToggleGoal}
      nodeCache={nodeCache}
      nodeStates={nodeStates}
    />
  );
}

function Goals({ profile, completedGoals, onToggleGoal, nodeCache, nodeStates }) {
  const [tooltip, setTooltip] = useState(null);

  const scaffold = buildMindmapScaffold(profile, nodeStates);
  const flatNodes = flattenScaffold(scaffold);

  // Filter nodes that are unlocked/in progress/completed and have content goals loaded
  const activeNodes = flatNodes.filter(n => {
    const state = nodeStates[n.id] || n.state;
    if (state === "locked") return false;
    const content = nodeCache[n.id];
    return content && content.goals && content.goals.length > 0;
  });

  const handleMouseEnter = (e, text) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      text,
      x: rect.left + window.scrollX + 25,
      y: rect.top + window.scrollY - 30
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="grid gap-6 animate-fade-in relative">
      <Panel className="border-l-4 border-l-emerald-500">
        <SectionHeader
          kicker="Milestone Goals"
          title="Goals to Achieve"
          description="Complete individual stage objectives to unlock future nodes on your Career Mindmap."
        />

        <div className="mt-6 space-y-6">
          {activeNodes.length > 0 ? (
            activeNodes.map((node) => {
              const content = nodeCache[node.id];
              const goals = content.goals || [];
              const goalReasons = content.goal_reasons || {};
              const nodeState = nodeStates[node.id] || node.state;

              return (
                <div key={node.id} className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: node.color }}
                      />
                      <span className="font-bold text-sm text-slate-800">{node.label}</span>
                      <span className="text-[10px] text-slate-500 font-semibold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                        {node.timeframe}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      nodeState === "completed" 
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                        : "bg-blue-100 text-blue-800 border border-blue-200"
                    }`}>
                      {nodeState}
                    </span>
                  </div>

                  <div className="grid gap-3">
                    {goals.map((goal, idx) => {
                      const isChecked = completedGoals.has(goal);
                      const whyReason = goalReasons[goal] || "This helps build target career capabilities.";

                      return (
                        <div 
                          key={idx}
                          className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all duration-200 ${
                            isChecked 
                              ? "bg-emerald-50/20 border-emerald-250 text-slate-800" 
                              : "bg-slate-50/50 border-slate-200 hover:border-slate-350 text-slate-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onToggleGoal(goal)}
                            className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                          />
                          <div className="flex-1 text-sm leading-relaxed select-none">
                            {goal}
                          </div>
                          
                          <button
                            onMouseEnter={(e) => handleMouseEnter(e, whyReason)}
                            onMouseLeave={handleMouseLeave}
                            className="text-slate-400 hover:text-amber-500 transition-colors p-0.5 flex-shrink-0"
                            aria-label="Why this matters"
                          >
                            💡
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10">
              <span className="text-3xl">🧭</span>
              <p className="text-sm text-slate-500 mt-2 font-medium">No unlocked stages found with checklist goals.</p>
              <p className="text-xs text-slate-400 mt-1">Visit the Career Mindmap first to load your starting path nodes.</p>
            </div>
          )}
        </div>
      </Panel>

      {/* Floating fixed portal tooltip */}
      {tooltip && (
        <div
          className="fixed bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl p-3.5 max-w-[280px] z-[9999] text-xs leading-normal animate-fadeIn flex gap-2.5 items-start"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          <span className="text-amber-400 mt-0.5">💡</span>
          <div>
            <p className="font-bold text-slate-400 mb-0.5">Why This Matters</p>
            <p className="text-slate-200">{tooltip.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MilestoneCard({ milestone, index, disabled, checked, onToggle, completedMilestones }) {
  const hasPrereqs = milestone.prerequisites && milestone.prerequisites.length > 0;
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div
      className={`rounded-xl border p-5 transition-all duration-300 flex flex-col gap-4 backdrop-blur-md ${
        disabled
          ? "border-black/5 bg-black/5 opacity-40 text-slate-400"
          : checked
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-950 shadow-inner"
          : "border-black/8 bg-white/55 text-slate-800 hover:border-black/15 hover:shadow-emerald-500/10 hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Tactile Spring Custom Checkbox on the Left */}
        <div
          onClick={() => { if (!disabled) onToggle(milestone.id); }}
          className={`mt-1.5 custom-checkbox shrink-0 ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}`}
        >
          <div className="custom-checkbox-checkmark" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-xs font-bold border uppercase tracking-wider bg-[#286f8f]/10 text-[#286f8f] border-[#286f8f]/20">
              {milestone.timeframe}
            </span>
            {disabled && (
              <span className="inline-flex items-center gap-1 rounded bg-black/10 px-2 py-0.5 text-xs font-bold text-slate-500 border border-black/5">
                LOCKED
              </span>
            )}
            {!disabled && !checked && (
              <span className="inline-flex items-center gap-1 rounded bg-[#28b7a5]/10 px-2 py-0.5 text-xs font-bold text-teal-800 border border-[#28b7a5]/20 animate-pulse">
                🔓 READY
              </span>
            )}
            {checked && (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-500/30">
                ✓ COMPLETED
              </span>
            )}
          </div>
          
          <h4
            onClick={() => { if (!disabled) onToggle(milestone.id); }}
            className={`mt-3 text-lg font-extrabold transition-all duration-200 cursor-pointer ${
              checked ? "text-emerald-800 line-through opacity-75" : "text-slate-900 hover:text-[#286f8f]"
            }`}
          >
            {milestone.title}
          </h4>
          <p className={`mt-1 text-sm leading-relaxed transition-all duration-200 ${
            checked ? "text-emerald-800/70" : "text-slate-600"
          }`}>
            {milestone.detail}
          </p>
        </div>
      </div>

      {/* More Information toggle button */}
      {hasPrereqs && !disabled && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-2 self-start rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            expanded
              ? "bg-[#28b7a5]/10 text-teal-800 border border-[#28b7a5]/20"
              : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900"
          }`}
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
          {expanded ? "Hide Details" : "More Information"}
          <span className={`text-[10px] font-semibold rounded-full px-1.5 py-0.5 ml-1 ${
            expanded ? "bg-[#28b7a5]/20 text-teal-900" : "bg-slate-200 text-slate-600"
          }`}>
            {milestone.prerequisites.length} steps
          </span>
        </button>
      )}

      {/* Expandable sub-goals section */}
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          maxHeight: expanded ? `${milestone.prerequisites?.length * 100 + 80}px` : "0px",
          opacity: expanded ? 1 : 0,
        }}
      >
        <div className="border-t border-black/10 pt-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            <span>Sub-goals to achieve this milestone</span>
            <span className="text-emerald-700">
              {milestone.prerequisites.filter(p => completedMilestones.has(p.id)).length} of {milestone.prerequisites.length} done
            </span>
          </div>
          <div className="grid gap-2">
            {milestone.prerequisites.map((pre, preIdx) => {
              const preChecked = completedMilestones.has(pre.id);
              return (
                <label
                  key={pre.id}
                  onClick={() => { if (!disabled) onToggle(pre.id); }}
                  className={`flex items-start gap-3 rounded-lg border p-3 transition-all duration-300 ${
                    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  } ${
                    preChecked
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-950 shadow-inner"
                      : "border-black/5 bg-black/5 hover:border-black/10 hover:bg-black/10 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mt-0.5 shrink-0">
                    <span className="text-xs font-bold text-slate-500 w-4 text-center">{preIdx + 1}</span>
                    <div
                       className={`custom-checkbox shrink-0 ${preChecked ? "checked" : ""} ${disabled ? "disabled" : ""}`}
                    >
                      <div className="custom-checkbox-checkmark" />
                    </div>
                  </div>
                  <span>
                    <span className={`block text-sm font-bold transition-all duration-200 ${
                      preChecked ? "text-emerald-800 line-through opacity-75" : "text-slate-900"
                    }`}>
                      {pre.title}
                    </span>
                    <span className={`mt-0.5 block text-xs transition-all duration-200 ${
                      preChecked ? "text-emerald-700/60" : "text-slate-500"
                    }`}>
                      {pre.detail}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}



function TieredList({ title, items, renderItem }) {
  return (
    <Panel className="border-l-4 border-l-ocean">
      <SectionHeader kicker="Filtered by financial tier" title={title} description="These update instantly when the tier toggle changes." />
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div key={item.id}>{renderItem(item)}</div>
        ))}
      </div>
    </Panel>
  );
}

function CourseCard({ item, overlapReason }) {
  return (
    <div className="relative">
      <InfoCard title={item.name} meta={item.semester} body={item.reason} />
      {overlapReason && (
        <span className="absolute top-4 right-4 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-rose-700 shadow-sm animate-pulse">
          Priority: {overlapReason}
        </span>
      )}
    </div>
  );
}

function InternshipCard({ item }) {
  return <InfoCard title={item.role} meta={item.when} body={`${item.stipendNote} Platforms: ${item.platforms.join(", ")}.`} />;
}

function CertificationCard({ item, checked, onToggle, overlapReason }) {
  return (
    <label
      onClick={() => onToggle(item.id)}
      className={`flex cursor-pointer gap-3 rounded-lg p-4 shadow-sm transition-all duration-300 relative ${
        checked ? "border border-emerald-200 bg-emerald-50/40 shadow-inner" : "card-emerald-glow"
      }`}
    >
      <div
        className={`mt-1 custom-checkbox shrink-0 ${checked ? "checked" : ""}`}
      >
        <div className="custom-checkbox-checkmark" />
      </div>
      <span>
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-coral">{item.platform} - {item.cost} - {item.duration}</span>
        <span className={`mt-2 block font-bold transition-all duration-200 ${checked ? "text-emerald-800 line-through opacity-70" : "text-ink"}`}>{item.name}</span>
        <span className={`mt-2 block text-sm transition-all duration-200 ${checked ? "text-emerald-700/60 opacity-60" : "text-slate-600"}`}>{item.impact}</span>
      </span>
      {overlapReason && (
        <span className="absolute top-4 right-4 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-rose-700 shadow-sm animate-pulse">
          Priority: {overlapReason}
        </span>
      )}
    </label>
  );
}

function AlternatePaths({ paths, selectedAlternate, onSelectAlternate }) {
  const activePath = selectedAlternate || paths[0];
  return (
    <div className="grid gap-5">
      <Panel className="border-l-4 border-l-coral">
        <SectionHeader kicker="Same skills, different routes" title="Alternate paths" description="Click a path to preview a roadmap for that direction." />
        <div className="mt-5 grid gap-3">
          {paths.map((path) => (
            <button
              key={path.id}
              className={`focus-ring rounded-lg border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${
                activePath.id === path.id ? "border-coral bg-[#fff0ea]" : "border-slate-200 bg-white"
              }`}
              type="button"
              onClick={() => onSelectAlternate(path)}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold">{path.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-ocean">{path.salaryRange}</p>
                  <p className="mt-1 text-sm text-slate-600">{path.pivotRequired}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-bold text-coral">{path.skillOverlap}%</p>
                  <p className="text-xs text-slate-500">skill overlap</p>
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-coral" style={{ width: `${path.skillOverlap}%` }} />
              </div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel className="border-l-4 border-l-ocean">
        <SectionHeader kicker="Preview roadmap" title={activePath.title} description={`How to pivot toward a ${activePath.title.toLowerCase()} career path.`} />
        <div className="mt-5 grid gap-3">
          <article className="rounded-lg border border-slate-200 bg-[#f8fbff] p-4">
            <p className="text-sm font-bold text-ocean">First 3 months</p>
            <p className="mt-2 text-sm text-slate-600">Focus on {activePath.pivotRequired.toLowerCase()} and collect two proof-of-work examples.</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-[#f8fbff] p-4">
            <p className="text-sm font-bold text-ocean">Months 4-12</p>
            <p className="mt-2 text-sm text-slate-600">Build one project directly tied to this path and rewrite your resume around that evidence.</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-[#fff8f4] p-4">
            <p className="text-sm font-bold text-coral">Year 2+</p>
            <p className="mt-2 text-sm text-slate-600">Apply for {activePath.title.toLowerCase()} roles with a focused portfolio and interview stories.</p>
          </article>
        </div>
      </Panel>
    </div>
  );
}

function SkillGap({ skillGap, profile, completedMilestones }) {
  const baseUserSkills = profile.skills.filter((s) => s !== "None yet");
  const earnedSkills = skillGap.need.filter((item) => completedMilestones.has(item.milestoneId)).map((item) => item.skill);
  const combinedUserSkills = [...baseUserSkills, ...earnedSkills];

  const remainingNeeds = skillGap.need.filter((item) => !completedMilestones.has(item.milestoneId));

  return (
    <div className="grid gap-5">
      <Panel className="border-l-4 border-l-emerald-500">
        <SectionHeader kicker="Your foundation" title="Already have" description="Skills you selected during onboarding, plus skills you've earned from completed milestones." />
        <div className="mt-5 grid gap-3">
          {combinedUserSkills.length > 0 ? (
            combinedUserSkills.map((skill, index) => (
              <article key={`${skill}-${index}`} className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="h-3 w-3 shrink-0 rounded-full bg-emerald-500" />
                <span className="font-bold text-emerald-800">{skill}</span>
              </article>
            ))
          ) : (
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No skills earned or selected yet.</p>
          )}
        </div>
      </Panel>

      <Panel className="border-l-4 border-l-amber-400">
        <SectionHeader kicker="Skills to acquire" title="Need next" description="Linked to roadmap milestones — complete the milestone to unlock each skill." />
        <div className="mt-5 grid gap-3">
          {remainingNeeds.length > 0 ? (
            remainingNeeds.map((item) => (
              <article
                key={item.skill}
                className="flex items-center gap-3 rounded-lg border border-amber-200 bg-[#fff8ed] p-4 transition"
              >
                <div className="h-3 w-3 shrink-0 rounded-full bg-amber-400" />
                <div>
                  <span className="block font-bold text-amber-900">{item.skill}</span>
                  <span className="mt-1 block text-sm text-slate-600">
                    Complete the linked roadmap milestone to unlock
                  </span>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">All skills acquired!</p>
          )}
        </div>
      </Panel>

      <Panel className="border-l-4 border-l-coral">
        <SectionHeader kicker="How to get there" title="Bridge with" description="Practical steps to close the gap between where you are and where you need to be." />
        <div className="mt-5 grid gap-3">
          {skillGap.bridgingSteps.map((step, i) => (
            <article key={i} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-[#fff8f4] p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral text-xs font-bold text-white">{i + 1}</span>
              <span className="font-bold text-ink">{step}</span>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function ProgressShell({ roadmap, financialTier, progressStats, deepRoadmap }) {
  const baseTotal = getAllMilestones(roadmap).length;
  const deepTotal = deepRoadmap?.weeklyStudyPlan?.length || 0;
  const total = baseTotal + deepTotal;
  const phaseLabels = {
    goalsToAchieve: "Goals achieved",
    shortTerm: "Short-term goals",
    certifications: "Certifications",
    internships: "Internships",
    longTerm: "Long-term goals",
    deepStudy: "Phase 2 Study",
  };

  return (
    <aside className="lg:sticky lg:top-5 lg:self-start">
      <Panel className="overflow-hidden">
        <div className="rounded-lg bg-black/5 p-5 border border-black/5 text-slate-800">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Progress tracker</p>
          <p className="mt-4 text-5xl font-bold">{progressStats.percentage}%</p>
          <p className="mt-2 text-sm text-slate-600">{progressStats.completed} of {progressStats.total} milestones completed.</p>
        </div>
        <div className="mt-5 space-y-4">
          {progressStats.byPhase.map((phase) => (
            <ProgressBar key={phase.phase} label={phaseLabels[phase.phase]} value={phase.percentage} />
          ))}
        </div>
        <div className="mt-5 rounded-lg bg-black/5 border border-black/5 p-4 text-slate-800">
          <p className="text-sm font-bold">Ready milestones</p>
          <p className="mt-1 text-sm text-slate-600">{total} milestones loaded for the {tierLabels[financialTier]} view.</p>
        </div>
        <div className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
          <p className="text-sm font-bold text-emerald-800">How far you have come</p>
          <p className="mt-1 text-sm text-emerald-700">
            {progressStats.latestCompleted
              ? `Latest: ${progressStats.latestCompleted.title}`
              : "Complete your first milestone to start the mini timeline."}
          </p>
        </div>
      </Panel>
    </aside>
  );
}

function Panel({ children, className = "" }) {
  return <div className={`rounded-lg border border-black/8 bg-white/55 p-5 shadow-xl backdrop-blur-md text-slate-800 ${className}`}>{children}</div>;
}

function SectionHeader({ kicker, title, description }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#286f8f]">{kicker}</p>
      <h2 className="mt-2 text-2xl font-extrabold text-slate-900">{title}</h2>
      <p className="mt-2 text-[15px] font-medium text-slate-700 leading-relaxed">{description}</p>
    </div>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <article className="rounded-lg border border-black/8 bg-white/55 p-5 shadow-xl backdrop-blur-md text-slate-800">
      <div className={`mb-4 h-2 w-16 rounded-full ${color}`} />
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-slate-900">{value}</p>
    </article>
  );
}

function InfoCard({ title, meta, body }) {
  return (
    <article className="h-full rounded-lg border border-black/8 bg-white/55 p-4 shadow-sm backdrop-blur-md text-slate-800 transition hover:-translate-y-0.5 hover:shadow-emerald-500/10">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-coral">{meta}</p>
      <h3 className="mt-2 font-extrabold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{body}</p>
    </article>
  );
}

function ProgressBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-sm font-semibold text-slate-700">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-black/10">
        <div className="h-full rounded-full bg-[#28b7a5]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function formatGoalType(goalType) {
  return goalType.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
