export function analyzeScore(game, score, timeTaken, mistakes) {
  let difficulty = "medium";
  let dyslexiaIndicators = [];
  let riskLevel = "low";

  // Basic difficulty adjustment
  if (score < 40 || mistakes > 5) difficulty = "easy";
  if (score > 80) difficulty = "hard";

  // Neurological difficulty tagging
  const gamePatterns = {
    word_recognition: {
      lowThreshold: 60,
      timeThreshold: 3000,
      indicators: ['phonological_processing', 'word_retrieval']
    },
    letter_sequence: {
      lowThreshold: 50,
      timeThreshold: 4000,
      indicators: ['sequencing_difficulty', 'working_memory']
    },
    sound_twins: {
      lowThreshold: 55,
      timeThreshold: 2500,
      indicators: ['auditory_discrimination', 'phonemic_awareness']
    },
    letter_mirror: {
      lowThreshold: 45,
      timeThreshold: 3500,
      indicators: ['visual_processing', 'letter_reversal']
    },
    speed_words: {
      lowThreshold: 70,
      timeThreshold: 2000,
      indicators: ['rapid_naming', 'processing_speed']
    }
  };

  const pattern = gamePatterns[game];
  if (pattern) {
    // Check performance indicators
    if (score < pattern.lowThreshold) {
      dyslexiaIndicators.push(...pattern.indicators);
      riskLevel = score < pattern.lowThreshold * 0.7 ? "high" : "moderate";
    }

    // Check response time indicators
    if (timeTaken > pattern.timeThreshold) {
      dyslexiaIndicators.push('slow_processing');
      if (riskLevel === "low") riskLevel = "moderate";
    }

    // Check error patterns
    if (mistakes && typeof mistakes === 'object') {
      const errorCount = Object.keys(mistakes).length;
      if (errorCount > 3) {
        dyslexiaIndicators.push('error_patterns');
        if (riskLevel === "low") riskLevel = "moderate";
      }
    }
  }

  return {
    difficulty,
    performanceLabel:
      score > 80 ? "excellent" :
      score > 60 ? "good" :
      score > 40 ? "average" : "weak",
    dyslexiaIndicators: [...new Set(dyslexiaIndicators)],
    riskLevel,
    needsAssessment: riskLevel !== "low"
  };
}
