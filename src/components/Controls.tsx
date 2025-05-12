import React from 'react';
import { useInterviewStore } from '../store/interviewStore';
import { Play, Square, ArrowRight, Camera } from 'lucide-react';

export const Controls: React.FC = () => {
  const { 
    isActive, 
    startInterview, 
    endInterview, 
    nextQuestion, 
    currentQuestionIndex,
    questions,
    isRecording
  } = useInterviewStore();

  return (
    <div className="flex flex-wrap gap-4 w-full">
      {!isActive ? (
        <button
          onClick={startInterview}
          className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
        >
          <Camera className="w-5 h-5" />
          Start Interview
        </button>
      ) : (
        <>
          <button
            onClick={endInterview}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg sm:flex-none sm:w-auto"
          >
            <Square className="w-5 h-5" />
            End Interview
          </button>
          
          <button
            onClick={nextQuestion}
            disabled={isRecording || currentQuestionIndex === questions.length - 1}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed sm:flex-none sm:w-auto"
          >
            <ArrowRight className="w-5 h-5" />
            Next Question
          </button>
        </>
      )}
    </div>
  );
};