import { createClient } from '@supabase/supabase-js';

// Reemplazá esto con las credenciales reales de tu proyecto de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; 
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);