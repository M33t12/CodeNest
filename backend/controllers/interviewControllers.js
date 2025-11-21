// controllers/interviewController.js
const Interview = require('../models/Interview.js');
const aiService = require('../services/aiInterviewService.js');
const { v4: uuidv4 } = require('uuid');

// Controller: Start Interview
exports.startInterview = async (req, res) => {
  try {
    const { interviewType, topic, context } = req.body;
    const userId = req.user._id.toString();

    // Validate required fields
    if (!userId || !interviewType || !topic) {
      return res.status(400).json({
        success: false,
        message: 'userId, interviewType, and topic are required'
      });
    }

    // Validate interview type
    if (!['technical', 'non-technical'].includes(interviewType)) {
      return res.status(400).json({
        success: false,
        message: 'interviewType must be either "technical" or "non-technical"'
      });
    }

    // Generate unique session ID
    const sessionId = uuidv4();

    // Generate initial AI greeting and first question
    const initialMessage = await aiService.generateInitialQuestion(
      interviewType,
      topic,
      context
    );

    // Create new interview session
    const interview = new Interview({
      userId,
      sessionId,
      interviewType,
      topic,
      context: context || '',
      status: 'in-progress',
      startTime: new Date(),
      conversation: [{
        speaker: 'ai',
        message: initialMessage,
        timestamp: new Date(),
        audioTranscription: false
      }]
    });

    await interview.save();

    res.status(201).json({
      success: true,
      message: 'Interview session started successfully',
      data: {
        sessionId: interview.sessionId,
        interviewType: interview.interviewType,
        topic: interview.topic,
        aiMessage: initialMessage,
        status: interview.status
      }
    });
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start interview session',
      error: error.message
    });
  }
};

// Controller: Send User Message
exports.sendMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'sessionId and message are required'
      });
    }

    // Find interview session
    const interview = await Interview.findOne({ sessionId });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    if (interview.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Interview is not in progress'
      });
    }

    // Add user message to conversation
    interview.addMessage('user', message, false);
    await interview.save();

    // Get AI response
    const aiResponse = await aiService.generateResponse(
      interview.conversation,
      interview.interviewType,
      interview.topic,
      interview.context
    );

    // Add AI response to conversation
    interview.addMessage('ai', aiResponse.message, false);
    
    // Store question and evaluation if applicable
    if (aiResponse.evaluation) {
      interview.questionsAsked.push({
        question: interview.conversation[interview.conversation.length - 3]?.message || '',
        answer: message,
        timestamp: new Date(),
        evaluationScore: aiResponse.evaluation.score,
        feedback: aiResponse.evaluation.feedback
      });
    }

    await interview.save();

    res.status(200).json({
      success: true,
      data: {
        aiMessage: aiResponse.message,
        shouldContinue: aiResponse.shouldContinue,
        questionCount: interview.questionsAsked.length
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error.message
    });
  }
};

// Controller: Transcribe Audio
exports.transcribeAudio = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Audio file is required'
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId is required'
      });
    }

    // Find interview session
    const interview = await Interview.findOne({ sessionId });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    // Transcribe audio using AI service
    const transcription = await aiService.transcribeAudio(req.file.buffer);

    // Add transcribed message to conversation
    interview.addMessage('user', transcription, true);
    await interview.save();

    // Get AI response
    const aiResponse = await aiService.generateResponse(
      interview.conversation,
      interview.interviewType,
      interview.topic,
      interview.context
    );

    // Add AI response to conversation
    interview.addMessage('ai', aiResponse.message, false);
    
    if (aiResponse.evaluation) {
      interview.questionsAsked.push({
        question: interview.conversation[interview.conversation.length - 3]?.message || '',
        answer: transcription,
        timestamp: new Date(),
        evaluationScore: aiResponse.evaluation.score,
        feedback: aiResponse.evaluation.feedback
      });
    }

    await interview.save();

    res.status(200).json({
      success: true,
      data: {
        transcription,
        aiMessage: aiResponse.message,
        shouldContinue: aiResponse.shouldContinue
      }
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to transcribe audio',
      error: error.message
    });
  }
};

