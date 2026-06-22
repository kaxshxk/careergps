'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowRight, Briefcase, Check } from 'lucide-react'
import type { UserProfile } from '@/lib/types'
import { DEFAULT_USER_PROFILE } from '@/lib/ui-data'

export type { UserProfile as UserAnswers }

interface AgentChatProps {
  jobTitle: string
  onComplete: (answers: UserProfile) => void
  onSkip: (answers: UserProfile) => void
  onEditJob: () => void
}

type MessageType = 'agent' | 'user'
type InputMode = 'none' | 'text' | 'chips' | 'multi-chips' | 'buttons'

interface Message {
  id: number
  type: MessageType
  content: string
  chips?: string[]
  multiSelect?: boolean
  buttons?: { label: string; primary?: boolean; action: string }[]
  detectedSkills?: string[]
  reviewData?: UserProfile
}

const Q_PROGRESS: Record<number, number> = { 0: 0, 1: 12, 2: 25, 3: 37, 4: 50, 5: 62, 6: 75, 7: 87, 8: 100 }

const NON_IT_KEYWORDS = [
  'marketing', 'finance', 'financial', 'design', 'designer',
  'healthcare', 'nurse', 'doctor', 'sales', 'legal', 'lawyer',
  'teacher', 'professor', 'hr', 'human resources', 'operations',
  'consultant', 'consulting', 'content', 'creator', 'founder',
  'entrepreneur', 'journalist', 'writer', 'editor',
]

function isNonItRole(jobTitle: string): boolean {
  const t = jobTitle.toLowerCase()
  return NON_IT_KEYWORDS.some(k => t.includes(k))
}

const Q2_IT_CHIPS    = ['Brand new to this', 'Some experience', 'Intermediate', 'Experienced']
const Q2_NON_IT_CHIPS = ['New to this field', '1-3 years experience', '3-7 years experience', '7+ years experience']
const Q3_CHIPS = ['30 mins', '1 hour', '2 hours', '3+ hours']
const Q4_CHIPS = ['1 month', '3 months', '6 months', '12 months']
const Q5_CHIPS = ['Video courses', 'Reading docs/books', 'Hands-on projects', 'Interactive exercises']
const Q6_CHIPS = ['Free only', 'Under $50/month', 'Flexible']
const Q7_IT_CHIPS    = ['Big Tech / FAANG', 'Startups', 'Consulting', 'Any company']
const Q7_NON_IT_CHIPS = ['Large Corporation', 'Small or Medium Business', 'Startup', 'Freelance or Independent', 'Government or Non-profit']
const Q8_IT_CHIPS    = ['Getting started', 'Staying consistent', 'Knowing what to focus on', 'Imposter syndrome']
const Q8_NON_IT_CHIPS = ["I don't know which skills matter", 'I have limited time to learn', 'I need to build my portfolio', 'I want to switch industries']

function parseHoursPerDay(chip: string): number {
  if (chip === '30 mins') return 0.5
  if (chip === '1 hour')  return 1
  if (chip === '2 hours') return 2
  return 3
}
function parseTimelineMonths(chip: string): number {
  if (chip === '1 month')  return 1
  if (chip === '3 months') return 3
  if (chip === '6 months') return 6
  return 12
}

function formatMarkdown(text: string) {
  if (!text) return null
  const parts = text.split('**')
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      return (
        <strong key={idx} className="font-bold text-[#0F172A]">
          {part}
        </strong>
      )
    }
    return <span key={idx}>{part}</span>
  })
}

