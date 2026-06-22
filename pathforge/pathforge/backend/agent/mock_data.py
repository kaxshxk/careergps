# ─── Python mirror of frontend/lib/mockData.ts ───────────────────────────────
# Single source of truth for all MOCK_MODE responses.
# Shapes must match TypeScript interfaces in frontend/lib/types.ts exactly.

from __future__ import annotations
import copy


def detect_role_category(job_title: str) -> str:
    """Return one of 20 role category strings from a free-text job title."""
    t = job_title.lower()

    # ── IT roles ──────────────────────────────────────────────────────────────
    if any(k in t for k in ("machine learning", " ml ", "mlops", "deep learning", " ai engineer", "nlp engineer", "llm engineer", "ai/ml", "ml engineer", "ai researcher")):
        return "ml"
    if any(k in t for k in ("data scientist", "data science", "data analyst", "analytics engineer", "bi analyst", "business intelligence")):
        return "data"
    if any(k in t for k in ("devops", "cloud engineer", "aws engineer", "kubernetes engineer", "infrastructure engineer", "platform engineer", "site reliability", " sre")):
        return "devops"
    if any(k in t for k in ("frontend", "front-end", "front end", "react developer", "vue developer", "angular developer", "ui developer", "ui/ux developer")):
        return "frontend"
    if any(k in t for k in ("backend", "back-end", "back end", "django", "flask developer", "java developer", "spring developer", "rails developer")):
        return "backend"
    if any(k in t for k in ("fullstack", "full stack", "full-stack", "software engineer", "software developer")):
        return "fullstack"

    # ── Non-IT roles ──────────────────────────────────────────────────────────
    if any(k in t for k in ("marketing", "seo specialist", "content manager", "social media manager", "growth hacker", "brand manager", "digital marketing", "copywriter", "campaign manager", "demand generation")):
        return "marketing"
    if any(k in t for k in ("finance", "financial", "investment banker", "portfolio manager", "trading", "auditor", "accountant", "actuar", " cfa", "wealth manager", "credit analyst", "financial planner")):
        return "finance"
    if any(k in t for k in ("design", "designer", "ux designer", "ui designer", "graphic designer", "visual designer", "product designer", "brand designer", "creative director", "ux researcher", "interaction designer")):
        return "design"
    if any(k in t for k in ("nurse", "doctor", "physician", "clinical", "medical", "healthcare", "pharmacist", "therapist", "dentist", "surgeon", "paramedic", "radiologist")):
        return "healthcare"
    if any(k in t for k in ("sales manager", "sales representative", "account executive", "business development", " bdm", "account manager", "sales director", "sales engineer", "revenue operations")):
        return "sales"
    if any(k in t for k in ("legal", "lawyer", "attorney", "legal counsel", "paralegal", "compliance officer", "contract manager", "general counsel", "law clerk", "legal advisor")):
        return "legal"
    if any(k in t for k in ("teacher", "professor", "educator", "instructor", "trainer", "curriculum designer", "e-learning", "learning designer", "tutor", "academic")):
        return "education"
    if any(k in t for k in ("human resources", "hr manager", "hr director", "hr business partner", "recruiter", "talent acquisition", "people operations", "compensation", "payroll manager", "hrbp")):
        return "hr"
    if any(k in t for k in ("operations manager", "supply chain", "logistics manager", "procurement", "project manager", "scrum master", "agile coach", "program manager", "operations director")):
        return "operations"
    if any(k in t for k in ("consultant", "management consultant", "strategy analyst", "advisory", "mckinsey", "bain ", "bcg ", "deloitte", "strategy consultant")):
        return "consulting"
    if any(k in t for k in ("content creator", "journalist", "editor", "videographer", "youtuber", "podcaster", "media producer", "blogger", "content strategist", "social media creator")):
        return "content"
    if any(k in t for k in ("founder", "entrepreneur", "co-founder", "chief executive officer", " ceo", "solopreneur", "startup founder", "product manager")):
        return "entrepreneurship"

    # ── IT catch-all ──────────────────────────────────────────────────────────
    if any(k in t for k in ("developer", "engineer", "programmer", "coder", "architect", "python", "javascript", "java ", "node.js")):
        return "fullstack"

    return "general_non_it"


# keep old name as alias so nothing else breaks
_detect_role = detect_role_category


# ─── Role profiles ────────────────────────────────────────────────────────────

