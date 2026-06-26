/**
 * CareerMindmapView.jsx
 * Full-screen mindmap view. Replaces DecisionTreeView.
 * Manages: financial tier selector, completedMilestones (from localStorage),
 * selected node popover, zoom controls, legend.
 */

import { useState, useMemo, useCallback } from "react";
import {
  loadCompletedMilestones,
  saveCompletedMilestones,
  loadFinancialTier,
  saveFinancialTier,
} from "../../services/localStorageService";
import { buildMindmapTree, NODE_COLORS } from "../../data/mindmapTreeBuilder";
import CareerMindmap from "./CareerMindmap";
import MindmapNodePopover from "./MindmapNodePopover";

// ─────────────────────────────────────────────────────────
// Legend
// ─────────────────────────────────────────────────────────

const LEGEND = [
  { type: "root",       label: "You (Start)" },
  { type: "path",       label: "Academic Path" },
  { type: "stream",     label: "Stream / Elective" },
  { type: "degree",     label: "Degree" },
  { type: "milestone",  label: "Milestone" },
  { type: "cert",       label: "Certification" },
  { type: "internship", label: "Internship" },
  { type: "goal",       label: "Career Goal" },
  { type: "alternate",  label: "Alternate Path" },
  { type: "skill",      label: "Skills to Build" },
];

const TIER_OPTIONS = [
  { value: "LOW",    label: "Free only",   desc: "Free resources" },
  { value: "MEDIUM", label: "Affordable",  desc: "Low-cost options" },
  { value: "HIGH",   label: "Self-funded", desc: "All options" },
];

// ─────────────────────────────────────────────────────────
// View shell
// ─────────────────────────────────────────────────────────

