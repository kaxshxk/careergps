const STORAGE_KEYS = {
  profile: "career-gps:student-profile",
  roadmap: "career-gps:roadmap",
  financialTier: "career-gps:financial-tier",
  progress: "career-gps:completed-milestones",
  deepRoadmap: "career-gps:deep-roadmap",
  resumeAnalysis: "career-gps:resume-analysis",
  marketIntel: "career-gps:market-intel",
  chatHistory: "career-gps:chat-history",
  mindmapExpanded: "career-gps:mindmap-expanded",
  mindmapZoom: "career-gps:mindmap-zoom",
};

export function saveStudentProfile(profile) {
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
}

export function loadStudentProfile() {
  const raw = localStorage.getItem(STORAGE_KEYS.profile);
  return raw ? JSON.parse(raw) : null;
}

export function saveRoadmap(roadmap) {
  localStorage.setItem(STORAGE_KEYS.roadmap, JSON.stringify(roadmap));
}

export function loadRoadmap() {
  const raw = localStorage.getItem(STORAGE_KEYS.roadmap);
  return raw ? JSON.parse(raw) : null;
}

export function saveFinancialTier(financialTier) {
  localStorage.setItem(STORAGE_KEYS.financialTier, financialTier);
}

export function loadFinancialTier() {
  return localStorage.getItem(STORAGE_KEYS.financialTier);
}

export function saveCompletedMilestones(completedMilestones) {
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify([...completedMilestones]));
}

export function loadCompletedMilestones() {
  const raw = localStorage.getItem(STORAGE_KEYS.progress);
  return raw ? JSON.parse(raw) : [];
}

export function saveDeepRoadmap(deepRoadmap) {
  localStorage.setItem(STORAGE_KEYS.deepRoadmap, JSON.stringify(deepRoadmap));
}

export function loadDeepRoadmap() {
  const raw = localStorage.getItem(STORAGE_KEYS.deepRoadmap);
  return raw ? JSON.parse(raw) : null;
}

export function saveResumeAnalysis(analysis) {
  localStorage.setItem(STORAGE_KEYS.resumeAnalysis, JSON.stringify(analysis));
}

export function loadResumeAnalysis() {
  const raw = localStorage.getItem(STORAGE_KEYS.resumeAnalysis);
  return raw ? JSON.parse(raw) : null;
}

export function saveMarketIntel(intel) {
  localStorage.setItem(STORAGE_KEYS.marketIntel, JSON.stringify(intel));
}

export function loadMarketIntel() {
  const raw = localStorage.getItem(STORAGE_KEYS.marketIntel);
  return raw ? JSON.parse(raw) : null;
}

export function saveChatHistory(history) {
  localStorage.setItem(STORAGE_KEYS.chatHistory, JSON.stringify(history));
}

export function loadChatHistory() {
  const raw = localStorage.getItem(STORAGE_KEYS.chatHistory);
  return raw ? JSON.parse(raw) : [];
}

export function saveMindmapExpandedNodes(nodeIds) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.mindmapExpanded, JSON.stringify([...nodeIds]));
  } catch (e) { /* sessionStorage might not be available */ }
}

export function loadMindmapExpandedNodes() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.mindmapExpanded);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

export function saveMindmapZoom(transform) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.mindmapZoom, JSON.stringify(transform));
  } catch (e) { /* sessionStorage might not be available */ }
}

export function loadMindmapZoom() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.mindmapZoom);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

export function clearCareerGpsStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
    try {
      sessionStorage.removeItem(key);
    } catch (e) {}
  });
}
