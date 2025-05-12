import { create } from 'zustand';
import { generateQuestion, evaluateResponse, generateFinalReport } from '../services/gemini';
import { textToSpeech, playAudio } from '../services/elevenlabs';
import { analyzeVideoFrame } from '../services/videoAnalysis';

interface InterviewQuestion {
  id: number;
  question: string;
  feedback?: string;
}

interface VideoAnalysis {
  timestamp: number;
  metrics: {
    eyeContact: number;
    engagement: number;
    stability: number;
  };
}

interface InterviewState {
  isActive: boolean;
  currentQuestionIndex: number;
  videoStream: MediaStream | null;
  audioStream: MediaStream | null;
  questions: InterviewQuestion[];
  isRecording: boolean;
  transcripts: Record<number, string>;
  results: string | null;
  recognition: any;
  videoAnalysis: VideoAnalysis[];
  
  // Actions
  startInterview: () => Promise<void>;
  endInterview: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  nextQuestion: () => Promise<void>;
  setResults: (results: string | null) => void;
  addVideoAnalysis: (metrics: VideoAnalysis['metrics']) => void;
}

const initialQuestion = {
  id: 1,
  question: 'Tell me about yourself and your background.',
};

export const useInterviewStore = create<InterviewState>((set, get) => ({
  isActive: false,
  currentQuestionIndex: 0,
  videoStream: null,
  audioStream: null,
  questions: [initialQuestion],
  isRecording: false,
  transcripts: {},
  results: null,
  recognition: null,
  videoAnalysis: [],

  startInterview: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const audioData = await textToSpeech(initialQuestion.question);
      await playAudio(audioData);

      set({ 
        isActive: true,
        videoStream: stream,
        audioStream,
        currentQuestionIndex: 0,
        transcripts: {},
        results: null,
        videoAnalysis: []
      });
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  },

  endInterview: async () => {
    const { videoStream, audioStream, questions, transcripts, recognition, videoAnalysis } = get();
    
    // Clean up media streams
    videoStream?.getTracks().forEach(track => track.stop());
    audioStream?.getTracks().forEach(track => track.stop());
    recognition?.stop();

    // Generate final report
    const responses = questions.map(q => ({
      question: q.question,
      response: transcripts[q.id] || '',
      feedback: q.feedback || ''
    }));

    const finalReport = await generateFinalReport(responses, videoAnalysis);
    set({ results: finalReport, isActive: false });
  },

  startRecording: async () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const { currentQuestionIndex, questions } = get();
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      set(state => ({
        transcripts: {
          ...state.transcripts,
          [state.questions[currentQuestionIndex].id]: transcript
        }
      }));
    };

    recognition.start();
    set({ isRecording: true, recognition });
  },

  stopRecording: async () => {
    const { recognition, currentQuestionIndex, questions, transcripts } = get();
    recognition?.stop();

    // Capture video analysis
    const videoElement = document.querySelector('video');
    if (videoElement) {
      const analysis = await analyzeVideoFrame(videoElement);
      if (analysis.faceDetected) {
        set(state => ({
          videoAnalysis: [
            ...state.videoAnalysis,
            {
              timestamp: Date.now(),
              metrics: analysis.analysis
            }
          ]
        }));
      }
    }

    // Get feedback for response
    const currentQuestion = questions[currentQuestionIndex];
    const feedback = await evaluateResponse(
      currentQuestion.question,
      transcripts[currentQuestion.id] || ''
    );

    // Generate next question
    const nextQuestion = await generateQuestion(transcripts[currentQuestion.id] || '');
    const newQuestion = { id: questions.length + 1, question: nextQuestion };

    // Update state
    set(state => ({
      isRecording: false,
      recognition: null,
      questions: state.questions.map((q, i) => 
        i === currentQuestionIndex ? { ...q, feedback } : q
      ).concat(newQuestion)
    }));

    // Speak next question
    const audioData = await textToSpeech(nextQuestion);
    await playAudio(audioData);
  },

  nextQuestion: async () => {
    const { currentQuestionIndex, questions, transcripts } = get();
    set({ currentQuestionIndex: currentQuestionIndex + 1 });
  },

  setResults: (results) => set({ results }),
  addVideoAnalysis: (metrics) => set(state => ({
    videoAnalysis: [
      ...state.videoAnalysis,
      { timestamp: Date.now(), metrics }
    ]
  }))
}));