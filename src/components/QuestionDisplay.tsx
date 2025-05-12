import React from 'react';
import { useInterviewStore } from '../store/interviewStore';
import { MessageCircle, Mic, MicOff } from 'lucide-react';

export const QuestionDisplay: React.FC = () => {
  const { 
    questions, 
    currentQuestionIndex, 
    isActive,
    isRecording,
    transcripts,
    startRecording,
    stopRecording
  } = useInterviewStore();
  
  if (!isActive) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const currentTranscript = transcripts[currentQuestion.id] || '';

  return (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gray-700 rounded-xl">
          <MessageCircle className="w-6 h-6 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            Question {currentQuestionIndex + 1}
          </h3>
          <p className="text-gray-300 mb-4">{currentQuestion.question}</p>
          
          <div className="space-y-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isRecording 
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-5 h-5" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Start Recording
                </>
              )}
            </button>
            
            {currentTranscript && (
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Your Response:</h4>
                <p className="text-gray-200">{currentTranscript}</p>
              </div>
            )}
            
            {currentQuestion.feedback && (
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                <h4 className="text-sm font-medium text-green-400 mb-2">Feedback:</h4>
                <p className="text-green-300">{currentQuestion.feedback}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};