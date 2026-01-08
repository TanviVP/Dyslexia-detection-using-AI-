import express from "express";
import { supabase } from "../supabase.js";
import { analyzeScore } from "../Services/ScoringEngine.js";

const router = express.Router();

// Get recent scores
router.get("/", async (req, res) => {
  try {
    const { limit = 20, user_id } = req.query;
    
    let query = supabase
      .from("game_scores")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(parseInt(limit));
    
    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

import { authenticateToken } from "../auth.js";

// Save new score
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { game_name, difficulty_level, accuracy, avg_response_time, errors } = req.body;
    const user_id = req.user.id; // Get user ID from JWT token
    
    const analysis = analyzeScore(game_name, accuracy * 100, avg_response_time, errors);

    const { data, error } = await supabase
      .from("game_scores")
      .insert([
        {
          user_id,
          game: game_name,
          score: accuracy * 100,
          time_taken: avg_response_time,
          mistakes: errors,
          difficulty: analysis.difficulty,
          performance_label: analysis.performanceLabel,
          dyslexia_indicators: analysis.dyslexiaIndicators,
          risk_level: analysis.riskLevel,
          needs_assessment: analysis.needsAssessment
        }
      ])
      .select()
      .single();

    if (error) return res.status(400).json({ error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save score after each game
router.post("/submit", async (req, res) => {
  try {
    const { user_id, game, score, time_taken, mistakes } = req.body;

    const analysis = analyzeScore(game, score, time_taken, mistakes);

    const { data, error } = await supabase
      .from("game_scores")
      .insert([
        {
          user_id,
          game,
          score,
          time_taken,
          mistakes,
          difficulty: analysis.difficulty,
          performance_label: analysis.performanceLabel,
          dyslexia_indicators: analysis.dyslexiaIndicators,
          risk_level: analysis.riskLevel,
          needs_assessment: analysis.needsAssessment
        }
      ]);

    if (error) return res.status(400).json({ error });
    res.json({ 
      message: "Score saved", 
      analysis,
      neurological: {
        indicators: analysis.dyslexiaIndicators,
        riskLevel: analysis.riskLevel,
        needsAssessment: analysis.needsAssessment
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
