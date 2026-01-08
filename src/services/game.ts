import { supabase } from '../lib/supabase'

export async function saveGameScore({
  gameName,
  difficulty,
  accuracy,
  avgResponseTime,
  errors
}: {
  gameName: string;
  difficulty: string;
  accuracy: number;
  avgResponseTime: number;
  errors: any;
}) {
  const user = supabase.auth.getUser();
  const user_id = (await user).data.user?.id;

  const { data, error } = await supabase.from('game_scores').insert({
    user_id,
    game_name: gameName,
    difficulty_level: difficulty,
    accuracy,
    avg_response_time: avgResponseTime,
    errors
  });

  return { data, error };
}
