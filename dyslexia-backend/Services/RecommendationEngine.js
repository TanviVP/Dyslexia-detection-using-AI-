export function getRecommendations(history) {
  let lowAreas = {};
  let dyslexiaPatterns = {};
  let riskFactors = [];

  // Analyze performance patterns
  history.forEach(row => {
    if (row.score < 50) {
      lowAreas[row.game] = (lowAreas[row.game] || 0) + 1;
    }

    // Track dyslexia indicators if available
    if (row.dyslexia_indicators && Array.isArray(row.dyslexia_indicators)) {
      row.dyslexia_indicators.forEach(indicator => {
        dyslexiaPatterns[indicator] = (dyslexiaPatterns[indicator] || 0) + 1;
      });
    }

    // Track risk levels
    if (row.risk_level && row.risk_level !== 'low') {
      riskFactors.push({
        game: row.game,
        risk: row.risk_level,
        score: row.score
      });
    }
  });

  // Generate targeted recommendations
  const recommendations = [];

  // Priority games based on dyslexia patterns
  const patternGames = {
    'phonological_processing': ['word_recognition', 'sound_twins'],
    'visual_processing': ['letter_mirror', 'odd_one_out'],
    'sequencing_difficulty': ['letter_sequence'],
    'rapid_naming': ['speed_words'],
    'working_memory': ['letter_sequence', 'word_recognition']
  };

  // Recommend games based on most frequent dyslexia indicators
  const topPatterns = Object.entries(dyslexiaPatterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  topPatterns.forEach(([pattern]) => {
    if (patternGames[pattern]) {
      recommendations.push(...patternGames[pattern]);
    }
  });

  // Add games with consistent low performance
  const sorted = Object.entries(lowAreas)
    .sort((a, b) => b[1] - a[1])
    .map(x => x[0]);

  recommendations.push(...sorted);

  // Default recommendations if no patterns found
  if (recommendations.length === 0) {
    return {
      games: ["word_recognition", "sound_twins", "letter_sequence"],
      dyslexiaRisk: "low",
      patterns: [],
      needsAssessment: false
    };
  }

  // Remove duplicates and limit to top 3
  const uniqueGames = [...new Set(recommendations)].slice(0, 3);

  // Determine overall risk assessment
  const highRiskCount = riskFactors.filter(r => r.risk === 'high').length;
  const moderateRiskCount = riskFactors.filter(r => r.risk === 'moderate').length;

  let overallRisk = "low";
  if (highRiskCount >= 2) overallRisk = "high";
  else if (highRiskCount >= 1 || moderateRiskCount >= 3) overallRisk = "moderate";

  return {
    games: uniqueGames,
    dyslexiaRisk: overallRisk,
    patterns: Object.keys(dyslexiaPatterns),
    needsAssessment: overallRisk !== "low",
    riskFactors: riskFactors.slice(0, 5)
  };
}
