import express from "express";
import { supabase } from "../supabase.js";

const router = express.Router();

router.get("/weakness", async (req, res) => {
  const { user_id } = req.query;

  const { data, error } = await supabase.rpc("fetch_user_tag_counts", {
    user_val: user_id,
  });

  if (error) return res.status(500).json({ error });
  res.json({ report: data });
});

export default router;
