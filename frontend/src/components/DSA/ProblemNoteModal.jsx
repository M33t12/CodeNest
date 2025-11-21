import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import useProgressStore from '../../store/progressStore';
import { useUserStore } from '../../store/userStore';
import toast from 'react-hot-toast';

const ProblemNoteModal = ({ problem, onClose }) => {
  const { progressMap, updateProgress } = useProgressStore();
  const getUserId = useUserStore((state) => state.getUserId);
  const userId = getUserId();

  const existingProgress = progressMap[problem._id];
  const [notes, setNotes] = useState(existingProgress?.notes || '');
  const [approach, setApproach] = useState(existingProgress?.approach || '');
  const [tags, setTags] = useState(existingProgress?.tags?.join(', ') || '');
  const [timeSpent, setTimeSpent] = useState(existingProgress?.timeSpent || 0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!userId) {
      toast.error('You must be logged in to save notes');
      return;
    }

    setSaving(true);
    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      await updateProgress(userId, problem._id, {
        notes,
        approach,
        tags: tagsArray,
        timeSpent: parseInt(timeSpent) || 0,
      });

      toast.success('Notes saved successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to save notes');
      console.error('Error saving notes:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Notes for Problem #{problem.leetcodeId}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{problem.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes, observations, or key points..."
              rows={6}
              maxLength={5000}
              className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {notes.length} / 5000 characters
            </p>
          </div>

          {/* Approach */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Solution Approach
            </label>
            <textarea
              value={approach}
              onChange={(e) => setApproach(e.target.value)}
              placeholder="Describe your solution approach or algorithm..."
              rows={4}
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., two-pointer, sliding-window, dynamic-programming"
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Time Spent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Spent (minutes)
            </label>
            <input
              type="number"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              min="0"
              placeholder="0"
              className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Problem Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Difficulty:</span>
              <span className={`text-sm font-semibold ${
                problem.difficulty === 'Easy' ? 'text-green-600' :
                problem.difficulty === 'Medium' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {problem.difficulty}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Acceptance:</span>
              <span className="text-sm font-semibold text-gray-900">
                {problem.acRate ? `${problem.acRate.toFixed(1)}%` : 'N/A'}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm text-gray-600">Topics:</span>
              <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                {problem.topics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <a
            href={problem.leetcodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Open in LeetCode →
          </a>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !userId}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemNoteModal;