export function adaptiveDifficultyAdjustment(userHistory, currentGame) {
  if (!userHistory || userHistory.length === 0) {
    return { difficulty: 'beginner', reason: 'No history available' };
  }

  // Get recent performance for this game
  const gameHistory = userHistory
    .filter(h => h.game === currentGame)
    .slice(0, 5)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (gameHistory.length === 0) {
    return { difficulty: 'beginner', reason: 'First time playing this game' };
  }

  const avgScore = gameHistory.reduce((sum, h) => sum + h.score, 0) / gameHistory.length;
  const avgTime = gameHistory.reduce((sum, h) => sum + (h.time_taken || 0), 0) / gameHistory.length;
  const recentTrend = gameHistory.length >= 3 ? 
    gameHistory[0].score - gameHistory[2].score : 0;

  // Adaptive logic
  if (avgScore >= 85 && recentTrend >= 0) {
    return { difficulty: 'hard', reason: 'Excellent performance, increasing challenge' };
  } else if (avgScore >= 70 && avgTime < 3000) {
    return { difficulty: 'moderate', reason: 'Good performance and speed' };
  } else if (avgScore >= 50) {
    return { difficulty: 'easy', reason: 'Steady progress, maintaining level' };
  } else {
    return { difficulty: 'beginner', reason: 'Need more practice at basic level' };
  }
}

export function getNextLevelRecommendation(gameResult) {
  const { score, timeTaken, errors, currentDifficulty } = gameResult;
  
  const difficultyLevels = ['beginner', 'easy', 'moderate', 'hard'];
  const currentIndex = difficultyLevels.indexOf(currentDifficulty) || 0;
  
  // Performance thresholds
  const excellentScore = 85;
  const goodScore = 70;
  const passScore = 60;
  
  if (score >= excellentScore && timeTaken < 2500) {
    // Move up 2 levels if possible
    const nextIndex = Math.min(currentIndex + 2, difficultyLevels.length - 1);
    return {
      nextLevel: difficultyLevels[nextIndex],
      reason: 'Excellent performance - skipping ahead',
      confidence: 0.9
    };
  } else if (score >= goodScore && timeTaken < 3500) {
    // Move up 1 level
    const nextIndex = Math.min(currentIndex + 1, difficultyLevels.length - 1);
    return {
      nextLevel: difficultyLevels[nextIndex],
      reason: 'Good performance - advancing level',
      confidence: 0.8
    };
  } else if (score >= passScore) {
    // Stay at current level
    return {
      nextLevel: currentDifficulty,
      reason: 'Adequate performance - continue practicing',
      confidence: 0.7
    };
  } else {
    // Move down 1 level if possible
    const nextIndex = Math.max(currentIndex - 1, 0);
    return {
      nextLevel: difficultyLevels[nextIndex],
      reason: 'Need more practice - reducing difficulty',
      confidence: 0.6
    };
  }
}

export function personalizedGameSequence(userProfile) {
  const { weakAreas, strongAreas, dyslexiaIndicators } = userProfile;
  
  // Priority games based on neurological patterns
  const gameTargets = {
    'phonological_processing': ['word_recognition', 'sound_twins'],
    'visual_processing': ['letter_mirror', 'odd_one_out'],
    'working_memory': ['letter_sequence', 'word_recognition'],
    'rapid_naming': ['speed_words'],
    'sequencing_difficulty': ['letter_sequence']
  };
  
  let recommendedSequence = [];
  
  // Add games targeting weak areas first
  if (dyslexiaIndicators && dyslexiaIndicators.length > 0) {
    dyslexiaIndicators.forEach(indicator => {
      if (gameTargets[indicator]) {
        recommendedSequence.push(...gameTargets[indicator]);
      }
    });
  }
  
  // Add games for weak performance areas
  if (weakAreas) {
    recommendedSequence.push(...weakAreas);
  }
  
  // Remove duplicates and limit to 5 games
  return [...new Set(recommendedSequence)].slice(0, 5);
}