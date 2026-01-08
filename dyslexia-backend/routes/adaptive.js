import express from "express";
import { supabase } from "../supabase.js";
import { adaptiveDifficultyAdjustment, getNextLevelRecommendation, personalizedGameSequence } from "../Services/AdaptiveEngine.js";

const router = express.Router();

// Get adaptive difficulty for a game
router.get("/difficulty/:game", async (req, res) => {
  try {
    const { game } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.json({ difficulty: 'beginner', reason: 'No user specified' });
    }

    const { data, error } = await supabase
      .from("game_scores")
      .select("*")
      .eq("user_id", user_id)
      .eq("game", game)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) return res.status(400).json({ error });

    const recommendation = adaptiveDifficultyAdjustment(data || [], game);
    res.json(recommendation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get next level recommendation after game completion
router.post("/next-level", async (req, res) => {
  try {
    const { score, timeTaken, errors, currentDifficulty, game } = req.body;

    const recommendation = getNextLevelRecommendation({
      score,
      timeTaken,
      errors,
      currentDifficulty
    });

    res.json(recommendation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get personalized game sequence
router.get("/sequence/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("game_scores")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error });

    // Analyze user profile
    const weakAreas = [];
    const dyslexiaIndicators = [];
    
    data.forEach(score => {
      if (score.score < 60) {
        weakAreas.push(score.game);
      }
      if (score.dyslexia_indicators) {
        dyslexiaIndicators.push(...score.dyslexia_indicators);
      }
    });

    const userProfile = {
      weakAreas: [...new Set(weakAreas)],
      dyslexiaIndicators: [...new Set(dyslexiaIndicators)]
    };

    const sequence = personalizedGameSequence(userProfile);
    res.json({ sequence, profile: userProfile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;