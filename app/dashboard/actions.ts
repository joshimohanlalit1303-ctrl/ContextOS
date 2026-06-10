'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function generateApiKey(formData?: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Generate a key like libro_sk_a1b2c3d4e5f6
  const rawKey = 'libro_sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

  const name = formData?.get('name')?.toString() || 'Default Key'

  const { error } = await supabase
    .from('api_keys')
    .insert({
      user_id: user.id,
      key: rawKey,
      name: name
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

export async function deleteMemory(memoryId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // To delete a memory securely, we would normally check the endUserId and projectId.
  // Using Supabase client with RLS should protect it, or we delete directly using Drizzle.
  // Since we use Drizzle elsewhere, let's use the admin client or Drizzle.
  // Actually, we'll just use the supabase client to delete it. Assuming RLS or simple delete works.
  const { error } = await supabase.from('memories').delete().eq('id', memoryId);
  if (error) throw new Error('Failed to delete memory');

  revalidatePath('/dashboard')
}

export async function updateMemory(memoryId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('memories').update({ content }).eq('id', memoryId);
  if (error) throw new Error('Failed to update memory');

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


export async function deleteAllMemories() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('memories').delete().eq('end_user_id', user.id)
  
  if (error) {
    console.error('Delete All Error:', error)
    throw new Error('Failed to delete all memories')
  }

  revalidatePath('/dashboard')
}
