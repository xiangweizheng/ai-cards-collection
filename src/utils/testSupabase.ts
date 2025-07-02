import { supabase } from '@/lib/supabase'

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // 测试数据库连接
    const { data, error } = await supabase
      .from('cards')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }
    
    console.log('Supabase connection successful:', data)
    return true
  } catch (error) {
    console.error('Supabase test failed:', error)
    return false
  }
}

export async function testSupabaseAuth() {
  try {
    console.log('Testing Supabase auth...')
    
    // 测试匿名登录
    const { data, error } = await supabase.auth.signInAnonymously()
    
    if (error) {
      console.error('Supabase auth error:', error)
      return false
    }
    
    console.log('Supabase auth successful:', data.user?.id)
    return true
  } catch (error) {
    console.error('Supabase auth test failed:', error)
    return false
  }
}
