import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function generateQuestion(context: string): Promise<string> {
  const prompt = `Generate a professional interview question based on this context: "${context}". 
  Make it relevant, open-ended, and suitable for a job interview.`;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function evaluateResponse(question: string, response: string): Promise<string> {
  const prompt = `Evaluate this interview response professionally:
  
  Question: ${question}
  Response: ${response}
  
  Provide structured feedback with:
  1. Strengths
  2. Areas for improvement
  3. Specific suggestions
  4. Rating (1-10)`;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateFinalReport(
  responses: Array<{ question: string; response: string; feedback: string }>,
  videoAnalysis: Array<{ metrics: { eyeContact: number; engagement: number; stability: number } }>
): Promise<string> {
  const videoSummary = videoAnalysis.reduce((acc, curr) => {
    acc.eyeContact += curr.metrics.eyeContact;
    acc.engagement += curr.metrics.engagement;
    acc.stability += curr.metrics.stability;
    acc.count++;
    return acc;
  }, { eyeContact: 0, engagement: 0, stability: 0, count: 0 });

  const prompt = `Generate a comprehensive interview evaluation report with these sections:
  
  1. Verbal Responses Analysis:
  ${responses.map(r => `
    - Question: ${r.question}
    - Response: ${r.response}
    - Feedback: ${r.feedback}
  `).join('\n')}
  
  2. Non-Verbal Analysis:
  - Eye Contact: ${videoSummary.count ? Math.round(videoSummary.eyeContact / videoSummary.count * 100) : 0}%
  - Engagement: ${videoSummary.count ? Math.round(videoSummary.engagement / videoSummary.count * 100) : 0}%
  - Stability: ${videoSummary.count ? Math.round(videoSummary.stability / videoSummary.count * 100) : 0}%
  
  3. Overall Assessment
  4. Recommendations for Improvement
  5. Final Score (1-100)`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}