/**
 * MindmapNodePopover.jsx
 * Slide-in detail panel shown when a user clicks a mindmap node.
 * Shows: title, type badge, timeline, detail text, required skill tags,
 * completion checkbox (for milestone/goal/cert/internship nodes).
 * Designed for a clean, light theme matching the white background.
 */

import { useEffect, useRef } from "react";
import { NODE_COLORS } from "../../data/mindmapTreeBuilder";

const TYPE_LABELS = {
  root:       "Starting Point",
  path:       "Academic Path",
  stream:     "Stream / Elective",
  degree:     "Degree Programme",
  milestone:  "Milestone",
  cert:       "Certification",
  internship: "Internship",
  goal:       "Career Goal",
  alternate:  "Alternate Path",
  skill:      "Skills to Build",
};

const TIER_BADGES = {
  LOW:    { label: "Free", cls: "bg-emerald-100 text-emerald-800" },
  MEDIUM: { label: "Affordable", cls: "bg-blue-100 text-blue-800" },
  HIGH:   { label: "Self-funded", cls: "bg-purple-100 text-purple-800" },
};

const COMPLETABLE_TYPES = new Set(["milestone", "goal", "cert", "internship"]);

export default function MindmapNodePopover({ node, onClose, onToggleComplete, completedMilestones, profile, disabled }) {
  const panelRef = useRef(null);
  
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  if (!node) {
    return (
      <div
        className="h-full w-full flex flex-col justify-center items-center px-8 py-12 text-center"
        style={{
          background: "linear-gradient(160deg, #ffffff 0%, #f8fafc 100%)",
          height: "100%",
          fontFamily: "'Graphik', 'Inter', sans-serif",
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{ background: "rgba(124, 58, 237, 0.06)", border: "1px solid rgba(124, 58, 237, 0.15)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth={2} className="w-8 h-8 animate-pulse">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Explore Career Mindmap</h3>
        <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
          Hover over any node in the mindmap to view details, budget tiers, certification pathways, and skills to acquire.
        </p>
        
        {/* Navigation tips */}
        <div className="mt-8 pt-6 border-t border-slate-200/60 w-full text-left space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Navigation Tips</p>
          <div className="flex gap-2.5 items-start text-xs text-slate-600">
            <span className="text-violet-500 font-bold">•</span>
            <span>Click nodes with <strong>+</strong> to expand their immediate next branches.</span>
          </div>
          <div className="flex gap-2.5 items-start text-xs text-slate-600">
            <span className="text-violet-500 font-bold">•</span>
            <span>Drag the canvas to pan, and use scroll wheel to zoom.</span>
          </div>
          <div className="flex gap-2.5 items-start text-xs text-slate-600">
            <span className="text-violet-500 font-bold">•</span>
            <span>Completed milestones highlight in green.</span>
          </div>
        </div>
      </div>
    );
  }

  const color = NODE_COLORS[node.type] || "#6b7280";
  const typeLabel = TYPE_LABELS[node.type] || node.type;
  const isCompleted = completedMilestones?.has(node.id);
  const canComplete = COMPLETABLE_TYPES.has(node.type);
  const tiers = node.financialTiers || [];
  const skills = node.skills || [];
  const prerequisites = node.prerequisites || [];

  // Collect custom stage goals
  const stageGoals = node.stageGoals || [];
  
  // Collect child task goals (milestones, certs, internships from degree/year nodes)
  const taskGoals = [];
  function collectTasks(n) {
    if (!n) return;
    if (n.id !== node.id) {
      if (COMPLETABLE_TYPES.has(n.type)) {
        taskGoals.push(n);
      }
      // Halt traversal if we hit a child path, stream, or degree node
      if (["path", "stream", "degree"].includes(n.type)) {
        return;
      }
    }
    if (n.children) {
      n.children.forEach(collectTasks);
    }
  }
  collectTasks(node);
  
  // Parse multi-line detail
  const detailLines = (node.detail || "").split("\n").filter(Boolean);

  return (
    <div
      ref={panelRef}
      className="relative h-full w-full flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #ffffff 0%, #f8fafc 100%)",
        borderLeft: `4px solid ${color}`,
        boxShadow: `-4px 0 24px rgba(0,0,0,0.03)`,
        animation: "slideInRight 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
        <div className="flex-1 min-w-0">
          {/* Type badge */}
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest mb-3"
            style={{ background: `${color}12`, color, border: `1px solid ${color}30` }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: color }}
            />
            {typeLabel}
          </div>

          {/* Title */}
          <h2
            className="text-xl font-bold leading-tight"
            style={{ color: "#0f172a" }}
          >
            {node.fullTitle || node.label}
          </h2>

          {/* Timeframe */}
          {node.timeframe && (
            <p
              className="mt-1.5 text-sm font-semibold"
              style={{ color: color }}
            >
              {node.timeframe}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 mt-0.5 rounded-full w-8 h-8 flex items-center justify-center transition hover:bg-slate-100"
          style={{ color: "#64748b" }}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#e2e8f0" }} />

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-thin">

        {/* Career Goal Banner */}
        {profile?.goal?.description && (
          <div className="rounded-xl p-3.5 bg-violet-50/50 border border-violet-100/70">
            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600 mb-1">
              Target Career Goal
            </p>
            <p className="text-sm font-bold text-slate-800 leading-snug">
              {profile.goal.description}
            </p>
          </div>
        )}

        {/* Detail text */}
        {detailLines.length > 0 && (
          <div className="space-y-2">
            {detailLines.map((line, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed"
                style={{ color: "#334155" }}
              >
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Stage Goals / Milestones / Tasks */}
        {((stageGoals && stageGoals.length > 0) || (taskGoals && taskGoals.length > 0)) && (
          <div className="space-y-3 pt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Goals for this Stage
            </p>
            
            {/* Custom Stage Goals (school stages) */}
            {stageGoals.length > 0 && (
              <ul className="space-y-2">
                {stageGoals.map((g, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                    <span 
                      className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: color }}
                    />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {/* Task Goals (Certs, Internships, Milestones from degree stages) */}
            {taskGoals.length > 0 && (
              <div className="space-y-2">
                {taskGoals.map((task) => {
                  const isDone = completedMilestones?.has(task.id);
                  return (
                    <div 
                      key={task.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all"
                      style={{
                        background: isDone ? "#f0fdf4" : "#ffffff",
                        borderColor: isDone ? "#10b98130" : "#e2e8f0",
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span 
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: NODE_COLORS[task.type] || "#6b7280" }}
                        />
                        <span className="font-semibold text-slate-700 truncate max-w-[210px]">
                          {task.fullTitle || task.label}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" 
                            style={{ 
                              background: `${NODE_COLORS[task.type]}10`, 
                              color: NODE_COLORS[task.type],
                              border: `1px solid ${NODE_COLORS[task.type]}20`
                            }}>
                        {TYPE_LABELS[task.type] || task.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Financial tiers */}
        {tiers.length > 0 && tiers.length < 3 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
               style={{ color: "#64748b" }}>
              Budget Requirement
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tiers.map(t => (
                <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${TIER_BADGES[t]?.cls}`}>
                  {TIER_BADGES[t]?.label || t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skill tags */}
        {skills.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
               style={{ color: "#64748b" }}>
              Skills Required
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background: `${NODE_COLORS.skill}10`,
                    color: NODE_COLORS.skill,
                    border: `1px solid ${NODE_COLORS.skill}30`,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Prerequisites */}
        {prerequisites.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
               style={{ color: "#64748b" }}>
              Prerequisites
            </p>
            <ul className="space-y-1">
              {prerequisites.map(pre => (
                <li
                  key={pre.id}
                  className="flex items-start gap-2 text-xs"
                  style={{ color: "#475569" }}
                >
                  <span
                    className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />
                  {pre.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alternate path info */}
        {node.type === "alternate" && node.skillOverlap !== undefined && (
          <div
            className="rounded-xl p-4"
            style={{ background: `${NODE_COLORS.alternate}08`, border: `1px solid ${NODE_COLORS.alternate}25` }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold" style={{ color: NODE_COLORS.alternate }}>
                Skill Overlap with Your Path
              </p>
              <span className="text-lg font-bold" style={{ color: NODE_COLORS.alternate }}>
                {node.skillOverlap}%
              </span>
            </div>
            {/* Overlap bar */}
            <div className="rounded-full overflow-hidden" style={{ height: 6, background: "#f1f5f9" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${node.skillOverlap}%`, background: NODE_COLORS.alternate }}
              />
            </div>
            {node.pivotRequired && (
              <p className="mt-3 text-xs" style={{ color: "#475569" }}>
                <span className="font-semibold" style={{ color: "#334155" }}>Pivot: </span>
                {node.pivotRequired}
              </p>
            )}
          </div>
        )}

        {/* Certification extra info */}
        {node.type === "cert" && node.platform && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Platform", value: node.platform },
              { label: "Cost", value: node.cost },
              { label: "Duration", value: node.timeframe },
              { label: "Impact", value: node.impact },
            ].filter(f => f.value).map(f => (
              <div key={f.label}
                className="rounded-lg p-3"
                style={{ background: `${NODE_COLORS.cert}08`, border: `1px solid ${NODE_COLORS.cert}20` }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
                   style={{ color: color }}>
                  {f.label}
                </p>
                <p className="text-xs font-semibold" style={{ color: "#334155" }}>
                  {f.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Internship extra info */}
        {node.type === "internship" && node.platforms && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
               style={{ color: "#64748b" }}>
              Where to Apply
            </p>
            <div className="flex flex-wrap gap-1.5">
              {node.platforms.map((p, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: `${NODE_COLORS.internship}0c`, color: NODE_COLORS.internship, border: `1px solid ${NODE_COLORS.internship}25` }}
                >
                  {p}
                </span>
              ))}
            </div>
            {node.stipendNote && (
              <p className="mt-3 text-xs" style={{ color: "#475569" }}>
                {node.stipendNote}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Completion toggle footer */}
      {canComplete && (
        <>
          <div style={{ height: 1, background: "#e2e8f0" }} />
          <div className="px-6 py-4">
            <button
              id={`mindmap-complete-${node.id}`}
              disabled={disabled}
              onClick={() => { if (!disabled) onToggleComplete(node.id); }}
              className={`w-full flex items-center justify-center gap-3 rounded-xl py-3 px-4 font-semibold text-sm transition-all duration-200 ${
                disabled 
                  ? "opacity-50 cursor-not-allowed" 
                  : "active:scale-[0.98]"
              }`}
              style={disabled
                ? { background: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0" }
                : isCompleted
                ? { background: "#dcfce7", color: "#15803d", border: "1px solid #10b981" }
                : { background: `${color}12`, color, border: `1px solid ${color}35` }
              }
            >
              {disabled ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                    <rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Milestone Locked
                </>
              ) : isCompleted ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Completed — click to undo
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <circle cx={12} cy={12} r={10} />
                    <path d="M12 8v4l2 2" strokeLinecap="round" />
                  </svg>
                  Mark as Complete
                </>
              )}
            </button>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              {disabled 
                ? "Complete all preceding milestones to unlock this goal" 
                : "Completion syncs with your Goals dashboard"
              }
            </p>
          </div>
        </>
      )}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
