'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Globe, Image as ImageIcon } from 'lucide-react'

type InputTab = 'title' | 'description' | 'url' | 'image'

export interface JobInputValue {
  jobTitle: string
  jobText?: string
  jobUrl?: string
  imageBase64?: string
}

interface JobInputProps {
  onSubmit: (value: JobInputValue) => void
  authRequired?: boolean
  onLogout?: () => void
  onNavigateToDashboard?: () => void
}

function useCounter(target: number, duration = 2000, delay = 0) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => {
      const start = performance.now()
      const tick = (now: number) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const ease = 1 - Math.pow(1 - progress, 3)
        setCount(Math.round(target * ease))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timer)
  }, [target, duration, delay])
  return count
}

const RAIN_CHIPS = [
  { label: 'Python',             left: '4%',  duration: '8.5s',  delay: '0.2s' },
  { label: 'React',              left: '14%', duration: '12.0s', delay: '2.5s' },
  { label: 'SQL',                left: '24%', duration: '10.2s', delay: '0.0s' },
  { label: 'Docker',             left: '34%', duration: '13.8s', delay: '3.1s' },
  { label: 'AWS',                left: '44%', duration: '8.0s',  delay: '6.2s' },
  { label: 'TypeScript',         left: '54%', duration: '11.5s', delay: '1.8s' },
  { label: 'Machine Learning',   left: '64%', duration: '9.8s',  delay: '4.7s' },
  { label: 'System Design',      left: '74%', duration: '12.6s', delay: '0.9s' },
  { label: 'Node.js',            left: '84%', duration: '6.4s',  delay: '7.1s' },
  { label: 'Figma',              left: '94%', duration: '8.8s',  delay: '2.3s' },
  { label: 'Marketing',          left: '9%',  duration: '12.2s', delay: '5.4s' },
  { label: 'Finance',            left: '19%', duration: '7.5s',  delay: '3.3s' },
  { label: 'UX Research',        left: '29%', duration: '9.5s',  delay: '6.8s' },
  { label: 'Leadership',         left: '39%', duration: '11.2s', delay: '0.1s' },
  { label: 'Excel',              left: '49%', duration: '7.0s',  delay: '1.5s' },
  { label: 'Copywriting',        left: '59%', duration: '13.5s', delay: '4.2s' },
  { label: 'Project Management', left: '69%', duration: '8.9s',  delay: '5.9s' },
  { label: 'Data Analysis',      left: '79%', duration: '10.8s', delay: '1.2s' },
  { label: 'Sales',              left: '89%', duration: '6.1s',  delay: '2.8s' },
  { label: 'Communication',      left: '47%', duration: '13.0s', delay: '7.8s' }
]

const TAGLINES = [
  'From job title to personalized roadmap in 30 seconds.',
  'Built from live market data across 50,000+ roles.',
  'Free resources. Real skills. Your exact path.',
]

const JOB_SUGGESTIONS = [
  "Software Engineer", "Senior Software Engineer",
  "Frontend Developer", "Backend Developer", 
  "Full Stack Developer", "Machine Learning Engineer",
  "Data Scientist", "Data Analyst",
  "Product Manager", "UX Designer", "UI Designer",
  "DevOps Engineer", "Cloud Architect",
  "Cybersecurity Analyst", "Mobile Developer",
  "Marketing Manager", "Digital Marketing Specialist",
  "Financial Analyst", "Investment Banker",
  "HR Manager", "Recruiter",
  "Sales Manager", "Account Executive",
  "Business Analyst", "Management Consultant",
  "Graphic Designer", "Content Writer",
  "Project Manager", "Operations Manager",
  "Healthcare Administrator", "Nurse",
  "Teacher", "Curriculum Designer",
  "Legal Counsel", "Compliance Officer",
  "Supply Chain Manager", "Logistics Coordinator",
  "Social Media Manager", "SEO Specialist",
  "Video Editor", "Content Creator",
  "Entrepreneur", "Startup Founder"
]