// Controller: Get Next Question
exports.getNextQuestion = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const interview = await Interview.findOne({ sessionId });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    const nextQuestion = await aiService.generateNextQuestion(
      interview.conversation,
      interview.interviewType,
      interview.topic,
      interview.questionsAsked.length
    );

    interview.addMessage('ai', nextQuestion, false);
    await interview.save();

    res.status(200).json({
      success: true,
      data: {
        question: nextQuestion,
        questionNumber: interview.questionsAsked.length + 1
      }
    });
  } catch (error) {
    console.error('Error getting next question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get next question',
      error: error.message
    });
  }
};

// Controller: Complete Interview
exports.completeInterview = async (req, res) => {
  try {
    const { sessionId, feedbackFormat } = req.body; // feedbackFormat: 'text', 'audio', 'both'

    const interview = await Interview.findOne({ sessionId });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    // Check if already completed
    if (interview.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Interview is already completed'
      });
    }

    // Generate comprehensive feedback
    const feedback = await aiService.generateFinalFeedback(
      interview.conversation,
      interview.questionsAsked,
      interview.interviewType,
      interview.topic
    );

    // Update interview with feedback
    interview.performanceMetrics = feedback.metrics;
    interview.finalFeedback.textFeedback = feedback.textFeedback;
    interview.finalFeedback.strengths = feedback.strengths;
    interview.finalFeedback.improvements = feedback.improvements;
    interview.finalFeedback.recommendations = feedback.recommendations;

    // Generate audio feedback if requested
    if (feedbackFormat === 'audio' || feedbackFormat === 'both') {
      const audioFeedback = await aiService.generateAudioFeedback(feedback.textFeedback);
      interview.finalFeedback.audioFeedback = audioFeedback;
    }

    // Update status and end time
    interview.status = 'completed';
    interview.endTime = new Date();
    interview.calculateDuration();

    // Save the completed interview
    await interview.save();

    console.log('Interview completed and saved:', {
      sessionId: interview.sessionId,
      status: interview.status,
      duration: interview.duration
    });

    res.status(200).json({
      success: true,
      message: 'Interview completed successfully',
      data: {
        sessionId: interview.sessionId,
        duration: interview.duration,
        performanceMetrics: interview.performanceMetrics,
        feedback: interview.finalFeedback,
        totalQuestions: interview.questionsAsked.length
      }
    });
  } catch (error) {
    console.error('Error completing interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete interview',
      error: error.message
    });
  }
};

// Controller: Generate Audio Feedback (separate endpoint)
exports.generateAudioFeedback = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const interview = await Interview.findOne({ sessionId });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    if (!interview.finalFeedback.textFeedback) {
      return res.status(400).json({
        success: false,
        message: 'Interview must be completed first'
      });
    }

    const audioFeedback = await aiService.generateAudioFeedback(
      interview.finalFeedback.textFeedback
    );

    interview.finalFeedback.audioFeedback = audioFeedback;
    await interview.save();

    res.status(200).json({
      success: true,
      data: {
        audioFeedback
      }
    });
  } catch (error) {
    console.error('Error generating audio feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate audio feedback',
      error: error.message
    });
  }
};

// Controller: Get Session Details
exports.getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const interview = await Interview.findOne({ sessionId });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    res.status(200).json({
      success: true,
      data: interview
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session',
      error: error.message
    });
  }
};

// Controller: Get User Interviews
exports.getUserInterviews = async (req, res) => {
  try {
    const userId  = req.user._id.toString();
    const { status, limit = 10, page = 1 } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    console.log('Fetching interviews with query:', query); // Debug log

    const interviews = await Interview.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    console.log(`Found ${interviews.length} interviews`); // Debug log
    console.log('Interview statuses:', interviews.map(i => ({ id: i.sessionId, status: i.status }))); // Debug log

    const total = await Interview.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        interviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user interviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interviews',
      error: error.message
    });
  }
};

// Controller: Cancel Interview
exports.cancelInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const interview = await Interview.findOne({ sessionId });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    interview.updateStatus('cancelled');
    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Interview cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel interview',
      error: error.message
    });
  }
};