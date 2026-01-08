import React from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface NeurologicalInsightsProps {
  indicators: string[];
  riskLevel: 'low' | 'moderate' | 'high';
  gameName: string;
  accuracy: number;
}

const NeurologicalInsights: React.FC<NeurologicalInsightsProps> = ({
  indicators,
  riskLevel,
  gameName,
  accuracy
}) => {
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'moderate': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'high': return <AlertCircle className="w-5 h-5" />;
      case 'moderate': return <Info className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getInsightMessage = () => {
    if (indicators.includes('phonological_processing')) {
      return 'Focus on sound-based exercises to strengthen phonological awareness.';
    }
    if (indicators.includes('visual_processing')) {
      return 'Visual pattern recognition exercises may help improve performance.';
    }
    if (indicators.includes('working_memory')) {
      return 'Memory-based games can help strengthen cognitive processing.';
    }
    return 'Continue practicing to build stronger reading foundations.';
  };

  if (indicators.length === 0 && riskLevel === 'low') {
    return null;
  }

  return (
    <motion.div
      className={`p-4 rounded-lg border-2 ${getRiskColor()} mt-4`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-start">
        <div className="mr-3 mt-0.5">
          {getRiskIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Brain className="w-4 h-4 mr-2" />
            <span className="font-semibold">Learning Insights</span>
          </div>
          
          {indicators.length > 0 && (
            <div className="mb-3">
              <p className="text-sm mb-2">Patterns detected in {gameName.replace(/_/g, ' ')}:</p>
              <div className="flex flex-wrap gap-1">
                {indicators.map((indicator, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs"
                  >
                    {indicator.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <p className="text-sm">{getInsightMessage()}</p>
          
          {riskLevel !== 'low' && (
            <p className="text-xs mt-2 opacity-80">
              💡 These insights help build your personalized learning profile
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NeurologicalInsights;