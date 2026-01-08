import { supabase } from '../lib/supabase'

export async function signUp(email: string, password: string, fullName: string, role: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role
      }
    }
  });

  return { data, error };
}
