import express from "express";
import { supabase } from "../supabase.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  const { user_id, recommended_game, reason, metadata } = req.body;

  const { data, error } = await supabase
    .from("recommendations")
    .insert([{ user_id, recommended_game, reason, metadata }])
    .select()
    .single();

  if (error) return res.status(500).json({ error });
  res.json({ recommendation: data });
});

export default router;
