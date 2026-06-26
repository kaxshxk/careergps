/**
 * CareerMindmap.jsx
 * Core SVG mindmap canvas using D3 for horizontal tree layout + zoom/pan.
 * Renders the full academic-to-career pathway as a NotebookLM-style
 * horizontal mindmap with curved Bezier connectors and animated nodes.
 * Features collapsible nodes and a beautiful white background.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import * as d3 from "d3";
import { saveMindmapExpandedNodes, loadMindmapExpandedNodes, saveMindmapZoom, loadMindmapZoom } from "../../services/localStorageService";
import { NODE_COLORS } from "../../data/mindmapTreeBuilder";

// ─────────────────────────────────────────────────────────
// Layout constants
// ─────────────────────────────────────────────────────────

const NODE_W = 160;
const NODE_H = 44;
const NODE_R = 10;
const H_GAP = 90;   // horizontal gap between depth levels
const V_GAP = 22;   // vertical gap between sibling nodes

// ─────────────────────────────────────────────────────────
// Colour helpers
// ─────────────────────────────────────────────────────────

function getNodeFill(d) {
  const { type, status } = d.data;
  if (status === "done") return "#f0fdf4"; // emerald-50 (light green)
  const base = NODE_COLORS[type] || "#6b7280";
  return `${base}0c`; // extremely soft pastel fill
}

function getNodeStroke(d) {
  const { type, status } = d.data;
  if (status === "done") return "#10b981"; // emerald-500
  const base = NODE_COLORS[type] || "#6b7280";
  if (status === "in_progress") return "#3b82f6"; // blue-500
  return `${base}90`;
}

function getTextColor(d) {
  const { status } = d.data;
  if (status === "done") return "#15803d"; // emerald-700
  if (status === "in_progress") return "#1d4ed8"; // blue-700
  return "#0f172a"; // slate-900
}

function getSubtextColor(d) {
  const { status } = d.data;
  if (status === "done") return "#16a34a"; // emerald-600
  if (status === "in_progress") return "#2563eb"; // blue-600
  return "#475569"; // slate-600
}

function getNodeOpacity(d) {
  return d.data.isUserPath ? 1 : 0.45;
}

// ─────────────────────────────────────────────────────────
// D3 tree renderer
// ─────────────────────────────────────────────────────────

function getInitialExpandedNodeIds(treeData, userStage) {
  const expanded = new Set();
  if (!treeData) return expanded;

  // Always expand the root node
  expanded.add("mindmap-root");


  // For each stage, we expand only up to the immediate "current position" level
  // so the user sees their next step — not 2 levels ahead.


  if (userStage === "CLASS_7_8") {
    // Expand root → 8th grade node only (1 level deep)
    if (treeData.children) {
      treeData.children.forEach(child => {
        if (child.id && child.id.includes("8th-grade")) {
          expanded.add(child.id);
          // Don't expand 8th grade's children automatically
        }
      });
    }
    return expanded;
  }

  if (userStage === "CLASS_9_10") {
    // Expand root → 9th grade node only
    if (treeData.children) {
      treeData.children.forEach(child => {
        if (child.id && child.id.includes("9th-grade")) {
          expanded.add(child.id);
        }
      });
    }
    return expanded;
  }

  if (userStage === "CLASS_11_12") {
    // Expand root → path nodes (CBSE/Inter/Diploma) only
    // The streams (PCM, PCB, MPC etc.) stay collapsed until user clicks
    if (treeData.children) {
      treeData.children.forEach(child => {
        if (child.isUserPath && child.type === "path") {
          expanded.add(child.id);
          // Expand the stream level too since CLASS_11_12 starts at stream
          if (child.children) {
            child.children.forEach(stream => {
              if (stream.isUserPath && stream.type === "stream") {
                expanded.add(stream.id);
                // Open the 11th grade node for user's stream
                if (stream.children) {
                  stream.children.forEach(gradeNode => {
                    if (gradeNode.id && gradeNode.id.includes("11th") && gradeNode.isUserPath) {
                      expanded.add(gradeNode.id);
                    }
                  });
                }
              }
            });
          }
        } else if (child.isUserPath) {
          expanded.add(child.id);
        }
      });
    }
    return expanded;
  }

  if (userStage === "UNDERGRADUATE") {
    // Expand root → degree nodes only (not year-1 inside degree)
    if (treeData.children) {
      treeData.children.forEach(child => {
        if (child.isUserPath && child.type === "degree" && !child.id.includes("year-")) {
          expanded.add(child.id);
        }
      });
    }
    return expanded;
  }

  if (userStage === "POSTGRADUATE") {
    // Expand root → PG degree nodes only
    if (treeData.children) {
      treeData.children.forEach(child => {
        if (child.isUserPath && child.type === "degree") {
          expanded.add(child.id);
        }
      });
    }
    return expanded;
  }

  if (userStage === "WORKING") {
    // Expand root → working root path only
    if (treeData.children) {
      treeData.children.forEach(child => {
        if (child.id && child.id.includes("working-root-path")) {
          expanded.add(child.id);
        }
      });
    }
    return expanded;
  }

  return expanded;
}

export default function CareerMindmap({ treeData, completedMilestones, onNodeClick, onNodeHover, activeNode, profile }) {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const [dimensions, setDimensions] = useState({ w: 1200, h: 800 });

  // Track expanded node IDs
  const [expandedNodeIds, setExpandedNodeIds] = useState(() => {
    const saved = loadMindmapExpandedNodes();
    return saved ? new Set(saved) : new Set(["mindmap-root"]);
  });

  // Update expandedNodeIds when treeData is loaded or changed to automatically expand where the user is
  const lastTreeDataRef = useRef(null);
  const zoomTransformRef = useRef(null);
  const zoomRef = useRef(null);
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (treeData && treeData !== lastTreeDataRef.current) {
      lastTreeDataRef.current = treeData;
      setExpandedNodeIds(prev => {
        const next = new Set(prev);
        const autoExpanded = getInitialExpandedNodeIds(treeData, profile?.stage || "CLASS_11_12");
        autoExpanded.forEach(id => next.add(id));
        next.add("mindmap-root");
        return next;
      });
    }
  }, [treeData, profile]);

  // Persist expandedNodeIds to sessionStorage for cross-navigation survival
  useEffect(() => {
    saveMindmapExpandedNodes(expandedNodeIds);
  }, [expandedNodeIds]);


  // Track container size
  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      for (const e of entries) {
        setDimensions({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    obs.observe(el);
    setDimensions({ w: el.clientWidth, h: el.clientHeight });
    return () => obs.disconnect();
  }, []);

  // ── Build D3 hierarchy from the flat tree data object, filtering non-expanded nodes ──
  const buildHierarchy = useCallback(() => {
    if (!treeData) return null;
    return d3.hierarchy(treeData, d => {
      if (!expandedNodeIds.has(d.id)) {
        return null; // children are hidden if node is not expanded
      }
      return d.children?.length ? d.children : null;
    });
  }, [treeData, expandedNodeIds]);

  // ── Highlight active node and related path ──
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (svg.empty() || !treeData) return;

    // Find related node IDs (ancestors & descendants of activeNode)
    const relatedIds = new Set();
    if (activeNode) {
      const tempRoot = d3.hierarchy(treeData);
      const activeD3Node = tempRoot.descendants().find(n => n.data.id === activeNode.id);
      if (activeD3Node) {
        activeD3Node.ancestors().forEach(n => relatedIds.add(n.data.id));
        activeD3Node.descendants().forEach(n => relatedIds.add(n.data.id));
      }
    }

    // Update node opacities
    svg.selectAll(".node")
      .transition().duration(200)
      .attr("opacity", d => {
        if (activeNode) {
          return relatedIds.has(d.data.id) ? 1.0 : 0.15;
        }
        return d.data.isUserPath ? 1.0 : 0.25;
      });

    // Update link colors/opacities
    svg.selectAll(".link")
      .transition().duration(200)
      .attr("stroke", d => {
        const color = NODE_COLORS[d.target.data.type] || "#6b7280";
        if (activeNode) {
          const isRelated = relatedIds.has(d.target.data.id) && relatedIds.has(d.source.data.id);
          return isRelated ? `${color}cc` : `${color}08`;
        }
        const opacity = d.target.data.isUserPath ? "77" : "12";
        return `${color}${opacity}`;
      })
      .attr("stroke-width", d => {
        const baseWidth = d.source.depth === 0 ? 2.5 : 1.5;
        if (activeNode) {
          const isRelated = relatedIds.has(d.target.data.id) && relatedIds.has(d.source.data.id);
          return isRelated ? baseWidth + 1.2 : baseWidth;
        }
        return d.target.data.isUserPath ? baseWidth + 0.5 : baseWidth;
      });
  }, [activeNode, treeData]);

  // ── Main render effect ──
  useEffect(() => {
    if (!svgRef.current || !treeData) return;

    const { w, h } = dimensions;
    const root = buildHierarchy();
    if (!root) return;

    // D3 horizontal tree layout
    const treeLayout = d3.tree()
      .nodeSize([NODE_H + V_GAP, NODE_W + H_GAP])
      .separation((a, b) => a.parent === b.parent ? 1.2 : 1.8);

    treeLayout(root);

    // Rotate: d3 tree is top-to-bottom by default; swap x↔y for left-to-right
    root.each(d => {
      const tmp = d.x;
      d.x = d.y;
      d.y = tmp;
    });

    // Compute bounding box
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    root.each(d => {
      minX = Math.min(minX, d.x);
      maxX = Math.max(maxX, d.x);
      minY = Math.min(minY, d.y);
      maxY = Math.max(maxY, d.y);
    });

    const treeWidth  = maxX - minX + NODE_W + 80;
    const treeHeight = maxY - minY + NODE_H + 80;

    // SVG setup
    const svg = d3.select(svgRef.current);
    // Capture current zoom transform before clearing
    if (svgRef.current && !isFirstRenderRef.current) {
      try {
        zoomTransformRef.current = d3.zoomTransform(svgRef.current);
      } catch (e) { /* no transform yet */ }
    }
    svg.selectAll("*").remove();
    svg.attr("width", "100%").attr("height", "100%")
       .attr("viewBox", `0 0 ${w} ${h}`);

    // ── Defs: filters, gradients, dot pattern ──
    const defs = svg.append("defs");

    // Glow filter (soft drop shadow/glow for active nodes)
    const filter = defs.append("filter").attr("id", "glow").attr("x", "-40%").attr("y", "-40%").attr("width", "180%").attr("height", "180%");
    filter.append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 1.5)
      .attr("stdDeviation", 3)
      .attr("flood-color", "#000000")
      .attr("flood-opacity", 0.08);

    // Completion shadow
    const filterGreen = defs.append("filter").attr("id", "glow-green").attr("x", "-40%").attr("y", "-40%").attr("width", "180%").attr("height", "180%");
    filterGreen.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur2");
    const feMerge2 = filterGreen.append("feMerge");
    feMerge2.append("feMergeNode").attr("in", "blur2");
    feMerge2.append("feMergeNode").attr("in", "SourceGraphic");

    // Dot grid pattern for light background
    const patternId = "dot-grid";
    const pat = defs.append("pattern")
      .attr("id", patternId)
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 28).attr("height", 28);
    pat.append("circle").attr("cx", 1).attr("cy", 1).attr("r", 0.8)
       .attr("fill", "rgba(0,0,0,0.06)");

    // Node gradient per type
    Object.entries(NODE_COLORS).forEach(([type, color]) => {
      const grad = defs.append("linearGradient")
        .attr("id", `grad-${type}`)
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "100%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", 0.12);
      grad.append("stop").attr("offset", "100%").attr("stop-color", color).attr("stop-opacity", 0.04);
    });

    // ── White Background ──
    svg.append("rect")
      .attr("width", "100%").attr("height", "100%")
      .attr("fill", "#ffffff");
    svg.append("rect")
      .attr("width", "100%").attr("height", "100%")
      .attr("fill", `url(#${patternId})`);

    // ── Zoomable group ──
    const g = svg.append("g")
      .attr("transform", `translate(${60 - minX}, ${40 - minY})`)
      .attr("ref", gRef);

    // ── Zoom behaviour ──
    const zoom = d3.zoom()
      .scaleExtent([0.3, 2.5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        // Save zoom state for cross-navigation persistence
        zoomTransformRef.current = event.transform;
        saveMindmapZoom({ k: event.transform.k, x: event.transform.x, y: event.transform.y });
      });
    svg.call(zoom);
    zoomRef.current = zoom;

    // Restore saved zoom transform, or use initial position on first render
    if (zoomTransformRef.current && !isFirstRenderRef.current) {
      svg.call(zoom.transform, zoomTransformRef.current);
    } else {
      // Check sessionStorage for cross-navigation persistence
      const savedZoom = loadMindmapZoom();
      if (savedZoom) {
        const restored = d3.zoomIdentity.translate(savedZoom.x, savedZoom.y).scale(savedZoom.k);
        svg.call(zoom.transform, restored);
        zoomTransformRef.current = restored;
      } else {
        // First render: center on root
        const initialTransform = d3.zoomIdentity.translate(80 - minX, h / 2 - (minY + maxY) / 2);
        svg.call(zoom.transform, initialTransform);
        zoomTransformRef.current = initialTransform;
      }
    }
    isFirstRenderRef.current = false;

    // ── Links (curved Bezier) ──
    g.selectAll(".link")
      .data(root.links())
      .join("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", d => {
        const color = NODE_COLORS[d.target.data.type] || "#6b7280";
        const opacity = d.target.data.isUserPath ? "77" : "25";
        return `${color}${opacity}`;
      })
      .attr("stroke-width", d => {
        const baseWidth = d.source.depth === 0 ? 2.5 : 1.5;
        return d.target.data.isUserPath ? baseWidth + 0.5 : baseWidth;
      })
      .attr("stroke-dasharray", d => d.target.data.type === "alternate" ? "5,4" : null)
      .attr("d", d => {
        const sx = d.source.x + NODE_W; // Link starts at the right edge of parent
        const sy = d.source.y + NODE_H / 2;
        const tx = d.target.x;          // Link ends at the left edge of child
        const ty = d.target.y + NODE_H / 2;
        const midX = (sx + tx) / 2;
        return `M${sx},${sy} C${midX},${sy} ${midX},${ty} ${tx},${ty}`;
      })
      .attr("opacity", 0)
      .transition().duration(600).delay((d, i) => i * 12)
      .attr("opacity", 1);

    // ── Node groups ──
    const nodeG = g.selectAll(".node")
      .data(root.descendants())
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .attr("cursor", "pointer")
      .attr("opacity", 0)
      .on("mousedown", (event) => {
        event.stopPropagation();
      })
      .on("click", (event, d) => {
        event.stopPropagation();
        
        // Collapse/expand on click if node has children in the original tree structure
        if (d.data.children && d.data.children.length > 0) {
          setExpandedNodeIds(prev => {
            const next = new Set(prev);
            if (next.has(d.data.id)) {
              // Collapse: recursively remove this node and all its descendants
              const toRemove = [];
              function collectDescendants(n) {
                toRemove.push(n.id);
                if (n.children) {
                  n.children.forEach(collectDescendants);
                }
              }
              collectDescendants(d.data);
              toRemove.forEach(id => next.delete(id));
            } else {
              // Expand: only add this node
              next.add(d.data.id);
            }
            return next;
          });
        }
      });

    nodeG.transition().duration(500).delay((d, i) => i * 18)
      .attr("opacity", d => getNodeOpacity(d));

    // ── Node background rect ──
    nodeG.append("rect")
      .attr("width", d => d.data.type === "root" ? NODE_W + 20 : NODE_W)
      .attr("height", NODE_H)
      .attr("x", d => d.data.type === "root" ? -10 : 0)
      .attr("rx", d => d.data.type === "root" ? 14 : NODE_R)
      .attr("ry", d => d.data.type === "root" ? 14 : NODE_R)
      .attr("fill", getNodeFill)
      .attr("stroke", getNodeStroke)
      .attr("stroke-width", d => d.data.type === "root" ? 2.5 : d.data.status === "done" ? 2 : 1.5)
      .attr("filter", d => d.data.status === "done" ? "url(#glow-green)" : "url(#glow)")
      .on("mouseenter", function(event, d) {
        onNodeHover(d.data); // Trigger hover update!
        
        const color = NODE_COLORS[d.data.type] || "#6b7280";
        d3.select(this)
          .transition().duration(150)
          .attr("stroke-width", 2.5)
          .attr("stroke", color)
          .attr("fill", d.data.status === "done" ? "#e6fced" : `${color}16`);
      })
      .on("mouseleave", function(event, d) {
        d3.select(this)
          .transition().duration(150)
          .attr("stroke-width", d.data.type === "root" ? 2.5 : d.data.status === "done" ? 2 : 1.5)
          .attr("stroke", getNodeStroke(d))
          .attr("fill", getNodeFill(d));
      });

    // ── Type indicator dot ──
    nodeG.append("circle")
      .attr("cx", 16)
      .attr("cy", NODE_H / 2)
      .attr("r", 4)
      .attr("fill", d => {
        if (d.data.status === "done") return "#10b981"; // emerald-500
        return NODE_COLORS[d.data.type] || "#6b7280";
      })
      .style("pointer-events", "none");

    // ── Completion checkmark (done nodes) ──
    nodeG.filter(d => d.data.status === "done")
      .append("text")
      .attr("x", NODE_W - 18)
      .attr("y", NODE_H / 2 + 1)
      .attr("dominant-baseline", "middle")
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("font-weight", "bold")
      .attr("fill", "#10b981")
      .text("✓")
      .style("pointer-events", "none");

    // ── Primary label ──
    nodeG.append("text")
      .attr("x", 28)
      .attr("y", NODE_H / 2 - 4)
      .attr("dominant-baseline", "middle")
      .attr("font-family", "'Graphik', 'Inter', sans-serif")
      .attr("font-size", d => d.data.type === "root" ? 12 : 11)
      .attr("font-weight", d => ["root","path","goal"].includes(d.data.type) ? 700 : 600)
      .attr("fill", getTextColor)
      .attr("max-width", NODE_W - 36)
      .text(d => {
        const lbl = d.data.label;
        const maxChars = d.data.type === "root" ? 24 : 18;
        return lbl.length > maxChars ? lbl.slice(0, maxChars - 1) + "…" : lbl;
      })
      .style("pointer-events", "none");

    // ── Timeframe sub-label ──
    nodeG.filter(d => d.data.timeframe && d.data.type !== "root")
      .append("text")
      .attr("x", 28)
      .attr("y", NODE_H / 2 + 9)
      .attr("dominant-baseline", "middle")
      .attr("font-family", "'Graphik', 'Inter', sans-serif")
      .attr("font-size", 9)
      .attr("font-weight", 400)
      .attr("fill", getSubtextColor)
      .text(d => {
        const t = d.data.timeframe;
        return t.length > 20 ? t.slice(0, 18) + "…" : t;
      })
      .style("pointer-events", "none");

    // ── Skills badge (node has skills) ──
    nodeG.filter(d => d.data.skills?.length > 0)
      .append("circle")
      .attr("cx", NODE_W - 14)
      .attr("cy", 8)
      .attr("r", 6)
      .attr("fill", NODE_COLORS.skill)
      .attr("opacity", 0.9)
      .style("pointer-events", "none");

    nodeG.filter(d => d.data.skills?.length > 0)
      .append("text")
      .attr("x", NODE_W - 14)
      .attr("y", 8.5)
      .attr("dominant-baseline", "middle")
      .attr("text-anchor", "middle")
      .attr("font-size", 7)
      .attr("font-weight", 800)
      .attr("fill", "#ffffff")
      .text(d => d.data.skills.length)
      .style("pointer-events", "none");

    // ── Collapsible toggle indicator circle on right-edge of nodes ──
    const toggleG = nodeG.filter(d => d.data.children && d.data.children.length > 0)
      .append("g")
      .attr("class", "toggle-button")
      .attr("transform", d => {
        const xPos = d.data.type === "root" ? NODE_W + 10 : NODE_W;
        return `translate(${xPos}, ${NODE_H / 2})`;
      });

    toggleG.append("circle")
      .attr("r", 7)
      .attr("fill", "#ffffff")
      .attr("stroke", getNodeStroke)
      .attr("stroke-width", 1.5);

    toggleG.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", 9)
      .attr("font-weight", "bold")
      .attr("fill", "#475569")
      .text(d => expandedNodeIds.has(d.data.id) ? "-" : "+");

  }, [treeData, dimensions, completedMilestones, buildHierarchy, onNodeClick, expandedNodeIds]);

  return (
    <svg
      ref={svgRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        userSelect: "none",
      }}
    />
  );
}
