// src/lib/realtime.ts
import { supabase } from "./supabase";

export function subscribeToNewScores(callback: (payload: any) => void) {
  const channel = supabase
    .channel("public:game_scores")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "game_scores" }, (payload) => {
      callback(payload.new);
    })
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}