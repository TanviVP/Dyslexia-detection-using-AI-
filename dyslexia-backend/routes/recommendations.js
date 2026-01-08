import express from "express";
import { supabase } from "../supabase.js";
import { getRecommendations } from "../Services/RecommendationEngine.js";

const router = express.Router();

// Get recommendations
router.get("/", async (req, res) => {
  try {
    const { limit = 10, user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }
    
    const { data, error } = await supabase
      .from("game_scores")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error });

    const analysis = getRecommendations(data || []);
    
    res.json(analysis.games.slice(0, parseInt(limit)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("game_scores")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error });

    const analysis = getRecommendations(data);

    res.json({ 
      recommended: analysis.games,
      neurological: {
        dyslexiaRisk: analysis.dyslexiaRisk,
        patterns: analysis.patterns,
        needsAssessment: analysis.needsAssessment,
        riskFactors: analysis.riskFactors
      },
      totalScores: data.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
