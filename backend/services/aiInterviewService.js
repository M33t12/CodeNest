// services/aiInterviewService.js
const Groq = require('groq-sdk');
require('dotenv').config();

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Using llama-3.3-70b-versatile - Fast, efficient, and excellent for conversational AI
const CHAT_MODEL = 'llama-3.3-70b-versatile';

// Using whisper-large-v3 for audio transcription
const TRANSCRIPTION_MODEL = 'whisper-large-v3';

// Maximum questions per interview
const MAX_QUESTIONS = 8;

/**
 * Generate initial greeting and first question
 */
async function generateInitialQuestion(interviewType, topic, context) {
  try {
    const systemPrompt = `You are an expert interviewer conducting a ${interviewType} interview on "${topic}".
${context ? `Additional context: ${context}` : ''}

Your role:
- Be professional, friendly, and encouraging
- Start with a warm greeting and brief introduction
- Ask relevant, thoughtful questions about ${topic}
- For technical interviews: Focus on practical knowledge, problem-solving, and real-world applications
- For non-technical interviews: Focus on soft skills, experiences, and behavioral aspects
- Keep questions clear and concise
- Build rapport with the candidate

Start the interview with a greeting and your first question.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Begin the interview.' }
      ],
      model: CHAT_MODEL,
      temperature: 0.7,
      max_tokens: 300
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating initial question:', error);
    throw new Error('Failed to generate initial question');
  }
}

/**
 * Generate AI response based on conversation context
 */
async function generateResponse(conversation, interviewType, topic, context) {
  try {
    const questionsAsked = Math.floor(conversation.filter(msg => msg.speaker === 'user').length);
    const shouldContinue = questionsAsked < MAX_QUESTIONS;

    // Get last user message
    const lastUserMessage = conversation.filter(msg => msg.speaker === 'user').slice(-1)[0]?.message || '';

    const systemPrompt = `You are an expert interviewer conducting a ${interviewType} interview on "${topic}".
${context ? `Additional context: ${context}` : ''}

Interview Progress: Question ${questionsAsked} of ${MAX_QUESTIONS}

Your responsibilities:
1. Evaluate the candidate's previous answer
2. Provide brief, constructive feedback (1-2 sentences)
3. ${shouldContinue ? 'Ask the next relevant question' : 'Conclude the interview professionally'}
4. Maintain a conversational, encouraging tone
5. For technical: Assess technical accuracy, depth, and problem-solving approach
6. For non-technical: Assess communication, experiences, and soft skills

Format your response as:
- Brief acknowledgment of their answer
- Quick feedback (strength or insight)
- ${shouldContinue ? 'Next question' : 'Professional conclusion thanking them'}

Keep responses concise (2-4 sentences).`;

    // Build conversation history for context
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add recent conversation history (last 6 messages for context)
    const recentConversation = conversation.slice(-6);
    recentConversation.forEach(msg => {
      messages.push({
        role: msg.speaker === 'ai' ? 'assistant' : 'user',
        content: msg.message
      });
    });

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: CHAT_MODEL,
      temperature: 0.7,
      max_tokens: 400
    });

    const aiMessage = completion.choices[0].message.content.trim();

    // Evaluate the user's answer
    const evaluation = await evaluateAnswer(lastUserMessage, interviewType, topic);

    return {
      message: aiMessage,
      shouldContinue: shouldContinue,
      evaluation: evaluation
    };
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response');
  }
}

/**
 * Evaluate user's answer
 */
async function evaluateAnswer(answer, interviewType, topic) {
  try {
    const evalPrompt = `Evaluate this ${interviewType} interview answer about ${topic}.

Answer: "${answer}"

Provide:
1. A score from 1-10
2. Brief feedback (2 sentences max)

Evaluation criteria:
${interviewType === 'technical' 
  ? '- Technical accuracy\n- Problem-solving approach\n- Clarity of explanation\n- Practical knowledge' 
  : '- Communication skills\n- Relevance to question\n- Structure (STAR method if applicable)\n- Professionalism'}

Respond in this exact JSON format:
{
  "score": <number>,
  "feedback": "<brief feedback>"
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'user', content: evalPrompt }
      ],
      model: CHAT_MODEL,
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: 'json_object' }
    });

    const evaluation = JSON.parse(completion.choices[0].message.content);
    return evaluation;
  } catch (error) {
    console.error('Error evaluating answer:', error);
    // Return default evaluation if parsing fails
    return {
      score: 5,
      feedback: 'Thank you for your response.'
    };
  }
}

/**
 * Generate next question
 */
