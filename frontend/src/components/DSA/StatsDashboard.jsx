import React, { useEffect } from 'react';
import { CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import useProgressStore from '../../store/progressStore';
import { useUserStore } from '../../store/userStore';

const StatsDashboard = () => {
  const { statistics, fetchProgressStats } = useProgressStore();
  const getUserId = useUserStore((state) => state.getUserId);

  // console.log("Statistics :",statistics);
  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      fetchProgressStats(userId);
    }
  }, [fetchProgressStats, getUserId]);

  let stats = statistics || {
    byStatus: { solved: 0, attempted: 0, 'not-started': 0 },
    byDifficulty: {
      Easy: { solved: 0, attempted: 0, total: 0 },
      Medium: { solved: 0, attempted: 0, total: 0 },
      Hard: { solved: 0, attempted: 0, total: 0 },
    },
  };


  const totalSolved = stats?.byStatus?.solved || 0;
  const totalAttempted = stats?.byStatus?.attempted || 0;
  let totalProblems = 0;
  if(stats.byStatus != undefined)
  {
    totalProblems = totalSolved + totalAttempted + (stats?.byStatus['not-started'] || 0);
  }
  const calculateProgress = (solved, total) => {
    if (total === 0) return 0;
    return ((solved / total) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Solved</p>
              <p className="text-3xl font-bold mt-1">{totalSolved}</p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Attempted</p>
              <p className="text-3xl font-bold mt-1">{totalAttempted}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Progress</p>
              <p className="text-3xl font-bold mt-1">{totalProblems}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Difficulty-wise Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Progress by Difficulty
        </h3>
        <div className="space-y-4">
          {/* Easy */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-600">Easy</span>
              <span className="text-sm text-gray-600">
                {stats?.byDifficulty?.Easy.solved} / {stats?.byDifficulty?.Easy?.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${calculateProgress(
                    stats?.byDifficulty?.Easy?.solved,
                    stats?.byDifficulty?.Easy?.total
                  )}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {calculateProgress(
                stats?.byDifficulty?.Easy?.solved,
                stats?.byDifficulty?.Easy?.total
              )}% complete
            </p>
          </div>

          {/* Medium */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yellow-600">Medium</span>
              <span className="text-sm text-gray-600">
                {stats?.byDifficulty?.Medium?.solved} / {stats?.byDifficulty?.Medium?.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${calculateProgress(
                    stats?.byDifficulty?.Medium?.solved,
                    stats?.byDifficulty?.Medium?.total
                  )}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {calculateProgress(
                stats?.byDifficulty?.Medium?.solved,
                stats?.byDifficulty?.Medium?.total
              )}% complete
            </p>
          </div>

          {/* Hard */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-600">Hard</span>
              <span className="text-sm text-gray-600">
                {stats?.byDifficulty?.Hard?.solved} / {stats?.byDifficulty?.Hard?.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${calculateProgress(
                    stats?.byDifficulty?.Hard?.solved,
                    stats?.byDifficulty?.Hard?.total
                  )}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {calculateProgress(
                stats?.byDifficulty?.Hard?.solved,
                stats?.byDifficulty?.Hard?.total
              )}% complete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;