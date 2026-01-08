import express from "express";
import { supabase } from "../supabase.js";

const router = express.Router();

// Get comprehensive neurological assessment
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from("game_scores")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error });

    // Aggregate neurological indicators
    const indicators = {};
    const riskLevels = { low: 0, moderate: 0, high: 0 };
    const gamePerformance = {};

    data.forEach(score => {
      // Count indicators
      if (score.dyslexia_indicators) {
        score.dyslexia_indicators.forEach(indicator => {
          indicators[indicator] = (indicators[indicator] || 0) + 1;
        });
      }

      // Count risk levels
      if (score.risk_level) {
        riskLevels[score.risk_level]++;
      }

      // Track game performance
      if (!gamePerformance[score.game]) {
        gamePerformance[score.game] = {
          scores: [],
          avgScore: 0,
          trend: 'stable'
        };
      }
      gamePerformance[score.game].scores.push(score.score);
    });

    // Calculate averages and trends
    Object.keys(gamePerformance).forEach(game => {
      const scores = gamePerformance[game].scores;
      gamePerformance[game].avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      
      // Simple trend analysis
      if (scores.length >= 3) {
        const recent = scores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const older = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;
        gamePerformance[game].trend = recent > older + 5 ? 'improving' : 
                                     recent < older - 5 ? 'declining' : 'stable';
      }
    });

    // Overall assessment
    const totalRisk = riskLevels.high * 3 + riskLevels.moderate * 2 + riskLevels.low;
    const totalScores = data.length;
    const riskRatio = totalRisk / (totalScores * 3);

    let overallAssessment = "low_risk";
    if (riskRatio > 0.6) overallAssessment = "high_risk";
    else if (riskRatio > 0.3) overallAssessment = "moderate_risk";

    const needsProfessionalAssessment = 
      riskLevels.high >= 3 || 
      (riskLevels.high >= 1 && riskLevels.moderate >= 3) ||
      Object.keys(indicators).length >= 4;

    res.json({
      assessment: {
        overallRisk: overallAssessment,
        needsProfessionalAssessment,
        confidence: Math.min(totalScores / 10, 1) // Confidence increases with more data
      },
      indicators: Object.entries(indicators)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, frequency: count })),
      riskDistribution: riskLevels,
      gamePerformance,
      recommendations: needsProfessionalAssessment ? 
        ["Consult with educational specialist", "Consider formal dyslexia assessment"] :
        ["Continue regular practice", "Monitor progress"],
      totalAssessments: totalScores
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;