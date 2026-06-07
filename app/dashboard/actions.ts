'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function generateApiKey() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Generate a key like libro_sk_a1b2c3d4e5f6
  const rawKey = 'libro_sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

  const { error } = await supabase
    .from('api_keys')
    .insert({
      user_id: user.id,
      key: rawKey
    })

  if (error) {
    console.error(error)
    throw new Error('Failed to generate API key')
  }

  revalidatePath('/dashboard')
}

export async function deleteApiKey(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error(error)
    throw new Error('Failed to delete API key')
  }

  revalidatePath('/dashboard')
}

export async function ensureApiKey(): Promise<string> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if user already has a key
  const { data: existing } = await supabase
    .from('api_keys')
    .select('key')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (existing?.key) return existing.key

  // Auto-generate a key
  const rawKey = 'libro_sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

  const { error } = await supabase
    .from('api_keys')
    .insert({ user_id: user.id, key: rawKey })

  if (error) throw new Error('Failed to generate API key')

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/connect')
  return rawKey
}

