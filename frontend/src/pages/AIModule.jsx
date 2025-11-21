import React, { useState, useEffect } from 'react';
import { Brain, History, Trophy, Users } from 'lucide-react';
import { useAIStore } from '../store/aiStore';
import { useInterviewStore } from '../store/interviewStore';
import QuizGenerator from '../components/quiz/QuizGenerator';
import QuizPlayer from '../components/quiz/QuizPlayer';
import QuizResults from '../components/quiz/QuizResults';
import QuizHistory from '../components/quiz/QuizHistory';
import QuizReview from '../components/quiz/QuizReview';
import InterviewStart from '../components/interview/InterviewStart';
import InterviewSession from '../components/interview/InterviewSession';
import InterviewFeedback from '../components/interview/InterviewFeedback';
import InterviewHistory from '../components/interview/InterviewHistory';

const AIModule = () => {
  const [activeTab, setActiveTab] = useState('quiz');
  
  const {
    currentQuiz,
    quizResults,
    fetchQuizHistory,
    clearCurrentQuiz,
    quizReview,
  } = useAIStore();

  const {
    currentInterview,
    feedback: interviewFeedback,
    clearCurrentInterview,
    clearFeedback,
  } = useInterviewStore();

  useEffect(() => {
    fetchQuizHistory();
  }, [fetchQuizHistory]);

  // Debug logging to track state changes
  useEffect(() => {
    console.log('Interview Feedback State:', interviewFeedback);
    console.log('Current Interview State:', currentInterview);
  }, [interviewFeedback, currentInterview]);

  const tabs = [
    { id: 'quiz', label: 'Quiz Generator', icon: Brain },
    { id: 'interview', label: 'AI Interview', icon: Users },
    { id: 'history', label: 'Quiz History', icon: History },
    { id: 'interview-history', label: 'Interview History', icon: Trophy },
  ];

  const handleNavigateToQuiz = () => {
    setActiveTab('quiz');
  };

  const handleTabChange = (tabId) => {
    // Prevent tab change if interview is in progress
    if (currentInterview && tabId !== 'interview') {
      const confirmLeave = window.confirm(
        'You have an active interview session. Are you sure you want to leave?'
      );
      if (!confirmLeave) return;
    }

    setActiveTab(tabId);
    
    // Clear current states when switching tabs (but preserve feedback until explicitly cleared)
    if (tabId === 'quiz') {
      if (quizResults) {
        clearCurrentQuiz();
      }
    }
    
    if (tabId === 'interview') {
      // Don't clear feedback when switching to interview tab
      // User might want to review it
    }
    
    if (tabId === 'interview-history') {
      // Optionally clear feedback when viewing history
      // This ensures a clean slate when reviewing past interviews
    }
  };

  const handleStartNewInterview = () => {
    clearFeedback();
    clearCurrentInterview();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Brain className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">AI Learning Module</h1>
          </div>
          <p className="text-gray-600">
            AI-powered quizzes and interviews to test and enhance your knowledge
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                    {/* Show indicator for active interview */}
                    {tab.id === 'interview' && currentInterview && !interviewFeedback && (
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    )}
                    {/* Show indicator for pending feedback */}
                    {tab.id === 'interview' && interviewFeedback && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6 min-h-[600px]">
            {/* Quiz Tab */}
            {activeTab === 'quiz' && (
              <>
                {!currentQuiz && !quizResults && !quizReview && <QuizGenerator />}
                {currentQuiz && !quizResults && !quizReview && <QuizPlayer />}
                {quizResults && !quizReview && <QuizResults />}
                {quizReview && <QuizReview />}
              </>
            )}

            {/* Interview Tab */}
            {activeTab === 'interview' && (
              <>
                {/* Show feedback if available */}
                {interviewFeedback && <InterviewFeedback />}
                
                {/* Show active session if no feedback */}
                {!interviewFeedback && currentInterview && <InterviewSession />}
                
                {/* Show start screen if no session and no feedback */}
                {!interviewFeedback && !currentInterview && <InterviewStart />}
              </>
            )}

            {/* Quiz History Tab */}
            {activeTab === 'history' && (
              <QuizHistory onNavigateToQuiz={handleNavigateToQuiz} />
            )}

            {/* Interview History Tab */}
            {activeTab === 'interview-history' && <InterviewHistory />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModule;