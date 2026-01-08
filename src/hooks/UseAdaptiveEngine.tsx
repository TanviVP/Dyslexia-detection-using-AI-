// src/hooks/useAdaptiveEngine.tsx
import { useState } from "react";
import { getNextDifficulty } from "../utils/adaptiveEngine";
import { saveGameScore } from "../services/gamesService";
import { saveRecommendation } from "../services/recommendationService";

export function useAdaptiveEngine(initialDifficulty = 1) {
  const [difficulty, setDifficulty] = useState<number>(initialDifficulty);
  const [loading, setLoading] = useState(false);

  async function onLevelEnd(payload: {
    gameName: string;
    accuracy: number;
    avgResponseTime: number;
    errors?: Record<string, any>;
  }) {
    setLoading(true);
    try {
      // Save score
      await saveGameScore({
        gameName: payload.gameName,
        difficulty,
        accuracy: payload.accuracy,
        avgResponseTime: payload.avgResponseTime,
        errors: payload.errors
      });

      // Decide next difficulty
      const result = getNextDifficulty({
        accuracy: payload.accuracy,
        avgResponseTime: payload.avgResponseTime,
        errors: payload.errors
      });

      // Save recommendation
      await saveRecommendation({
        gameName: payload.gameName,
        recommendedDifficulty: String(result.next),
        reason: result.reason
      });

      // Update difficulty locally
      setDifficulty((prev) => {
        // choose behavior: set to recommended, or +1/-1 etc.
        const next = typeof result.next === "number" ? result.next : prev; 
        return next;
      });

      return result;
    } finally {
      setLoading(false);
    }
  }

  return { difficulty, setDifficulty, onLevelEnd, loading };
}