export default function CareerMindmapView({ profile, roadmap, onGoToDashboard }) {
  // ── State ──
  const [financialTier, setFinancialTier] = useState(
    () => loadFinancialTier() || profile.financialTier || "HIGH"
  );
  const [completedMilestones, setCompletedMilestones] = useState(
    () => new Set(loadCompletedMilestones())
  );
  const [activeNode, setActiveNode] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  // ── Build mindmap tree ──
  const treeData = useMemo(() => {
    return buildMindmapTree(profile, roadmap, completedMilestones);
  }, [profile, roadmap, completedMilestones, financialTier]); // eslint-disable-line

  const handleNodeClick = useCallback((node) => {
    setActiveNode(node);
    setIsLocked(true);
  }, []);

  const handleNodeHover = useCallback((node) => {
    if (!isLocked) {
      setActiveNode(node);
    }
  }, [isLocked]);

  const handleClosePopover = useCallback(() => {
    setIsLocked(false);
    setActiveNode(null);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setIsLocked(false);
    setActiveNode(null);
  }, []);

  // ── Completion toggle ──
  const handleToggleComplete = useCallback((milestoneId) => {
    setCompletedMilestones(current => {
      const next = new Set(current);
      if (next.has(milestoneId)) {
        next.delete(milestoneId);
        // Cascade uncheck subsequent milestones
        const mainMs = roadmap?.goalsToAchieve?.milestones || [];
        const idx = mainMs.findIndex(m => m.id === milestoneId);
        if (idx !== -1) {
          for (let i = idx + 1; i < mainMs.length; i++) {
            next.delete(mainMs[i].id);
            (mainMs[i].prerequisites || []).forEach(p => next.delete(p.id));
          }
        }
      } else {
        next.add(milestoneId);
      }
      saveCompletedMilestones(next);
      return next;
    });
  }, [roadmap]);

  // ── Tier change ──
  const handleTierChange = useCallback((tier) => {
    setFinancialTier(tier);
    saveFinancialTier(tier);
  }, []);

  // ── Progress summary ──
  const { completedCount, totalCount } = useMemo(() => {
    const mainMs = roadmap?.goalsToAchieve?.milestones || [];
    const certs = roadmap?.certifications || [];
    const totalCount = mainMs.length + certs.length;
    const completedCount = [...completedMilestones].filter(id =>
      mainMs.some(m => m.id === id) || certs.some(c => c.id === id)
    ).length;
    return { completedCount, totalCount };
  }, [roadmap, completedMilestones]);

  const progressPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const isNodeDisabled = useCallback((nodeId) => {
    if (!nodeId) return false;
    const mainMs = roadmap?.goalsToAchieve?.milestones || [];
    const idx = mainMs.findIndex(m => m.id === nodeId);
    if (idx <= 0) return false;
    
    // All preceding milestones in the full list must be completed
    for (let i = 0; i < idx; i++) {
      if (!completedMilestones.has(mainMs[i].id)) return true;
    }
    return false;
  }, [roadmap, completedMilestones]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#f8fafc", // slate-50 background (off-white)
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Graphik', 'Inter', sans-serif",
      }}
    >
      {/* ── Top bar ── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "12px 20px",
          background: "rgba(255, 255, 255, 0.95)",
          borderBottom: "1px solid #e2e8f0",
          backdropFilter: "blur(12px)",
          flexShrink: 0,
          zIndex: 100,
        }}
      >
        {/* Left — back + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            id="mindmap-back-dashboard"
            onClick={onGoToDashboard}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#0f172a"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#334155"; }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} style={{ width: 14, height: 14 }}>
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </button>

          <div style={{ width: 1, height: 24, background: "#cbd5e1" }} />

          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 1 }}>
              Career GPS
            </p>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.2 }}>
              Career Mindmap
            </h1>
          </div>
        </div>

        {/* Centre — progress bar */}
        <div style={{ flex: 1, maxWidth: 320, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Progress
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a" }}>
              {completedCount}/{totalCount} · {progressPct}%
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 9999, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                borderRadius: 9999,
                background: "linear-gradient(90deg, #7c3aed, #10b981)",
                transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
          </div>
        </div>

        {/* Right — tier selector + legend toggle + instructions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Financial tier */}
          <div style={{ display: "flex", gap: 4 }}>
            {TIER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleTierChange(opt.value)}
                title={opt.desc}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  border: "1px solid",
                  ...(financialTier === opt.value
                    ? { background: "#7c3aed", borderColor: "#7c3aed", color: "#fff" }
                    : { background: "#ffffff", borderColor: "#cbd5e1", color: "#475569" }
                  ),
                }}
                onMouseEnter={e => {
                  if (financialTier !== opt.value) {
                    e.currentTarget.style.background = "#f1f5f9";
                  }
                }}
                onMouseLeave={e => {
                  if (financialTier !== opt.value) {
                    e.currentTarget.style.background = "#ffffff";
                  }
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Legend toggle */}
          <button
            id="mindmap-toggle-legend"
            onClick={() => setShowLegend(s => !s)}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid #cbd5e1",
              background: showLegend ? "#e2e8f0" : "#ffffff",
              color: "#475569",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = showLegend ? "#cbd5e1" : "#f1f5f9"; }}
            onMouseLeave={e => { e.currentTarget.style.background = showLegend ? "#e2e8f0" : "#ffffff"; }}
          >
            Legend
          </button>

          {/* Zoom hint */}
          <span style={{ fontSize: 10, color: "#94a3b8", userSelect: "none", whiteSpace: "nowrap" }}>
            Scroll to zoom · Drag to pan
          </span>
        </div>
      </header>

      {/* ── Canvas area ── */}
      <div style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden" }}>
        {/* Left: SVG Canvas wrapper */}
        <div style={{ flex: 1, position: "relative", height: "100%", overflow: "hidden" }}>
          {/* Mindmap SVG */}
          <CareerMindmap
            treeData={treeData}
            completedMilestones={completedMilestones}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            onCanvasClick={handleCanvasClick}
            activeNode={activeNode}
            profile={profile}
          />

          {/* ── Legend overlay ── */}
          {showLegend && (
            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: 20,
                background: "rgba(255, 255, 255, 0.92)",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "12px 16px",
                backdropFilter: "blur(12px)",
                zIndex: 50,
                minWidth: 180,
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
            >
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 8, marginTop: 0 }}>
                Node Legend
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {LEGEND.map(({ type, label }) => (
                  <div key={type} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 99, background: NODE_COLORS[type], flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 99, background: "#10b981", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>Completed</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 99, background: "#3b82f6", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>In Progress</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 99, background: NODE_COLORS.skill, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>
                    <span style={{ fontSize: 8 }}>n</span> = skills required count
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── User path indicator ── */}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(124, 58, 237, 0.08)",
              border: "1px solid rgba(124, 58, 237, 0.25)",
              borderRadius: 20,
              padding: "4px 14px",
              fontSize: 11,
              fontWeight: 600,
              color: "#6d28d9",
              zIndex: 50,
              backdropFilter: "blur(8px)",
              userSelect: "none",
              boxShadow: "0 2px 10px rgba(124, 58, 237, 0.06)",
            }}
          >
            {profile.name}'s path · {profile.goal?.description || "Career Goal"}
          </div>

          {/* ── Hover-to-select hint ── */}
          {!activeNode && (
            <div
              style={{
                position: "absolute",
                bottom: 20,
                right: 20,
                background: "rgba(255, 255, 255, 0.85)",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: "8px 14px",
                fontSize: 11,
                color: "#64748b",
                zIndex: 50,
                backdropFilter: "blur(8px)",
                userSelect: "none",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
              }}
            >
              Hover over any node to view details
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ width: 380, height: "100%", flexShrink: 0, borderLeft: "1px solid #e2e8f0", zIndex: 60 }}>
          <MindmapNodePopover
            node={activeNode}
            onClose={handleClosePopover}
            onToggleComplete={handleToggleComplete}
            completedMilestones={completedMilestones}
            profile={profile}
            disabled={isNodeDisabled(activeNode?.id)}
          />
        </div>
      </div>
    </div>
  );
}
