'use client'

import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'

const MOCK_JWT = 'mock-pathforge-jwt'

let browserClient: SupabaseClient | null = null

function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  }
}

export function hasRealSupabaseConfig() {
  const { url, anonKey } = getSupabaseConfig()
  return Boolean(url && anonKey && url !== 'placeholder' && anonKey !== 'placeholder')
}

export function getSupabaseBrowserClient() {
  if (!hasRealSupabaseConfig()) return null
  if (!browserClient) {
    const { url, anonKey } = getSupabaseConfig()
    browserClient = createClient(url, anonKey)
  }
  return browserClient
}

export async function signInWithGoogle() {
  const client = getSupabaseBrowserClient()
  if (!client) return { data: { provider: 'mock' }, error: null }
  return client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
    },
  })
}

export function getMockSession() {
  return {
    access_token: MOCK_JWT,
    token_type: 'bearer',
    user: {
      id: 'mock-user-001',
      email: 'demo@pathforge.ai',
      user_metadata: { full_name: 'PathForge Demo User' },
    },
  }
}

export async function getClientSession(forceMock = false): Promise<{ session: Session | null; isMock: boolean }> {
  if (forceMock || !hasRealSupabaseConfig()) {
    return { session: getMockSession() as Session, isMock: true }
  }
  const client = getSupabaseBrowserClient()
  if (!client) {
    return { session: null, isMock: false }
  }
  const { data } = await client.auth.getSession()
  return { session: data.session, isMock: false }
}

export async function getAccessToken(forceMock = false): Promise<string> {
  const { session, isMock } = await getClientSession(forceMock)
  if (isMock) return MOCK_JWT
  if (!session?.access_token) {
    throw new Error('Please sign in to continue.')
  }
  return session.access_token
}
