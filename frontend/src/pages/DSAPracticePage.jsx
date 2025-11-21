import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import useProblemStore from '../store/problemStore';
import useProgressStore from '../store/progressStore';
import { useUserStore } from '../store/userStore';
import FilterBar from '../components/DSA/FilterBar';
import ProblemList from '../components/DSA/ProblemList';
import StatsDashboard from '../components/DSA/StatsDashboard';
import Pagination from '../components/DSA/Pagination';
import { BarChart3, List } from 'lucide-react';

const DSAPracticePage = () => {
  const { fetchProblems, pagination, setFilter } = useProblemStore();
  const { fetchUserProgress } = useProgressStore();
  const getUserId = useUserStore((state) => state.getUserId);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const [activeTab, setActiveTab] = useState('problems'); // 'problems' or 'stats'

  useEffect(() => {
    // Fetch initial data
    fetchProblems();
    
    // Fetch user progress if authenticated
    const userId = getUserId();
    if (userId && isAuthenticated()) {
      fetchUserProgress(userId);
    }
  }, [fetchProblems, fetchUserProgress, getUserId, isAuthenticated]);

  const handlePageChange = (newPage) => {
    setFilter('page', newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-lg">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  DSA Practice Tracker
                </h1>
                <p className="text-gray-600 mt-2">
                  Master Data Structures & Algorithms
                </p>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('problems')}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === 'problems'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-5 h-5" />
                  <span>Problems</span>
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === 'stats'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Statistics</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        {activeTab === 'problems' ? (
          <div className="space-y-6">
            {/* Filter Bar - Now at the top */}
            <FilterBar />

            {/* Problems List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Problem List
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {pagination.total} problems found
                    </p>
                  </div>
                  
                  {!isAuthenticated() && (
                    <div className="inline-flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                      <span className="text-lg">💡</span>
                      <span className="font-medium">Login to track your progress and save notes</span>
                    </div>
                  )}
                </div>
              </div>
              
              <ProblemList />
              
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        ) : (
          /* Statistics Dashboard */
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900">
                  Your Progress Statistics
                </h2>
                <p className="text-gray-600 mt-2">
                  Track your DSA learning journey and progress
                </p>
              </div>
              
              {isAuthenticated() ? (
                <StatsDashboard />
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-300 p-16 text-center">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="text-6xl">📊</div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Statistics Unavailable
                    </h3>
                    <p className="text-gray-600 text-lg">
                      Please login to view your detailed progress statistics and track your learning journey
                    </p>
                    <button 
                      onClick={() => window.location.href = '/login'}
                      className="mt-4 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/50"
                    >
                      Login Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DSAPracticePage;