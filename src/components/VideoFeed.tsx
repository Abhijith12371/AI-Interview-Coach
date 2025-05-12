import React, { useEffect, useRef, useState } from 'react';
import { useInterviewStore } from '../store/interviewStore';
import { analyzeVideoFrame } from '../services/videoAnalysis';

export const VideoFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const analysisInterval = useRef<NodeJS.Timeout>();
  const [analysis, setAnalysis] = useState<any>(null);
  const isRecording = useInterviewStore((state) => state.isRecording);
  const videoStream = useInterviewStore((state) => state.videoStream);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
      
      // Start analysis when video starts
      startVideoAnalysis();
    }

    return () => {
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
      }
    };
  }, [videoStream]);

  const startVideoAnalysis = async () => {
    if (!videoRef.current) return;
    
    // Load model first
    await analyzeVideoFrame(videoRef.current);
    
    // Then start periodic analysis
    analysisInterval.current = setInterval(async () => {
      if (videoRef.current) {
        const result = await analyzeVideoFrame(videoRef.current);
        setAnalysis(result);
        
        // You could also store this in the global state
        // or send to your backend for further processing
      }
    }, 1000); // Analyze once per second
  };

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900 to-gray-900 shadow-2xl">
      {videoStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white/70">
          Camera feed will appear here
        </div>
      )}
      
      {/* Analysis overlay */}
      {analysis?.faceDetected && (
        <div className="absolute top-0 left-0 p-4 bg-black/50 rounded-br-2xl">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className={`p-2 rounded ${analysis.analysis.eyeContact > 0.7 ? 'bg-green-500' : 'bg-yellow-500'}`}>
              Eye Contact: {(analysis.analysis.eyeContact * 100).toFixed(0)}%
            </div>
            <div className={`p-2 rounded ${analysis.analysis.smileIntensity > 0.5 ? 'bg-green-500' : 'bg-blue-500'}`}>
              Engagement: {(analysis.analysis.smileIntensity * 100).toFixed(0)}%
            </div>
            <div className={`p-2 rounded ${analysis.analysis.headMovement > 0.6 ? 'bg-green-500' : 'bg-red-500'}`}>
              Stability: {(analysis.analysis.headMovement * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      )}
      
      {isRecording && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white/90 text-sm">Recording</span>
          </div>
        </div>
      )}
    </div>
  );
};