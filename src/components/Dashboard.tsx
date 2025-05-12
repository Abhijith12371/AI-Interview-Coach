import React from 'react';
import { motion } from 'framer-motion';
import { useInterviewStore } from '../store/interviewStore';
import { Brain, Clock, Star, TrendingUp, Eye, Smile, Move } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { questions, transcripts, videoAnalysis } = useInterviewStore();
  
  // Calculate metrics
  const totalQuestions = questions.length;
  const completedQuestions = Object.keys(transcripts).length;
  
  const averageScore = questions
    .filter(q => q.feedback)
    .reduce((acc, curr) => {
      const score = curr.feedback?.match(/(\d+)\/10/)?.[1];
      return acc + (Number(score) || 0);
    }, 0) / questions.filter(q => q.feedback).length || 0;

  // Calculate video metrics
  const videoMetrics = videoAnalysis.reduce((acc, curr) => {
    acc.eyeContact += curr.metrics.eyeContact;
    acc.engagement += curr.metrics.engagement;
    acc.stability += curr.metrics.stability;
    acc.count++;
    return acc;
  }, { eyeContact: 0, engagement: 0, stability: 0, count: 0 });

  const cards = [
    { icon: Brain, title: 'Questions', value: totalQuestions },
    { icon: TrendingUp, title: 'Completed', value: `${completedQuestions}/${totalQuestions}` },
    { icon: Star, title: 'Avg Score', value: `${averageScore.toFixed(1)}/10` },
    { icon: Eye, title: 'Eye Contact', value: `${Math.round(
      videoMetrics.count ? (videoMetrics.eyeContact / videoMetrics.count) * 100 : 0
    )}%` },
    { icon: Smile, title: 'Engagement', value: `${Math.round(
      videoMetrics.count ? (videoMetrics.engagement / videoMetrics.count) * 100 : 0
    )}%` },
    { icon: Move, title: 'Stability', value: `${Math.round(
      videoMetrics.count ? (videoMetrics.stability / videoMetrics.count) * 100 : 0
    )}%` }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
    >
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-cyan-400/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-700 rounded-lg">
              <card.icon className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xs text-gray-400">{card.title}</h3>
              <p className="text-lg font-bold text-white">{card.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};