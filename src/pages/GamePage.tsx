import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import WordRecognitionGame from '../components/games/WordRecognitionGame'
import LetterSequencingGameSimple from '../components/games/LetterSequencingGameSimple'
import ReadingComprehensionGame from '../components/games/ReadingComprehensionGame'
import LetterMirrorGame from '../components/games/LetterMirrorGame'
import SpeedWordsGame from '../components/games/SpeedWordsGame'
import SoundTwinsGame from '../components/games/SoundTwinsGame'
import BuildWordGame from '../components/games/BuildWordGame'
import OddOneOutGame from '../components/games/OddOneOutGame'

const GamePage: React.FC = () => {
  const { gameType } = useParams<{ gameType: string }>()
  const { isAdmin } = useAuth()

  // Prevent admin users from accessing games
  if (isAdmin) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-6">Admin users cannot play games. Please use the admin dashboard to view user results.</p>
          <Link to="/admin" className="btn btn-primary">
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    )
  }

  switch (gameType) {
    case 'word-recognition':
      return <WordRecognitionGame onGameComplete={(score) => console.log('Game completed with score:', score)} />
    
    case 'letter-sequencing':
      return <LetterSequencingGameSimple />
    
    case 'reading-comprehension':
      return <ReadingComprehensionGame onGameComplete={(score) => console.log('Game completed with score:', score)} />
    
    case 'letter-mirror':
      return <LetterMirrorGame />
    
    case 'speed-words':
      return <SpeedWordsGame />
    
    case 'sound-twins':
      return <SoundTwinsGame />
    
    case 'odd-one-out':
      return <OddOneOutGame />
    
    default:
      return <WordRecognitionGame onGameComplete={(score) => console.log('Game completed with score:', score)} />
  }
}

export default GamePage