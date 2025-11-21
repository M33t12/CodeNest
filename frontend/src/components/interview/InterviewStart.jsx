// components/interview/InterviewStart.jsx
import React, { useState } from 'react';
import { Play, Briefcase, Code, AlertCircle } from 'lucide-react';
import { useInterviewStore } from '../../store/interviewStore';

const InterviewStart = () => {
  const [formData, setFormData] = useState({
    interviewType: 'technical',
    topic: '',
    context: ''
  });

  const { startInterview, isLoading, error } = useInterviewStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userId = localStorage.getItem('userId') || 'default-user';
    
    try {
      await startInterview({
        userId,
        ...formData
      });
    } catch (err) {
      console.error('Failed to start interview:', err);
    }
  };

  const interviewTypes = [
    {
      id: 'technical',
      label: 'Technical Interview',
      icon: Code,
      description: 'Test your technical knowledge and problem-solving skills',
      examples: 'JavaScript, React, Python, Data Structures, System Design'
    },
    {
      id: 'non-technical',
      label: 'Non-Technical Interview',
      icon: Briefcase,
      description: 'Practice behavioral and situational questions',
      examples: 'Leadership, Teamwork, Communication, Conflict Resolution'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Start Your AI Interview
        </h2>
        <p className="text-gray-600">
          Practice with AI-powered interviews tailored to your needs
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Interview Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Interview Type
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            {interviewTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, interviewType: type.id })}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    formData.interviewType === type.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-3 rounded-lg ${
                        formData.interviewType === type.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {type.label}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {type.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        Examples: {type.examples}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic Input */}
        <div>
          <label
            htmlFor="topic"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Interview Topic <span className="text-red-500">*</span>
          </label>
          <input
            id="topic"
            type="text"
            required
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="e.g., React Hooks, Leadership Skills, System Design"
            className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Be specific about what you want to be interviewed on
          </p>
        </div>

        {/* Context Input */}
        <div>
          <label
            htmlFor="context"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Additional Context <span className="text-gray-400">(Optional)</span>
          </label>
          <textarea
            id="context"
            rows="4"
            value={formData.context}
            onChange={(e) => setFormData({ ...formData, context: e.target.value })}
            placeholder="Provide any additional context like your experience level, specific areas of focus, or preparation goals..."
            className="text-gray-700 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Help the AI tailor questions to your level and goals
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isLoading || !formData.topic.trim()}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-3 text-lg"
          >
            <Play size={24} />
            <span>{isLoading ? 'Starting Interview...' : 'Start Interview'}</span>
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">What to Expect:</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>The interview will consist of up to 8 questions</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>You can respond via text or voice</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Receive instant feedback and evaluation after each answer</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Get comprehensive feedback at the end with improvement suggestions</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default InterviewStart;