async function generateNextQuestion(conversation, interviewType, topic, questionCount) {
  try {
    const systemPrompt = `You are an expert interviewer conducting a ${interviewType} interview on "${topic}".
You are now at question ${questionCount + 1} of ${MAX_QUESTIONS}.

Based on the conversation so far, generate the next relevant question that:
- Builds upon previous answers
- Explores different aspects of ${topic}
- Matches the candidate's level
- Is clear and specific

For technical interviews: Progress from fundamentals to advanced topics, or explore related areas.
For non-technical interviews: Explore different competencies like leadership, teamwork, problem-solving, etc.

Ask only the question, no extra commentary.`;

    const messages = [{ role: 'system', content: systemPrompt }];
    
    // Add conversation context
    conversation.slice(-4).forEach(msg => {
      messages.push({
        role: msg.speaker === 'ai' ? 'assistant' : 'user',
        content: msg.message
      });
    });

    messages.push({ role: 'user', content: 'What is your next question?' });

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: CHAT_MODEL,
      temperature: 0.7,
      max_tokens: 200
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating next question:', error);
    throw new Error('Failed to generate next question');
  }
}

/**
 * Generate final comprehensive feedback
 */
async function generateFinalFeedback(conversation, questionsAsked, interviewType, topic) {
  try {
    // Calculate metrics
    const scores = questionsAsked.map(q => q.evaluationScore || 0);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const feedbackPrompt = `Analyze this ${interviewType} interview about "${topic}".

Interview Summary:
- Total Questions: ${questionsAsked.length}
- Average Score: ${avgScore.toFixed(1)}/10

Questions and Answers:
${questionsAsked.map((q, i) => `
Q${i + 1}: ${q.question}
A${i + 1}: ${q.answer}
Score: ${q.evaluationScore}/10
`).join('\n')}

Provide comprehensive feedback in this exact JSON format:
{
  "metrics": {
    "technicalAccuracy": <0-100>,
    "communicationSkills": <0-100>,
    "problemSolving": <0-100>,
    "overallScore": <0-100>,
    "confidenceLevel": "<low/medium/high>"
  },
  "textFeedback": "<3-4 paragraph comprehensive feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>", "<area 3>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"]
}

Make feedback specific, constructive, and encouraging.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'user', content: feedbackPrompt }
      ],
      model: CHAT_MODEL,
      temperature: 0.5,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });

    const feedback = JSON.parse(completion.choices[0].message.content);
    return feedback;
  } catch (error) {
    console.error('Error generating final feedback:', error);
    // Return default feedback structure
    return {
      metrics: {
        technicalAccuracy: 70,
        communicationSkills: 75,
        problemSolving: 70,
        overallScore: 72,
        confidenceLevel: 'medium'
      },
      textFeedback: 'Thank you for completing the interview. You demonstrated good understanding of the topic.',
      strengths: ['Good communication', 'Engaged responses', 'Clear explanations'],
      improvements: ['Provide more specific examples', 'Elaborate on technical details', 'Structure answers better'],
      recommendations: ['Practice more on the topic', 'Work on specific examples', 'Review fundamental concepts']
    };
  }
}

/**
 * Transcribe audio to text using Groq Whisper
 */
async function transcribeAudio(audioBuffer) {
  try {
    // Groq expects a File object, so we need to create one from the buffer
    const audioFile = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: TRANSCRIPTION_MODEL,
      language: 'en',
      response_format: 'json',
      temperature: 0.0
    });

    return transcription.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
}

/**
 * Generate audio feedback (Text-to-Speech)
 * Note: Groq doesn't have native TTS, so we return text or integrate with external TTS
 */
async function generateAudioFeedback(textFeedback) {
  try {
    // Since Groq doesn't provide TTS, we can:
    // 1. Return the text for client-side TTS (Web Speech API)
    // 2. Integrate with external TTS services (Google TTS, AWS Polly, etc.)
    // 3. Use open-source TTS solutions
    
    // For now, returning structured feedback text optimized for TTS
    const ttsOptimizedFeedback = await optimizeFeedbackForTTS(textFeedback);
    
    return {
      type: 'text',
      content: ttsOptimizedFeedback,
      note: 'Use client-side TTS (Web Speech API) or integrate with external TTS service'
    };
  } catch (error) {
    console.error('Error generating audio feedback:', error);
    return {
      type: 'text',
      content: textFeedback,
      note: 'Audio generation unavailable'
    };
  }
}

/**
 * Optimize feedback text for Text-to-Speech
 */
async function optimizeFeedbackForTTS(textFeedback) {
  try {
    const prompt = `Convert this interview feedback into a natural, conversational script suitable for text-to-speech:

"${textFeedback}"

Make it:
- Conversational and warm
- Well-paced with natural pauses
- Easy to listen to
- Remove any formatting or special characters
- Keep it encouraging and professional

Return only the optimized text.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'user', content: prompt }
      ],
      model: CHAT_MODEL,
      temperature: 0.5,
      max_tokens: 800
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error optimizing feedback for TTS:', error);
    return textFeedback;
  }
}

module.exports = {
  generateInitialQuestion,
  generateResponse,
  generateNextQuestion,
  generateFinalFeedback,
  transcribeAudio,
  generateAudioFeedback,
  evaluateAnswer
};