_PROFILES: dict = {
    "frontend": {
        "description": (
            "Design and build high-performance web interfaces using modern JavaScript "
            "frameworks. Own the user experience layer, partner with designers, and "
            "drive front-end architecture decisions."
        ),
        "dailyOps": [
            "Build React components and design-system primitives",
            "Collaborate with UX designers on interaction patterns",
            "Optimize Core Web Vitals and bundle size",
            "Write unit and integration tests with Jest / Testing Library",
            "Review pull requests and mentor junior engineers",
        ],
        "agentAnalysis": (
            "Based on analysis of 31 active job postings, this role strongly favors "
            "engineers with proven TypeScript fluency and performance optimization experience. "
            "Accessibility (WCAG 2.1 AA) and testing coverage are rising requirements.\n\n"
            "Key insight: 68% of postings mention state-management skills (Redux/Zustand), "
            "while 54% now explicitly require end-to-end testing (Cypress/Playwright)."
        ),
        "marketSignal": {"value": 28, "trend": "up"},
        "marketTrendSparkline": [22, 24, 23, 28, 30, 27, 35, 38, 36, 44, 50, 58],
        "confidenceScore": 91.4,
        "compensationTiers": [
            {"level": "Entry",  "range": "$90K - $120K"},
            {"level": "Mid",    "range": "$120K - $165K"},
            {"level": "Senior", "range": "$165K - $230K"},
        ],
        "skillFrequency": [
            {"skill": "React / Next.js",     "percentage": 94},
            {"skill": "TypeScript",          "percentage": 89},
            {"skill": "CSS / Tailwind",      "percentage": 82},
            {"skill": "Jest / RTL",          "percentage": 71},
            {"skill": "GraphQL / REST",      "percentage": 65},
            {"skill": "Vite / Webpack",      "percentage": 58},
            {"skill": "Accessibility",       "percentage": 52},
            {"skill": "Cypress / Playwright","percentage": 44},
        ],
        "skillCategories": [
            {
                "name": "Technical Skills",
                "skills": [
                    {"id": "react",         "name": "React",           "proficiency": 80, "match": 94, "status": "good",    "description": "Core framework for building interactive UIs at scale"},
                    {"id": "typescript",    "name": "TypeScript",      "proficiency": 65, "match": 89, "status": "good",    "description": "Static typing that prevents runtime bugs in large codebases"},
                    {"id": "nextjs",        "name": "Next.js",         "proficiency": 45, "match": 82, "status": "partial", "description": "SSR/SSG framework powering most production React apps"},
                    {"id": "css-tailwind",  "name": "CSS / Tailwind",  "proficiency": 78, "match": 82, "status": "good",    "description": "Utility-first styling adopted by 70% of new projects"},
                    {"id": "jest-rtl",      "name": "Jest / RTL",      "proficiency": 38, "match": 71, "status": "partial", "description": "Unit and integration tests required at most product companies"},
                    {"id": "graphql",       "name": "GraphQL",         "proficiency": 18, "match": 55, "status": "learn",   "description": "Flexible query language replacing REST in API-heavy products"},
                ],
            },
            {
                "name": "Soft Skills",
                "skills": [
                    {"id": "ux-collab",     "name": "UX Collaboration",       "proficiency": 72, "match": 78, "status": "good",    "description": "Partner with designers to build polished, accessible interfaces"},
                    {"id": "code-review",   "name": "Code Review",             "proficiency": 65, "match": 72, "status": "good",    "description": "Constructive reviews catch bugs early and raise team quality"},
                    {"id": "estimation",    "name": "Sprint Estimation",        "proficiency": 48, "match": 58, "status": "partial", "description": "Accurate sizing helps teams plan and avoid crunch"},
                    {"id": "written-comm",  "name": "Written Communication",    "proficiency": 60, "match": 62, "status": "good",    "description": "Clear async writing is essential in distributed teams"},
                ],
            },
            {
                "name": "Core Concepts",
                "skills": [
                    {"id": "a11y",            "name": "Web Accessibility (a11y)",   "proficiency": 28, "match": 65, "status": "partial", "description": "WCAG compliance is required at most enterprise companies"},
                    {"id": "perf-opt",        "name": "Performance Optimization",   "proficiency": 42, "match": 68, "status": "partial", "description": "Core Web Vitals directly affect SEO and user retention"},
                    {"id": "browser-internals","name": "Browser Internals",         "proficiency": 55, "match": 60, "status": "partial", "description": "Rendering and event-loop knowledge enables expert debugging"},
                ],
            },
            {
                "name": "Tools and Platforms",
                "skills": [
                    {"id": "vite-webpack",   "name": "Vite / Webpack",          "proficiency": 44, "match": 58, "status": "partial", "description": "Bundler config shapes build speed and developer experience"},
                    {"id": "cypress",        "name": "Cypress / Playwright",    "proficiency": 12, "match": 44, "status": "learn",   "description": "End-to-end testing is a top-10 requirement in job listings"},
                    {"id": "figma",          "name": "Figma",                   "proficiency": 52, "match": 55, "status": "partial", "description": "Design handoff tool used by virtually every product team"},
                ],
            },
        ],
        "roadmap": [
            {
                "title": "Month 01 — React & TypeScript Deep Dive",
                "weeks": [
                    {
                        "label": "Week 01", "skill": "TypeScript",
                        "tasks": [
                            {"id": "1", "title": "TypeScript fundamentals course",        "source": "Execute Program",  "duration": "~5H", "completed": True},
                            {"id": "2", "title": "Convert JS project to strict TS",      "source": "Project",          "duration": "~4H", "completed": True,  "badges": ["Project"]},
                            {"id": "3", "title": "Generics and utility types workshop",  "source": "Total TypeScript", "duration": "~3H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 02", "skill": "React Patterns",
                        "tasks": [
                            {"id": "4", "title": "React hooks in depth",              "source": "ui.dev",         "duration": "~4H", "completed": False, "isToday": True},
                            {"id": "5", "title": "Build reusable component library",  "source": "Project",        "duration": "~6H", "completed": False, "badges": ["Project", "Resume+"]},
                            {"id": "6", "title": "Performance profiling lab",         "source": "Chrome DevTools","duration": "~2H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 03", "skill": "State Management",
                        "tasks": [
                            {"id": "f03-1", "title": "Zustand state management deep dive",    "source": "Zustand Docs",    "duration": "~3H", "completed": False},
                            {"id": "f03-2", "title": "Build global cart with Zustand",        "source": "Project",         "duration": "~4H", "completed": False, "badges": ["Project"]},
                            {"id": "f03-3", "title": "Redux Toolkit vs Zustand trade-offs",   "source": "Blog",            "duration": "~2H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 04", "skill": "CSS & Tailwind",
                        "tasks": [
                            {"id": "f04-1", "title": "Tailwind CSS advanced patterns",        "source": "Tailwind Docs",   "duration": "~4H", "completed": False},
                            {"id": "f04-2", "title": "Build responsive design system",        "source": "Project",         "duration": "~5H", "completed": False, "badges": ["Project"]},
                            {"id": "f04-3", "title": "CSS animations and transitions",        "source": "MDN",             "duration": "~2H", "completed": False},
                        ],
                    },
                ],
            },
            {
                "title": "Month 02 — Testing & Accessibility",
                "weeks": [
                    {
                        "label": "Week 05", "skill": "Testing",
                        "tasks": [
                            {"id": "7", "title": "Jest & Testing Library fundamentals", "source": "Kent C. Dodds", "duration": "~5H", "completed": False},
                            {"id": "8", "title": "Cypress end-to-end test suite",      "source": "Project",       "duration": "~6H", "completed": False, "badges": ["Project"]},
                            {"id": "9", "title": "WCAG 2.1 accessibility audit",       "source": "a11y Project",  "duration": "~3H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 06", "skill": "Cypress E2E",
                        "tasks": [
                            {"id": "f06-1", "title": "Cypress component testing setup",       "source": "Cypress Docs",    "duration": "~3H", "completed": False},
                            {"id": "f06-2", "title": "Write full user-flow E2E tests",        "source": "Project",         "duration": "~5H", "completed": False, "badges": ["Project"]},
                            {"id": "f06-3", "title": "CI integration for Cypress tests",      "source": "GitHub Actions",  "duration": "~2H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 07", "skill": "Accessibility",
                        "tasks": [
                            {"id": "f07-1", "title": "ARIA roles and semantic HTML deep dive", "source": "MDN",             "duration": "~4H", "completed": False},
                            {"id": "f07-2", "title": "Axe DevTools audit & fix violations",   "source": "a11y Project",    "duration": "~4H", "completed": False, "badges": ["Project"]},
                            {"id": "f07-3", "title": "Keyboard navigation testing",           "source": "WebAIM",          "duration": "~2H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 08", "skill": "Storybook",
                        "tasks": [
                            {"id": "f08-1", "title": "Storybook component documentation",    "source": "Storybook Docs",  "duration": "~4H", "completed": False},
                            {"id": "f08-2", "title": "Visual regression with Chromatic",     "source": "Chromatic",       "duration": "~3H", "completed": False},
                            {"id": "f08-3", "title": "Design token integration",             "source": "Project",         "duration": "~3H", "completed": False, "badges": ["Project"]},
                        ],
                    },
                ],
            },
            {
                "title": "Month 03 — Next.js & Performance",
                "weeks": [
                    {
                        "label": "Week 09", "skill": "Next.js",
                        "tasks": [
                            {"id": "10", "title": "Next.js App Router deep dive",     "source": "Next.js Docs",  "duration": "~5H", "completed": False},
                            {"id": "11", "title": "Server components vs client",      "source": "Blog",          "duration": "~3H", "completed": False},
                            {"id": "12", "title": "Build production Next.js app",     "source": "Project",       "duration": "~8H", "completed": False, "badges": ["Project", "Resume+"]},
                        ],
                    },
                    {
                        "label": "Week 10", "skill": "API Routes",
                        "tasks": [
                            {"id": "f10-1", "title": "Next.js API routes and Route Handlers", "source": "Next.js Docs",  "duration": "~4H", "completed": False},
                            {"id": "f10-2", "title": "tRPC end-to-end type safety",           "source": "tRPC Docs",     "duration": "~3H", "completed": False},
                            {"id": "f10-3", "title": "Database integration with Prisma",      "source": "Prisma Docs",   "duration": "~4H", "completed": False, "badges": ["Project"]},
                        ],
                    },
                    {
                        "label": "Week 11", "skill": "Performance",
                        "tasks": [
                            {"id": "f11-1", "title": "Core Web Vitals optimization",          "source": "web.dev",       "duration": "~4H", "completed": False},
                            {"id": "f11-2", "title": "Image and font optimization",           "source": "Next.js Docs",  "duration": "~3H", "completed": False},
                            {"id": "f11-3", "title": "Bundle analysis and code splitting",    "source": "webpack-bundle-analyzer", "duration": "~3H", "completed": False, "badges": ["Project"]},
                        ],
                    },
                    {
                        "label": "Week 12", "skill": "Deployment",
                        "tasks": [
                            {"id": "f12-1", "title": "Deploy to Vercel with CI/CD",           "source": "Vercel Docs",   "duration": "~3H", "completed": False},
                            {"id": "f12-2", "title": "Edge functions and middleware",          "source": "Next.js Docs",  "duration": "~3H", "completed": False},
                            {"id": "f12-3", "title": "Full-stack capstone project",            "source": "Project",       "duration": "~8H", "completed": False, "badges": ["Project", "Resume+"]},
                        ],
                    },
                ],
            },
        ],
        "weeklyView": [
            {
                "weekNumber": 1, "dateRange": "May 4 - May 10", "skill": "TypeScript",
                "completionPercentage": 100,
                "tasks": [
                    {"id": "fw1-1", "title": "TypeScript fundamentals course", "description": "Cover types, interfaces, generics, and strict mode configuration", "resource": "Execute Program", "duration": "5h", "type": "Video", "completed": True},
                    {"id": "fw1-2", "title": "Convert JS project to strict TS", "description": "Apply TypeScript to an existing JavaScript codebase", "resource": "Project", "duration": "4h", "type": "Project", "completed": True},
                    {"id": "fw1-3", "title": "Generics and utility types", "description": "Partial, Pick, Omit, Record — master the built-in utility types", "resource": "Total TypeScript", "duration": "3h", "type": "Practice", "completed": True},
                    {"id": "fw1-4", "title": "TypeScript config deep dive", "description": "tsconfig.json, strict flags, and module resolution strategies", "resource": "TypeScript Docs", "duration": "2h", "type": "Reading", "completed": True},
                ],
            },
            {
                "weekNumber": 2, "dateRange": "May 11 - May 17", "skill": "React Patterns",
                "completionPercentage": 50,
                "tasks": [
                    {"id": "fw2-1", "title": "React hooks in depth", "description": "useCallback, useMemo, useReducer — when and why to use each", "resource": "ui.dev", "duration": "4h", "type": "Video", "completed": True},
                    {"id": "fw2-2", "title": "Custom hooks workshop", "description": "Extract logic into reusable hooks and test them in isolation", "resource": "Kent C. Dodds", "duration": "3h", "type": "Practice", "completed": True},
                    {"id": "fw2-3", "title": "Build reusable component library", "description": "Design tokens, compound components, and accessible primitives", "resource": "Project", "duration": "6h", "type": "Project", "completed": False},
                    {"id": "fw2-4", "title": "Performance profiling with Profiler", "description": "Identify and eliminate unnecessary re-renders using React DevTools", "resource": "Chrome DevTools", "duration": "2h", "type": "Practice", "completed": False},
                ],
            },
            {
                "weekNumber": 3, "dateRange": "May 18 - May 24", "skill": "Testing",
                "completionPercentage": 0,
                "tasks": [
                    {"id": "fw3-1", "title": "Jest & Testing Library fundamentals", "description": "render, screen, userEvent — the RTL philosophy and query priority", "resource": "Kent C. Dodds", "duration": "3h", "type": "Video", "completed": False},
                    {"id": "fw3-2", "title": "Test async components and hooks", "description": "waitFor, act(), and MSW for mocking API calls in tests", "resource": "Testing Library Docs", "duration": "3h", "type": "Practice", "completed": False},
                    {"id": "fw3-3", "title": "Cypress end-to-end test suite", "description": "Write full user-flow tests for your component library project", "resource": "Project", "duration": "6h", "type": "Project", "completed": False},
                    {"id": "fw3-4", "title": "WCAG 2.1 accessibility audit", "description": "Audit your components with axe and fix reported violations", "resource": "a11y Project", "duration": "3h", "type": "Practice", "completed": False},
                    {"id": "fw3-5", "title": "Storybook component documentation", "description": "Document each component with stories, controls, and a11y addon", "resource": "Storybook Docs", "duration": "2h", "type": "Reading", "completed": False},
                ],
            },
            {
                "weekNumber": 4, "dateRange": "May 25 - May 31", "skill": "Next.js",
                "completionPercentage": 0,
                "tasks": [
                    {"id": "fw4-1", "title": "Next.js App Router deep dive", "description": "Layouts, loading states, error boundaries, and parallel routes", "resource": "Next.js Docs", "duration": "5h", "type": "Video", "completed": False},
                    {"id": "fw4-2", "title": "Server vs client components", "description": "When to mark 'use client' and how to compose server/client trees", "resource": "Blog", "duration": "3h", "type": "Reading", "completed": False},
                    {"id": "fw4-3", "title": "Data fetching patterns in Next.js 14", "description": "fetch with caching, revalidation, and streaming with Suspense", "resource": "Next.js Docs", "duration": "3h", "type": "Reading", "completed": False},
                    {"id": "fw4-4", "title": "Build production Next.js app", "description": "End-to-end app with auth, data fetching, and deployment to Vercel", "resource": "Project", "duration": "8h", "type": "Project", "completed": False},
                ],
            },
        ],
        "dailyView": [
            {
                "dayName": "Monday", "date": "May 18", "isToday": False, "isPast": True,
                "tasks": [
                    {"id": "fd1-1", "title": "Set up Jest and Testing Library", "source": "Kent C. Dodds", "duration": "45m", "type": "Video", "completed": True},
                    {"id": "fd1-2", "title": "Write first component smoke tests", "source": "Testing Library Docs", "duration": "1h", "type": "Practice", "completed": True},
                ],
            },
            {
                "dayName": "Tuesday", "date": "May 19", "isToday": False, "isPast": True,
                "tasks": [
                    {"id": "fd2-1", "title": "Test async state and data fetching", "source": "Kent C. Dodds", "duration": "1h", "type": "Practice", "completed": True},
                    {"id": "fd2-2", "title": "MSW setup for API mocking", "source": "Testing Library Docs", "duration": "45m", "type": "Reading", "completed": False},
                ],
            },
            {
                "dayName": "Wednesday", "date": "May 20", "isToday": True, "isPast": False,
                "tasks": [
                    {"id": "fd3-1", "title": "Integration tests with MSW", "source": "Kent C. Dodds", "duration": "1h", "type": "Practice", "completed": False},
                    {"id": "fd3-2", "title": "userEvent vs fireEvent patterns", "source": "Testing Library Docs", "duration": "30m", "type": "Reading", "completed": False},
                    {"id": "fd3-3", "title": "Test custom hooks with renderHook", "source": "Testing Library Docs", "duration": "45m", "type": "Practice", "completed": False},
                ],
            },
            {
                "dayName": "Thursday", "date": "May 21", "isToday": False, "isPast": False,
                "tasks": [
                    {"id": "fd4-1", "title": "Cypress installation and first spec", "source": "Project", "duration": "1h", "type": "Practice", "completed": False},
                    {"id": "fd4-2", "title": "Write login flow E2E test", "source": "Project", "duration": "1h", "type": "Project", "completed": False},
                ],
            },
            {
                "dayName": "Friday", "date": "May 22", "isToday": False, "isPast": False,
                "tasks": [
                    {"id": "fd5-1", "title": "Complete Cypress test suite", "source": "Project", "duration": "2h", "type": "Project", "completed": False},
                    {"id": "fd5-2", "title": "WCAG axe audit setup", "source": "a11y Project", "duration": "1h", "type": "Practice", "completed": False},
                ],
            },
            {
                "dayName": "Saturday", "date": "May 23", "isToday": False, "isPast": False,
                "tasks": [
                    {"id": "fd6-1", "title": "Fix accessibility violations", "source": "a11y Project", "duration": "1.5h", "type": "Practice", "completed": False},
                ],
            },
            {
                "dayName": "Sunday", "date": "May 24", "isToday": False, "isPast": False,
                "tasks": [],
            },
        ],
        "progress": {
            "matchScore": 72,
            "skillProgress": [
                {"name": "React",      "percentage": 75},
                {"name": "TypeScript", "percentage": 60},
                {"name": "Testing",    "percentage": 30},
                {"name": "Next.js",    "percentage": 40},
                {"name": "GraphQL",    "percentage": 15},
            ],
            "currentStreak": 7,
            "bestStreak": 14,
            "todaysTasks": [
                {"id": "t1", "title": "Complete React hooks module",     "completed": False},
                {"id": "t2", "title": "Review yesterday's TypeScript notes", "completed": True},
                {"id": "t3", "title": "Practice 3 array method exercises",   "completed": False},
            ],
        },
        "matchScore": 72,
    },

    "backend": {
        "description": (
            "Design and maintain server-side systems, APIs, and data pipelines. "
            "Own service reliability, scalability, and security while shipping "
            "features that power client-facing products."
        ),
        "dailyOps": [
            "Design and implement RESTful and gRPC services",
            "Write database migrations and optimize queries",
            "Participate in on-call rotation and incident response",
            "Code review with a focus on correctness and security",
            "Collaborate with frontend engineers on API contracts",
        ],
        "agentAnalysis": (
            "Based on analysis of 29 active job postings, Python (FastAPI/Django) and "
            "PostgreSQL remain dominant, but Go is growing fast in high-scale services.\n\n"
            "Key insight: 63% of postings require cloud-native experience (containers + "
            "managed databases), and observability (OpenTelemetry) is now a top-5 requirement."
        ),
        "marketSignal": {"value": 22, "trend": "stable"},
        "marketTrendSparkline": [18, 20, 19, 22, 21, 24, 26, 25, 28, 30, 29, 32],
        "confidenceScore": 89.7,
        "compensationTiers": [
            {"level": "Entry",  "range": "$95K - $130K"},
            {"level": "Mid",    "range": "$130K - $175K"},
            {"level": "Senior", "range": "$175K - $250K"},
        ],
        "skillFrequency": [
            {"skill": "Python (FastAPI/Django)", "percentage": 91},
            {"skill": "PostgreSQL / SQL",        "percentage": 87},
            {"skill": "Docker / Kubernetes",     "percentage": 78},
            {"skill": "REST / gRPC APIs",        "percentage": 74},
            {"skill": "Redis / Caching",         "percentage": 61},
            {"skill": "Cloud (AWS/GCP)",         "percentage": 66},
            {"skill": "CI/CD Pipelines",         "percentage": 55},
            {"skill": "Message Queues (Kafka)",  "percentage": 42},
        ],
        "skillCategories": [
            {
                "name": "Technical Skills",
                "skills": [
                    {"id": "python",      "name": "Python",              "proficiency": 82, "match": 91, "status": "good",    "description": "Dominant backend language for APIs, scripting, and data work"},
                    {"id": "fastapi",     "name": "FastAPI",             "proficiency": 68, "match": 82, "status": "good",    "description": "Modern async Python framework for high-performance REST APIs"},
                    {"id": "postgresql",  "name": "PostgreSQL / SQL",    "proficiency": 74, "match": 87, "status": "good",    "description": "Relational database skill required in virtually every backend role"},
                    {"id": "docker",      "name": "Docker",              "proficiency": 58, "match": 78, "status": "good",    "description": "Container packaging is the standard for all modern deployments"},
                    {"id": "redis",       "name": "Redis",               "proficiency": 38, "match": 61, "status": "partial", "description": "In-memory caching drastically reduces database load and latency"},
                    {"id": "go",          "name": "Go",                  "proficiency": 15, "match": 48, "status": "learn",   "description": "Fast-growing language for high-throughput microservices"},
                ],
            },
            {
                "name": "Soft Skills",
                "skills": [
                    {"id": "code-review",   "name": "Code Review",              "proficiency": 70, "match": 75, "status": "good",    "description": "Thorough reviews prevent regressions and spread knowledge"},
                    {"id": "incident-resp", "name": "Incident Response",        "proficiency": 50, "match": 65, "status": "partial", "description": "On-call readiness is expected at mid+ level backend roles"},
                    {"id": "api-design",    "name": "API Design",               "proficiency": 62, "match": 74, "status": "good",    "description": "Clear API contracts reduce integration bugs and support tickets"},
                    {"id": "cross-team",    "name": "Cross-team Collaboration", "proficiency": 68, "match": 70, "status": "good",    "description": "Backend engineers frequently unblock frontend and mobile teams"},
                ],
            },
            {
                "name": "Core Concepts",
                "skills": [
                    {"id": "distributed",   "name": "Distributed Systems",      "proficiency": 32, "match": 68, "status": "partial", "description": "CAP theorem, consensus, and failure modes are senior interview staples"},
                    {"id": "db-design",     "name": "Database Design",          "proficiency": 55, "match": 72, "status": "partial", "description": "Proper schema design prevents costly migrations down the road"},
                    {"id": "security",      "name": "Security Fundamentals",    "proficiency": 42, "match": 65, "status": "partial", "description": "OWASP top 10, auth patterns, and secret management are baseline requirements"},
                ],
            },
            {
                "name": "Tools and Platforms",
                "skills": [
                    {"id": "kubernetes",    "name": "Kubernetes",               "proficiency": 22, "match": 65, "status": "learn",   "description": "K8s orchestration is required at most companies running microservices"},
                    {"id": "cicd",          "name": "CI/CD Pipelines",          "proficiency": 45, "match": 55, "status": "partial", "description": "Automated pipelines are expected for all production code"},
                    {"id": "kafka",         "name": "Message Queues (Kafka)",   "proficiency": 18, "match": 42, "status": "learn",   "description": "Event streaming enables decoupled, resilient system architectures"},
                ],
            },
        ],
        "roadmap": [
            {
                "title": "Month 01 — Python & APIs",
                "weeks": [
                    {
                        "label": "Week 01", "skill": "FastAPI",
                        "tasks": [
                            {"id": "1", "title": "FastAPI crash course",              "source": "Official Docs",   "duration": "~4H", "completed": True},
                            {"id": "2", "title": "Build a CRUD REST service",        "source": "Project",         "duration": "~5H", "completed": True,  "badges": ["Project"]},
                            {"id": "3", "title": "Authentication with JWT & OAuth2", "source": "Real Python",     "duration": "~3H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 02", "skill": "PostgreSQL",
                        "tasks": [
                            {"id": "4", "title": "Advanced SQL queries & indexes",   "source": "pgExercises",     "duration": "~3H", "completed": False, "isToday": True},
                            {"id": "5", "title": "Database design project",          "source": "Project",         "duration": "~6H", "completed": False, "badges": ["Project", "Resume+"]},
                            {"id": "6", "title": "Query profiling with EXPLAIN",     "source": "PostgreSQL Docs", "duration": "~2H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 03", "skill": "Redis",
                        "tasks": [
                            {"id": "b03-1", "title": "Redis fundamentals and data types",     "source": "Redis Docs",    "duration": "~3H", "completed": False},
                            {"id": "b03-2", "title": "Caching API responses with Redis",      "source": "Project",       "duration": "~4H", "completed": False, "badges": ["Project"]},
                            {"id": "b03-3", "title": "Redis pub/sub and Lua scripting",       "source": "Real Python",   "duration": "~3H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 04", "skill": "Security",
                        "tasks": [
                            {"id": "b04-1", "title": "OWASP top 10 for backend APIs",         "source": "OWASP Docs",    "duration": "~4H", "completed": False},
                            {"id": "b04-2", "title": "OAuth 2.0 and JWT best practices",      "source": "Auth0 Blog",    "duration": "~3H", "completed": False},
                            {"id": "b04-3", "title": "Secure API hardening project",          "source": "Project",       "duration": "~4H", "completed": False, "badges": ["Project", "Resume+"]},
                        ],
                    },
                ],
            },
            {
                "title": "Month 02 — Distributed Systems",
                "weeks": [
                    {
                        "label": "Week 05", "skill": "Docker & Kubernetes",
                        "tasks": [
                            {"id": "7", "title": "Docker fundamentals",               "source": "KodeKloud",  "duration": "~5H", "completed": False},
                            {"id": "8", "title": "Deploy multi-service app to K8s",   "source": "Project",    "duration": "~8H", "completed": False, "badges": ["Project"]},
                            {"id": "9", "title": "Kafka producer/consumer patterns",  "source": "Confluent",  "duration": "~4H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 06", "skill": "Kubernetes",
                        "tasks": [
                            {"id": "b06-1", "title": "K8s networking: Services and Ingress",  "source": "K8s Docs",      "duration": "~4H", "completed": False},
                            {"id": "b06-2", "title": "Helm chart packaging",                  "source": "Helm Docs",     "duration": "~3H", "completed": False},
                            {"id": "b06-3", "title": "K8s autoscaling and resource limits",   "source": "Project",       "duration": "~4H", "completed": False, "badges": ["Project"]},
                        ],
                    },
                    {
                        "label": "Week 07", "skill": "Message Queues",
                        "tasks": [
                            {"id": "b07-1", "title": "Kafka architecture deep dive",          "source": "Confluent",     "duration": "~4H", "completed": False},
                            {"id": "b07-2", "title": "Build event-driven microservice",       "source": "Project",       "duration": "~6H", "completed": False, "badges": ["Project", "Resume+"]},
                            {"id": "b07-3", "title": "Dead letter queues and retry logic",    "source": "Blog",          "duration": "~2H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 08", "skill": "CI/CD",
                        "tasks": [
                            {"id": "b08-1", "title": "GitHub Actions pipeline for Python",    "source": "GitHub Docs",   "duration": "~3H", "completed": False},
                            {"id": "b08-2", "title": "Container image scanning and signing",  "source": "Snyk Docs",     "duration": "~3H", "completed": False},
                            {"id": "b08-3", "title": "Blue-green deployment strategy",        "source": "Project",       "duration": "~4H", "completed": False, "badges": ["Project"]},
                        ],
                    },
                ],
            },
            {
                "title": "Month 03 — Observability & Scale",
                "weeks": [
                    {
                        "label": "Week 09", "skill": "Observability",
                        "tasks": [
                            {"id": "10", "title": "OpenTelemetry crash course",       "source": "OTel Docs",   "duration": "~4H", "completed": False},
                            {"id": "11", "title": "Distributed tracing with Jaeger",  "source": "Blog",        "duration": "~3H", "completed": False},
                            {"id": "12", "title": "Build observable microservice",    "source": "Project",     "duration": "~8H", "completed": False, "badges": ["Project", "Resume+"]},
                        ],
                    },
                    {
                        "label": "Week 10", "skill": "Prometheus & Grafana",
                        "tasks": [
                            {"id": "b10-1", "title": "Prometheus metrics and alerting",       "source": "Prometheus Docs", "duration": "~4H", "completed": False},
                            {"id": "b10-2", "title": "Grafana dashboard for backend API",     "source": "Project",         "duration": "~4H", "completed": False, "badges": ["Project"]},
                            {"id": "b10-3", "title": "Alert rules and PagerDuty integration", "source": "Blog",            "duration": "~2H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 11", "skill": "Load Testing",
                        "tasks": [
                            {"id": "b11-1", "title": "Locust load testing fundamentals",      "source": "Locust Docs",     "duration": "~3H", "completed": False},
                            {"id": "b11-2", "title": "Profile and fix performance bottleneck","source": "Project",         "duration": "~5H", "completed": False, "badges": ["Project"]},
                            {"id": "b11-3", "title": "Database connection pooling tuning",    "source": "PostgreSQL Docs", "duration": "~2H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 12", "skill": "System Hardening",
                        "tasks": [
                            {"id": "b12-1", "title": "Rate limiting and circuit breakers",    "source": "Blog",            "duration": "~3H", "completed": False},
                            {"id": "b12-2", "title": "API gateway with Kong or Traefik",      "source": "Kong Docs",       "duration": "~3H", "completed": False},
                            {"id": "b12-3", "title": "Full-stack backend capstone project",   "source": "Project",         "duration": "~8H", "completed": False, "badges": ["Project", "Resume+"]},
                        ],
                    },
                ],
            },
        ],
        "weeklyView": [
            {
                "weekNumber": 1, "dateRange": "May 4 - May 10", "skill": "FastAPI",
                "completionPercentage": 100,
                "tasks": [
                    {"id": "bw1-1", "title": "FastAPI crash course", "description": "Path operations, dependency injection, Pydantic models, and async handlers", "resource": "Official Docs", "duration": "4h", "type": "Video", "completed": True},
                    {"id": "bw1-2", "title": "Build a CRUD REST service", "description": "Full create-read-update-delete API with SQLAlchemy and Alembic migrations", "resource": "Project", "duration": "5h", "type": "Project", "completed": True},
                    {"id": "bw1-3", "title": "JWT & OAuth2 authentication", "description": "Secure endpoints with JWT tokens and implement refresh token rotation", "resource": "Real Python", "duration": "3h", "type": "Reading", "completed": True},
                    {"id": "bw1-4", "title": "OpenAPI docs and schema export", "description": "Auto-generated Swagger UI and client SDK generation from your API", "resource": "FastAPI Docs", "duration": "2h", "type": "Reading", "completed": True},
                ],
            },
            {
                "weekNumber": 2, "dateRange": "May 11 - May 17", "skill": "PostgreSQL",
                "completionPercentage": 50,
                "tasks": [
                    {"id": "bw2-1", "title": "Advanced SQL queries & indexes", "description": "Window functions, CTEs, partial indexes, and query planner hints", "resource": "pgExercises", "duration": "3h", "type": "Practice", "completed": True},
                    {"id": "bw2-2", "title": "Database design project", "description": "Design a normalized schema for a multi-tenant SaaS application", "resource": "Project", "duration": "6h", "type": "Project", "completed": True},
                    {"id": "bw2-3", "title": "Query profiling with EXPLAIN ANALYZE", "description": "Read query plans, identify seq scans, and add targeted indexes", "resource": "PostgreSQL Docs", "duration": "2h", "type": "Reading", "completed": False},
                    {"id": "bw2-4", "title": "Connection pooling with PgBouncer", "description": "Configure transaction-mode pooling and tune pool sizes", "resource": "Blog", "duration": "2h", "type": "Reading", "completed": False},
                ],
            },
            {
                "weekNumber": 3, "dateRange": "May 18 - May 24", "skill": "Docker",
                "completionPercentage": 0,
                "tasks": [
                    {"id": "bw3-1", "title": "Docker fundamentals course", "description": "Images, containers, volumes, networks, and multi-stage builds", "resource": "KodeKloud", "duration": "5h", "type": "Video", "completed": False},
                    {"id": "bw3-2", "title": "Docker Compose for local dev", "description": "Compose a FastAPI + PostgreSQL + Redis stack with hot-reload", "resource": "Project", "duration": "3h", "type": "Practice", "completed": False},
                    {"id": "bw3-3", "title": "Container security best practices", "description": "Non-root users, image scanning, secret management with env vars", "resource": "Docker Docs", "duration": "2h", "type": "Reading", "completed": False},
                    {"id": "bw3-4", "title": "Deploy multi-service app to K8s", "description": "Write Deployments, Services, ConfigMaps, and Secrets for your API", "resource": "Project", "duration": "8h", "type": "Project", "completed": False},
                    {"id": "bw3-5", "title": "Helm chart packaging", "description": "Package your K8s manifests into a reusable Helm chart", "resource": "Helm Docs", "duration": "3h", "type": "Reading", "completed": False},
                ],
            },
            {
                "weekNumber": 4, "dateRange": "May 25 - May 31", "skill": "Kafka",
                "completionPercentage": 0,
                "tasks": [
                    {"id": "bw4-1", "title": "Kafka fundamentals", "description": "Topics, partitions, consumer groups, and offset management", "resource": "Confluent", "duration": "4h", "type": "Video", "completed": False},
                    {"id": "bw4-2", "title": "Producer and consumer in Python", "description": "kafka-python library — produce and consume with error handling", "resource": "Project", "duration": "3h", "type": "Practice", "completed": False},
                    {"id": "bw4-3", "title": "Event-driven architecture patterns", "description": "Saga pattern, outbox pattern, and idempotent consumers", "resource": "Blog", "duration": "3h", "type": "Reading", "completed": False},
                    {"id": "bw4-4", "title": "Build event-driven order system", "description": "Microservices communicating exclusively via Kafka events", "resource": "Project", "duration": "6h", "type": "Project", "completed": False},
                ],
            },
        ],
        "dailyView": [
            {
                "dayName": "Monday", "date": "May 18", "isToday": False, "isPast": True,
                "tasks": [
                    {"id": "bd1-1", "title": "Docker images and layers", "source": "KodeKloud", "duration": "1h", "type": "Video", "completed": True},
                    {"id": "bd1-2", "title": "Build and run first container", "source": "Docker Docs", "duration": "45m", "type": "Practice", "completed": True},
                ],
            },
            {
                "dayName": "Tuesday", "date": "May 19", "isToday": False, "isPast": True,
                "tasks": [
                    {"id": "bd2-1", "title": "Docker networking fundamentals", "source": "KodeKloud", "duration": "1h", "type": "Video", "completed": True},
                    {"id": "bd2-2", "title": "Multi-stage build optimization", "source": "Docker Docs", "duration": "45m", "type": "Practice", "completed": False},
                ],
            },
            {
                "dayName": "Wednesday", "date": "May 20", "isToday": True, "isPast": False,
                "tasks": [
                    {"id": "bd3-1", "title": "Docker Compose multi-service stack", "source": "Project", "duration": "1.5h", "type": "Practice", "completed": False},
                    {"id": "bd3-2", "title": "Container security deep dive", "source": "Docker Docs", "duration": "45m", "type": "Reading", "completed": False},
                    {"id": "bd3-3", "title": "Volumes and persistent storage", "source": "KodeKloud", "duration": "30m", "type": "Video", "completed": False},
                ],
            },
            {
                "dayName": "Thursday", "date": "May 21", "isToday": False, "isPast": False,
                "tasks": [
                    {"id": "bd4-1", "title": "K8s architecture overview", "source": "KodeKloud", "duration": "1h", "type": "Video", "completed": False},
                    {"id": "bd4-2", "title": "Write first Deployment YAML", "source": "K8s Docs", "duration": "1h", "type": "Practice", "completed": False},
                ],
            },
            {
                "dayName": "Friday", "date": "May 22", "isToday": False, "isPast": False,
                "tasks": [
                    {"id": "bd5-1", "title": "Deploy API to local K8s cluster", "source": "Project", "duration": "2h", "type": "Project", "completed": False},
                    {"id": "bd5-2", "title": "K8s Services and Ingress", "source": "K8s Docs", "duration": "1h", "type": "Reading", "completed": False},
                ],
            },
            {
                "dayName": "Saturday", "date": "May 23", "isToday": False, "isPast": False,
                "tasks": [
                    {"id": "bd6-1", "title": "Helm chart for API", "source": "Helm Docs", "duration": "2h", "type": "Practice", "completed": False},
                ],
            },
            {
                "dayName": "Sunday", "date": "May 24", "isToday": False, "isPast": False,
                "tasks": [],
            },
        ],
        "progress": {
            "matchScore": 70,
            "skillProgress": [
                {"name": "Python",     "percentage": 80},
                {"name": "PostgreSQL", "percentage": 65},
                {"name": "FastAPI",    "percentage": 55},
                {"name": "Docker",     "percentage": 40},
                {"name": "Kafka",      "percentage": 10},
            ],
            "currentStreak": 5,
            "bestStreak": 12,
            "todaysTasks": [
                {"id": "t1", "title": "Advanced SQL queries practice",  "completed": False},
                {"id": "t2", "title": "Review FastAPI documentation",   "completed": True},
                {"id": "t3", "title": "Implement one REST endpoint",    "completed": False},
            ],
        },
        "matchScore": 70,
    },

    "ml": {
        "description": (
            "Lead the development and deployment of production ML systems. "
            "Collaborate with cross-functional teams to design and implement "
            "scalable machine learning solutions that drive business impact."
        ),
        "dailyOps": [
            "Design and implement ML pipelines",
            "Collaborate with product teams on feature prioritization",
            "Review and mentor junior engineers",
            "Monitor model performance and drift",
            "Research and evaluate new ML techniques",
        ],
        "agentAnalysis": (
            "Based on analysis of 24 active job postings, this role requires a strong "
            "foundation in Python and deep learning frameworks. The emphasis on MLOps "
            "indicates companies are prioritizing production-ready engineers over "
            "research-focused candidates.\n\n"
            "Key insight: 71% of postings mention containerization skills, suggesting "
            "a shift toward platform-oriented ML roles."
        ),
        "marketSignal": {"value": 34, "trend": "up"},
        "marketTrendSparkline": [30, 35, 32, 40, 45, 42, 55, 60, 58, 72, 78, 85],
        "confidenceScore": 94.2,
        "compensationTiers": [
            {"level": "Entry",  "range": "$120K - $150K"},
            {"level": "Mid",    "range": "$150K - $200K"},
            {"level": "Senior", "range": "$200K - $280K"},
        ],
        "skillFrequency": [
            {"skill": "Python",              "percentage": 96},
            {"skill": "PyTorch/TensorFlow",  "percentage": 88},
            {"skill": "MLOps",               "percentage": 76},
            {"skill": "Docker/K8s",          "percentage": 71},
            {"skill": "SQL",                 "percentage": 68},
            {"skill": "Cloud (AWS/GCP)",     "percentage": 65},
            {"skill": "Feature Engineering", "percentage": 58},
            {"skill": "A/B Testing",         "percentage": 42},
        ],
        "skillCategories": [
            {
                "name": "Technical Skills",
                "skills": [
                    {"id": "python",            "name": "Python",               "proficiency": 88, "match": 96, "status": "good",    "description": "The default ML language — used in all major frameworks and pipelines"},
                    {"id": "pytorch",           "name": "PyTorch",              "proficiency": 42, "match": 88, "status": "partial", "description": "Industry-standard deep learning framework for research and production"},
                    {"id": "tensorflow",        "name": "TensorFlow",           "proficiency": 25, "match": 85, "status": "learn",   "description": "Google's DL framework dominates mobile and embedded deployments"},
                    {"id": "mlops",             "name": "MLOps",                "proficiency": 35, "match": 76, "status": "partial", "description": "Production ML requires versioning, monitoring, and automated retraining"},
                    {"id": "docker",            "name": "Docker / Kubernetes",  "proficiency": 55, "match": 71, "status": "good",    "description": "Containerization is essential for reproducible ML environments"},
                    {"id": "feature-eng",       "name": "Feature Engineering",  "proficiency": 45, "match": 58, "status": "partial", "description": "Data representation quality determines model performance ceiling"},
                ],
            },
            {
                "name": "Soft Skills",
                "skills": [
                    {"id": "paper-reading",   "name": "Research Paper Reading",    "proficiency": 55, "match": 70, "status": "good",    "description": "Staying current with arxiv papers is expected in ML roles"},
                    {"id": "stakeholder-comm","name": "Stakeholder Communication", "proficiency": 50, "match": 65, "status": "partial", "description": "Translating model metrics into business impact for non-technical audiences"},
                    {"id": "mentoring",       "name": "Mentoring",                 "proficiency": 60, "match": 68, "status": "good",    "description": "Senior ML roles consistently require technical leadership"},
                    {"id": "exp-rigor",       "name": "Experimental Rigor",        "proficiency": 48, "match": 72, "status": "partial", "description": "Disciplined A/B testing prevents false positives and wasted compute"},
                ],
            },
            {
                "name": "Core Concepts",
                "skills": [
                    {"id": "statistics",       "name": "Statistics & Probability", "proficiency": 65, "match": 80, "status": "good",    "description": "The mathematical foundation underlying all ML algorithms"},
                    {"id": "deep-learning",    "name": "Deep Learning Theory",     "proficiency": 38, "match": 82, "status": "partial", "description": "Understanding transformer and CNN architectures enables good model selection"},
                    {"id": "data-pipelines",   "name": "Data Pipelines",           "proficiency": 42, "match": 68, "status": "partial", "description": "Reliable data ingestion is the bottleneck in most production ML systems"},
                ],
            },
            {
                "name": "Tools and Platforms",
                "skills": [
                    {"id": "sql-spark",        "name": "SQL / Spark",             "proficiency": 72, "match": 68, "status": "good",    "description": "Data retrieval and transformation underpin all ML workflows"},
                    {"id": "cloud-ml",         "name": "Cloud ML (AWS/GCP)",      "proficiency": 42, "match": 65, "status": "partial", "description": "SageMaker and Vertex AI are required in enterprise ML roles"},
                    {"id": "mlflow",           "name": "Experiment Tracking (MLflow)", "proficiency": 28, "match": 52, "status": "learn", "description": "Reproducibility tools prevent model versioning nightmares"},
                ],
            },
        ],
        "roadmap": [
            {
                "title": "Month 01 — Python Foundations",
                "weeks": [
                    {
                        "label": "Week 01", "skill": "Python",
                        "tasks": [
                            {"id": "1", "title": "Complete Python basics module",  "source": "Codecademy", "duration": "~4H", "completed": True},
                            {"id": "2", "title": "Build CLI todo app project",     "source": "Project",    "duration": "~3H", "completed": True,  "badges": ["Project"]},
                            {"id": "3", "title": "Practice data structures",       "source": "LeetCode",   "duration": "~2H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 02", "skill": "NumPy/Pandas",
                        "tasks": [
                            {"id": "4", "title": "NumPy fundamentals course",    "source": "DataCamp", "duration": "~3H", "completed": False, "isToday": True},
                            {"id": "5", "title": "Pandas data manipulation",     "source": "DataCamp", "duration": "~4H", "completed": False},
                            {"id": "6", "title": "Analyze real dataset project", "source": "Kaggle",   "duration": "~5H", "completed": False, "badges": ["Project", "Resume+"]},
                        ],
                    },
                    {
                        "label": "Week 03", "skill": "Scikit-learn Basics",
                        "tasks": [
                            {"id": "m03-1", "title": "Linear and logistic regression",        "source": "Scikit-learn Docs", "duration": "~4H", "completed": False},
                            {"id": "m03-2", "title": "Train first classification pipeline",   "source": "Kaggle Learn",      "duration": "~4H", "completed": False, "badges": ["Project"]},
                            {"id": "m03-3", "title": "Confusion matrix and precision-recall", "source": "Towards DS",        "duration": "~2H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 04", "skill": "Data Visualization",
                        "tasks": [
                            {"id": "m04-1", "title": "Matplotlib and Seaborn fundamentals",   "source": "Matplotlib Docs",   "duration": "~4H", "completed": False},
                            {"id": "m04-2", "title": "EDA dashboard with Plotly",             "source": "Project",           "duration": "~5H", "completed": False, "badges": ["Project"]},
                            {"id": "m04-3", "title": "Data storytelling techniques",          "source": "Towards DS",        "duration": "~2H", "completed": False},
                        ],
                    },
                ],
            },
            {
                "title": "Month 02 — Machine Learning Core",
                "weeks": [
                    {
                        "label": "Week 05", "skill": "Scikit-learn",
                        "tasks": [
                            {"id": "7", "title": "ML fundamentals course",               "source": "Fast.ai",  "duration": "~6H", "completed": False},
                            {"id": "8", "title": "Classification algorithms deep dive",   "source": "Coursera", "duration": "~4H", "completed": False},
                            {"id": "9", "title": "Build ML pipeline project",             "source": "Project",  "duration": "~8H", "completed": False, "badges": ["Project", "Resume+"]},
                        ],
                    },
                    {
                        "label": "Week 06", "skill": "Model Evaluation",
                        "tasks": [
                            {"id": "m06-1", "title": "Cross-validation and GridSearchCV",    "source": "Scikit-learn Docs", "duration": "~4H", "completed": False},
                            {"id": "m06-2", "title": "ROC curves and AUC scoring",           "source": "Towards DS",        "duration": "~3H", "completed": False},
                            {"id": "m06-3", "title": "Bias-variance tradeoff experiments",   "source": "Project",           "duration": "~4H", "completed": False, "badges": ["Project"]},
                        ],
                    },
                    {
                        "label": "Week 07", "skill": "Feature Engineering",
                        "tasks": [
                            {"id": "m07-1", "title": "Feature selection techniques",          "source": "Scikit-learn Docs", "duration": "~4H", "completed": False},
                            {"id": "m07-2", "title": "Encoding categorical variables",        "source": "Kaggle",            "duration": "~3H", "completed": False},
                            {"id": "m07-3", "title": "Feature engineering Kaggle competition","source": "Project",           "duration": "~5H", "completed": False, "badges": ["Project", "Resume+"]},
                        ],
                    },
                    {
                        "label": "Week 08", "skill": "Unsupervised Learning",
                        "tasks": [
                            {"id": "m08-1", "title": "K-Means and DBSCAN clustering",         "source": "Scikit-learn Docs", "duration": "~3H", "completed": False},
                            {"id": "m08-2", "title": "PCA dimensionality reduction",          "source": "Coursera",          "duration": "~3H", "completed": False},
                            {"id": "m08-3", "title": "Customer segmentation project",         "source": "Project",           "duration": "~5H", "completed": False, "badges": ["Project"]},
                        ],
                    },
                ],
            },
            {
                "title": "Month 03 — Deep Learning & MLOps",
                "weeks": [
                    {
                        "label": "Week 09", "skill": "PyTorch",
                        "tasks": [
                            {"id": "10", "title": "PyTorch fundamentals",             "source": "PyTorch Tutorials", "duration": "~6H", "completed": False},
                            {"id": "11", "title": "Train image classifier (MNIST)",   "source": "Project",           "duration": "~4H", "completed": False, "badges": ["Project"]},
                            {"id": "12", "title": "MLflow experiment tracking",       "source": "MLflow Docs",       "duration": "~3H", "completed": False, "badges": ["Resume+"]},
                        ],
                    },
                    {
                        "label": "Week 10", "skill": "CNNs & Transfer Learning",
                        "tasks": [
                            {"id": "m10-1", "title": "CNN architectures: ResNet, EfficientNet",  "source": "Fast.ai",           "duration": "~4H", "completed": False},
                            {"id": "m10-2", "title": "Transfer learning with pretrained models", "source": "PyTorch Tutorials",  "duration": "~4H", "completed": False},
                            {"id": "m10-3", "title": "Fine-tune model on custom dataset",        "source": "Project",            "duration": "~5H", "completed": False, "badges": ["Project", "Resume+"]},
                        ],
                    },
                    {
                        "label": "Week 11", "skill": "MLflow & Deployment",
                        "tasks": [
                            {"id": "m11-1", "title": "MLflow tracking and model registry",       "source": "MLflow Docs",        "duration": "~4H", "completed": False},
                            {"id": "m11-2", "title": "Serve model with FastAPI",                 "source": "Project",            "duration": "~4H", "completed": False, "badges": ["Project"]},
                            {"id": "m11-3", "title": "Docker container for ML model",            "source": "Docker Docs",        "duration": "~3H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 12", "skill": "MLOps Pipeline",
                        "tasks": [
                            {"id": "m12-1", "title": "End-to-end MLOps pipeline with DVC",       "source": "DVC Docs",           "duration": "~4H", "completed": False},
                            {"id": "m12-2", "title": "Model monitoring and drift detection",     "source": "Evidently AI",       "duration": "~4H", "completed": False},
                            {"id": "m12-3", "title": "ML capstone: deploy to production",        "source": "Project",            "duration": "~8H", "completed": False, "badges": ["Project", "Resume+"]},
                        ],
                    },
                ],
            },
        ],
        "weeklyView": [
            {
                "weekNumber": 1, "dateRange": "May 4 - May 10", "skill": "Python",
                "completionPercentage": 100,
                "tasks": [
                    {"id": "mw1-1", "title": "Complete Python basics module", "description": "Variables, functions, loops, OOP fundamentals — essential ML scripting patterns", "resource": "Codecademy", "duration": "4h", "type": "Video", "completed": True},
                    {"id": "mw1-2", "title": "Build CLI data processor", "description": "Apply Python skills by building a command-line data processing tool", "resource": "Project", "duration": "3h", "type": "Project", "completed": True},
                    {"id": "mw1-3", "title": "Practice data structures", "description": "Lists, dicts, sets — know when to use each for ML preprocessing", "resource": "LeetCode", "duration": "2h", "type": "Practice", "completed": True},
                    {"id": "mw1-4", "title": "File I/O and error handling", "description": "Reading/writing files, try/except patterns for robust data pipelines", "resource": "Real Python", "duration": "2h", "type": "Reading", "completed": True},
                ],
            },
            {
                "weekNumber": 2, "dateRange": "May 11 - May 17", "skill": "NumPy/Pandas",
                "completionPercentage": 50,
                "tasks": [
                    {"id": "mw2-1", "title": "NumPy fundamentals course", "description": "Arrays, broadcasting, vectorized operations — the backbone of ML data prep", "resource": "DataCamp", "duration": "3h", "type": "Video", "completed": True},
                    {"id": "mw2-2", "title": "Pandas data manipulation", "description": "DataFrames, groupby, merges, and time series basics for tabular ML data", "resource": "DataCamp", "duration": "4h", "type": "Video", "completed": True},
                    {"id": "mw2-3", "title": "Analyze real dataset project", "description": "Download a Kaggle dataset and produce 5 actionable insights with plots", "resource": "Kaggle", "duration": "5h", "type": "Project", "completed": False},
                    {"id": "mw2-4", "title": "Data visualization with Matplotlib", "description": "Histograms, scatter plots, and correlation heatmaps for EDA", "resource": "Matplotlib Docs", "duration": "2h", "type": "Practice", "completed": False},
                ],
            },
            {
                "weekNumber": 3, "dateRange": "May 18 - May 24", "skill": "Scikit-learn",
                "completionPercentage": 0,
                "tasks": [
                    {"id": "mw3-1", "title": "ML fundamentals with scikit-learn", "description": "Understand the fit/predict API and build sklearn pipelines end-to-end", "resource": "Fast.ai", "duration": "3h", "type": "Video", "completed": False},
                    {"id": "mw3-2", "title": "Train first classification model", "description": "Logistic regression and SVM on iris dataset — compare results", "resource": "Kaggle Learn", "duration": "2h", "type": "Practice", "completed": False},
                    {"id": "mw3-3", "title": "Model evaluation techniques", "description": "Confusion matrix, precision-recall, ROC curves, and AUC scoring", "resource": "Towards Data Science", "duration": "2h", "type": "Reading", "completed": False},
                    {"id": "mw3-4", "title": "Cross-validation and hyperparameter tuning", "description": "GridSearchCV and RandomizedSearchCV — prevent overfitting in practice", "resource": "Scikit-learn Docs", "duration": "3h", "type": "Practice", "completed": False},
                    {"id": "mw3-5", "title": "Build end-to-end ML pipeline project", "description": "Ingest → clean → feature engineer → train → evaluate → save model", "resource": "Project", "duration": "4h", "type": "Project", "completed": False},
                ],
            },
            {
                "weekNumber": 4, "dateRange": "May 25 - May 31", "skill": "Deep Learning",
                "completionPercentage": 0,
                "tasks": [
                    {"id": "mw4-1", "title": "Neural network fundamentals", "description": "Forward pass, backpropagation, activation functions, and loss landscapes", "resource": "3Blue1Brown", "duration": "3h", "type": "Video", "completed": False},
                    {"id": "mw4-2", "title": "PyTorch basics workshop", "description": "Tensors, autograd, and building your first nn.Module from scratch", "resource": "PyTorch Tutorials", "duration": "4h", "type": "Practice", "completed": False},
                    {"id": "mw4-3", "title": "Train MNIST image classifier", "description": "CNN project to solidify PyTorch fundamentals — achieve >98% accuracy", "resource": "Project", "duration": "3h", "type": "Project", "completed": False},
                    {"id": "mw4-4", "title": "Fast.ai practical deep learning lecture 1", "description": "Top-down approach to understanding and applying modern deep learning", "resource": "Fast.ai", "duration": "2h", "type": "Video", "completed": False},
                ],
            },
        ],
        "dailyView": [
            {
                "dayName": "Monday", "date": "May 18", "isToday": False, "isPast": True,
                "tasks": [
                    {"id": "md1-1", "title": "Read scikit-learn docs intro", "source": "Scikit-learn Docs", "duration": "45m", "type": "Reading", "completed": True},
                    {"id": "md1-2", "title": "Watch ML fundamentals lecture", "source": "Fast.ai", "duration": "1h", "type": "Video", "completed": True},
                ],
            },
            {
                "dayName": "Tuesday", "date": "May 19", "isToday": False, "isPast": True,
                "tasks": [
                    {"id": "md2-1", "title": "Train logistic regression on iris", "source": "Kaggle Learn", "duration": "1h", "type": "Practice", "completed": True},
                    {"id": "md2-2", "title": "Plot confusion matrix", "source": "Towards Data Science", "duration": "30m", "type": "Practice", "completed": False},
                ],
            },
            {
                "dayName": "Wednesday", "date": "May 20", "isToday": True, "isPast": False,
                "tasks": [
                    {"id": "md3-1", "title": "Study ROC curves and AUC metric", "source": "Towards Data Science", "duration": "45m", "type": "Reading", "completed": False},
                    {"id": "md3-2", "title": "Implement cross-validation loop", "source": "Scikit-learn Docs", "duration": "1h", "type": "Practice", "completed": False},
                    {"id": "md3-3", "title": "Watch hyperparameter tuning video", "source": "Fast.ai", "duration": "45m", "type": "Video", "completed": False},
                ],
            },
            {
                "dayName": "Thursday", "date": "May 21", "isToday": False, "isPast": False,
                "tasks": [
                    {"id": "md4-1", "title": "GridSearchCV deep dive", "source": "Scikit-learn Docs", "duration": "1h", "type": "Practice", "completed": False},
                    {"id": "md4-2", "title": "RandomizedSearchCV vs Grid", "source": "Real Python", "duration": "30m", "type": "Reading", "completed": False},
                ],
            },
            {
                "dayName": "Friday", "date": "May 22", "isToday": False, "isPast": False,
                "tasks": [
                    {"id": "md5-1", "title": "Start ML pipeline project", "source": "Project", "duration": "2h", "type": "Project", "completed": False},
                    {"id": "md5-2", "title": "Data ingestion and cleaning step", "source": "Kaggle", "duration": "1h", "type": "Practice", "completed": False},
                ],
            },
            {
                "dayName": "Saturday", "date": "May 23", "isToday": False, "isPast": False,
                "tasks": [
                    {"id": "md6-1", "title": "Model training and evaluation", "source": "Project", "duration": "1.5h", "type": "Project", "completed": False},
                ],
            },
            {
                "dayName": "Sunday", "date": "May 24", "isToday": False, "isPast": False,
                "tasks": [],
            },
        ],
        "progress": {
            "matchScore": 67,
            "skillProgress": [
                {"name": "Python",           "percentage": 68},
                {"name": "NumPy/Pandas",     "percentage": 45},
                {"name": "Machine Learning", "percentage": 22},
                {"name": "PyTorch",          "percentage": 15},
                {"name": "MLOps",            "percentage":  8},
            ],
            "currentStreak": 7,
            "bestStreak": 14,
            "todaysTasks": [
                {"id": "t1", "title": "Complete NumPy basics",       "completed": False},
                {"id": "t2", "title": "Review yesterday's notes",    "completed": True},
                {"id": "t3", "title": "Practice 3 array exercises",  "completed": False},
            ],
        },
        "matchScore": 67,
    },

    "data": {
        "description": (
            "Extract insights from large, complex datasets to guide product and "
            "business decisions. Build analytics pipelines, dashboards, and "
            "statistical models that turn raw data into strategic advantage."
        ),
        "dailyOps": [
            "Write SQL queries to explore and validate data",
            "Build and maintain Airflow / dbt pipelines",
            "Create dashboards in Tableau, Looker, or Metabase",
            "Present findings to stakeholders in weekly reviews",
            "Collaborate with engineering on data model design",
        ],
        "agentAnalysis": (
            "Based on analysis of 27 active job postings, SQL mastery is still the "
            "single most mentioned skill, appearing in 95% of postings. Python with "
            "pandas is the dominant scripting environment.\n\n"
            "Key insight: 59% of postings now list dbt experience, up from 31% two "
            "years ago — analytics engineering and data science roles are converging."
        ),
        "marketSignal": {"value": 19, "trend": "stable"},
        "marketTrendSparkline": [14, 16, 15, 18, 17, 20, 19, 22, 21, 24, 23, 25],
        "confidenceScore": 88.5,
        "compensationTiers": [
            {"level": "Entry",  "range": "$80K - $110K"},
            {"level": "Mid",    "range": "$110K - $150K"},
            {"level": "Senior", "range": "$150K - $210K"},
        ],
        "skillFrequency": [
            {"skill": "SQL",              "percentage": 95},
            {"skill": "Python / Pandas",  "percentage": 86},
            {"skill": "dbt",              "percentage": 59},
            {"skill": "Tableau / Looker", "percentage": 67},
            {"skill": "Airflow",          "percentage": 54},
            {"skill": "Spark",            "percentage": 48},
            {"skill": "Statistics",       "percentage": 72},
            {"skill": "Cloud DWH",        "percentage": 62},
        ],
        "skillCategories": [
            {
                "name": "Technical Skills",
                "skills": [
                    {"id": "sql",           "name": "SQL",              "proficiency": 82, "match": 95, "status": "good",    "description": "Core analytical skill — every data role requires advanced SQL"},
                    {"id": "python-pandas", "name": "Python / Pandas",  "proficiency": 68, "match": 86, "status": "good",    "description": "Primary scripting environment for data cleaning and analysis"},
                    {"id": "dbt",           "name": "dbt",              "proficiency": 32, "match": 59, "status": "partial", "description": "Analytics engineering tool listed in 59% of data job postings"},
                    {"id": "spark",         "name": "Apache Spark",     "proficiency": 18, "match": 48, "status": "learn",   "description": "Distributed processing for datasets too large for a single machine"},
                    {"id": "statistics",    "name": "Statistics",       "proficiency": 62, "match": 72, "status": "good",    "description": "Hypothesis testing and regression are daily tools for analysts"},
                    {"id": "ab-testing",    "name": "A/B Testing",      "proficiency": 28, "match": 50, "status": "learn",   "description": "Experiment design and statistical significance are interview essentials"},
                ],
            },
            {
                "name": "Soft Skills",
                "skills": [
                    {"id": "data-storytelling","name": "Data Storytelling",       "proficiency": 65, "match": 78, "status": "good",    "description": "Communicating insights to non-technical stakeholders drives decisions"},
                    {"id": "stakeholder-mgmt", "name": "Stakeholder Management",  "proficiency": 58, "match": 70, "status": "good",    "description": "Data teams must align with product, engineering, and leadership"},
                    {"id": "biz-acumen",       "name": "Business Acumen",          "proficiency": 55, "match": 68, "status": "partial", "description": "Business context determines which metrics actually matter"},
                    {"id": "documentation",    "name": "Documentation",            "proficiency": 40, "match": 55, "status": "partial", "description": "Documented pipelines prevent silent data quality incidents"},
                ],
            },
            {
                "name": "Core Concepts",
                "skills": [
                    {"id": "data-modeling",  "name": "Data Modeling",   "proficiency": 55, "match": 70, "status": "partial", "description": "Star schemas and Kimball vs. Inmon choices shape warehouse performance"},
                    {"id": "etl-elt",        "name": "ETL / ELT Pipelines","proficiency": 38, "match": 62, "status": "partial","description": "Reliable data ingestion is the foundation of any analytics stack"},
                    {"id": "data-quality",   "name": "Data Quality",    "proficiency": 45, "match": 65, "status": "partial", "description": "Bad data silently corrupts decisions — validation is non-negotiable"},
                ],
            },
            {
                "name": "Tools and Platforms",
                "skills": [
                    {"id": "airflow",        "name": "Airflow",              "proficiency": 20, "match": 54, "status": "learn",   "description": "Workflow orchestration for complex data pipeline dependencies"},
                    {"id": "tableau-looker", "name": "Tableau / Looker",     "proficiency": 48, "match": 67, "status": "partial", "description": "Self-service dashboards reduce analyst bottlenecks for stakeholders"},
                    {"id": "bigquery",       "name": "BigQuery / Cloud DWH", "proficiency": 38, "match": 62, "status": "partial", "description": "Cloud data warehouses are the default analytics backend at scale"},
                ],
            },
        ],
        "roadmap": [
            {
                "title": "Month 01 — SQL Mastery",
                "weeks": [
                    {
                        "label": "Week 01", "skill": "Advanced SQL",
                        "tasks": [
                            {"id": "1", "title": "Window functions deep dive",          "source": "Mode Analytics",       "duration": "~4H", "completed": True},
                            {"id": "2", "title": "CTEs and recursive queries",          "source": "pgExercises",          "duration": "~3H", "completed": True,  "badges": ["Project"]},
                            {"id": "3", "title": "Query optimization workshop",         "source": "Use The Index, Luke",  "duration": "~3H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 02", "skill": "Python / Pandas",
                        "tasks": [
                            {"id": "4", "title": "Pandas EDA on real dataset",          "source": "Kaggle",   "duration": "~5H", "completed": False, "isToday": True},
                            {"id": "5", "title": "Statistical testing with scipy",      "source": "DataCamp", "duration": "~3H", "completed": False},
                            {"id": "6", "title": "Build end-to-end analysis notebook",  "source": "Project",  "duration": "~6H", "completed": False, "badges": ["Project", "Resume+"]},
                        ],
                    },
                    {
                        "label": "Week 03", "skill": "Statistics",
                        "tasks": [
                            {"id": "d03-1", "title": "Hypothesis testing fundamentals",       "source": "DataCamp",      "duration": "~4H", "completed": False},
                            {"id": "d03-2", "title": "Regression analysis in Python",        "source": "Statsmodels",   "duration": "~4H", "completed": False},
                            {"id": "d03-3", "title": "Statistical analysis project",         "source": "Project",       "duration": "~4H", "completed": False, "badges": ["Project"]},
                        ],
                    },
                    {
                        "label": "Week 04", "skill": "Data Visualization",
                        "tasks": [
                            {"id": "d04-1", "title": "Seaborn advanced charts",               "source": "Seaborn Docs",  "duration": "~3H", "completed": False},
                            {"id": "d04-2", "title": "Plotly interactive dashboards",         "source": "Plotly Docs",   "duration": "~4H", "completed": False},
                            {"id": "d04-3", "title": "Data storytelling capstone viz",        "source": "Project",       "duration": "~4H", "completed": False, "badges": ["Project", "Resume+"]},
                        ],
                    },
                ],
            },
            {
                "title": "Month 02 — Analytics Engineering",
                "weeks": [
                    {
                        "label": "Week 05", "skill": "dbt",
                        "tasks": [
                            {"id": "7", "title": "dbt fundamentals course",        "source": "dbt Learn",   "duration": "~5H", "completed": False},
                            {"id": "8", "title": "Build a dbt project from scratch","source": "Project",   "duration": "~8H", "completed": False, "badges": ["Project"]},
                            {"id": "9", "title": "Airflow DAG for data pipeline",   "source": "Astronomer", "duration": "~6H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 06", "skill": "Airflow",
                        "tasks": [
                            {"id": "d06-1", "title": "Airflow DAGs and operators deep dive",  "source": "Astronomer",    "duration": "~4H", "completed": False},
                            {"id": "d06-2", "title": "Build ETL pipeline with scheduling",    "source": "Project",       "duration": "~6H", "completed": False, "badges": ["Project", "Resume+"]},
                            {"id": "d06-3", "title": "Monitoring DAGs and failure alerts",    "source": "Astronomer Blog","duration": "~2H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 07", "skill": "Cloud DWH",
                        "tasks": [
                            {"id": "d07-1", "title": "BigQuery partitioning and clustering",  "source": "Google Cloud",  "duration": "~4H", "completed": False},
                            {"id": "d07-2", "title": "Snowflake vs BigQuery comparison",      "source": "Blog",          "duration": "~3H", "completed": False},
                            {"id": "d07-3", "title": "Build analytics stack on BigQuery",     "source": "Project",       "duration": "~5H", "completed": False, "badges": ["Project"]},
                        ],
                    },
                    {
                        "label": "Week 08", "skill": "Data Quality",
                        "tasks": [
                            {"id": "d08-1", "title": "Great Expectations for data validation","source": "GX Docs",       "duration": "~4H", "completed": False},
                            {"id": "d08-2", "title": "dbt tests and data freshness checks",   "source": "dbt Docs",      "duration": "~3H", "completed": False},
                            {"id": "d08-3", "title": "Data quality monitoring pipeline",      "source": "Project",       "duration": "~4H", "completed": False, "badges": ["Project"]},
                        ],
                    },
                ],
            },
            {
                "title": "Month 03 — Cloud & Visualization",
                "weeks": [
                    {
                        "label": "Week 09", "skill": "BigQuery",
                        "tasks": [
                            {"id": "10", "title": "BigQuery fundamentals",              "source": "Google Cloud",  "duration": "~4H", "completed": False},
                            {"id": "11", "title": "Tableau dashboard project",          "source": "Project",       "duration": "~6H", "completed": False, "badges": ["Project", "Resume+"]},
                            {"id": "12", "title": "A/B testing and statistics review", "source": "DataCamp",      "duration": "~4H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 10", "skill": "A/B Testing",
                        "tasks": [
                            {"id": "d10-1", "title": "Experiment design fundamentals",        "source": "DataCamp",      "duration": "~4H", "completed": False},
                            {"id": "d10-2", "title": "Statistical significance calculator",   "source": "Project",       "duration": "~4H", "completed": False, "badges": ["Project"]},
                            {"id": "d10-3", "title": "Multi-armed bandit algorithms",         "source": "Blog",          "duration": "~3H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 11", "skill": "Spark",
                        "tasks": [
                            {"id": "d11-1", "title": "PySpark fundamentals",                  "source": "Databricks",    "duration": "~5H", "completed": False},
                            {"id": "d11-2", "title": "Spark SQL for large datasets",          "source": "Databricks",    "duration": "~4H", "completed": False},
                            {"id": "d11-3", "title": "Build distributed ETL with Spark",      "source": "Project",       "duration": "~5H", "completed": False, "badges": ["Project", "Resume+"]},
                        ],
                    },
                    {
                        "label": "Week 12", "skill": "Presentation",
                        "tasks": [
                            {"id": "d12-1", "title": "Executive data storytelling workshop",  "source": "Coursera",      "duration": "~3H", "completed": False},
                            {"id": "d12-2", "title": "Build Looker Studio executive report",  "source": "Project",       "duration": "~4H", "completed": False, "badges": ["Project"]},
                            {"id": "d12-3", "title": "Analytics capstone presentation",       "source": "Project",       "duration": "~5H", "completed": False, "badges": ["Project", "Resume+"]},
                        ],
                    },
                ],
            },
        ],
        "weeklyView": [
            {
                "weekNumber": 1, "dateRange": "May 4 - May 10", "skill": "Advanced SQL",
                "completionPercentage": 100,
                "tasks": [
                    {"id": "dw1-1", "title": "Window functions deep dive", "description": "ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD — with real-world business use cases", "resource": "Mode Analytics", "duration": "4h", "type": "Practice", "completed": True},
                    {"id": "dw1-2", "title": "CTEs and recursive queries", "description": "Readable query composition with CTEs and hierarchical data with recursion", "resource": "pgExercises", "duration": "3h", "type": "Practice", "completed": True},
                    {"id": "dw1-3", "title": "Query optimization workshop", "description": "EXPLAIN ANALYZE, index selection, and avoiding full table scans", "resource": "Use The Index, Luke", "duration": "3h", "type": "Reading", "completed": True},
                    {"id": "dw1-4", "title": "Build a SQL analytics challenge", "description": "Solve 20 real business analytics questions on a sample e-commerce dataset", "resource": "Mode Analytics", "duration": "3h", "type": "Project", "completed": True},
                ],
            },
            {
                "weekNumber": 2, "dateRange": "May 11 - May 17", "skill": "Python / Pandas",
                "completionPercentage": 50,
                "tasks": [
                    {"id": "dw2-1", "title": "Pandas EDA on real dataset", "description": "Exploratory data analysis — distributions, outliers, missing values, correlations", "resource": "Kaggle", "duration": "5h", "type": "Practice", "completed": True},
                    {"id": "dw2-2", "title": "Statistical testing with scipy", "description": "t-tests, chi-square, Mann-Whitney — when and how to apply each", "resource": "DataCamp", "duration": "3h", "type": "Video", "completed": True},
                    {"id": "dw2-3", "title": "Build end-to-end analysis notebook", "description": "Full EDA → hypothesis testing → visualization → business recommendation", "resource": "Project", "duration": "6h", "type": "Project", "completed": False},
                    {"id": "dw2-4", "title": "Seaborn and Plotly for storytelling", "description": "Craft compelling data stories with annotated, publication-quality charts", "resource": "Towards Data Science", "duration": "2h", "type": "Reading", "completed": False},
                ],
            },
            {
                "weekNumber": 3, "dateRange": "May 18 - May 24", "skill": "dbt",
                "completionPercentage": 0,
                "tasks": [
                    {"id": "dw3-1", "title": "dbt fundamentals course", "description": "Models, sources, refs, tests, and documentation — the dbt development loop", "resource": "dbt Learn", "duration": "5h", "type": "Video", "completed": False},
                    {"id": "dw3-2", "title": "Build a dbt project from scratch", "description": "Layer raw → staging → marts models on a real dataset with schema tests", "resource": "Project", "duration": "8h", "type": "Project", "completed": False},
                    {"id": "dw3-3", "title": "dbt testing and data quality", "description": "not_null, unique, accepted_values, and custom generic tests", "resource": "dbt Docs", "duration": "2h", "type": "Reading", "completed": False},
                    {"id": "dw3-4", "title": "dbt documentation and lineage", "description": "Auto-generate docs and explore your DAG in the dbt docs UI", "resource": "dbt Docs", "duration": "2h", "type": "Practice", "completed": False},
                ],
            },
            {
                "weekNumber": 4, "dateRange": "May 25 - May 31", "skill": "Airflow",
                "completionPercentage": 0,
                "tasks": [
                    {"id": "dw4-1", "title": "Airflow fundamentals", "description": "DAGs, operators, sensors, and the scheduler — core concepts explained", "resource": "Astronomer", "duration": "4h", "type": "Video", "completed": False},
                    {"id": "dw4-2", "title": "Build an Airflow ETL pipeline", "description": "Orchestrate a full ETL: extract from API → transform with Python → load to DWH", "resource": "Project", "duration": "6h", "type": "Project", "completed": False},
                    {"id": "dw4-3", "title": "DAG testing and best practices", "description": "Unit test operators, handle retries, and set up alerting on failure", "resource": "Astronomer Blog", "duration": "3h", "type": "Reading", "completed": False},
                ],
            },
        ],
        "dailyView": [
            {
                "dayName": "Monday", "date": "May 18", "isToday": False, "isPast": True,
                "tasks": [
                    {"id": "dd1-1", "title": "dbt fundamentals — module 1", "source": "dbt Learn", "duration": "1h", "type": "Video", "completed": True},
                    {"id": "dd1-2", "title": "Set up dbt project locally", "source": "dbt Docs", "duration": "1h", "type": "Practice", "completed": True},
                ],
            },
            {
                "dayName": "Tuesday", "date": "May 19", "isToday": False, "isPast": True,
                "tasks": [
                    {"id": "dd2-1", "title": "Build staging models", "source": "Project", "duration": "1.5h", "type": "Project", "completed": True},
                    {"id": "dd2-2", "title": "Add schema tests", "source": "dbt Docs", "duration": "30m", "type": "Practice", "completed": False},
                ],
            },
            {
                "dayName": "Wednesday", "date": "May 20", "isToday": True, "isPast": False,
                "tasks": [
                    {"id": "dd3-1", "title": "Build mart models from staging", "source": "Project", "duration": "1.5h", "type": "Project", "completed": False},
                    {"id": "dd3-2", "title": "Write custom generic tests", "source": "dbt Docs", "duration": "45m", "type": "Practice", "completed": False},
                    {"id": "dd3-3", "title": "Generate and serve dbt docs", "source": "dbt Docs", "duration": "30m", "type": "Practice", "completed": False},
                ],
            },
            {
                "dayName": "Thursday", "date": "May 21", "isToday": False, "isPast": False,
                "tasks": [
                    {"id": "dd4-1", "title": "Airflow intro — DAGs and operators", "source": "Astronomer", "duration": "1h", "type": "Video", "completed": False},
                    {"id": "dd4-2", "title": "Write first Airflow DAG", "source": "Project", "duration": "1h", "type": "Practice", "completed": False},
                ],
            },
            {
                "dayName": "Friday", "date": "May 22", "isToday": False, "isPast": False,
                "tasks": [
                    {"id": "dd5-1", "title": "Build ETL pipeline DAG", "source": "Project", "duration": "2h", "type": "Project", "completed": False},
                    {"id": "dd5-2", "title": "Add retry logic and alerts", "source": "Astronomer Blog", "duration": "1h", "type": "Reading", "completed": False},
                ],
            },
            {
                "dayName": "Saturday", "date": "May 23", "isToday": False, "isPast": False,
                "tasks": [
                    {"id": "dd6-1", "title": "End-to-end pipeline review", "source": "Project", "duration": "1.5h", "type": "Project", "completed": False},
                ],
            },
            {
                "dayName": "Sunday", "date": "May 24", "isToday": False, "isPast": False,
                "tasks": [],
            },
        ],
        "progress": {
            "matchScore": 74,
            "skillProgress": [
                {"name": "SQL",        "percentage": 82},
                {"name": "Python",     "percentage": 60},
                {"name": "Tableau",    "percentage": 45},
                {"name": "dbt",        "percentage": 20},
                {"name": "Airflow",    "percentage": 12},
            ],
            "currentStreak": 9,
            "bestStreak": 18,
            "todaysTasks": [
                {"id": "t1", "title": "Pandas EDA on a new dataset",     "completed": False},
                {"id": "t2", "title": "Review dbt fundamentals notes",   "completed": True},
                {"id": "t3", "title": "Write 3 window function queries", "completed": False},
            ],
        },
        "matchScore": 74,
    },

    "general": {
        "description": (
            "Design, build, and ship software features end-to-end. Collaborate with "
            "product, design, and operations to solve user problems through "
            "well-crafted, tested, and maintainable code."
        ),
        "dailyOps": [
            "Implement features from design specs to production",
            "Write unit, integration, and end-to-end tests",
            "Participate in agile ceremonies and sprint planning",
            "Perform code reviews and pair-program with teammates",
            "Contribute to system design and architecture discussions",
        ],
        "agentAnalysis": (
            "Based on analysis of 35 active job postings, software engineering roles "
            "consistently prize fundamentals: data structures, system design, and "
            "collaborative coding practices.\n\n"
            "Key insight: 66% of postings mention CI/CD experience and 58% list cloud "
            "deployment skills — even for roles not explicitly in DevOps."
        ),
        "marketSignal": {"value": 18, "trend": "stable"},
        "marketTrendSparkline": [12, 14, 13, 16, 15, 18, 17, 20, 19, 22, 21, 24],
        "confidenceScore": 87.0,
        "compensationTiers": [
            {"level": "Entry",  "range": "$85K - $115K"},
            {"level": "Mid",    "range": "$115K - $160K"},
            {"level": "Senior", "range": "$160K - $230K"},
        ],
        "skillFrequency": [
            {"skill": "Git / Version Control",  "percentage": 98},
            {"skill": "REST APIs",              "percentage": 85},
            {"skill": "SQL",                    "percentage": 78},
            {"skill": "Docker",                 "percentage": 72},
            {"skill": "CI/CD",                  "percentage": 66},
            {"skill": "Cloud (AWS/GCP/Azure)",  "percentage": 64},
            {"skill": "Testing",                "percentage": 60},
            {"skill": "System Design",          "percentage": 55},
        ],
        "skillCategories": [
            {
                "name": "Technical Skills",
                "skills": [
                    {"id": "git",        "name": "Git",                       "proficiency": 82, "match": 98, "status": "good",    "description": "Version control is the baseline of every software engineering job"},
                    {"id": "rest-apis",  "name": "REST APIs",                 "proficiency": 68, "match": 85, "status": "good",    "description": "Designing and consuming HTTP APIs is a universal engineering skill"},
                    {"id": "sql",        "name": "SQL",                       "proficiency": 62, "match": 78, "status": "good",    "description": "Database querying is required across virtually all engineering roles"},
                    {"id": "docker",     "name": "Docker",                    "proficiency": 40, "match": 72, "status": "partial", "description": "Containers are the standard unit of deployment across the industry"},
                    {"id": "algorithms", "name": "Data Structures & Algorithms","proficiency": 48,"match": 65, "status": "partial", "description": "Interview essential and prerequisite for writing efficient code"},
                    {"id": "testing",    "name": "Testing",                   "proficiency": 35, "match": 60, "status": "partial", "description": "Unit and integration tests are required for all production code"},
                ],
            },
            {
                "name": "Soft Skills",
                "skills": [
                    {"id": "code-review",  "name": "Code Review",              "proficiency": 65, "match": 70, "status": "good",    "description": "Thoughtful reviews improve team quality and spread knowledge"},
                    {"id": "written-comm", "name": "Written Communication",    "proficiency": 72, "match": 72, "status": "good",    "description": "Clear technical writing reduces meetings and unblocks teammates"},
                    {"id": "estimation",   "name": "Task Estimation",          "proficiency": 45, "match": 60, "status": "partial", "description": "Reliable estimates help teams plan and meet commitments"},
                    {"id": "ownership",    "name": "Engineering Ownership",    "proficiency": 58, "match": 68, "status": "good",    "description": "End-to-end feature ownership from design to production monitoring"},
                ],
            },
            {
                "name": "Core Concepts",
                "skills": [
                    {"id": "system-design", "name": "System Design",          "proficiency": 28, "match": 55, "status": "learn",   "description": "Architecture knowledge separates mid from senior engineers"},
                    {"id": "networking",    "name": "HTTP & Networking",       "proficiency": 52, "match": 62, "status": "partial", "description": "TCP, DNS, and HTTP knowledge is required for any web backend work"},
                    {"id": "security-basics","name": "Security Fundamentals", "proficiency": 35, "match": 58, "status": "partial", "description": "OWASP basics and auth patterns prevent costly security breaches"},
                ],
            },
            {
                "name": "Tools and Platforms",
                "skills": [
                    {"id": "cicd",       "name": "CI/CD",                     "proficiency": 38, "match": 66, "status": "partial", "description": "Automated pipelines are expected for all production software"},
                    {"id": "aws",        "name": "Cloud (AWS/GCP/Azure)",      "proficiency": 25, "match": 64, "status": "learn",   "description": "Cloud deployment knowledge is increasingly required even for pure devs"},
                    {"id": "monitoring", "name": "Observability & Monitoring", "proficiency": 22, "match": 50, "status": "learn",   "description": "Logs, metrics, and traces are essential tools for production systems"},
                ],
            },
        ],
        "roadmap": [
            {
                "title": "Month 01 — Foundations & Tooling",
                "weeks": [
                    {
                        "label": "Week 01", "skill": "Git & Collaboration",
                        "tasks": [
                            {"id": "1", "title": "Advanced Git workflows",           "source": "Atlassian",   "duration": "~3H", "completed": True},
                            {"id": "2", "title": "Open source contribution",         "source": "Project",     "duration": "~4H", "completed": True,  "badges": ["Project"]},
                            {"id": "3", "title": "Code review best practices",       "source": "Google Eng",  "duration": "~2H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 02", "skill": "System Design Basics",
                        "tasks": [
                            {"id": "4", "title": "System design primer",              "source": "ByteByteGo", "duration": "~5H", "completed": False, "isToday": True},
                            {"id": "5", "title": "Design a URL shortener end-to-end", "source": "Project",   "duration": "~6H", "completed": False, "badges": ["Project", "Resume+"]},
                            {"id": "6", "title": "REST vs GraphQL trade-offs",        "source": "Blog",       "duration": "~2H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 03", "skill": "SQL & Databases",
                        "tasks": [
                            {"id": "g03-1", "title": "SQL fundamentals and JOINs",           "source": "SQLZoo",        "duration": "~4H", "completed": False},
                            {"id": "g03-2", "title": "Database schema design project",       "source": "Project",       "duration": "~5H", "completed": False, "badges": ["Project"]},
                            {"id": "g03-3", "title": "Transactions and ACID properties",     "source": "Blog",          "duration": "~2H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 04", "skill": "REST APIs",
                        "tasks": [
                            {"id": "g04-1", "title": "RESTful API design principles",         "source": "RESTful API Docs", "duration": "~3H", "completed": False},
                            {"id": "g04-2", "title": "Build and document a REST API",         "source": "Project",       "duration": "~5H", "completed": False, "badges": ["Project", "Resume+"]},
                            {"id": "g04-3", "title": "API versioning and rate limiting",      "source": "Blog",          "duration": "~2H", "completed": False},
                        ],
                    },
                ],
            },
            {
                "title": "Month 02 — Cloud & CI/CD",
                "weeks": [
                    {
                        "label": "Week 05", "skill": "Docker & AWS",
                        "tasks": [
                            {"id": "7", "title": "Docker for developers course",     "source": "KodeKloud",  "duration": "~5H", "completed": False},
                            {"id": "8", "title": "Deploy app to AWS ECS",            "source": "Project",    "duration": "~6H", "completed": False, "badges": ["Project"]},
                            {"id": "9", "title": "Build a GitHub Actions pipeline",  "source": "Project",    "duration": "~3H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 06", "skill": "CI/CD Pipelines",
                        "tasks": [
                            {"id": "g06-1", "title": "GitHub Actions advanced workflows",     "source": "GitHub Docs",   "duration": "~4H", "completed": False},
                            {"id": "g06-2", "title": "Automated test and deploy pipeline",    "source": "Project",       "duration": "~5H", "completed": False, "badges": ["Project", "Resume+"]},
                            {"id": "g06-3", "title": "Environment secrets and matrix builds", "source": "GitHub Docs",   "duration": "~2H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 07", "skill": "Cloud Storage & CDN",
                        "tasks": [
                            {"id": "g07-1", "title": "AWS S3 and CloudFront setup",           "source": "AWS Docs",      "duration": "~3H", "completed": False},
                            {"id": "g07-2", "title": "Static asset optimization",             "source": "web.dev",       "duration": "~3H", "completed": False},
                            {"id": "g07-3", "title": "CDN caching strategies project",        "source": "Project",       "duration": "~4H", "completed": False, "badges": ["Project"]},
                        ],
                    },
                    {
                        "label": "Week 08", "skill": "Security Fundamentals",
                        "tasks": [
                            {"id": "g08-1", "title": "OWASP top 10 vulnerabilities",          "source": "OWASP Docs",    "duration": "~4H", "completed": False},
                            {"id": "g08-2", "title": "Security audit of your deployed app",   "source": "Project",       "duration": "~5H", "completed": False, "badges": ["Project"]},
                            {"id": "g08-3", "title": "IAM roles and least-privilege setup",   "source": "AWS Docs",      "duration": "~2H", "completed": False},
                        ],
                    },
                ],
            },
            {
                "title": "Month 03 — Testing & Observability",
                "weeks": [
                    {
                        "label": "Week 09", "skill": "Testing",
                        "tasks": [
                            {"id": "10", "title": "Unit and integration testing",    "source": "Blog",        "duration": "~4H", "completed": False},
                            {"id": "11", "title": "Add observability to your app",   "source": "OTel Docs",   "duration": "~4H", "completed": False},
                            {"id": "12", "title": "Full CI/CD pipeline project",     "source": "Project",     "duration": "~6H", "completed": False, "badges": ["Project", "Resume+"]},
                        ],
                    },
                    {
                        "label": "Week 10", "skill": "Observability",
                        "tasks": [
                            {"id": "g10-1", "title": "OpenTelemetry instrumentation",         "source": "OTel Docs",     "duration": "~4H", "completed": False},
                            {"id": "g10-2", "title": "Structured logging with JSON",          "source": "Blog",          "duration": "~3H", "completed": False},
                            {"id": "g10-3", "title": "Grafana dashboard for your app",        "source": "Project",       "duration": "~4H", "completed": False, "badges": ["Project"]},
                        ],
                    },
                    {
                        "label": "Week 11", "skill": "Performance",
                        "tasks": [
                            {"id": "g11-1", "title": "Profiling and benchmarking basics",     "source": "Blog",          "duration": "~3H", "completed": False},
                            {"id": "g11-2", "title": "Identify and fix N+1 query problem",   "source": "Project",       "duration": "~4H", "completed": False, "badges": ["Project"]},
                            {"id": "g11-3", "title": "Caching strategy implementation",       "source": "Blog",          "duration": "~3H", "completed": False},
                        ],
                    },
                    {
                        "label": "Week 12", "skill": "Final Project",
                        "tasks": [
                            {"id": "g12-1", "title": "Full-stack feature with tests and CI",  "source": "Project",       "duration": "~6H", "completed": False, "badges": ["Project"]},
                            {"id": "g12-2", "title": "Add monitoring and alerting",           "source": "Project",       "duration": "~4H", "completed": False},
                            {"id": "g12-3", "title": "Production deploy and postmortem",      "source": "Project",       "duration": "~4H", "completed": False, "badges": ["Project", "Resume+"]},
                        ],
                    },
                ],
            },
        ],
        "weeklyView": [
            {
                "weekNumber": 1, "dateRange": "May 4 - May 10", "skill": "Git & Collaboration",
                "completionPercentage": 100,
                "tasks": [
                    {"id": "gw1-1", "title": "Advanced Git workflows", "description": "Rebasing, cherry-pick, reflog, and strategies for clean branch history", "resource": "Atlassian", "duration": "3h", "type": "Reading", "completed": True},
                    {"id": "gw1-2", "title": "Open source contribution", "description": "Fork a real project, fix an issue, and submit a well-crafted pull request", "resource": "Project", "duration": "4h", "type": "Project", "completed": True},
                    {"id": "gw1-3", "title": "Code review best practices", "description": "How to give and receive code reviews that improve team quality", "resource": "Google Eng", "duration": "2h", "type": "Reading", "completed": True},
                    {"id": "gw1-4", "title": "Git hooks and automation", "description": "pre-commit, commit-msg, and pre-push hooks for quality enforcement", "resource": "Blog", "duration": "2h", "type": "Practice", "completed": True},
                ],
            },
            {
                "weekNumber": 2, "dateRange": "May 11 - May 17", "skill": "System Design",
                "completionPercentage": 50,
                "tasks": [
                    {"id": "gw2-1", "title": "System design primer", "description": "Load balancing, caching, databases, and CAP theorem fundamentals", "resource": "ByteByteGo", "duration": "5h", "type": "Video", "completed": True},
                    {"id": "gw2-2", "title": "Design a URL shortener", "description": "Full system design: schema, API, encoding, rate limiting, analytics", "resource": "Project", "duration": "6h", "type": "Project", "completed": True},
                    {"id": "gw2-3", "title": "REST vs GraphQL trade-offs", "description": "When to choose each protocol and real-world cost considerations", "resource": "Blog", "duration": "2h", "type": "Reading", "completed": False},
                    {"id": "gw2-4", "title": "Consistent hashing and sharding", "description": "How distributed systems scale reads and writes horizontally", "resource": "ByteByteGo", "duration": "2h", "type": "Video", "completed": False},
                ],
            },
            {
                "weekNumber": 3, "dateRange": "May 18 - May 24", "skill": "Docker & AWS",
                "completionPercentage": 0,
                "tasks": [
                    {"id": "gw3-1", "title": "Docker for developers course", "description": "Images, containers, Compose, and best practices for local dev environments", "resource": "KodeKloud", "duration": "5h", "type": "Video", "completed": False},
                    {"id": "gw3-2", "title": "AWS core services overview", "description": "EC2, S3, RDS, IAM, VPC — the five services every engineer must know", "resource": "AWS Docs", "duration": "3h", "type": "Reading", "completed": False},
                    {"id": "gw3-3", "title": "Deploy app to AWS ECS", "description": "Containerize your app, push to ECR, and run it on ECS Fargate", "resource": "Project", "duration": "6h", "type": "Project", "completed": False},
                    {"id": "gw3-4", "title": "Build a GitHub Actions pipeline", "description": "CI: lint + test → CD: build image → push to ECR → deploy to ECS", "resource": "Project", "duration": "3h", "type": "Project", "completed": False},
                ],
            },
            {
                "weekNumber": 4, "dateRange": "May 25 - May 31", "skill": "Testing",
                "completionPercentage": 0,
                "tasks": [
                    {"id": "gw4-1", "title": "Unit and integration testing", "description": "Testing pyramid, mocking strategies, and the anatomy of a good test", "resource": "Blog", "duration": "4h", "type": "Video", "completed": False},
                    {"id": "gw4-2", "title": "Test your deployed app end-to-end", "description": "Playwright or Cypress test against your ECS-deployed app", "resource": "Project", "duration": "4h", "type": "Project", "completed": False},
                    {"id": "gw4-3", "title": "OpenTelemetry basics", "description": "Add traces, metrics, and logs to your app with the OTel SDK", "resource": "OTel Docs", "duration": "3h", "type": "Practice", "completed": False},
                ],
            },
        ],
        "dailyView": [
            {
                "dayName": "Monday", "date": "May 18", "isToday": False, "isPast": True,
                "tasks": [
                    {"id": "gd1-1", "title": "Docker images and Dockerfile basics", "source": "KodeKloud", "duration": "1h", "type": "Video", "completed": True},
                    {"id": "gd1-2", "title": "Build and run a containerized app", "source": "Docker Docs", "duration": "45m", "type": "Practice", "completed": True},
                ],
            },
            {
                "dayName": "Tuesday", "date": "May 19", "isToday": False, "isPast": True,
                "tasks": [
                    {"id": "gd2-1", "title": "Docker Compose setup", "source": "KodeKloud", "duration": "1h", "type": "Practice", "completed": True},
                    {"id": "gd2-2", "title": "Multi-stage build optimization", "source": "Docker Docs", "duration": "30m", "type": "Reading", "completed": False},
                ],
            },
            {
                "dayName": "Wednesday", "date": "May 20", "isToday": True, "isPast": False,
                "tasks": [
                    {"id": "gd3-1", "title": "AWS EC2 and IAM overview", "source": "AWS Docs", "duration": "1h", "type": "Reading", "completed": False},
                    {"id": "gd3-2", "title": "Push Docker image to ECR", "source": "Project", "duration": "1h", "type": "Practice", "completed": False},
                    {"id": "gd3-3", "title": "ECS Fargate task definition", "source": "AWS Docs", "duration": "45m", "type": "Reading", "completed": False},
                ],
            },
            {
                "dayName": "Thursday", "date": "May 21", "isToday": False, "isPast": False,
                "tasks": [
                    {"id": "gd4-1", "title": "Deploy service to ECS", "source": "Project", "duration": "1.5h", "type": "Project", "completed": False},
                    {"id": "gd4-2", "title": "Set up ALB and health checks", "source": "AWS Docs", "duration": "45m", "type": "Practice", "completed": False},
                ],
            },
            {
                "dayName": "Friday", "date": "May 22", "isToday": False, "isPast": False,
                "tasks": [
                    {"id": "gd5-1", "title": "Write GitHub Actions CI pipeline", "source": "Project", "duration": "1.5h", "type": "Project", "completed": False},
                    {"id": "gd5-2", "title": "Add CD step: deploy to ECS on push", "source": "Project", "duration": "1h", "type": "Project", "completed": False},
                ],
            },
            {
                "dayName": "Saturday", "date": "May 23", "isToday": False, "isPast": False,
                "tasks": [
                    {"id": "gd6-1", "title": "Review and document the pipeline", "source": "Project", "duration": "1h", "type": "Practice", "completed": False},
                ],
            },
            {
                "dayName": "Sunday", "date": "May 24", "isToday": False, "isPast": False,
                "tasks": [],
            },
        ],
        "progress": {
            "matchScore": 65,
            "skillProgress": [
                {"name": "Git",           "percentage": 85},
                {"name": "REST APIs",     "percentage": 60},
                {"name": "SQL",           "percentage": 55},
                {"name": "Docker",        "percentage": 35},
                {"name": "System Design", "percentage": 20},
            ],
            "currentStreak": 3,
            "bestStreak": 10,
            "todaysTasks": [
                {"id": "t1", "title": "System design primer reading",   "completed": False},
                {"id": "t2", "title": "Review Git branching notes",     "completed": True},
                {"id": "t3", "title": "Build one small project feature","completed": False},
            ],
        },
        "matchScore": 65,
    },
}

# ─── Per-skill resources ──────────────────────────────────────────────────────

def _make_profile(
    role_name: str,
    description: str,
    daily_ops: list[str],
    skills: list[dict],
    roadmap_focus: list[str],
    compensation: list[dict],
    match_score: int = 68,
    market_value: int = 21,
    trend: str = "up",
) -> dict:
    """Build a complete mock profile matching the existing profile contract."""
    categories = [
        {
            "name": "Core Skills",
            "skills": [
                {
                    "id": s["id"],
                    "name": s["name"],
                    "proficiency": s.get("proficiency", 35),
                    "match": s.get("match", 82),
                    "status": s.get("status", "partial"),
                    "description": s.get("description", f"Important capability for {role_name} roles"),
                }
                for s in skills[:4]
            ],
        },
        {
            "name": "Tools and Platforms",
            "skills": [
                {
                    "id": s["id"],
                    "name": s["name"],
                    "proficiency": s.get("proficiency", 28),
                    "match": s.get("match", 74),
                    "status": s.get("status", "learn"),
                    "description": s.get("description", f"Commonly requested tool for {role_name} teams"),
                }
                for s in skills[4:7]
            ],
        },
        {
            "name": "Professional Skills",
            "skills": [
                {"id": "communication", "name": "Communication", "proficiency": 58, "match": 78, "status": "good", "description": "Explain decisions clearly to stakeholders and teammates"},
                {"id": "stakeholder-management", "name": "Stakeholder Management", "proficiency": 42, "match": 72, "status": "partial", "description": "Align goals, constraints, and feedback across cross-functional partners"},
                {"id": "presentation", "name": "Presentation", "proficiency": 46, "match": 70, "status": "partial", "description": "Turn work into concise recommendations and next steps"},
            ],
        },
    ]
    # Ensure there are at least 8 skills in the frequency array
    all_freq_skills = list(skills)
    default_extra = [
        {"id": "communication", "name": "Communication", "proficiency": 58, "match": 78, "status": "good"},
        {"id": "stakeholder-management", "name": "Stakeholder Management", "proficiency": 42, "match": 72, "status": "partial"},
        {"id": "presentation", "name": "Presentation", "proficiency": 46, "match": 70, "status": "partial"},
    ]
    for extra in default_extra:
        if len(all_freq_skills) >= 8:
            break
        if not any(s["id"] == extra["id"] for s in all_freq_skills):
            all_freq_skills.append(extra)

    skill_frequency = [{"skill": s["name"], "percentage": s.get("match", 78)} for s in all_freq_skills[:8]]
    weeks = [
        {
            "label": f"Week {i:02d}",
            "skill": focus,
            "tasks": [
                {"id": f"{role_name[:3].lower()}-{i}-1", "title": f"Learn {focus} fundamentals", "source": "Curated course", "duration": "~3H", "completed": i == 1},
                {"id": f"{role_name[:3].lower()}-{i}-2", "title": f"Apply {focus} in a portfolio task", "source": "Project", "duration": "~4H", "completed": False, "badges": ["Project"]},
                {"id": f"{role_name[:3].lower()}-{i}-3", "title": f"Review real {role_name} examples", "source": "Case studies", "duration": "~2H", "completed": False},
            ],
        }
        for i, focus in enumerate(roadmap_focus[:4], start=1)
    ]
    weekly_view = [
        {
            "weekNumber": i,
            "dateRange": f"Week {i}",
            "skill": focus,
            "completionPercentage": 25 if i == 1 else 0,
            "tasks": [
                {"id": f"{role_name[:3].lower()}-w{i}-1", "title": f"Study {focus}", "description": f"Build baseline fluency in {focus}", "resource": "Curated resource", "duration": "2h", "type": "Reading", "completed": i == 1},
                {"id": f"{role_name[:3].lower()}-w{i}-2", "title": f"Create {focus} artifact", "description": "Produce a resume-ready work sample", "resource": "Project", "duration": "3h", "type": "Project", "completed": False},
            ],
        }
        for i, focus in enumerate(roadmap_focus[:4], start=1)
    ]
    daily_view = [
        {
            "dayName": day,
            "date": f"May {18 + i}",
            "isToday": day == "Wednesday",
            "isPast": i < 2,
            "tasks": [] if day == "Sunday" else [
                {"id": f"{role_name[:3].lower()}-d{i}-1", "title": f"{roadmap_focus[0]} practice", "source": "Project", "duration": "45m", "type": "Practice", "completed": i == 0},
            ],
        }
        for i, day in enumerate(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
    ]
    return {
        "description": description,
        "dailyOps": daily_ops,
        "agentAnalysis": (
            f"Mock analysis for {role_name} combines role-specific job signals, "
            f"skill demand, and practical learning priorities. The strongest gaps "
            f"to close first are {roadmap_focus[0]}, {roadmap_focus[1]}, and {roadmap_focus[2]}."
        ),
        "marketSignal": {"value": market_value, "trend": trend},
        "marketSignals": [{"label": "Demand", "value": market_value, "trend": trend}],
        "marketTrendSparkline": [12, 14, 15, 17, 16, 19, 21, 20, 23, 25, 27, 30],
        "confidenceScore": 87.5,
        "compensationTiers": compensation,
        "skillFrequency": skill_frequency,
        "skillCategories": categories,
        "roadmap": [
            {"title": f"Month 01 - {roadmap_focus[0]} and {roadmap_focus[1]}", "weeks": weeks[:2]},
            {"title": f"Month 02 - {roadmap_focus[2]} and {roadmap_focus[3]}", "weeks": weeks[2:4]},
        ],
        "weeklyView": weekly_view,
        "dailyView": daily_view,
        "progress": {
            "matchScore": match_score,
            "skillProgress": [{"name": s["name"], "percentage": s.get("proficiency", 35)} for s in skills[:5]],
            "currentStreak": 3,
            "bestStreak": 9,
            "todaysTasks": [
                {"id": "t1", "title": f"Practice {roadmap_focus[0]}", "completed": False},
                {"id": "t2", "title": f"Review {roadmap_focus[1]} notes", "completed": True},
                {"id": "t3", "title": "Update portfolio evidence", "completed": False},
            ],
        },
        "matchScore": match_score,
    }


_COMMON_COMP = [
    {"level": "Entry", "range": "$45K - $70K"},
    {"level": "Mid", "range": "$70K - $110K"},
    {"level": "Senior", "range": "$110K - $170K"},
]

_PROFILES.update({
    "fullstack": _make_profile("Full Stack Software Engineer", "Build end-to-end product features across frontend, backend, APIs, and databases.", ["Implement user-facing features", "Design API contracts", "Write database queries", "Debug production issues", "Review pull requests"], [{"id": "typescript", "name": "TypeScript", "proficiency": 62, "match": 90, "status": "good"}, {"id": "react", "name": "React", "proficiency": 58, "match": 88, "status": "good"}, {"id": "python", "name": "Python", "proficiency": 45, "match": 78}, {"id": "sql", "name": "SQL", "proficiency": 42, "match": 76}, {"id": "nodejs", "name": "Node.js", "proficiency": 38, "match": 72}, {"id": "git", "name": "Git", "proficiency": 70, "match": 74, "status": "good"}, {"id": "system-design", "name": "System Design", "proficiency": 25, "match": 80, "status": "learn"}], ["TypeScript", "React", "API Design", "System Design"], [{"level": "Entry", "range": "$85K - $120K"}, {"level": "Mid", "range": "$120K - $165K"}, {"level": "Senior", "range": "$165K - $230K"}], 70, 29),
    "devops": _make_profile("DevOps Engineer", "Automate cloud infrastructure, CI/CD, observability, and deployment reliability.", ["Maintain CI/CD pipelines", "Manage cloud infrastructure", "Monitor service health", "Automate deployments", "Improve incident response"], [{"id": "docker", "name": "Docker", "proficiency": 46, "match": 86}, {"id": "aws", "name": "AWS", "proficiency": 40, "match": 84}, {"id": "kubernetes", "name": "Kubernetes", "proficiency": 24, "match": 82, "status": "learn"}, {"id": "git", "name": "Git", "proficiency": 68, "match": 76, "status": "good"}, {"id": "terraform", "name": "Terraform", "proficiency": 18, "match": 78, "status": "learn"}, {"id": "observability", "name": "Observability", "proficiency": 26, "match": 74}, {"id": "ci-cd", "name": "CI/CD", "proficiency": 35, "match": 80}], ["Docker", "AWS", "CI/CD", "Observability"], [{"level": "Entry", "range": "$90K - $125K"}, {"level": "Mid", "range": "$125K - $175K"}, {"level": "Senior", "range": "$175K - $240K"}], 66, 24),
    "marketing": _make_profile("Marketing Manager", "Plan campaigns, grow qualified demand, measure channel performance, and shape brand messaging.", ["Build campaign plans", "Review SEO and analytics reports", "Coordinate content calendars", "Optimize conversion funnels", "Present growth results"], [{"id": "seo", "name": "SEO", "proficiency": 34, "match": 88}, {"id": "google-analytics", "name": "Google Analytics", "proficiency": 31, "match": 84}, {"id": "content-strategy", "name": "Content Strategy", "proficiency": 42, "match": 82}, {"id": "campaign-management", "name": "Campaign Management", "proficiency": 38, "match": 80}, {"id": "crm-salesforce", "name": "CRM / Salesforce", "proficiency": 24, "match": 72}, {"id": "copywriting", "name": "Copywriting", "proficiency": 48, "match": 74, "status": "good"}, {"id": "marketing-automation", "name": "Marketing Automation", "proficiency": 20, "match": 70}], ["SEO", "Google Analytics", "Content Strategy", "Campaign Management"], _COMMON_COMP, 69, 27),
    "finance": _make_profile("Financial Analyst", "Build models, analyze performance, forecast business outcomes, and communicate financial recommendations.", ["Update financial models", "Analyze variance and KPIs", "Prepare management reports", "Partner on budgets", "Build scenario forecasts"], [{"id": "financial-modeling", "name": "Financial Modeling", "proficiency": 36, "match": 90}, {"id": "excel-finance", "name": "Excel for Finance", "proficiency": 55, "match": 88, "status": "good"}, {"id": "accounting", "name": "Accounting Fundamentals", "proficiency": 42, "match": 78}, {"id": "forecasting", "name": "Forecasting", "proficiency": 28, "match": 76}, {"id": "powerpoint", "name": "PowerPoint", "proficiency": 44, "match": 70}, {"id": "sql", "name": "SQL", "proficiency": 18, "match": 64, "status": "learn"}, {"id": "business-analysis", "name": "Business Analysis", "proficiency": 40, "match": 72}], ["Financial Modeling", "Excel for Finance", "Forecasting", "Executive Reporting"], _COMMON_COMP, 71, 23),
    "design": _make_profile("UX Designer", "Research user needs, design product flows, prototype interfaces, and validate usability.", ["Run user interviews", "Create wireframes", "Prototype in Figma", "Review usability findings", "Collaborate with product and engineering"], [{"id": "figma", "name": "Figma", "proficiency": 50, "match": 90, "status": "good"}, {"id": "user-research", "name": "User Research", "proficiency": 32, "match": 86}, {"id": "interaction-design", "name": "Interaction Design", "proficiency": 38, "match": 84}, {"id": "design-systems", "name": "Design Systems", "proficiency": 26, "match": 76}, {"id": "portfolio", "name": "Portfolio Case Studies", "proficiency": 22, "match": 82, "status": "learn"}, {"id": "accessibility", "name": "Accessibility", "proficiency": 24, "match": 72}, {"id": "visual-design", "name": "Visual Design", "proficiency": 45, "match": 74}], ["Figma", "User Research", "Interaction Design", "Portfolio Case Studies"], _COMMON_COMP, 68, 22),
    "healthcare": _make_profile("Healthcare Professional", "Deliver patient-centered care, document outcomes, coordinate treatment, and follow clinical protocols.", ["Assess patient needs", "Document care plans", "Coordinate with care teams", "Educate patients", "Track quality and safety"], [{"id": "clinical-assessment", "name": "Clinical Assessment", "proficiency": 44, "match": 88}, {"id": "patient-communication", "name": "Patient Communication", "proficiency": 52, "match": 84, "status": "good"}, {"id": "medical-documentation", "name": "Medical Documentation", "proficiency": 38, "match": 80}, {"id": "care-coordination", "name": "Care Coordination", "proficiency": 36, "match": 78}, {"id": "healthcare-compliance", "name": "Healthcare Compliance", "proficiency": 28, "match": 74}, {"id": "ehr-systems", "name": "EHR Systems", "proficiency": 30, "match": 72}, {"id": "quality-improvement", "name": "Quality Improvement", "proficiency": 24, "match": 70}], ["Clinical Assessment", "Medical Documentation", "Care Coordination", "Quality Improvement"], _COMMON_COMP, 70, 25),
    "sales": _make_profile("Sales Professional", "Build pipeline, qualify prospects, run discovery, manage deals, and close revenue.", ["Prospect target accounts", "Run discovery calls", "Update CRM records", "Prepare proposals", "Negotiate deal terms"], [{"id": "crm-salesforce", "name": "CRM / Salesforce", "proficiency": 35, "match": 86}, {"id": "prospecting", "name": "Prospecting", "proficiency": 42, "match": 84}, {"id": "discovery-calls", "name": "Discovery Calls", "proficiency": 38, "match": 82}, {"id": "negotiation", "name": "Negotiation", "proficiency": 30, "match": 78}, {"id": "sales-forecasting", "name": "Sales Forecasting", "proficiency": 24, "match": 72}, {"id": "account-management", "name": "Account Management", "proficiency": 40, "match": 76}, {"id": "presentation", "name": "Presentation", "proficiency": 46, "match": 74}], ["CRM / Salesforce", "Prospecting", "Discovery Calls", "Negotiation"], _COMMON_COMP, 67, 24),
    "legal": _make_profile("Legal Professional", "Research law, review contracts, manage compliance risk, and communicate legal guidance.", ["Conduct legal research", "Draft contract notes", "Review compliance issues", "Prepare case summaries", "Coordinate with stakeholders"], [{"id": "legal-research", "name": "Legal Research", "proficiency": 38, "match": 90}, {"id": "contract-review", "name": "Contract Review", "proficiency": 34, "match": 84}, {"id": "compliance", "name": "Compliance", "proficiency": 30, "match": 80}, {"id": "legal-writing", "name": "Legal Writing", "proficiency": 42, "match": 82}, {"id": "case-analysis", "name": "Case Analysis", "proficiency": 34, "match": 76}, {"id": "negotiation", "name": "Negotiation", "proficiency": 26, "match": 72}, {"id": "document-management", "name": "Document Management", "proficiency": 35, "match": 70}], ["Legal Research", "Contract Review", "Compliance", "Legal Writing"], _COMMON_COMP, 66, 18, "flat"),
    "education": _make_profile("Education Professional", "Design learning experiences, teach concepts, assess progress, and improve student outcomes.", ["Plan lessons", "Deliver instruction", "Assess learner progress", "Create learning materials", "Support students"], [{"id": "curriculum-design", "name": "Curriculum Design", "proficiency": 36, "match": 88}, {"id": "instructional-design", "name": "Instructional Design", "proficiency": 30, "match": 82}, {"id": "assessment-design", "name": "Assessment Design", "proficiency": 34, "match": 78}, {"id": "classroom-management", "name": "Classroom Management", "proficiency": 48, "match": 76, "status": "good"}, {"id": "edtech", "name": "EdTech Tools", "proficiency": 28, "match": 72}, {"id": "learning-analytics", "name": "Learning Analytics", "proficiency": 18, "match": 68, "status": "learn"}, {"id": "facilitation", "name": "Facilitation", "proficiency": 44, "match": 74}], ["Curriculum Design", "Instructional Design", "Assessment Design", "EdTech Tools"], _COMMON_COMP, 69, 19),
    "hr": _make_profile("HR Professional", "Hire talent, support employees, manage HR programs, and improve people operations.", ["Coordinate hiring pipelines", "Support employee relations", "Maintain HR records", "Run onboarding", "Analyze people metrics"], [{"id": "hr-management", "name": "HR Management", "proficiency": 38, "match": 88}, {"id": "recruiting", "name": "Recruiting", "proficiency": 42, "match": 84}, {"id": "employee-relations", "name": "Employee Relations", "proficiency": 34, "match": 80}, {"id": "performance-management", "name": "Performance Management", "proficiency": 28, "match": 76}, {"id": "hris", "name": "HRIS", "proficiency": 24, "match": 72}, {"id": "compensation", "name": "Compensation Basics", "proficiency": 22, "match": 68}, {"id": "people-analytics", "name": "People Analytics", "proficiency": 18, "match": 66, "status": "learn"}], ["HR Management", "Recruiting", "Employee Relations", "People Analytics"], _COMMON_COMP, 68, 20),
    "operations": _make_profile("Operations Manager", "Improve process reliability, manage projects, coordinate teams, and reduce operational waste.", ["Track operational KPIs", "Run process reviews", "Coordinate projects", "Manage vendors", "Improve handoffs"], [{"id": "project-management", "name": "Project Management", "proficiency": 42, "match": 88}, {"id": "lean-six-sigma", "name": "Lean Six Sigma", "proficiency": 22, "match": 82}, {"id": "process-improvement", "name": "Process Improvement", "proficiency": 36, "match": 84}, {"id": "operations-analytics", "name": "Operations Analytics", "proficiency": 28, "match": 76}, {"id": "excel-finance", "name": "Excel / Sheets", "proficiency": 48, "match": 74, "status": "good"}, {"id": "vendor-management", "name": "Vendor Management", "proficiency": 30, "match": 70}, {"id": "risk-management", "name": "Risk Management", "proficiency": 26, "match": 68}], ["Project Management", "Lean Six Sigma", "Process Improvement", "Operations Analytics"], _COMMON_COMP, 69, 22),
    "consulting": _make_profile("Consultant", "Structure ambiguous problems, analyze evidence, build recommendations, and present client-ready work.", ["Frame client problems", "Analyze data and interviews", "Build slide decks", "Facilitate workshops", "Present recommendations"], [{"id": "powerpoint", "name": "PowerPoint", "proficiency": 40, "match": 86}, {"id": "problem-solving", "name": "Structured Problem Solving", "proficiency": 36, "match": 88}, {"id": "market-research", "name": "Market Research", "proficiency": 30, "match": 80}, {"id": "financial-modeling", "name": "Financial Modeling", "proficiency": 24, "match": 72}, {"id": "stakeholder-management", "name": "Stakeholder Management", "proficiency": 42, "match": 78}, {"id": "workshop-facilitation", "name": "Workshop Facilitation", "proficiency": 26, "match": 70}, {"id": "excel-finance", "name": "Excel Analysis", "proficiency": 38, "match": 74}], ["Structured Problem Solving", "PowerPoint", "Market Research", "Client Presentation"], _COMMON_COMP, 67, 21),
    "content": _make_profile("Content Creator", "Plan content, produce media, grow audiences, and measure creative performance.", ["Plan editorial calendar", "Write scripts or posts", "Edit video and assets", "Publish content", "Review engagement metrics"], [{"id": "content-strategy", "name": "Content Strategy", "proficiency": 40, "match": 88}, {"id": "video-editing", "name": "Video Editing", "proficiency": 28, "match": 82}, {"id": "copywriting", "name": "Copywriting", "proficiency": 46, "match": 80, "status": "good"}, {"id": "audience-growth", "name": "Audience Growth", "proficiency": 30, "match": 78}, {"id": "seo", "name": "SEO", "proficiency": 24, "match": 72}, {"id": "analytics", "name": "Content Analytics", "proficiency": 22, "match": 70}, {"id": "brand-storytelling", "name": "Brand Storytelling", "proficiency": 38, "match": 76}], ["Content Strategy", "Video Editing", "Audience Growth", "Content Analytics"], _COMMON_COMP, 66, 26),
    "entrepreneurship": _make_profile("Entrepreneur", "Validate opportunities, build go-to-market plans, manage cash, and execute early growth loops.", ["Interview customers", "Prioritize product bets", "Track unit economics", "Test acquisition channels", "Pitch partners or investors"], [{"id": "customer-discovery", "name": "Customer Discovery", "proficiency": 34, "match": 88}, {"id": "business-modeling", "name": "Business Modeling", "proficiency": 30, "match": 84}, {"id": "financial-modeling", "name": "Financial Modeling", "proficiency": 24, "match": 76}, {"id": "go-to-market", "name": "Go-to-Market", "proficiency": 28, "match": 82}, {"id": "sales", "name": "Sales", "proficiency": 35, "match": 78}, {"id": "pitch-deck", "name": "Pitch Decks", "proficiency": 22, "match": 72}, {"id": "project-management", "name": "Project Management", "proficiency": 42, "match": 74}], ["Customer Discovery", "Business Modeling", "Go-to-Market", "Financial Modeling"], _COMMON_COMP, 64, 24),
    "general_non_it": _make_profile("General Non-IT Role", "Build transferable business skills, communicate clearly, manage work, and create evidence of role readiness.", ["Prioritize work", "Communicate updates", "Coordinate stakeholders", "Analyze basic data", "Build portfolio proof"], [{"id": "communication", "name": "Communication", "proficiency": 52, "match": 82, "status": "good"}, {"id": "project-management", "name": "Project Management", "proficiency": 34, "match": 78}, {"id": "excel-finance", "name": "Excel / Sheets", "proficiency": 38, "match": 74}, {"id": "powerpoint", "name": "Presentation", "proficiency": 32, "match": 72}, {"id": "research", "name": "Research", "proficiency": 36, "match": 70}, {"id": "stakeholder-management", "name": "Stakeholder Management", "proficiency": 30, "match": 68}, {"id": "portfolio", "name": "Portfolio Evidence", "proficiency": 18, "match": 70, "status": "learn"}], ["Communication", "Project Management", "Excel / Sheets", "Portfolio Evidence"], _COMMON_COMP, 62, 17, "flat"),
})

_SCORE_TEMPLATE = {"quality": 88, "recency": 85, "trust": 90, "relevance": 92, "access": 95, "fit": 87}

_SKILL_RESOURCES: dict = {
    "python": [
        {"title": "Python for Everybody Specialization", "provider": "Coursera / Univ. of Michigan",
         "tags": ["Course", "Free audit"], "rank": "gold", "duration": "~30H",
         "url": "https://www.coursera.org/specializations/python",
         "scores": {"quality": 95, "recency": 88, "trust": 96, "relevance": 98, "access": 80, "fit": 94}},
        {"title": "Automate the Boring Stuff with Python", "provider": "automatetheboringstuff.com",
         "tags": ["Book", "Free"], "rank": "silver", "duration": "~20H",
         "url": "https://automatetheboringstuff.com",
         "scores": {"quality": 90, "recency": 85, "trust": 92, "relevance": 90, "access": 100, "fit": 88}},
        {"title": "Real Python Tutorials", "provider": "realpython.com",
         "tags": ["Docs", "Free/Paid"], "rank": "bronze", "duration": "Ref",
         "url": "https://realpython.com",
         "scores": {"quality": 88, "recency": 95, "trust": 94, "relevance": 88, "access": 90, "fit": 82}},
    ],
    "react": [
        {"title": "React Official Documentation", "provider": "react.dev",
         "tags": ["Docs", "Free"], "rank": "gold", "duration": "Ref",
         "url": "https://react.dev",
         "scores": {"quality": 96, "recency": 99, "trust": 100, "relevance": 99, "access": 100, "fit": 96}},
        {"title": "Full Stack Open", "provider": "University of Helsinki",
         "tags": ["Course", "Free"], "rank": "silver", "duration": "~60H",
         "url": "https://fullstackopen.com",
         "scores": {"quality": 94, "recency": 92, "trust": 95, "relevance": 95, "access": 100, "fit": 92}},
        {"title": "React — The Complete Guide", "provider": "Udemy / Maximilian Schwarzmüller",
         "tags": ["Course", "Paid"], "rank": "bronze", "duration": "~40H",
         "url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
         "scores": {"quality": 90, "recency": 88, "trust": 90, "relevance": 93, "access": 60, "fit": 88}},
    ],
    "machine-learning": [
        {"title": "Machine Learning Specialization", "provider": "Coursera / Andrew Ng",
         "tags": ["Course", "Free audit"], "rank": "gold", "duration": "~90H",
         "url": "https://www.coursera.org/specializations/machine-learning-introduction",
         "scores": {"quality": 97, "recency": 90, "trust": 98, "relevance": 98, "access": 75, "fit": 96}},
        {"title": "Practical Deep Learning for Coders", "provider": "fast.ai",
         "tags": ["Course", "Free"], "rank": "silver", "duration": "~30H",
         "url": "https://course.fast.ai",
         "scores": {"quality": 93, "recency": 92, "trust": 92, "relevance": 94, "access": 100, "fit": 90}},
        {"title": "Hands-On Machine Learning (3rd ed.)", "provider": "O'Reilly",
         "tags": ["Book", "Paid"], "rank": "bronze", "duration": "~Book",
         "url": "https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/",
         "scores": {"quality": 96, "recency": 94, "trust": 96, "relevance": 96, "access": 50, "fit": 91}},
    ],
    "sql": [
        {"title": "SQLZoo Interactive Tutorial", "provider": "sqlzoo.net",
         "tags": ["Interactive", "Free"], "rank": "gold", "duration": "~10H",
         "url": "https://sqlzoo.net",
         "scores": {"quality": 90, "recency": 88, "trust": 90, "relevance": 96, "access": 100, "fit": 92}},
        {"title": "Mode SQL Tutorial", "provider": "mode.com",
         "tags": ["Tutorial", "Free"], "rank": "silver", "duration": "~8H",
         "url": "https://mode.com/sql-tutorial/",
         "scores": {"quality": 88, "recency": 90, "trust": 88, "relevance": 94, "access": 100, "fit": 89}},
        {"title": "SQL for Data Science", "provider": "Coursera / UC Davis",
         "tags": ["Course", "Free audit"], "rank": "bronze", "duration": "~20H",
         "url": "https://www.coursera.org/learn/sql-for-data-science",
         "scores": {"quality": 85, "recency": 85, "trust": 88, "relevance": 90, "access": 80, "fit": 84}},
    ],
    "typescript": [
        {"title": "Total TypeScript", "provider": "totaltypescript.com",
         "tags": ["Course", "Free/Paid"], "rank": "gold", "duration": "~20H",
         "url": "https://www.totaltypescript.com",
         "scores": {"quality": 96, "recency": 97, "trust": 94, "relevance": 98, "access": 85, "fit": 95}},
        {"title": "TypeScript Official Handbook", "provider": "typescriptlang.org",
         "tags": ["Docs", "Free"], "rank": "silver", "duration": "Ref",
         "url": "https://www.typescriptlang.org/docs/",
         "scores": {"quality": 94, "recency": 99, "trust": 100, "relevance": 96, "access": 100, "fit": 90}},
        {"title": "Execute Program — TypeScript", "provider": "executeprogram.com",
         "tags": ["Interactive", "Paid"], "rank": "bronze", "duration": "~15H",
         "url": "https://www.executeprogram.com/courses/typescript",
         "scores": {"quality": 92, "recency": 92, "trust": 90, "relevance": 94, "access": 60, "fit": 88}},
    ],
    "docker": [
        {"title": "Docker for the Absolute Beginner", "provider": "KodeKloud",
         "tags": ["Course", "Free"], "rank": "gold", "duration": "~8H",
         "url": "https://kodekloud.com/courses/docker-for-the-absolute-beginner/",
         "scores": {"quality": 92, "recency": 90, "trust": 90, "relevance": 96, "access": 90, "fit": 92}},
        {"title": "Docker Official Documentation", "provider": "docs.docker.com",
         "tags": ["Docs", "Free"], "rank": "silver", "duration": "Ref",
         "url": "https://docs.docker.com",
         "scores": {"quality": 90, "recency": 98, "trust": 100, "relevance": 95, "access": 100, "fit": 86}},
        {"title": "The Docker Handbook", "provider": "freeCodeCamp",
         "tags": ["Article", "Free"], "rank": "bronze", "duration": "~5H",
         "url": "https://www.freecodecamp.org/news/the-docker-handbook/",
         "scores": {"quality": 85, "recency": 84, "trust": 88, "relevance": 90, "access": 100, "fit": 82}},
    ],
    "git": [
        {"title": "Pro Git Book (2nd ed.)", "provider": "git-scm.com",
         "tags": ["Book", "Free"], "rank": "gold", "duration": "Book",
         "url": "https://git-scm.com/book/en/v2",
         "scores": {"quality": 95, "recency": 90, "trust": 100, "relevance": 96, "access": 100, "fit": 91}},
        {"title": "Learn Git Branching", "provider": "learngitbranching.js.org",
         "tags": ["Interactive", "Free"], "rank": "silver", "duration": "~5H",
         "url": "https://learngitbranching.js.org",
         "scores": {"quality": 92, "recency": 88, "trust": 92, "relevance": 94, "access": 100, "fit": 93}},
        {"title": "Atlassian Git Tutorials", "provider": "atlassian.com",
         "tags": ["Docs", "Free"], "rank": "bronze", "duration": "Ref",
         "url": "https://www.atlassian.com/git/tutorials",
         "scores": {"quality": 88, "recency": 88, "trust": 90, "relevance": 90, "access": 100, "fit": 85}},
    ],
    "aws": [
        {"title": "AWS Cloud Practitioner Essentials", "provider": "aws.amazon.com",
         "tags": ["Course", "Free"], "rank": "gold", "duration": "~6H",
         "url": "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/",
         "scores": {"quality": 90, "recency": 92, "trust": 98, "relevance": 92, "access": 100, "fit": 88}},
        {"title": "Cloud Computing Specialization", "provider": "Coursera / Univ. of Illinois",
         "tags": ["Course", "Free audit"], "rank": "silver", "duration": "~40H",
         "url": "https://www.coursera.org/specializations/cloud-computing",
         "scores": {"quality": 88, "recency": 86, "trust": 90, "relevance": 88, "access": 80, "fit": 84}},
        {"title": "freeCodeCamp Cloud Computing Course", "provider": "YouTube / fCC",
         "tags": ["Video", "Free"], "rank": "bronze", "duration": "~5H",
         "url": "https://www.youtube.com/watch?v=M988_fsOSWo",
         "scores": {"quality": 82, "recency": 84, "trust": 84, "relevance": 84, "access": 100, "fit": 80}},
    ],
}

# ─── Additional skill resource mappings ──────────────────────────────────────

_SKILL_RESOURCES.update({
    "css": [
        {"title": "CSS Full Course – Beginner to Expert", "provider": "freeCodeCamp (YouTube)",
         "tags": ["Video", "Free"], "rank": "gold", "duration": "~11H",
         "url": "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
         "scores": {"quality": 90, "recency": 88, "trust": 88, "relevance": 96, "access": 100, "fit": 90}},
        {"title": "CSS Reference & Guides", "provider": "MDN Web Docs",
         "tags": ["Docs", "Free"], "rank": "silver", "duration": "Ref",
         "url": "https://developer.mozilla.org/en-US/docs/Web/CSS",
         "scores": {"quality": 95, "recency": 99, "trust": 100, "relevance": 95, "access": 100, "fit": 88}},
        {"title": "Tailwind CSS Documentation", "provider": "tailwindcss.com",
         "tags": ["Docs", "Free"], "rank": "bronze", "duration": "Ref",
         "url": "https://tailwindcss.com/docs",
         "scores": {"quality": 96, "recency": 99, "trust": 98, "relevance": 92, "access": 100, "fit": 88}},
    ],
    "nodejs": [
        {"title": "The Complete Node.js Developer Course", "provider": "Udemy / Andrew Mead",
         "tags": ["Course", "Paid"], "rank": "gold", "duration": "~35H",
         "url": "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/",
         "scores": {"quality": 93, "recency": 88, "trust": 90, "relevance": 96, "access": 60, "fit": 92}},
        {"title": "Node.js Official Documentation", "provider": "nodejs.org",
         "tags": ["Docs", "Free"], "rank": "silver", "duration": "Ref",
         "url": "https://nodejs.org/en/docs/",
         "scores": {"quality": 92, "recency": 98, "trust": 100, "relevance": 94, "access": 100, "fit": 86}},
        {"title": "Node.js Crash Course", "provider": "freeCodeCamp (YouTube)",
         "tags": ["Video", "Free"], "rank": "bronze", "duration": "~3H",
         "url": "https://www.youtube.com/watch?v=fBNz5xF-Kx4",
         "scores": {"quality": 85, "recency": 84, "trust": 86, "relevance": 90, "access": 100, "fit": 82}},
    ],
    "system-design": [
        {"title": "System Design Interview – ByteByteGo", "provider": "ByteByteGo",
         "tags": ["Course", "Paid"], "rank": "gold", "duration": "~20H",
         "url": "https://bytebytego.com",
         "scores": {"quality": 96, "recency": 95, "trust": 94, "relevance": 98, "access": 70, "fit": 95}},
        {"title": "System Design Primer", "provider": "GitHub / donnemartin",
         "tags": ["Docs", "Free"], "rank": "silver", "duration": "~30H",
         "url": "https://github.com/donnemartin/system-design-primer",
         "scores": {"quality": 94, "recency": 90, "trust": 96, "relevance": 96, "access": 100, "fit": 93}},
        {"title": "Grokking Modern System Design", "provider": "Educative.io",
         "tags": ["Course", "Paid"], "rank": "bronze", "duration": "~25H",
         "url": "https://www.educative.io/courses/grokking-modern-system-design-interview",
         "scores": {"quality": 92, "recency": 92, "trust": 90, "relevance": 95, "access": 60, "fit": 90}},
    ],
    "communication": [
        {"title": "Technical Writing One", "provider": "Google Developers",
         "tags": ["Course", "Free"], "rank": "gold", "duration": "~3H",
         "url": "https://developers.google.com/tech-writing/one",
         "scores": {"quality": 92, "recency": 90, "trust": 96, "relevance": 90, "access": 100, "fit": 88}},
        {"title": "Communicating Data Findings", "provider": "Coursera / Duke University",
         "tags": ["Course", "Free audit"], "rank": "silver", "duration": "~12H",
         "url": "https://www.coursera.org/learn/communicating-data-findings",
         "scores": {"quality": 88, "recency": 86, "trust": 90, "relevance": 88, "access": 80, "fit": 84}},
        {"title": "Soft Skills for Engineers", "provider": "freeCodeCamp (YouTube)",
         "tags": ["Video", "Free"], "rank": "bronze", "duration": "~2H",
         "url": "https://www.youtube.com/results?search_query=communication+skills+for+software+engineers",
         "scores": {"quality": 80, "recency": 82, "trust": 82, "relevance": 84, "access": 100, "fit": 80}},
    ],
    "problem-solving": [
        {"title": "Data Structures & Algorithms Specialization", "provider": "Coursera / UC San Diego",
         "tags": ["Course", "Free audit"], "rank": "gold", "duration": "~60H",
         "url": "https://www.coursera.org/specializations/data-structures-algorithms",
         "scores": {"quality": 94, "recency": 88, "trust": 94, "relevance": 96, "access": 80, "fit": 92}},
        {"title": "LeetCode Top Interview Questions", "provider": "LeetCode",
         "tags": ["Interactive", "Free/Paid"], "rank": "silver", "duration": "ongoing",
         "url": "https://leetcode.com/explore/interview/card/top-interview-questions-easy/",
         "scores": {"quality": 92, "recency": 96, "trust": 92, "relevance": 95, "access": 90, "fit": 90}},
        {"title": "Algorithms Part I", "provider": "Coursera / Princeton",
         "tags": ["Course", "Free audit"], "rank": "bronze", "duration": "~54H",
         "url": "https://www.coursera.org/learn/algorithms-part1",
         "scores": {"quality": 96, "recency": 86, "trust": 96, "relevance": 92, "access": 80, "fit": 88}},
    ],
})

# ─── Default resources for skills not explicitly mapped ──────────────────────

def _learning_resource_pack(skill_id: str, display: str, query: str) -> list:
    return [
        {"title": f"{display} Fundamentals", "provider": "Coursera",
         "tags": ["Course", "Free audit"], "rank": "gold", "duration": "varies",
         "url": f"https://www.coursera.org/search?query={query}",
         "scores": {**_SCORE_TEMPLATE, "quality": 90, "relevance": 94}},
        {"title": f"{display} Practical Tutorials", "provider": "YouTube",
         "tags": ["Video", "Free"], "rank": "silver", "duration": "varies",
         "url": f"https://www.youtube.com/results?search_query={query}+tutorial",
         "scores": {**_SCORE_TEMPLATE, "access": 100, "relevance": 90}},
        {"title": f"{display} Guides and Templates", "provider": "Search",
         "tags": ["Guide", "Free"], "rank": "bronze", "duration": "Ref",
         "url": f"https://www.google.com/search?q={query}+free+guide+template",
         "scores": {**_SCORE_TEMPLATE, "relevance": 86}},
    ]


_SKILL_RESOURCES.update({
    "seo": _learning_resource_pack("seo", "SEO", "seo"),
    "google-analytics": _learning_resource_pack("google-analytics", "Google Analytics", "google+analytics"),
    "financial-modeling": _learning_resource_pack("financial-modeling", "Financial Modeling", "financial+modeling"),
    "excel-finance": _learning_resource_pack("excel-finance", "Excel for Finance", "excel+finance"),
    "figma": _learning_resource_pack("figma", "Figma", "figma+ux+design"),
    "user-research": _learning_resource_pack("user-research", "User Research", "user+research+ux"),
    "crm-salesforce": _learning_resource_pack("crm-salesforce", "CRM and Salesforce", "salesforce+crm"),
    "project-management": _learning_resource_pack("project-management", "Project Management", "project+management"),
    "lean-six-sigma": _learning_resource_pack("lean-six-sigma", "Lean Six Sigma", "lean+six+sigma"),
    "powerpoint": _learning_resource_pack("powerpoint", "PowerPoint", "powerpoint+presentation"),
    "content-strategy": _learning_resource_pack("content-strategy", "Content Strategy", "content+strategy"),
    "video-editing": _learning_resource_pack("video-editing", "Video Editing", "video+editing"),
    "curriculum-design": _learning_resource_pack("curriculum-design", "Curriculum Design", "curriculum+design"),
    "legal-research": _learning_resource_pack("legal-research", "Legal Research", "legal+research"),
    "hr-management": _learning_resource_pack("hr-management", "HR Management", "hr+management"),
})


def _default_resources(skill_name: str) -> list:
    display = skill_name.replace("-", " ").replace("_", " ").title()
    slug = skill_name.lower().replace(" ", "+").replace("/", "+").replace("-", "+")
    return [
        {"title": f"{display} Tutorial", "provider": "YouTube / freeCodeCamp",
         "tags": ["Video", "Free"], "rank": "gold", "duration": "varies",
         "url": f"https://www.youtube.com/results?search_query={slug}+tutorial",
         "scores": {**_SCORE_TEMPLATE, "relevance": 80}},
        {"title": f"{display} Courses", "provider": "Coursera",
         "tags": ["Course", "Free audit"], "rank": "silver", "duration": "varies",
         "url": f"https://www.coursera.org/search?query={slug}",
         "scores": {**_SCORE_TEMPLATE, "relevance": 78}},
        {"title": f"{display} – Docs & Guides", "provider": "Official Docs / MDN",
         "tags": ["Docs", "Free"], "rank": "bronze", "duration": "Ref",
         "url": f"https://www.freecodecamp.org/news/search/?query={slug}",
         "scores": {**_SCORE_TEMPLATE, "relevance": 75}},
    ]


def get_mock_resources(skill_id: str) -> list:
    """Return curated resources for the given skill id / name."""
    sid = skill_id.lower().strip()
    if sid in _SKILL_RESOURCES:
        key = sid
    elif any(k in sid for k in ("python", "fastapi", "django", "flask")):
        key = "python"
    elif any(k in sid for k in ("react", "next", "jsx", "vue", "angular")):
        key = "react"
    elif any(k in sid for k in ("machine learning", "pytorch", "tensorflow", "scikit", "ml ", "deep learning", "mlops", "mlflow")):
        key = "machine-learning"
    elif any(k in sid for k in ("sql", "postgresql", "postgres", "mysql", "bigquery")):
        key = "sql"
    elif "typescript" in sid:
        key = "typescript"
    elif any(k in sid for k in ("docker", "kubernetes", "k8s")):
        key = "docker"
    elif "git" in sid:
        key = "git"
    elif any(k in sid for k in ("aws", "cloud", "gcp", "azure")):
        key = "aws"
    elif any(k in sid for k in ("css", "tailwind", "a11y", "accessibility", "wcag", "styling")):
        key = "css"
    elif any(k in sid for k in ("node", "express")):
        key = "nodejs"
    elif any(k in sid for k in ("system design", "system-design", "distributed", "architecture", "api design", "api-design", "db-design")):
        key = "system-design"
    elif any(k in sid for k in ("seo", "search engine optimization")):
        key = "seo"
    elif any(k in sid for k in ("google analytics", "ga4", "analytics")):
        key = "google-analytics"
    elif any(k in sid for k in ("financial model", "finance model", "forecasting")):
        key = "financial-modeling"
    elif any(k in sid for k in ("excel", "spreadsheet", "sheets")):
        key = "excel-finance"
    elif any(k in sid for k in ("figma", "prototype", "wireframe")):
        key = "figma"
    elif any(k in sid for k in ("user research", "ux research", "interview")):
        key = "user-research"
    elif any(k in sid for k in ("crm", "salesforce")):
        key = "crm-salesforce"
    elif any(k in sid for k in ("project management", "project-management", "program management")):
        key = "project-management"
    elif any(k in sid for k in ("lean", "six sigma", "six-sigma")):
        key = "lean-six-sigma"
    elif any(k in sid for k in ("powerpoint", "slide", "deck")):
        key = "powerpoint"
    elif any(k in sid for k in ("content strategy", "content-strategy")):
        key = "content-strategy"
    elif any(k in sid for k in ("video editing", "video-editing")):
        key = "video-editing"
    elif any(k in sid for k in ("curriculum", "instructional design")):
        key = "curriculum-design"
    elif any(k in sid for k in ("legal research", "legal-research")):
        key = "legal-research"
    elif any(k in sid for k in ("hr management", "hr-management", "human resources")):
        key = "hr-management"
    elif any(k in sid for k in ("communication", "storytelling", "stakeholder", "written", "presentation", "documentation")):
        key = "communication"
    elif any(k in sid for k in ("algorithm", "data structure", "problem solv", "problem-solv", "dsa", "ab-test", "a/b test")):
        key = "problem-solving"
    else:
        key = None

    if key and key in _SKILL_RESOURCES:
        return _SKILL_RESOURCES[key]
    return _default_resources(skill_id)


# ─── Skill-name → ID helpers ──────────────────────────────────────────────────

def _skill_name_to_id(skill_name: str, skill_categories: list) -> str:
    """Map a week/task skill label to the closest skill ID in skill_categories."""
    name_lower = skill_name.lower().strip()
    # Exact name match
    for cat in skill_categories:
        for s in cat.get("skills", []):
            if s.get("name", "").lower() == name_lower:
                return s["id"]
    # Partial match: either label contains skill name or vice versa
    for cat in skill_categories:
        for s in cat.get("skills", []):
            s_name = s.get("name", "").lower()
            s_id   = s.get("id",   "").lower()
            if s_name in name_lower or name_lower in s_name:
                return s["id"]
            if s_id in name_lower:
                return s["id"]
    # Fallback: normalise label to kebab-case ID
    import re
    return re.sub(r"[^a-z0-9-]+", "-", name_lower).strip("-")


def _build_skill_progress(skill_categories: list, roadmap_months: list, weekly_view: list) -> list:
    """Build the full skillProgress array from skill categories and task counts."""
    task_counts: dict      = {}
    completed_counts: dict = {}

    for month in roadmap_months:
        for week in month.get("weeks", []):
            for task in week.get("tasks", []):
                sid = task.get("skillId", "")
                if sid:
                    task_counts[sid] = task_counts.get(sid, 0) + 1
                    if task.get("completed", False):
                        completed_counts[sid] = completed_counts.get(sid, 0) + 1

    for week in weekly_view:
        for task in week.get("tasks", []):
            sid = task.get("skillId", "")
            if sid:
                task_counts[sid] = task_counts.get(sid, 0) + 1

    result: list = []
    seen:   set  = set()
    for cat in skill_categories:
        for s in cat.get("skills", []):
            sid = s.get("id", "")
            if not sid or sid in seen:
                continue
            seen.add(sid)
            curr_prof = s.get("proficiency", 0)
            req_prof  = s.get("match",       100)
            total     = task_counts.get(sid, 0)
            comp      = completed_counts.get(sid, 0)
            pct       = round(min(100, (curr_prof / req_prof) * 100)) if req_prof > 0 else 0
            result.append({
                "skillId":             sid,
                "name":                s.get("name", ""),
                "currentProficiency":  curr_prof,
                "requiredProficiency": req_prof,
                "totalTasks":          total,
                "completedTasks":      comp,
                "percentage":          pct,
            })
    return result


# ─── Dynamic roadmap generators ──────────────────────────────────────────────

_TASK_TYPES = ["Video", "Reading", "Practice", "Project"]

_TASK_TEMPLATES: dict[str, list[str]] = {
    "Video": [
        "Watch {skill} fundamentals course",
        "{skill} in-depth video walkthrough",
        "Follow {skill} tutorial series",
        "{skill} crash course",
        "Advanced {skill} lecture series",
    ],
    "Reading": [
        "Read {skill} official documentation",
        "Study {skill} best practices guide",
        "Review {skill} core concepts",
        "{skill} advanced patterns article",
        "Explore {skill} reference material",
    ],
    "Practice": [
        "Complete {skill} coding exercises",
        "Solve {skill} challenge problems",
        "{skill} hands-on coding drill",
        "Timed {skill} practice session",
        "Work through {skill} problem set",
    ],
    "Project": [
        "Build a {skill} mini-project",
        "{skill} portfolio project",
        "Implement a {skill} real-world example",
        "Deploy a {skill}-based application",
        "Extend previous {skill} project",
    ],
}

_TASK_SOURCES: dict[str, list[str]] = {
    "Video": ["YouTube", "Coursera", "Udemy", "Pluralsight", "LinkedIn Learning"],
    "Reading": ["Official Docs", "MDN", "Dev.to Blog", "O'Reilly Book", "GitHub Docs"],
    "Practice": ["LeetCode", "Exercises", "Playground", "Replit", "CodePen"],
    "Project": ["Project", "GitHub", "Portfolio", "Sandbox", "Personal Project"],
}


def _tasks_per_week(hours_per_day: float) -> int:
    if hours_per_day <= 0.5:
        return 5
    elif hours_per_day <= 1:
        return 10
    elif hours_per_day <= 2:
        return 15
    elif hours_per_day <= 3:
        return 20
    else:
        return 25


def _tasks_per_day(hours_per_day: float) -> int:
    if hours_per_day <= 0.5:
        return 1
    elif hours_per_day <= 1:
        return 2
    elif hours_per_day <= 2:
        return 3
    elif hours_per_day <= 3:
        return 4
    else:
        return 5


def _task_duration(hours_per_day: float) -> str:
    if hours_per_day <= 0.5:
        return "~30m"
    elif hours_per_day <= 1:
        return "~30m"
    elif hours_per_day <= 2:
        return "~40m"
    elif hours_per_day <= 3:
        return "~45m"
    else:
        return "~1H"


def _flat_skills(skill_categories: list) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for cat in skill_categories:
        for s in cat.get("skills", []):
            name = s.get("name", "").strip()
            if name and name not in seen:
                seen.add(name)
                result.append(name)
    return result or ["Core Concepts", "Practical Skills", "Advanced Topics", "Portfolio Projects"]


def generate_monthly_roadmap(
    role_category: str,
    num_months: int,
    hours_per_day: float,
    skill_categories: list,
) -> list:
    """Generate exactly num_months month objects, each with 4 weeks and dynamic task counts."""
    skills = _flat_skills(skill_categories)
    tpw = _tasks_per_week(hours_per_day)
    dur = _task_duration(hours_per_day)

    def month_title_suffix(m_idx: int) -> str:
        if num_months == 1:
            return "Foundation Skills"
        if m_idx == num_months - 1:
            return "Interview Prep & Portfolio"
        titles = [
            "Foundation Skills",
            "Core Skills",
            "Advanced Skills",
        ]
        if m_idx < len(titles):
            return titles[m_idx]
        return "Specialization and Projects"

    week_themes = [
        "Introduction",
        "Core Concepts",
        "Hands-on Practice",
        "Projects & Review",
    ]

    months = []
    skill_idx = 0
    for m_idx in range(num_months):
        month_num = m_idx + 1
        weeks = []
        for w_idx in range(4):
            global_week = m_idx * 4 + w_idx + 1
            skill = skills[skill_idx % len(skills)]
            skill_idx += 1
            skill_id = _skill_name_to_id(skill, skill_categories)
            type_counters: dict[str, int] = {"Video": 0, "Reading": 0, "Practice": 0, "Project": 0}
            tasks = []
            for t_idx in range(tpw):
                task_type = _TASK_TYPES[t_idx % 4]
                tc = type_counters[task_type]
                type_counters[task_type] += 1
                title = _TASK_TEMPLATES[task_type][tc % 5].format(skill=skill)
                source = _TASK_SOURCES[task_type][tc % 5]
                tasks.append({
                    "id": f"task-m{month_num}-w{global_week}-t{t_idx + 1}",
                    "skillId": skill_id,
                    "title": title,
                    "source": source,
                    "duration": dur,
                    "completed": False,
                    "skillFocus": skill,
                })
            weeks.append({
                "label": f"Week {global_week:02d}",
                "skill": skill,
                "weekTheme": week_themes[w_idx],
                "tasks": tasks,
            })
        months.append({
            "title": f"Month {month_num:02d} — {month_title_suffix(m_idx)}",
            "weeks": weeks,
        })
    return months


def generate_weekly_view(
    num_months: int,
    hours_per_day: float,
    skill_categories: list,
) -> list:
    """Generate num_months * 4 week objects with correct task counts per hours_per_day."""
    skills = _flat_skills(skill_categories)
    tpw = _tasks_per_week(hours_per_day)
    dur = _task_duration(hours_per_day)
    total_weeks = num_months * 4

    weeks = []
    for w_idx in range(total_weeks):
        skill = skills[w_idx % len(skills)]
        skill_id = _skill_name_to_id(skill, skill_categories)
        week_num = w_idx + 1
        type_counters: dict[str, int] = {"Video": 0, "Reading": 0, "Practice": 0, "Project": 0}
        tasks = []
        for t_idx in range(tpw):
            task_type = _TASK_TYPES[t_idx % 4]
            tc = type_counters[task_type]
            type_counters[task_type] += 1
            title = _TASK_TEMPLATES[task_type][tc % 5].format(skill=skill)
            source = _TASK_SOURCES[task_type][tc % 5]
            tasks.append({
                "id": f"wv-w{week_num}-t{t_idx + 1}",
                "skillId": skill_id,
                "title": title,
                "description": f"Build fluency in {skill} through {task_type.lower()}",
                "resource": source,
                "duration": dur,
                "type": task_type,
                "completed": False,
            })
        weeks.append({
            "weekNumber": week_num,
            "dateRange": f"Week {week_num}",
            "skill": skill,
            "completionPercentage": 0,
            "tasks": tasks,
        })
    return weeks


def generate_daily_view(
    hours_per_day: float,
    skill_categories: list,
) -> list:
    """Generate 7 days for current week with tasks per day based on hours_per_day."""
    skills = _flat_skills(skill_categories)
    tpd = _tasks_per_day(hours_per_day)
    dur = _task_duration(hours_per_day)
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    daily = []
    for d_idx, day in enumerate(day_names):
        if day == "Sunday":
            tasks: list = []
        else:
            tasks = []
            for t_idx in range(tpd):
                skill = skills[t_idx % len(skills)]
                skill_id = _skill_name_to_id(skill, skill_categories)
                task_type = _TASK_TYPES[t_idx % 4]
                title = _TASK_TEMPLATES[task_type][t_idx % 5].format(skill=skill)
                source = _TASK_SOURCES[task_type][t_idx % 5]
                tasks.append({
                    "id": f"dv-d{d_idx + 1}-t{t_idx + 1}",
                    "skillId": skill_id,
                    "title": title,
                    "source": source,
                    "duration": dur,
                    "type": task_type,
                    "completed": False,
                })
        daily.append({
            "dayName": day,
            "date": f"Day {d_idx + 1}",
            "isToday": day == "Wednesday",
            "isPast": d_idx < 2,
            "tasks": tasks,
        })
    return daily


# ─── Public helper ────────────────────────────────────────────────────────────

def get_mock_data(job_title: str, user_profile: dict | None = None) -> dict:
    """Return mock session data tailored to the given job title and user profile."""
    role = _detect_role(job_title)
    if role not in _PROFILES:
        role = "general_non_it"
    p = _PROFILES[role]

    # Personalise match score from user profile
    base_score = p["matchScore"]
    up = user_profile or {}

    # Resume boost
    if up.get("hasResume"):
        base_score += 5
    resume_skills = up.get("resumeSkills") or []
    if len(resume_skills) >= 5:
        base_score += 8
    elif len(resume_skills) >= 2:
        base_score += 4

    # Experience level adjustment
    exp_level = (up.get("experienceLevel") or up.get("experience_level") or "").lower()
    if "brand new" in exp_level:
        base_score -= 20
    elif "some" in exp_level:
        base_score -= 10
    elif "experienced" in exp_level:
        base_score += 10

    # Role context
    current_role = (up.get("currentRole") or up.get("current_role") or "").strip()
    if not current_role:
        base_score -= 8

    match_score = max(25, min(95, base_score))

    job_data = {
        "title": job_title,
        "tags": ["Remote", "High Demand", "Growing"],
        "description": p["description"],
        "dailyOps": p["dailyOps"],
        "marketSignal": p["marketSignal"],
        "agentAnalysis": p["agentAnalysis"],
        "confidenceScore": p["confidenceScore"],
        "marketTrendSparkline": p["marketTrendSparkline"],
        "compensationTiers": p["compensationTiers"],
    }

    # Skill categories — augment based on company type
    skill_categories = copy.deepcopy(p["skillCategories"])
    company_type = (up.get("targetCompanyType") or up.get("target_company_type") or "").lower()
    if "big tech" in company_type or "faang" in company_type:
        skill_categories.append({
            "name": "Interview Prep",
            "skills": [
                {"id": "system-design",  "name": "System Design",  "proficiency": 22, "match": 88, "status": "partial", "description": "Distributed systems design expected at senior FAANG interviews"},
                {"id": "dsa",            "name": "DSA",            "proficiency": 35, "match": 92, "status": "partial", "description": "Data structures and algorithms — tested in every FAANG screen"},
                {"id": "behavioral",     "name": "Behavioral",     "proficiency": 55, "match": 78, "status": "good",    "description": "STAR-format stories showcasing leadership and impact"},
            ],
        })
    elif "consulting" in company_type:
        skill_categories.append({
            "name": "Consulting Skills",
            "skills": [
                {"id": "communication",  "name": "Communication",  "proficiency": 60, "match": 85, "status": "good",    "description": "Translate technical findings into executive narratives"},
                {"id": "stakeholder",    "name": "Stakeholder Mgmt","proficiency": 40, "match": 78, "status": "partial", "description": "Manage client expectations and deliverables across workstreams"},
            ],
        })

    skill_tree = {
        "matchScore": match_score,
        "role": job_title,
        "categories": skill_categories,
    }

    gap_map = {
        "matchScore": match_score,
        "categories": skill_categories,
    }

    # Roadmap — generate dynamically based on timeline and daily commitment
    timeline_months = int(up.get("targetTimelineMonths") or up.get("target_timeline_months") or 3)
    hours_per_day = float(up.get("hoursPerDay") or up.get("hours_per_day") or 1)

    # Map string chip values to months (handles both numeric and string inputs)
    _timeline_map = {
        "1 month": 1, "1 month (intensive)": 1,
        "3 months": 3,
        "6 months": 6,
        "12 months": 12,
        "no deadline": 16,
    }
    raw_timeline = str(up.get("targetTimeline") or up.get("target_timeline") or "").lower().strip()
    if raw_timeline in _timeline_map:
        timeline_months = _timeline_map[raw_timeline]

    months = generate_monthly_roadmap(role, timeline_months, hours_per_day, p["skillCategories"])
    weekly_view = generate_weekly_view(timeline_months, hours_per_day, p["skillCategories"])
    daily_view = generate_daily_view(hours_per_day, p["skillCategories"])

    # Build skill progress with full proficiency data from skill_tree / gap_map
    skill_progress = _build_skill_progress(skill_categories, months, weekly_view)

    # Assign skillId to today's tasks using the first two skills of the role
    first_sid  = skill_categories[0]["skills"][0]["id"]  if skill_categories and skill_categories[0].get("skills") else ""
    second_sid = skill_categories[0]["skills"][1]["id"]  if skill_categories and len(skill_categories[0].get("skills", [])) > 1 else first_sid
    base_today = p["progress"].get("todaysTasks", [])
    today_tasks = []
    for i, t in enumerate(base_today):
        task_copy = dict(t)
        if not task_copy.get("skillId"):
            task_copy["skillId"] = first_sid if i % 2 == 0 else second_sid
        today_tasks.append(task_copy)

    # Full progress object in roadmap so applyRoadmapRecord works correctly
    base_progress = p["progress"]
    progress_with_score = {
        **base_progress,
        "matchScore":    match_score,
        "skillProgress": skill_progress,
        "todaysTasks":   today_tasks,
    }

    roadmap = {
        "role": job_title,
        "months": months,
        "weeklyView": weekly_view,
        "dailyView": daily_view,
        "progress": progress_with_score,
    }

    # Default resource for the first skill in the role
    first_skill_id = (skill_categories[0]["skills"][0].get("id", "") if skill_categories else "python")
    default_resources = {first_skill_id: get_mock_resources(first_skill_id)}

    return {
        "job_data":     job_data,
        "market_skills": p["skillFrequency"],
        "skill_tree":   skill_tree,
        "gap_map":      gap_map,
        "resources":    default_resources,
        "roadmap":      roadmap,
        "match_score":  match_score,
        "marketSignals": p.get("marketSignals", [p["marketSignal"]]),
        "progress":     progress_with_score,
    }


# ─── Legacy constants (kept for any direct imports) ───────────────────────────

_ml = _PROFILES["ml"]
MOCK_JOB_DATA = {
    "title": "Senior ML Engineer",
    "tags": ["Remote", "Series B", "High Demand"],
    "description": _ml["description"],
    "dailyOps": _ml["dailyOps"],
    "marketSignal": _ml["marketSignal"],
    "agentAnalysis": _ml["agentAnalysis"],
    "confidenceScore": _ml["confidenceScore"],
    "marketTrendSparkline": _ml["marketTrendSparkline"],
}
MOCK_SKILL_FREQUENCY = _ml["skillFrequency"]
MOCK_COMPENSATION_TIERS = _ml["compensationTiers"]
MOCK_SKILL_CATEGORIES = _ml["skillCategories"]
MOCK_GAP_MAP = {"matchScore": _ml["matchScore"], "categories": MOCK_SKILL_CATEGORIES}
MOCK_ROADMAP = _ml["roadmap"]
MOCK_RESOURCES = {"python": get_mock_resources("python")}
MOCK_PROGRESS = _ml["progress"]
MOCK_MATCH_SCORE = {"overall": _ml["matchScore"], "confidence": _ml["confidenceScore"]}