export function JobInput({
  onSubmit,
  authRequired = false,
  onLogout,
  onNavigateToDashboard,
}: JobInputProps) {
  const [activeTab, setActiveTab]     = useState<InputTab>('title')
  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl]                 = useState('')
  const [imageFile, setImageFile]     = useState<File | null>(null)
  const [imageBase64, setImageBase64] = useState('')
  const [isFetching, setIsFetching]           = useState(false)
  const [btnHover, setBtnHover]               = useState(false)
  const [cardHover, setCardHover]             = useState(false)
  const [taglineIndex, setTaglineIndex]       = useState(0)
  const [hoverMyRoadmaps, setHoverMyRoadmaps] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [hoveredSuggestionIdx, setHoveredSuggestionIdx] = useState<number | null>(null)

  const filteredSuggestions = title.length >= 2
    ? JOB_SUGGESTIONS.filter(item =>
        item.toLowerCase().includes(title.toLowerCase())
      ).slice(0, 6)
    : []


  const jobs      = useCounter(50000, 2200, 200)
  const skills    = useCounter(500,   2200, 400)
  const roadmaps  = useCounter(25000, 2200, 600)

  useEffect(() => {
    const timer = setInterval(() => {
      setTaglineIndex(i => (i + 1) % TAGLINES.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])





  const tabs: { id: InputTab; label: string }[] = [
    { id: 'title',       label: 'Title'       },
    { id: 'description', label: 'Description' },
    { id: 'url',         label: 'URL'         },
    { id: 'image',       label: 'Image'       },
  ]

  const hasContent = title.trim() || description.trim() || url.trim() || imageFile

  const handleSubmit = () => {
    if (!hasContent) return
    onSubmit({
      jobTitle:     title || description || url || imageFile?.name || 'Job Role',
      jobText:      description || undefined,
      jobUrl:       url || undefined,
      imageBase64:  imageBase64 || undefined,
    })
  }

  const handleFetchUrl = async () => {
    if (!url.trim()) return
    setIsFetching(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsFetching(false)
    setTitle('Senior ML Engineer')
    setDescription('Fetched job description from URL...')
  }

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) void readImage(file)
  }

  const readImage = async (file: File) => {
    setImageFile(file)
    const encoded = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload  = () => resolve(String(reader.result ?? ''))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
    setImageBase64(encoded)
  }

  const tabIndex = tabs.findIndex(t => t.id === activeTab)

  return (
    <div
      className="h-screen flex flex-col relative overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.08), transparent),
          #FAFAFA
        `,
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.08), transparent),
          radial-gradient(#E5E7EB 1px, transparent 1px)
        `,
        backgroundSize: 'auto, 24px 24px',
      }}
    >
      {/* Floating skill chips */}
      {RAIN_CHIPS.map((chip, idx) => (
        <div
          key={idx}
          className="fixed pointer-events-none select-none"
          style={{
            left: chip.left,
            top: '-50px',
            opacity: 0.3,
            zIndex: 0,
            animation: `rainChip ${chip.duration} linear infinite`,
            animationDelay: chip.delay,
          }}
        >
          <span className="px-3 py-1 text-xs font-medium rounded-full border" style={{ background: '#EEF2FF', color: '#6366F1', borderColor: '#C7D2FE' }}>
            {chip.label}
          </span>
        </div>
      ))}

      {/* Top Bar */}
      <header
        className="flex items-center justify-between px-6 py-4 absolute top-0 left-0 right-0 z-20 w-full"
        style={{ background: 'transparent', border: 'none', boxShadow: 'none', paddingTop: '24px', paddingBottom: '24px' }}
      >
        {/* Left spacer to keep center content centered on desktop */}
        <div className="w-[120px] hidden md:block" />

        {/* Center Logo & Name */}
        <div className="flex items-center gap-2 md:absolute md:left-1/2 md:-translate-x-1/2">
          <div className="rounded-lg flex items-center justify-center" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#6366F1,#7C3AED)' }}>
            <svg className="text-white" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px' }}>
              <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
            </svg>
          </div>
          <span
            className="font-bold text-center"
            style={{
              background: 'linear-gradient(135deg,#6366F1,#7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '28px',
              fontWeight: 800,
              letterSpacing: '-0.5px'
            }}
          >
            PathForge
          </span>
        </div>

        {/* Right Button */}
        <div>
          <button
            onClick={onNavigateToDashboard}
            onMouseEnter={() => setHoverMyRoadmaps(true)}
            onMouseLeave={() => setHoverMyRoadmaps(false)}
            style={{
              background: hoverMyRoadmaps ? '#EEF2FF' : 'transparent',
              border: '1px solid #6366F1',
              color: '#6366F1',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            My Roadmaps
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 relative z-10 overflow-hidden">
        <div className="w-full max-w-[580px]" style={{ animation: 'fadeUp 0.6s ease forwards' }}>
          {/* Pill Label */}
          <div className="flex justify-center mb-[16px]">
            <span style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#6366F1', padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 500 }}>
              AI Career Navigator
            </span>
          </div>

          {/* Gradient Hero Heading */}
          <h1
            className="font-extrabold text-center mb-[12px] leading-tight"
            style={{
              fontSize: 'clamp(28px, 3.5vw, 42px)',
              whiteSpace: 'nowrap',
              background: 'linear-gradient(135deg, #0F172A 40%, #6366F1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            What job are you targeting?
          </h1>
          <p
            key={taglineIndex}
            className="text-base text-center mb-[24px]"
            style={{ color: '#475569', animation: 'fadeIn 0.5s ease forwards' }}
          >
            {TAGLINES[taglineIndex]}
          </p>

          {/* Stats counters */}
          <div className="flex justify-center gap-10 mb-[28px] stagger-children" style={{ fontFamily: 'Inter, sans-serif' }}>
            {[
              { value: `${jobs.toLocaleString()}+`,     label: 'Roles Analyzed'      },
              { value: `${skills}+`,                    label: 'Skills Mapped'        },
              { value: `${roadmaps.toLocaleString()}+`, label: 'Roadmaps Generated'   },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight" style={{ fontWeight: 700 }}>{stat.value}</div>
                <div className="text-[11px] text-[#6B7280] font-normal uppercase tracking-wider mt-1.5" style={{ fontWeight: 400 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {authRequired && (
            <p className="text-sm text-[#EF4444] text-center mb-4">Please sign in to open your PathForge dashboard.</p>
          )}

          {/* Input Card */}
          <div
            className="bg-white transition-all duration-300"
            style={{
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              overflow: activeTab === 'title' ? 'visible' : 'hidden',
              boxShadow: cardHover
                ? '0 12px 40px rgba(99,102,241,0.12), 0 0 0 1px rgba(99,102,241,0.08)'
                : '0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(99,102,241,0.04)',
            }}
            onMouseEnter={() => setCardHover(true)}
            onMouseLeave={() => setCardHover(false)}
            onFocusCapture={() => setCardHover(true)}
            onBlurCapture={() => setCardHover(false)}
          >
            {/* Tabs with sliding underline */}
            <div className="flex border-b border-[#E5E7EB] relative">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 py-3.5 text-sm font-medium transition-colors relative"
                  style={{ color: activeTab === tab.id ? '#6366F1' : '#475569' }}
                >
                  {tab.label}
                </button>
              ))}
              {/* Sliding underline */}
              <div
                className="absolute bottom-0 h-0.5 rounded-t transition-all duration-250 ease-in-out"
                style={{
                  background: '#6366F1',
                  width: `${100 / tabs.length}%`,
                  left: `${(tabIndex / tabs.length) * 100}%`,
                  transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1), width 0.25s ease',
                }}
              />
            </div>

            {/* Tab Content */}
            <div className="p-6" style={{ height: '160px', overflow: activeTab === 'title' ? 'visible' : 'hidden' }}>
              <div key={activeTab} style={{ animation: 'fadeUp 0.2s ease forwards' }}>
              {activeTab === 'title' && (
                <div style={{ position: 'relative', width: '100%', marginTop: '8px' }}>
                  <input
                    type="text"
                    value={title}
                    onChange={e => {
                      setTitle(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 150)
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="e.g. Marketing Manager, UX Designer, Financial Analyst, Software Engineer..."
                    className="w-full bg-transparent border-none outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
                    style={{ paddingTop: '12px', fontSize: '15px', lineHeight: 1.5 }}
                  />
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                        zIndex: 50,
                        overflow: 'hidden',
                      }}
                    >
                      {filteredSuggestions.map((suggestion, idx) => (
                        <div
                          key={suggestion}
                          onMouseEnter={() => setHoveredSuggestionIdx(idx)}
                          onMouseLeave={() => setHoveredSuggestionIdx(null)}
                          onClick={() => {
                            setTitle(suggestion)
                            setShowSuggestions(false)
                          }}
                          style={{
                            padding: '10px 16px',
                            fontSize: '14px',
                            color: hoveredSuggestionIdx === idx ? '#6366F1' : '#374151',
                            backgroundColor: hoveredSuggestionIdx === idx ? '#F8F9FF' : 'transparent',
                            cursor: 'pointer',
                          }}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'description' && (
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="w-full text-base bg-transparent border-none outline-none text-[#0F172A] placeholder:text-[#94A3B8] resize-none"
                  style={{ height: '110px' }}
                />
              )}
              {activeTab === 'url' && (
                <div className="flex items-center gap-3" style={{ marginTop: '8px' }}>
                  <Globe className="w-5 h-5 text-[#94A3B8] flex-shrink-0" />
                  <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://linkedin.com/jobs/..."
                    className="flex-1 text-base bg-transparent border-none outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
                  />
                  <button
                    onClick={handleFetchUrl}
                    disabled={!url.trim() || isFetching}
                    className="btn-primary px-3.5 py-2 text-sm flex items-center gap-1.5 h-auto disabled:opacity-50 rounded-lg"
                    style={{ minHeight: 'unset', height: 'auto', background: '#6366F1' }}
                  >
                    {isFetching ? 'Fetching...' : 'Fetch'}
                    {!isFetching && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
              {activeTab === 'image' && (
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleImageDrop}
                  className={`border border-dashed rounded-xl text-center transition-colors ${
                    imageFile ? 'border-[#6366F1] bg-[#EEF2FF]' : 'border-[#E5E7EB]'
                  }`}
                  style={{ padding: '16px 20px', height: '112px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                >
                  <ImageIcon className={`w-7 h-7 mx-auto mb-1.5 ${imageFile ? 'text-[#6366F1]' : 'text-[#94A3B8]'}`} />
                  {imageFile ? (
                    <p className="text-sm text-[#6366F1] font-medium truncate max-w-xs mx-auto">{imageFile.name}</p>
                  ) : (
                    <div>
                      <p className="text-xs text-[#94A3B8] mb-1">Drop a job posting screenshot here</p>
                      <label className="text-xs text-[#6366F1] underline cursor-pointer font-semibold">
                        or browse
                        <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && void readImage(e.target.files[0])} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>
              )}
              </div>
            </div>

            <div className="h-px bg-[#F3F4F6] mx-4" />

            {/* Bottom Row */}
            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-2">
                {['Live market data', 'AI-powered', 'Free resources'].map(label => (
                  <span key={label} className="px-2 py-1 bg-[#F3F4F6] text-[#94A3B8] text-xs rounded-lg">{label}</span>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!hasContent}
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                className="flex items-center gap-2 text-sm font-bold text-white rounded-xl disabled:opacity-50 relative overflow-hidden transition-all duration-200"
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                  boxShadow: hasContent ? '0 4px 18px rgba(99,102,241,0.35)' : 'none',
                  transform: btnHover && hasContent ? 'translateY(-2px)' : undefined,
                  cursor: hasContent ? 'pointer' : 'not-allowed',
                }}
              >
                {btnHover && hasContent && (
                  <span
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)', animation: 'shimmerSlide 0.6s ease forwards' }}
                  />
                )}
                <span className="relative z-10">Analyze Role</span>
                <ArrowRight
                  className="w-4 h-4 relative z-10 transition-transform duration-200"
                  style={{ transform: btnHover && hasContent ? 'translateX(4px)' : 'translateX(0)' }}
                />
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
