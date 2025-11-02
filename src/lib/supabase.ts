import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON || 'public-anon-key'
export const supabase = createClient(supabaseUrl, supabaseKey)
