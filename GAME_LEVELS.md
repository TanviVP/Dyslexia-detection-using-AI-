# Game Level System Documentation

## Overview

The dyslexia assessment platform now features a comprehensive level system that provides multiple difficulty levels for each game, allowing for more precise assessment and better user experience.

## Level System Features

### 🎯 Multiple Difficulty Levels
Each game now supports 3-4 difficulty levels:
- **Beginner**: Entry-level with generous time limits and simple content
- **Easy**: Basic difficulty with moderate challenges
- **Moderate**: Intermediate level with increased complexity
- **Hard**: Advanced level with challenging content and time pressure

### 📊 Configurable Parameters
Each level includes:
- **Time Limit**: Customizable per question/task
- **Question Count**: Variable number of questions per level
- **Passing Score**: Different thresholds for each difficulty
- **Visual Design**: Unique color schemes and styling
- **Content Complexity**: Appropriate vocabulary and patterns

### 🎮 Enhanced User Experience
- **Level Selection Interface**: Beautiful, intuitive level picker
- **Progress Tracking**: Real-time progress bars and scoring
- **Detailed Results**: Comprehensive analytics per level
- **Adaptive Difficulty**: Users can choose their comfort level

## Game Configurations

### Word Recognition
- **Beginner**: 2-3 letter words, 15s per question, 8 questions, pass: 6/8
- **Easy**: 3-4 letter words, 12s per question, 10 questions, pass: 7/10
- **Moderate**: 5-6 letter words, 10s per question, 12 questions, pass: 8/12
- **Hard**: 7+ letter words, 8s per question, 15 questions, pass: 10/15

### Letter Sequencing
- **Beginner**: 3-letter words, 20s per question, 8 questions, pass: 6/8
- **Easy**: 4-letter words, 18s per question, 10 questions, pass: 7/10
- **Moderate**: 5-6 letter words, 15s per question, 12 questions, pass: 8/12
- **Hard**: 7+ letter words, 12s per question, 15 questions, pass: 10/15

### Reading Comprehension
- **Beginner**: Short sentences, 60s per passage, 5 questions, pass: 3/5
- **Easy**: Simple paragraphs, 90s per passage, 6 questions, pass: 4/6
- **Moderate**: Medium passages, 120s per passage, 8 questions, pass: 5/8
- **Hard**: Complex texts, 150s per passage, 10 questions, pass: 7/10

### Letter Mirror
- **Beginner**: Basic letter pairs (b/d, p/q), 8s per question, 10 questions, pass: 7/10
- **Easy**: Common confusable letters, 6s per question, 12 questions, pass: 8/12
- **Moderate**: Mixed case and rotated letters, 5s per question, 15 questions, pass: 10/15

### Speed Words
- **Beginner**: Simple words, 5s per question, 15 questions, pass: 10/15
- **Easy**: Common words, 4s per question, 20 questions, pass: 14/20
- **Moderate**: Mixed vocabulary, 3s per question, 25 questions, pass: 18/25
- **Hard**: Complex words, 2s per question, 30 questions, pass: 22/30

### Sound Twins
- **Beginner**: Clear sound differences, 10s per question, 8 questions, pass: 6/8
- **Easy**: Similar consonant sounds, 8s per question, 10 questions, pass: 7/10
- **Moderate**: Vowel discrimination, 6s per question, 12 questions, pass: 8/12
- **Hard**: Minimal sound pairs, 5s per question, 15 questions, pass: 11/15

### Build the Word
- **Beginner**: 3-4 letter words, 30s per question, 8 questions, pass: 6/8
- **Easy**: 4-5 letter words, 25s per question, 10 questions, pass: 7/10
- **Moderate**: 6-7 letter words, 20s per question, 12 questions, pass: 8/12
- **Hard**: 8+ letter words, 15s per question, 15 questions, pass: 10/15

### Odd One Out
- **Beginner**: Obvious category differences, 15s per question, 8 questions, pass: 6/8
- **Easy**: Clear semantic categories, 12s per question, 10 questions, pass: 7/10
- **Moderate**: Subtle pattern recognition, 10s per question, 12 questions, pass: 8/12
- **Hard**: Abstract relationships, 8s per question, 15 questions, pass: 11/15

## Implementation Details

### Core Files
- `src/lib/gameConfig.ts`: Central configuration for all games and levels
- `src/components/games/LevelSelector.tsx`: Reusable level selection component
- Updated game components to use the new level system

### Key Components

#### GameConfig Interface
```typescript
interface GameConfig {
  id: string
  title: string
  description: string
  icon: string
  levels: GameLevel[]
  estimatedDuration: string
  category: 'reading' | 'visual' | 'auditory' | 'cognitive'
}
```

#### GameLevel Interface
```typescript
interface GameLevel {
  id: string
  name: string
  description: string
  difficulty: 'Beginner' | 'Easy' | 'Moderate' | 'Hard' | 'Expert'
  timeLimit?: number
  questionsCount: number
  passingScore: number
  color: string
  bgColor: string
}
```

### Usage Example
```typescript
import { gameConfigs } from '../lib/gameConfig'
import LevelSelector from './LevelSelector'

// Get game configuration
const gameConfig = gameConfigs['word-recognition']

// Use level selector
<LevelSelector
  gameTitle={gameConfig.title}
  gameDescription={gameConfig.description}
  levels={gameConfig.levels}
  onLevelSelect={handleLevelSelect}
  onBack={handleBack}
/>
```

## Benefits

### For Users
- **Personalized Experience**: Choose appropriate difficulty level
- **Progressive Learning**: Start easy and advance gradually
- **Better Assessment**: More accurate dyslexia screening
- **Reduced Frustration**: Avoid overwhelming difficulty

### For Administrators
- **Detailed Analytics**: Level-specific performance data
- **Better Insights**: Understanding user capabilities across difficulties
- **Flexible Configuration**: Easy to adjust parameters
- **Scalable System**: Simple to add new levels or games

### For Developers
- **Centralized Configuration**: All game settings in one place
- **Reusable Components**: Level selector works across all games
- **Consistent Interface**: Uniform experience across games
- **Easy Maintenance**: Simple to update or modify levels

## Future Enhancements

### Adaptive Difficulty
- Automatically adjust difficulty based on performance
- Dynamic level recommendations
- Personalized difficulty curves

### Advanced Analytics
- Performance trends across levels
- Detailed timing and accuracy metrics
- Comparative analysis between levels

### Additional Features
- Level unlocking system
- Achievement badges for completing levels
- Multiplayer level challenges
- Custom level creation tools

## Migration Guide

### Updating Existing Games
1. Import the new configuration system
2. Replace hardcoded difficulty with level selection
3. Update game logic to use level parameters
4. Implement the LevelSelector component
5. Update result tracking to include level information

### Example Migration
```typescript
// Before
const [difficulty, setDifficulty] = useState<string | null>(null)

// After
const [selectedLevel, setSelectedLevel] = useState<GameLevel | null>(null)
const gameConfig = gameConfigs['game-id']
```

This level system provides a robust foundation for scalable, personalized dyslexia assessment games while maintaining consistency and ease of use across the platform.