// src/lib/supabase.ts
// import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabase = {
  // Stub for Supabase client
  from: (table: string) => ({
    insert: (data: any) => Promise.resolve({ data, error: null }),
    select: () => Promise.resolve({ data: [], error: null })
  })
}
