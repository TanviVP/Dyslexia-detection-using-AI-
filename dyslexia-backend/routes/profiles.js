import express from "express";
import { supabase } from "../supabase.js";

const router = express.Router();

// Get user profile
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user_id)
      .single();

    if (error) return res.status(400).json({ error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user_id)
      .select()
      .single();

    if (error) return res.status(400).json({ error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;