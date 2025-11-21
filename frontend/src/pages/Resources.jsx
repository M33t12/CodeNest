"use client";

// pages/Resources.jsx
import { useState, useEffect } from "react";
import { Plus, Search, Grid, List, Star } from "lucide-react";
import { useResourceStore } from "../store/resourceStore.js";
import ResourceCard from "../components/ResourceCard";
import ResourceUploadModal from "../components/ResourceUploadModal";

const Resources = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [showFeatured, setShowFeatured] = useState(false);

  const {
    resources,
    featuredResources,
    isLoading,
    error,
    pagination,
    fetchResources,
    fetchFeaturedResources,
    uploadResource,
    filters,
    setFilters,
  } = useResourceStore();

  useEffect(() => {
    fetchResources();
    fetchFeaturedResources();
  }, [fetchResources, fetchFeaturedResources]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchResources({
        subject: selectedSubject || undefined,
        type: selectedType || undefined,
        search: searchTerm || undefined,
        featured: showFeatured || undefined,
        page: 1,
      });
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, selectedSubject, selectedType, showFeatured, fetchResources]);

  const handleUpload = async (formData) => {
    try {
      await uploadResource(formData);
      setShowUploadModal(false);
      // Refresh resources after upload
      fetchResources();
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleLoadMore = () => {
    if (pagination?.hasNext) {
      fetchResources({
        subject: selectedSubject || undefined,
        type: selectedType || undefined,
        search: searchTerm || undefined,
        featured: showFeatured || undefined,
        page: pagination.current + 1,
        append: true, // Add this to append results instead of replacing
      });
    }
  };

  const csSubjects = [
    "Data Structures",
    "Algorithms",
    "Operating Systems",
    "Database Systems",
    "Computer Networks",
    "Software Engineering",
    "Theory of Computation",
    "Artificial Intelligence",
    "Machine Learning",
    "Web Development",
    "Cybersecurity",
    "Programming Languages",
    "Computer Graphics",
    "Human Computer Interaction",
  ];

  const resourceTypes = ["pdf", "image", "link", "blog", "markdown"];

  if (isLoading && !resources.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        // Header - NEW:
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
              <p className="text-gray-600 mt-2">
                Discover and share CS resources
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Upload Resource</span>
            </button>
          </div>
        </div>
        {featuredResources?.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="text-yellow-400 fill-current" size={24} />
              <h2 className="text-xl font-bold text-white">
                Featured Resources
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredResources.slice(0, 3).map((resource) => (
                <div
                  key={resource._id}
                  className="bg-white/10 backdrop-blur rounded-lg p-4 cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={() =>
                    (window.location.href = `/resources/${resource._id}`)
                  }
                >
                  <h3 className="text-white font-semibold">{resource.name}</h3>
                  <p className="text-white/80 text-sm">{resource.subject}</p>
                  <div className="flex items-center mt-2">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span className="text-white/90 ml-1">
                      {resource.averageRating?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white rounded-lg text-black shadow-md p-6">
          <div className="grid md:grid-cols-5 gap-4 mb-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Subjects</option>
              {csSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {resourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={filters.sort}
              onChange={(e) => setFilters({ sort: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt">Latest</option>
              <option value="averageRating">Highest Rated</option>
              <option value="views">Most Viewed</option>
              <option value="downloads">Most Downloaded</option>
              <option value="name">Name</option>
            </select>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showFeatured}
                onChange={(e) => setShowFeatured(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Featured only</span>
            </label>

            {pagination && (
              <div className="text-sm text-gray-600">
                Showing {resources.length} of {pagination.total} resources
              </div>
            )}
          </div>
        </div>
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div
          className={
            viewMode === "grid"
              ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {resources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              viewMode={viewMode}
            />
          ))}
        </div>
        {pagination?.hasNext && (
          <div className="text-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
        {resources.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No resources found</div>
            <p className="text-gray-500 mt-2">
              Try adjusting your search criteria or upload the first resource!
            </p>
          </div>
        )}
        {/* Modals */}
        {showUploadModal && (
          <ResourceUploadModal
            onClose={() => setShowUploadModal(false)}
            onUpload={handleUpload}
            csSubjects={csSubjects}
            resourceTypes={resourceTypes}
          />
        )}
      </div>
    </div>
  );
};

export default Resources;
