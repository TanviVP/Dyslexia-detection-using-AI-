import express from "express";
import { supabase } from "../supabase.js";

const router = express.Router();

// START ATTEMPT
router.post("/start", async (req, res) => {
  const { user_id, game_id, total_items, metadata } = req.body;

  const { data, error } = await supabase
    .from("attempts")
    .insert([{ user_id, game_id, total_items, metadata }])
    .select()
    .single();

  if (error) return res.status(500).json({ error });
  res.json({ attempt: data });
});

// END ATTEMPT
router.post("/end", async (req, res) => {
  const { attempt_id, score } = req.body;

  const { data, error } = await supabase
    .from("attempts")
    .update({
      score,
      completed_at: new Date().toISOString(),
    })
    .eq("id", attempt_id)
    .select()
    .single();

  if (error) return res.status(500).json({ error });
  res.json({ attempt: data });
});

export default router;
