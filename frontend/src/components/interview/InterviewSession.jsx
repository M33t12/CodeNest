// components/interview/InterviewSession.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, StopCircle, AlertCircle, Loader } from 'lucide-react';
import { useInterviewStore } from '../../store/interviewStore';

const InterviewSession = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const {
    currentInterview,
    isLoading,
    error,
    isRecording,
    sendMessage,
    transcribeAudio,
    completeInterview,
    setRecording,
    clearError
  } = useInterviewStore();

  useEffect(() => {
    scrollToBottom();
  }, [currentInterview?.conversation]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    
    try {
      await sendMessage(message);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        
        try {
          await transcribeAudio(blob);
        } catch (err) {
          console.error('Failed to transcribe:', err);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleCompleteInterview = async () => {
    if (window.confirm('Are you sure you want to end the interview?')) {
      try {
        await completeInterview('text');
      } catch (err) {
        console.error('Failed to complete interview:', err);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentInterview) return null;

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-300px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1">{currentInterview.topic}</h2>
            <p className="text-blue-100 capitalize">
              {currentInterview.interviewType} Interview
            </p>
          </div>
          <button
            onClick={handleCompleteInterview}
            disabled={isLoading}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <StopCircle size={18} />
            <span>End Interview</span>
          </button>
        </div>
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <span>Questions: {currentInterview.questionCount || 0}/8</span>
          <span>•</span>
          <span>Status: {currentInterview.status}</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-x border-red-200 p-4 flex items-start space-x-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto bg-white border-x border-gray-200 p-6 space-y-4">
        {currentInterview.conversation.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                msg.speaker === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.message}
              </p>
              {msg.audioTranscription && (
                <span className="text-xs opacity-75 mt-1 block">
                  🎤 Voice transcription
                </span>
              )}
              <span
                className={`text-xs mt-2 block ${
                  msg.speaker === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-5 py-3 flex items-center space-x-2">
              <Loader className="animate-spin text-gray-500" size={16} />
              <span className="text-sm text-gray-600">AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border border-gray-200 rounded-b-xl p-4">
        {isRecording ? (
          <div className="flex items-center justify-between bg-red-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="font-medium text-gray-900">
                Recording: {formatTime(recordingTime)}
              </span>
            </div>
            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <MicOff size={18} />
              <span>Stop Recording</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your answer..."
              disabled={isLoading}
              className="flex-1 text-gray-700 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
            <button
              type="button"
              onClick={startRecording}
              disabled={isLoading}
              className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors disabled:opacity-50"
              title="Record voice answer"
            >
              <Mic size={22} />
            </button>
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={22} />
            </button>
          </form>
        )}
        <p className="text-xs text-gray-700 mt-2 text-center">
          You can type your answer or use voice recording
        </p>
      </div>
    </div>
  );
};

export default InterviewSession;