export function AgentChat({ jobTitle, onComplete, onSkip, onEditJob }: AgentChatProps) {
  const nonIt = isNonItRole(jobTitle)
  const Q2_CHIPS = nonIt ? Q2_NON_IT_CHIPS : Q2_IT_CHIPS
  const Q7_CHIPS = nonIt ? Q7_NON_IT_CHIPS : Q7_IT_CHIPS
  const Q8_CHIPS = nonIt ? Q8_NON_IT_CHIPS : Q8_IT_CHIPS

  const [messages, setMessages]             = useState<Message[]>([])
  const [currentStep, setCurrentStep]       = useState(0)
  const [editingStep, setEditingStep]       = useState(0)
  const [inputMode, setInputMode]           = useState<InputMode>('none')
  const [textInput, setTextInput]           = useState('')
  const [isTyping, setIsTyping]             = useState(false)
  const [answers, setAnswers]               = useState<UserProfile>({ ...DEFAULT_USER_PROFILE, roleType: nonIt ? 'non_it' : 'it' })
  const [multiSelectBuffer, setMultiSelectBuffer] = useState<string[]>([])
  const messagesEndRef       = useRef<HTMLDivElement>(null)
  const fileInputRef         = useRef<HTMLInputElement>(null)
  const hasQueuedInitialMessage = useRef(false)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])

  const progressPct = Q_PROGRESS[Math.min(currentStep, 8)] ?? 0

  const addAgentMessage = (
    content: string,
    opts?: {
      chips?: string[]
      multiSelect?: boolean
      buttons?: { label: string; primary?: boolean; action: string }[]
      detectedSkills?: string[]
      reviewData?: UserProfile
      textInput?: boolean
    }
  ) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const msg: Message = { id: Date.now(), type: 'agent', content, chips: opts?.chips, multiSelect: opts?.multiSelect, buttons: opts?.buttons, detectedSkills: opts?.detectedSkills, reviewData: opts?.reviewData }
      setMessages(prev => [...prev, msg])
      if (opts?.chips) setInputMode(opts.multiSelect ? 'multi-chips' : 'chips')
      else if (opts?.buttons) setInputMode('buttons')
      else if (opts?.textInput) setInputMode('text')
      else setInputMode('none')
    }, 800)
  }

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content }])
    setInputMode('none')
    setTextInput('')
  }

  const askQ1 = () => addAgentMessage("What's your current role or background? (e.g. 'Frontend dev with 2 years React experience')", { textInput: true })
  const askQ2 = () => addAgentMessage(`How would you rate your experience with the core skills for **${jobTitle}**?`, { chips: Q2_CHIPS })
  const askQ3 = () => addAgentMessage('How much time can you dedicate to learning each day?', { chips: Q3_CHIPS })
  const askQ4 = () => addAgentMessage("What's your target timeline to be job-ready?", { chips: Q4_CHIPS })
  const askQ5 = () => { setMultiSelectBuffer([]); addAgentMessage('How do you learn best? Pick up to 2 styles.', { chips: Q5_CHIPS, multiSelect: true }) }
  const askQ6 = () => addAgentMessage("What's your budget for learning resources?", { chips: Q6_CHIPS })
  const askQ7 = () => addAgentMessage('What type of company are you targeting?', { chips: Q7_CHIPS })
  const askQ8 = () => addAgentMessage("Last one — what's your biggest challenge with learning right now?", { chips: Q8_CHIPS })

  const showFinalMessage = (a: UserProfile) => {
    const hoursLabel = a.hoursPerDay === 0.5 ? '30 min' : `${a.hoursPerDay}h`
    const styleStr   = a.learningStyle.length > 0 ? a.learningStyle.join(' + ') : 'mixed methods'
    const freeNote   = a.budget === 'Free only' ? 'only include free resources' : 'include premium resources where they add value'
    const content    = `Perfect. Here's what I've built your roadmap around:\n\n**Target role:** ${jobTitle}\n**Your level:** ${a.experienceLevel || 'intermediate'}\n**Commitment:** ${hoursLabel}/day over ${a.targetTimeline || '3 months'}\n**Company target:** ${a.targetCompanyType || 'any'}\n**Learning style:** ${styleStr}\n\nI'll calibrate difficulty to your level and ${freeNote}. Ready to forge your path?`
    addAgentMessage(content, { buttons: [{ label: 'Build My Roadmap', primary: true, action: 'build' }, { label: 'Review my answers', primary: false, action: 'review' }] })
  }

  useEffect(() => {
    if (hasQueuedInitialMessage.current) return
    hasQueuedInitialMessage.current = true
    const timeoutId = window.setTimeout(() => {
      addAgentMessage(`Hi! I've analyzed **${jobTitle}** and it looks like a great target. I have 8 quick questions to make your roadmap specific to you. Or share your resume and I'll skip a few.`, {
        buttons: [
          { label: 'Upload Resume',        primary: true,  action: 'upload'       },
          { label: 'Skip, ask me instead', primary: false, action: 'skip-resume'  },
        ],
      })
    }, 500)
    return () => { window.clearTimeout(timeoutId); hasQueuedInitialMessage.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleButtonAction = (action: string) => {
    if (action === 'upload') fileInputRef.current?.click()
    else if (action === 'skip-resume') { addUserMessage('Skip, ask me instead'); setCurrentStep(1); setTimeout(() => askQ1(), 300) }
    else if (action === 'build') onComplete(answers)
    else if (action === 'review') addAgentMessage("Here's everything I have on you. Edit anything before we start:", { reviewData: answers })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    addUserMessage(`Uploaded: ${file.name}`)
    setIsTyping(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    const detectedSkills = ['Python', 'SQL', 'React', 'Machine Learning']
    const updatedAnswers = { ...answers, hasResume: true, resumeSkills: detectedSkills }
    setAnswers(updatedAnswers)
    setIsTyping(false)
    setMessages(prev => [...prev, { id: Date.now(), type: 'agent', content: "Done! I found these skills in your resume — I'll factor them into your match score and skip the basics.", detectedSkills }])
    setCurrentStep(3)
    setTimeout(() => askQ3(), 800)
  }

  const handleTextSubmit = () => {
    if (!textInput.trim()) return
    const value = textInput.trim()
    addUserMessage(value)
    if (editingStep === 1) { const updated = { ...answers, currentRole: value }; setAnswers(updated); setEditingStep(0); setTimeout(() => showFinalMessage(updated), 300); return }
    if (currentStep === 1) { const updated = { ...answers, currentRole: value }; setAnswers(updated); setCurrentStep(2); setTimeout(() => askQ2(), 300) }
  }

  const handleChipSelect = (chip: string) => {
    if (editingStep > 0) { handleEditChipAnswer(editingStep, chip); return }
    addUserMessage(chip)
    if (currentStep === 2) { const u = { ...answers, experienceLevel: chip }; setAnswers(u); setCurrentStep(3); setTimeout(() => askQ3(), 300) }
    else if (currentStep === 3) { const u = { ...answers, hoursPerDay: parseHoursPerDay(chip), timeAvailable: chip }; setAnswers(u); setCurrentStep(4); setTimeout(() => askQ4(), 300) }
    else if (currentStep === 4) { const u = { ...answers, targetTimeline: chip, targetTimelineMonths: parseTimelineMonths(chip) }; setAnswers(u); setCurrentStep(5); setTimeout(() => askQ5(), 300) }
    else if (currentStep === 6) { const u = { ...answers, budget: chip }; setAnswers(u); setCurrentStep(7); setTimeout(() => askQ7(), 300) }
    else if (currentStep === 7) { const u = { ...answers, targetCompanyType: chip }; setAnswers(u); setCurrentStep(8); setTimeout(() => askQ8(), 300) }
    else if (currentStep === 8) { const u = { ...answers, biggestChallenge: chip }; setAnswers(u); setCurrentStep(9); setTimeout(() => showFinalMessage(u), 300) }
  }

  const handleMultiChipToggle = (chip: string) => {
    setMultiSelectBuffer(prev => {
      if (prev.includes(chip)) return prev.filter(c => c !== chip)
      if (prev.length >= 2) return prev
      return [...prev, chip]
    })
  }

  const handleMultiSelectDone = () => {
    const selected = multiSelectBuffer.length > 0 ? multiSelectBuffer : ['Video courses']
    addUserMessage(selected.join(' + '))
    if (editingStep === 5) { const u = { ...answers, learningStyle: selected }; setAnswers(u); setEditingStep(0); setMultiSelectBuffer([]); setTimeout(() => showFinalMessage(u), 300); return }
    const u = { ...answers, learningStyle: selected }; setAnswers(u); setCurrentStep(6); setMultiSelectBuffer([]); setTimeout(() => askQ6(), 300)
  }

  const handleEditStep = (step: number) => {
    setEditingStep(step)
    switch (step) {
      case 1: addAgentMessage("What should I update your background to?", { textInput: true }); setTextInput(answers.currentRole); break
      case 2: addAgentMessage('Update your experience level:', { chips: Q2_CHIPS }); break
      case 3: addAgentMessage('Update your daily time commitment:', { chips: Q3_CHIPS }); break
      case 4: addAgentMessage('Update your target timeline:', { chips: Q4_CHIPS }); break
      case 5: setMultiSelectBuffer([...answers.learningStyle]); addAgentMessage('Update your learning style (pick up to 2):', { chips: Q5_CHIPS, multiSelect: true }); break
      case 6: addAgentMessage('Update your budget:', { chips: Q6_CHIPS }); break
      case 7: addAgentMessage('Update your target company type:', { chips: Q7_CHIPS }); break
      case 8: addAgentMessage('Update your biggest challenge:', { chips: Q8_CHIPS }); break
    }
  }

  const handleEditChipAnswer = (step: number, chip: string) => {
    addUserMessage(chip)
    let updated = { ...answers }
    switch (step) {
      case 2: updated.experienceLevel = chip; break
      case 3: updated = { ...updated, hoursPerDay: parseHoursPerDay(chip), timeAvailable: chip }; break
      case 4: updated = { ...updated, targetTimeline: chip, targetTimelineMonths: parseTimelineMonths(chip) }; break
      case 6: updated.budget = chip; break
      case 7: updated.targetCompanyType = chip; break
      case 8: updated.biggestChallenge = chip; break
    }
    setAnswers(updated)
    setEditingStep(0)
    setTimeout(() => showFinalMessage(updated), 300)
  }

  const ReviewCard = ({ data }: { data: UserProfile }) => {
    const rows = [
      { label: 'Current role',     value: data.currentRole,                step: 1 },
      { label: 'Experience level', value: data.experienceLevel,            step: 2 },
      { label: 'Daily commitment', value: data.timeAvailable,              step: 3 },
      { label: 'Target timeline',  value: data.targetTimeline,             step: 4 },
      { label: 'Learning style',   value: data.learningStyle.join(', '),   step: 5 },
      { label: 'Budget',           value: data.budget,                     step: 6 },
      { label: 'Target company',   value: data.targetCompanyType,          step: 7 },
      { label: 'Biggest challenge',value: data.biggestChallenge,           step: 8 },
    ].filter(r => r.value)

    return (
      <div className="mt-3 space-y-1">
        {rows.map((row, i) => (
          <div key={row.step} className={`flex items-center justify-between py-2 ${i < rows.length - 1 ? 'border-b border-[#E5E7EB]' : ''}`}>
            <span className="text-sm text-[#475569]">{row.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#0F172A]">{row.value}</span>
              <button onClick={() => handleEditStep(row.step)} className="text-xs text-[#6366F1] hover:underline cursor-pointer">edit</button>
            </div>
          </div>
        ))}
        <button onClick={() => onComplete(data)} className="btn-primary w-full py-2.5 mt-3 text-sm flex items-center justify-center gap-2 h-auto rounded-xl">
          Build My Roadmap
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const questionNumber = currentStep >= 1 && currentStep <= 8 ? currentStep : null
  const activeChips = messages.filter(m => m.type === 'agent' && m.chips).at(-1)?.chips ?? []
  const activeButtons = messages.filter(m => m.type === 'agent' && m.buttons).at(-1)?.buttons ?? []

  return (
    <div
      className="h-screen flex flex-col bg-white relative overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Top progress bar — indigo, 3px */}
      <div className="h-[3px] w-full bg-[#F3F4F6] z-50 flex-shrink-0">
        <div
          className="h-full bg-[#6366F1] transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-white z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366F1,#7C3AED)' }}>
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
            </svg>
          </div>
          <span className="text-lg font-bold" style={{ background: 'linear-gradient(135deg,#6366F1,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.3px' }}>PathForge</span>
          
          {/* Job title chip with edit link */}
          <div className="hidden sm:flex items-center gap-1.5 ml-3 px-3 py-1 bg-[#EEF2FF] border border-[#C7D2FE] rounded-full">
            <Briefcase className="w-3.5 h-3.5 text-[#6366F1] flex-shrink-0" />
            <span className="text-xs font-semibold text-[#6366F1] max-w-[140px] truncate">{jobTitle}</span>
            <button onClick={onEditJob} className="text-[11px] text-[#4F46E5] hover:underline font-semibold cursor-pointer">edit</button>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {/* Progress Dots Row */}
          <div className="hidden md:flex items-center gap-2">
            {Array.from({ length: 8 }, (_, i) => {
              const qn = i + 1
              const isDone    = questionNumber !== null && qn < questionNumber
              const isCurrent = qn === questionNumber
              return (
                <div
                  key={qn}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width:      '10px',
                    height:     '10px',
                    backgroundColor: isDone ? '#6366F1' : isCurrent ? 'transparent' : '#E5E7EB',
                    border:     isCurrent ? '2px solid #6366F1' : 'none',
                  }}
                />
              )
            })}
          </div>
          
          <button onClick={() => onSkip(answers)} className="text-sm font-medium text-[#475569] hover:text-[#6366F1] transition-colors cursor-pointer">
            Skip all
          </button>
        </div>
      </header>

      {/* Sidebar Progress Card (desktop only, hidden on mobile) */}
      <div
        className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 w-[220px] bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex-col gap-4 z-30"
      >
        <h3 className="text-sm text-[#0F172A] tracking-tight" style={{ fontWeight: 600 }}>Your Analysis</h3>
        <hr className="border-[#E5E7EB]" />
        
        <div className="flex flex-col gap-3">
          <div>
            <div className="inline-flex items-center px-2.5 py-1 bg-[#EEF2FF] border border-[#C7D2FE] text-[#6366F1] text-xs font-semibold rounded-full max-w-full">
              <span className="truncate">{jobTitle}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <div className="text-[11px] font-semibold text-[#475569]">
              Questions answered: {Math.min(currentStep, 8)} of 8
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full bg-[#F3F4F6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6366F1] rounded-full transition-all duration-300"
                style={{ width: `${(Math.min(currentStep, 8) / 8) * 100}%` }}
              />
            </div>
          </div>
          
          <p className="text-[11px] text-[#94A3B8] font-normal mt-1">Estimated time: ~2 min</p>
        </div>
      </div>

      {/* Chat Area Container */}
      <div className="flex-1 relative overflow-hidden bg-white">
        <main
          className="h-full overflow-y-auto px-6 py-8"
          style={{
            backgroundImage: 'radial-gradient(rgba(156,163,175,0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          <div className="max-w-[640px] mx-auto space-y-6">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} message-in`}>
                {message.type === 'agent' ? (
                  <div className="flex gap-3" style={{ maxWidth: '520px' }}>
                    {/* Agent avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#6366F1,#7C3AED)', animation: 'avatarPulse 3s ease-in-out infinite' }}
                      >
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
                        </svg>
                      </div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ background: '#10B981' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#475569] mb-1.5">PathForge</p>
                      <div
                        className="bg-white border border-[#E5E7EB] transition-all duration-200"
                        style={{
                          borderRadius: '18px 18px 18px 4px',
                          padding: '16px 20px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        }}
                      >
                        <p className="text-[15px] text-[#0F172A] leading-relaxed whitespace-pre-line">
                          {formatMarkdown(message.content)}
                        </p>
                        {message.detectedSkills && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {message.detectedSkills.map(skill => (
                              <span key={skill} className="px-2 py-1 bg-green-50 border border-green-200 text-green-700 text-xs rounded-md">{skill}</span>
                            ))}
                          </div>
                        )}
                        {message.reviewData && <ReviewCard data={message.reviewData} />}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2" style={{ maxWidth: '400px' }}>
                    <div
                      className="px-[18px] py-[12px] text-[15px] font-medium"
                      style={{
                        background: '#EEF2FF',
                        color: '#4338CA',
                        borderRadius: '18px 18px 4px 18px',
                      }}
                    >
                      {message.content}
                    </div>
                    <Check className="w-3.5 h-3.5 flex-shrink-0 text-[#6366F1]" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3 message-in">
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366F1,#7C3AED)', animation: 'avatarPulse 3s ease-in-out infinite' }}>
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
                    </svg>
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ background: '#10B981' }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#475569] mb-1.5">PathForge</p>
                  <div className="bg-white border border-[#E5E7EB] px-4 py-3" style={{ borderRadius: '18px 18px 18px 4px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <div className="flex gap-1.5 items-center">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ background: '#94A3B8', animation: `bounceDot 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>
        {/* Subtle gradient fade at the bottom of the chat area before the input zone */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
      </div>

      {/* Input Bar */}
      <div className="border-t border-[#E5E7EB] bg-white px-6 py-[20px] z-20 flex-shrink-0">
        <div className="max-w-[640px] mx-auto w-full">
          {inputMode === 'buttons' && (
            <div className="flex flex-wrap justify-center items-center gap-4 w-full">
              {activeButtons.map(btn => (
                <button
                  key={btn.action}
                  onClick={() => handleButtonAction(btn.action)}
                  className={`px-[28px] py-[12px] text-sm font-semibold rounded-[24px] transition-all duration-200 cursor-pointer ${
                    btn.primary
                      ? 'text-white hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0'
                      : 'bg-white border border-[#E5E7EB] text-[#475569] hover:bg-[#EEF2FF] hover:border-[#6366F1] hover:text-[#6366F1] hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                  style={btn.primary ? { background: 'linear-gradient(135deg,#6366F1,#7C3AED)', boxShadow: '0 4px 18px rgba(99,102,241,0.25)' } : {}}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}

          {inputMode === 'chips' && (
            <div className="flex flex-wrap gap-2.5 justify-center w-full">
              {activeChips.map((chip, i) => (
                <button
                  key={chip}
                  onClick={() => handleChipSelect(chip)}
                  className="px-[20px] py-[10px] text-sm font-medium transition-all duration-150 border border-[#E5E7EB] bg-white text-[#475569] rounded-[24px] hover:border-[#6366F1] hover:bg-[#EEF2FF] hover:text-[#6366F1] hover:-translate-y-0.5 hover:shadow-sm cursor-pointer"
                  style={{ animationDelay: `${i * 60}ms`, animation: 'fadeInUp 0.3s ease forwards', opacity: 0 }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {inputMode === 'multi-chips' && (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex flex-wrap gap-2.5 justify-center">
                {activeChips.map((chip, i) => {
                  const isSelected = multiSelectBuffer.includes(chip)
                  return (
                    <button
                      key={chip}
                      onClick={() => handleMultiChipToggle(chip)}
                      className={`px-[20px] py-[10px] text-sm font-medium transition-all duration-150 border rounded-[24px] flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'border-[#6366F1] bg-[#EEF2FF] text-[#6366F1]'
                          : 'border-[#E5E7EB] bg-white text-[#475569] hover:border-[#6366F1] hover:bg-[#EEF2FF] hover:text-[#6366F1]'
                      }`}
                      style={{ animationDelay: `${i * 60}ms`, animation: 'fadeInUp 0.3s ease forwards', opacity: 0 }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      {chip}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={handleMultiSelectDone}
                disabled={multiSelectBuffer.length === 0}
                className="px-[28px] py-[12px] text-sm font-semibold rounded-[24px] disabled:opacity-50 text-white cursor-pointer hover:opacity-95"
                style={{ background: 'linear-gradient(135deg,#6366F1,#7C3AED)', boxShadow: '0 4px 12px rgba(99,102,241,0.2)' }}
              >
                Done ({multiSelectBuffer.length}/2 selected)
              </button>
            </div>
          )}

          {inputMode === 'text' && (
            <div className="relative flex items-center w-full max-w-[640px] mx-auto">
              <input
                type="text"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
                placeholder="Type your answer here..."
                autoFocus
                className="w-full pl-5 pr-14 py-3.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-2xl text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#6366F1] focus:bg-white focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] outline-none transition-all text-sm"
              />
              <button
                onClick={handleTextSubmit}
                disabled={!textInput.trim()}
                className="absolute right-2 p-2 rounded-xl text-white transition-all disabled:opacity-40 hover:opacity-90 active:scale-95 cursor-pointer bg-[#6366F1] hover:bg-[#4F46E5] flex items-center justify-center"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
        </div>
      </div>
    </div>
  )
}
