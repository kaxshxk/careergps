'use client'

import { useState } from 'react'
import { Check, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'

export interface MockUser {
  name: string
  email: string
  plan: 'Free' | 'Pro'
  joinDate: string
  initials: string
}

interface AuthScreenProps {
  onSignIn: (user: MockUser) => void
  onClose: () => void
  fullPage?: boolean
}

function getStrength(password: string): { label: string; color: string; width: string } {
  const len = password.length
  if (len === 0) return { label: '', color: '#E5E7EB', width: '0%' }
  if (len < 6)  return { label: 'Weak',        color: '#EF4444', width: '25%' }
  if (len < 10) return { label: 'Fair',         color: '#F59E0B', width: '50%' }
  if (len < 14) return { label: 'Strong',       color: '#10B981', width: '75%' }
  return           { label: 'Very Strong', color: '#6366F1', width: '100%' }
}

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'User'
  return local
    .replace(/[._-]/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const FEATURES = [
  'AI-powered skill gap analysis in seconds',
  'Personalized roadmaps for 500+ job roles',
  'Curated resources, free & paid',
]

const FULL_PAGE_FEATURES = [
  'Works for IT and Non-IT roles',
  'Personalized to your background',
  'Free resources prioritized',
]

const FLOATING_SKILLS = ['Python', 'React', 'SQL', 'Machine Learning', 'System Design', 'TypeScript']

export function AuthScreen({ onSignIn, onClose, fullPage = false }: AuthScreenProps) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')

  const [siEmail, setSiEmail]         = useState('')
  const [siPassword, setSiPassword]   = useState('')
  const [siShowPw, setSiShowPw]       = useState(false)

  const [suName, setSuName]           = useState('')
  const [suEmail, setSuEmail]         = useState('')
  const [suPassword, setSuPassword]   = useState('')
  const [suConfirm, setSuConfirm]     = useState('')
  const [suShowPw, setSuShowPw]       = useState(false)
  const [suTerms, setSuTerms]         = useState(false)
  const [error, setError]             = useState('')

  const strength = getStrength(suPassword)

  const buildUser = (name: string, email: string): MockUser => {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
    return { name, email, plan: 'Free', joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), initials }
  }

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!siEmail || !siPassword) { setError('Please fill in all fields.'); return }
    onSignIn(buildUser(nameFromEmail(siEmail), siEmail))
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!suName || !suEmail || !suPassword || !suConfirm) { setError('Please fill in all fields.'); return }
    if (suPassword !== suConfirm) { setError('Passwords do not match.'); return }
    if (!suTerms) { setError('Please accept the Terms of Service.'); return }
    onSignIn(buildUser(suName, suEmail))
  }

  const handleGoogle = () => onSignIn(buildUser('Google User', 'google@example.com'))

  const inputBase = `w-full pl-10 pr-4 py-3 border border-[#E5E7EB] rounded-[10px] text-[15px] text-[#0F172A] placeholder:text-[#94A3B8] bg-white outline-none transition-all duration-200`
  const inputFocus = `focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]`

  const features = fullPage ? FULL_PAGE_FEATURES : FEATURES

  return (
    <div className="fixed inset-0 z-50 flex" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{
          width: fullPage ? '45%' : '52%',
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 6s ease infinite',
        }}
      >
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">PathForge</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h1 className="text-white font-extrabold text-[36px] leading-tight mb-4" style={{ fontWeight: 800 }}>
            {fullPage ? 'Your AI Career\nNavigator' : 'Your AI career\nnavigator is ready.'}
          </h1>
          <p className="text-indigo-100 text-base mb-8 leading-relaxed max-w-sm">
            {fullPage
              ? 'Get a personalized learning roadmap built from live job market data'
              : 'Analyze any job role and get a personalized learning roadmap in under 30 seconds.'}
          </p>

          <div className="space-y-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3" style={{ animation: `slideRight 0.4s ease ${i * 0.1}s both` }}>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-white/90 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating demo cards */}
        <div className="relative z-10 flex gap-3">
          <div
            className="bg-white rounded-xl p-3 shadow-lg flex-1"
            style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '0s' }}
          >
            <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Skills Needed</p>
            <div className="flex flex-wrap gap-1.5">
              {FLOATING_SKILLS.slice(0, 4).map(s => (
                <span key={s} className="px-2 py-0.5 text-[11px] font-medium rounded-full" style={{ background: '#EEF2FF', color: '#6366F1' }}>{s}</span>
              ))}
            </div>
          </div>
          <div
            className="bg-white rounded-xl p-3 shadow-lg w-28 flex flex-col items-center justify-center"
            style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '1.2s' }}
          >
            <div className="relative w-14 h-14 mb-1">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" fill="none" stroke="#F3F4F6" strokeWidth="4" />
                <circle cx="22" cy="22" r="18" fill="none" stroke="#6366F1" strokeWidth="4" strokeLinecap="round" strokeDasharray="113.1" strokeDashoffset="28" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-[#0F172A]">75%</span>
              </div>
            </div>
            <p className="text-[10px] text-[#94A3B8] font-medium">Match</p>
          </div>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────────── */}
      <div className="flex-1 bg-white flex items-center justify-center p-8 relative overflow-y-auto">
        {/* Close button — only shown when not fullPage */}
        {!fullPage && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F3F4F6] transition-all text-lg font-light"
          >
            ×
          </button>
        )}

        <div className="w-full max-w-[400px]" style={{ animation: 'scaleIn 0.3s ease forwards' }}>
          {/* Logo (mobile only) */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366F1,#7C3AED)' }}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
              </svg>
            </div>
            <span className="text-lg font-bold" style={{ background: 'linear-gradient(135deg,#6366F1,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PathForge</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {fullPage ? 'Welcome to PathForge' : tab === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-[#475569]">
              {tab === 'signin' ? 'Sign in to continue your career journey.' : 'Start forging your path today.'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex p-1 bg-[#F3F4F6] rounded-xl mb-6 relative">
            <div
              className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-in-out"
              style={{
                background: '#6366F1',
                width: 'calc(50% - 4px)',
                left: tab === 'signin' ? '4px' : 'calc(50%)',
                boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
              }}
            />
            {(['signin', 'signup'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className="flex-1 py-2 text-sm font-semibold relative z-10 transition-colors duration-200 rounded-lg"
                style={{ color: tab === t ? '#FFFFFF' : '#475569' }}
              >
                {t === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-100">
              <p className="text-xs text-red-500">{error}</p>
            </div>
          )}

          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input type="email" placeholder="Email address" value={siEmail} onChange={e => setSiEmail(e.target.value)}
                  className={`${inputBase} ${inputFocus}`} />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input type={siShowPw ? 'text' : 'password'} placeholder="Password" value={siPassword} onChange={e => setSiPassword(e.target.value)}
                  className={`${inputBase} pr-10 ${inputFocus}`} />
                <button type="button" onClick={() => setSiShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors">
                  {siShowPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-right">
                <button type="button" className="text-xs text-[#94A3B8] hover:text-[#6366F1] transition-colors">Forgot password?</button>
              </div>
              <button type="submit" className="btn-primary w-full text-sm font-semibold">
                Sign In
              </button>
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-[#E5E7EB]" />
                <span className="text-xs text-[#94A3B8]">or continue with</span>
                <div className="flex-1 h-px bg-[#E5E7EB]" />
              </div>
              <button type="button" onClick={handleGoogle}
                className="w-full h-12 rounded-[10px] border border-[#E5E7EB] bg-white text-sm font-medium text-[#0F172A] flex items-center justify-center gap-2 hover:bg-[#F8F9FF] hover:shadow-sm transition-all duration-200">
                <GoogleIcon />
                Continue with Google
              </button>
              <p className="text-center text-xs text-[#94A3B8]">
                {"Don't have an account? "}
                <button type="button" onClick={() => setTab('signup')} className="text-[#6366F1] font-medium hover:underline">Sign up</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input type="text" placeholder="Full name" value={suName} onChange={e => setSuName(e.target.value)}
                  className={`${inputBase} ${inputFocus}`} />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input type="email" placeholder="Email address" value={suEmail} onChange={e => setSuEmail(e.target.value)}
                  className={`${inputBase} ${inputFocus}`} />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input type={suShowPw ? 'text' : 'password'} placeholder="Password" value={suPassword} onChange={e => setSuPassword(e.target.value)}
                  className={`${inputBase} pr-10 ${inputFocus}`} />
                <button type="button" onClick={() => setSuShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors">
                  {suShowPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {suPassword && (
                <div className="px-1">
                  <div className="h-1 rounded-full overflow-hidden bg-[#F3F4F6]">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: strength.width, background: strength.color }} />
                  </div>
                  {strength.label && <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label}</p>}
                </div>
              )}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input type="password" placeholder="Confirm password" value={suConfirm} onChange={e => setSuConfirm(e.target.value)}
                  className={`${inputBase} ${inputFocus}`} />
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={suTerms} onChange={e => setSuTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-indigo-500 rounded" />
                <span className="text-xs text-[#94A3B8]">
                  I agree to the{' '}
                  <span className="text-[#6366F1] cursor-pointer hover:underline">Terms of Service</span>
                </span>
              </label>
              <button type="submit" className="btn-primary w-full text-sm font-semibold">
                Create Account
              </button>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#E5E7EB]" />
                <span className="text-xs text-[#94A3B8]">or continue with</span>
                <div className="flex-1 h-px bg-[#E5E7EB]" />
              </div>
              <button type="button" onClick={handleGoogle}
                className="w-full h-12 rounded-[10px] border border-[#E5E7EB] bg-white text-sm font-medium text-[#0F172A] flex items-center justify-center gap-2 hover:bg-[#F8F9FF] hover:shadow-sm transition-all duration-200">
                <GoogleIcon />
                Continue with Google
              </button>
              <p className="text-center text-xs text-[#94A3B8]">
                Already have an account?{' '}
                <button type="button" onClick={() => setTab('signin')} className="text-[#6366F1] font-medium hover:underline">Sign in</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
