import React, { useEffect, useState } from 'react';
import { X, Search, Filter, ChevronDown } from 'lucide-react';
import useProblemStore from '../../store/problemStore';

const FilterBar = () => {
  const { filters, topics, setFilter, resetFilters, fetchTopics } = useProblemStore();
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [showMobileTopicDropdown, setShowMobileTopicDropdown] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // console.log("Topics ::", topics);
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const selectedTopic = topics.find(t => t.name === filters.topic);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Mobile: Collapsible filters */}
      <div className="lg:hidden">
        <details className="group">
          <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Filters</span>
              {(filters.difficulty || filters.topic || filters.search) && (
                <span className="px-2 py-0.5 text-xs text-gray-700 bg-blue-100 rounded-full">
                  Active
                </span>
              )}
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
          </summary>
          
          <div className="px-4 py-3 border-t border-gray-200 space-y-4">
            {/* Mobile Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilter('search', e.target.value)}
                  placeholder="Search problems..."
                  className="w-full pl-10 pr-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Mobile Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('difficulty', '')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    filters.difficulty === ''
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setFilter('difficulty', diff)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      filters.difficulty === diff
                        ? diff === 'Easy' ? 'bg-green-600 text-white' :
                          diff === 'Medium' ? 'bg-yellow-600 text-white' :
                          'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Topic */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <button
                onClick={() => setShowMobileTopicDropdown(!showMobileTopicDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <span>
                  {filters.topic ? `${selectedTopic?.name} (${selectedTopic?.count})` : 'All Topics'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showMobileTopicDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Topic Dropdown Menu */}
              {showMobileTopicDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMobileTopicDropdown(false)}
                  />
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setFilter('topic', '');
                          setShowMobileTopicDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          filters.topic === ''
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        All Topics
                      </button>
                      {topics.map((topic) => (
                        <button
                          key={topic.name}
                          onClick={() => {
                            setFilter('topic', topic.name);
                            setShowMobileTopicDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
                            filters.topic === topic.name
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span>{topic.name}</span>
                          <span className="text-xs text-gray-500">({topic.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Reset */}
            <button
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        </details>
      </div>

      {/* Desktop: Horizontal filters */}
      <div className="hidden lg:block">
        <div className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilter('search', e.target.value)}
                  placeholder="Search problems..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-700" />
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Difficulty:
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('difficulty', '')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    filters.difficulty === ''
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setFilter('difficulty', diff)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      filters.difficulty === diff
                        ? diff === 'Easy' ? 'bg-green-600 text-white' :
                          diff === 'Medium' ? 'bg-yellow-600 text-white' :
                          'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTopicDropdown(!showTopicDropdown)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="whitespace-nowrap">
                  {filters.topic ? `Topic: ${selectedTopic?.name}` : 'All Topics'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showTopicDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Topic Dropdown Menu */}
              {showTopicDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowTopicDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setFilter('topic', '');
                          setShowTopicDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          filters.topic === ''
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        All Topics
                      </button>
                      {topics.map((topic) => (
                        <button
                          key={topic.name}
                          onClick={() => {
                            setFilter('topic', topic.name);
                            setShowTopicDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
                            filters.topic === topic.name
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span>{topic.name}</span>
                          <span className="text-xs text-gray-500">({topic.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Active Filters Display */}
          {(filters.difficulty || filters.topic || filters.search) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">Active filters:</span>
              <div className="flex flex-wrap gap-2">
                {filters.difficulty && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    {filters.difficulty}
                    <button
                      onClick={() => setFilter('difficulty', '')}
                      className="hover:text-gray-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.topic && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    {filters.topic}
                    <button
                      onClick={() => setFilter('topic', '')}
                      className="hover:text-gray-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.search && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    Search: "{filters.search}"
                    <button
                      onClick={() => setFilter('search', '')}
                      className="hover:text-gray-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;