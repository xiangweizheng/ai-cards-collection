import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qsmkgsordivrfxhyqbfq.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export interface DatabaseCard {
  id: string
  title: string
  description: string
  type: string
  rarity?: string
  price?: number
  url?: string
  image_url?: string
  tags: string[]
  metadata: Record<string, unknown>
  user_id?: string
  created_at: string
  updated_at: string
}

export interface DatabaseDeck {
  id: string
  name: string
  description: string
  is_public: boolean
  tags: string[]
  card_ids: string[]
  user_id?: string
  created_at: string
  updated_at: string
}
