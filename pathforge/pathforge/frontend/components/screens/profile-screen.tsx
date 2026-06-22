'use client'

import { useState } from 'react'
import { ArrowLeft, Edit2, Check, X, Trash2, LogOut } from 'lucide-react'
import type { MockUser } from './auth-screen'
import { AppSidebar } from '@/components/app-sidebar'

type Tab = 'intelligence' | 'skills' | 'roadmap'

interface ProfileScreenProps {
  user: MockUser
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  currentStreak: number
  jobTitle: string
  onBack: () => void
  onProfileClick: () => void
  onLogout?: () => void
  previousScreen?: string
  sidebarContext?: 'dashboard' | 'analysis'
  savedRoadmapsCount?: number
  tasksCompleted?: number
  avgMatchScore?: number
  onNewAnalysis?: () => void
  stats?: {
    roadmapsCreated: number
    tasksCompleted: number
    currentStreak: number
    bestStreak: number
    avgMatchScore: number
    skillsLearned: number
  }
}

const DEFAULT_STATS = {
  roadmapsCreated: 1,
  tasksCompleted: 0,
  currentStreak: 0,
  bestStreak: 0,
  avgMatchScore: 0,
  skillsLearned: 0,
}

export function ProfileScreen({
  user,
  activeTab,
  onTabChange,
  currentStreak,
  jobTitle,
  onBack,
  onProfileClick,
  onLogout,
  stats = DEFAULT_STATS,
  previousScreen,
  sidebarContext,
  savedRoadmapsCount,
  tasksCompleted,
  avgMatchScore,
  onNewAnalysis,
}: ProfileScreenProps) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(user.name)
  const [editEmail, setEditEmail] = useState(user.email)
  const [editRole, setEditRole] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [notifWeekly, setNotifWeekly] = useState(true)
  const [notifDaily, setNotifDaily] = useState(false)
  const [notifAchiev, setNotifAchiev] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleSave = () => setEditing(false)
  const handleCancel = () => {
    setEditName(user.name)
    setEditEmail(user.email)
    setEditing(false)
  }

  const statItems = [
    { label: 'Roadmaps Created', value: stats.roadmapsCreated },
    { label: 'Tasks Completed', value: stats.tasksCompleted },
    { label: 'Current Streak', value: `${stats.currentStreak}d` },
    { label: 'Best Streak', value: `${stats.bestStreak}d` },
    { label: 'Avg Match Score', value: `${stats.avgMatchScore}%` },
    { label: 'Skills Learned', value: stats.skillsLearned },
  ]

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        currentStreak={currentStreak}
        jobTitle={jobTitle}
        onBack={onBack}
        userName={user.name}
        onProfileClick={onProfileClick}
        onLogout={onLogout}
        previousScreen={previousScreen}
        sidebarContext={sidebarContext}
        savedRoadmapsCount={savedRoadmapsCount}
        tasksCompleted={tasksCompleted}
        avgMatchScore={avgMatchScore}
        onNewAnalysis={onNewAnalysis}
      />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface border-b border-border px-6 py-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-text-muted">/</span>
          <span className="text-sm font-semibold text-text-primary">Profile</span>
        </div>

        <div className="max-w-2xl mx-auto p-6 space-y-5 screen-enter">
          {/* Profile header card */}
          <div className="bg-surface border border-border rounded-xl p-6 card-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#6366F1' }}
                >
                  <span className="text-2xl font-bold text-white">{user.initials}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
                    {user.name}
                  </h1>
                  <p className="text-sm text-text-muted mt-0.5">{user.email}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 text-xs rounded-full bg-chip-bg text-text-secondary border border-border">
                    {user.plan} Plan
                  </span>
                </div>
              </div>
              <button
                className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90"
                style={{ background: '#6366F1' }}
              >
                Upgrade to Pro
              </button>
            </div>
            <p className="text-xs text-text-muted mt-4">Member since {user.joinDate}</p>
          </div>

          {/* Personal Info */}
          <div className="bg-surface border border-border rounded-xl p-6 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">Personal Info</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-xs text-accent hover:underline"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 text-xs text-white px-2.5 py-1 rounded-lg"
                    style={{ background: '#6366F1' }}
                  >
                    <Check className="w-3 h-3" />
                    Save Changes
                  </button>
                  <button onClick={handleCancel} className="text-xs text-text-muted hover:text-text-primary">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {[
                { label: 'Full Name', value: editName, set: setEditName },
                { label: 'Email', value: editEmail, set: setEditEmail },
                { label: 'Current Role', value: editRole, set: setEditRole, placeholder: 'e.g. Software Engineer' },
                { label: 'Location', value: editLocation, set: setEditLocation, placeholder: 'e.g. San Francisco, CA' },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label}>
                  <p className="text-xs text-text-muted mb-1">{label}</p>
                  {editing ? (
                    <input
                      type="text"
                      value={value}
                      onChange={e => set(e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent transition-all"
                    />
                  ) : (
                    <p className="text-sm text-text-primary">{value || <span className="text-text-muted italic">Not set</span>}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Learning Stats */}
          <div className="bg-surface border border-border rounded-xl p-6 card-shadow">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Learning Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              {statItems.map(s => (
                <div key={s.label} className="bg-chip-bg rounded-xl p-4">
                  <p className="text-xs text-text-muted mb-1">{s.label}</p>
                  <p className="text-2xl font-bold font-mono" style={{ color: '#111827' }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-surface border border-border rounded-xl p-6 card-shadow">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Account Settings</h2>

            <div className="space-y-4 mb-6">
              {[
                { label: 'Weekly progress emails', checked: notifWeekly, set: setNotifWeekly },
                { label: 'Daily task reminders', checked: notifDaily, set: setNotifDaily },
                { label: 'Achievement notifications', checked: notifAchiev, set: setNotifAchiev },
              ].map(({ label, checked, set }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{label}</span>
                  <button
                    onClick={() => set(p => !p)}
                    className="relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0"
                    style={{ background: checked ? '#6366F1' : '#E5E7EB' }}
                  >
                    <span
                      className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
                      style={{ left: checked ? '22px' : '2px' }}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between py-3 border-t border-border">
              <span className="text-sm text-text-secondary">Theme</span>
              <span className="text-sm text-text-muted px-3 py-1 rounded-lg bg-chip-bg border border-border">Light</span>
            </div>

            {/* Sign Out */}
            <div className="pt-4 mt-2 border-t border-border">
              {showLogoutConfirm ? (
                <div className="p-4 rounded-xl border" style={{ borderColor: '#FCA5A5', background: '#FFF5F5' }}>
                  <p className="text-sm font-medium mb-3" style={{ color: '#EF4444' }}>Are you sure you want to sign out?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowLogoutConfirm(false); onLogout?.() }}
                      className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                      style={{ background: '#EF4444' }}
                    >
                      Sign Out
                    </button>
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="px-4 py-2 text-sm font-medium text-text-secondary rounded-lg border border-border hover:bg-chip-bg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: '#EF4444' }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              )}
            </div>

            {/* Delete Account */}
            <div className="pt-4 mt-4 border-t border-border">
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 text-sm font-medium transition-colors"
                  style={{ color: '#EF4444' }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              ) : (
                <div className="p-4 rounded-xl border" style={{ borderColor: '#FCA5A5', background: '#FFF5F5' }}>
                  <p className="text-sm font-medium mb-3" style={{ color: '#EF4444' }}>Are you sure you want to delete your account?</p>
                  <p className="text-xs text-text-muted mb-3">This action cannot be undone. All your data will be permanently removed.</p>
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                      style={{ background: '#EF4444' }}
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-sm font-medium text-text-secondary rounded-lg border border-border hover:bg-chip-bg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
