import React, { useState, useEffect } from "react";
import {
  Plus,
  Filter,
  Edit3,
  Trash2,
  Eye,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  ExternalLink,
  Layers,
  FileIcon,
  ImageIcon,
  Link as LinkIcon,
  MessageSquare,
  Code,
} from "lucide-react";
import { useResourceStore } from "../store/resourceStore";
import ResourceUploadModal from "../components/ResourceUploadModal";

const MyResources = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedResource, setSelectedResource] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  const {
    userResources,
    isLoading,
    error,
    fetchUserResources,
    uploadResource,
    updateResource,
    deleteResource,
    clearError,
  } = useResourceStore();

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

  useEffect(() => {
    fetchUserResources(statusFilter === "all" ? "" : statusFilter);
  }, [statusFilter, fetchUserResources]);

  const filteredResources = userResources.filter(
    (resource) => statusFilter === "all" || resource.status === statusFilter
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTypeIcon = (type) => {
    const iconMap = {
      pdf: <FileText className="w-4 h-4 text-red-600" />,
      image: <ImageIcon className="w-4 h-4 text-purple-600" />,
      link: <LinkIcon className="w-4 h-4 text-blue-600" />,
      blog: <MessageSquare className="w-4 h-4 text-green-600" />,
      markdown: <Code className="w-4 h-4 text-orange-600" />,
      mixed: <Layers className="w-4 h-4 text-indigo-600" />,
    };
    return iconMap[type] || <FileIcon className="w-4 h-4 text-gray-600" />;
  };

  const handleUpload = async (formData) => {
    try {
      await uploadResource(formData);
      setShowUploadModal(false);
      fetchUserResources(statusFilter === "all" ? "" : statusFilter);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleDelete = async () => {
    if (selectedResource) {
      try {
        await deleteResource(selectedResource._id);
        setShowDeleteModal(false);
        setSelectedResource(null);
        fetchUserResources(statusFilter === "all" ? "" : statusFilter);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const openResource = (resource) => {
    // For multi-item resources, navigate to detail page
    if (resource.resourceItems && resource.resourceItems.length > 1) {
      window.location.href = `/resources/${resource._id}`;
    } else if (resource.content?.url) {
      window.open(resource.content.url, "_blank");
    } else {
      window.location.href = `/resources/${resource._id}`;
    }
  };

  const getResourceStats = () => {
    return {
      total: userResources.length,
      pending: userResources.filter((r) => r.status === "pending").length,
      approved: userResources.filter((r) => r.status === "approved").length,
      rejected: userResources.filter((r) => r.status === "rejected").length,
    };
  };

  const handleEditClick = (resource) => {
    setEditingResource(resource);
  };

  const handleSave = async (updatedData) => {
    try {
      await updateResource(editingResource._id, updatedData);
      setEditingResource(null);
      fetchUserResources(statusFilter === "all" ? "" : statusFilter);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const stats = getResourceStats();

  // Helper to get item types for multi-item resources
  const getItemTypes = (resource) => {
    if (resource.resourceItems && resource.resourceItems.length > 0) {
      return [...new Set(resource.resourceItems.map(item => item.itemType))];
    }
    return [];
  };

  const isMultiItem = (resource) => {
    return resource.resourceItems && resource.resourceItems.length > 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Resources
            </h1>
            <p className="text-gray-600">Manage your uploaded resources</p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Upload Resource</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-600">Total Resources</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </div>
                <div className="text-sm text-gray-600">Pending Review</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.approved}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <XCircle className="w-6 h-6 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Filter by Status:</span>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending ({stats.pending})</option>
              <option value="approved">Approved ({stats.approved})</option>
              <option value="rejected">Rejected ({stats.rejected})</option>
            </select>

            <div className="ml-auto text-sm text-gray-600">
              Showing {filteredResources.length} of {stats.total} resources
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-700 hover:text-red-900"
            >
              <XCircle size={16} />
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Resources List */}
        {!isLoading && (
          <div className="space-y-6">
            {filteredResources.map((resource) => (
              <div
                key={resource._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {resource.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(resource.status)}
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            resource.status
                          )}`}
                        >
                          {resource.status.toUpperCase()}
                        </span>
                      </div>
                      {isMultiItem(resource) && (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium flex items-center space-x-1">
                          <Layers className="w-4 h-4" />
                          <span>{resource.resourceItems.length} items</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span className="font-medium">{resource.subject}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded flex items-center space-x-1">
                        {getTypeIcon(resource.primaryType || resource.type || 'mixed')}
                        <span className="capitalize">
                          {resource.primaryType || resource.type || 'mixed'}
                        </span>
                      </span>
                      <span>
                        Created{" "}
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Show item types for multi-item resources */}
                    {isMultiItem(resource) && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="text-xs text-gray-600">Contains:</span>
                        {getItemTypes(resource).map((type, idx) => (
                          <span key={idx} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-xs">
                            {getTypeIcon(type)}
                            <span className="capitalize">{type}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {resource.content?.description && (
                      <p className="text-gray-700 mb-3">
                        {resource.content.description}
                      </p>
                    )}

                    {/* Tags */}
                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {resource.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{resource.views || 0} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="w-4 h-4" />
                        <span>{resource.downloads || 0} downloads</span>
                      </div>
                      {resource.averageRating > 0 && (
                        <div className="flex items-center space-x-1">
                          <span>⭐ {resource.averageRating.toFixed(1)}</span>
                          <span>({resource.totalRatings || 0} ratings)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => openResource(resource)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="View Resource"
                    >
                      <ExternalLink size={18} />
                    </button>

                    {resource.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleEditClick(resource)}
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                          title="Edit Resource"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedResource(resource);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Delete Resource"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* AI Feedback */}
                {resource.aiFeedback && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900 mb-1">
                          AI Analysis
                        </h4>
                        <p className="text-blue-800 text-sm">
                          {resource.aiFeedback}
                        </p>
                        {resource.aiVerdict && (
                          <div className="mt-2 text-xs text-blue-700">
                            Verdict:{" "}
                            <span className="font-medium">
                              {resource.aiVerdict.toUpperCase()}
                            </span>
                            {resource.aiConfidence > 0 && (
                              <span>
                                {" "}
                                (Confidence:{" "}
                                {Math.round(resource.aiConfidence * 100)}%)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {resource.status === "rejected" && resource.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-red-900 mb-1">
                          Rejection Reason
                        </h4>
                        <p className="text-red-800 text-sm">
                          {resource.rejectionReason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredResources.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <div className="text-xl font-semibold text-gray-900 mb-2">
              {statusFilter === "all"
                ? "No resources yet"
                : `No ${statusFilter} resources`}
            </div>
            <p className="text-gray-600 mb-4">
              {statusFilter === "all"
                ? "Start by uploading your first resource"
                : `You don't have any ${statusFilter} resources`}
            </p>
            {statusFilter === "all" ? (
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload Your First Resource
              </button>
            ) : (
              <button
                onClick={() => setStatusFilter("all")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Show All Resources
              </button>
            )}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <ResourceUploadModal
            onClose={() => setShowUploadModal(false)}
            onUpload={handleUpload}
            csSubjects={csSubjects}
            resourceTypes={resourceTypes}
            editMode={false}
          />
        )}

        {/* Edit Modal */}
        {editingResource && (
          <ResourceUploadModal
            onClose={() => setEditingResource(null)}
            onSave={handleSave}
            csSubjects={csSubjects}
            resourceTypes={resourceTypes}
            editMode={true}
            existingResource={editingResource}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedResource && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-start space-x-3 mb-4">
                <Trash2 className="w-6 h-6 text-red-600 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Delete Resource
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Are you sure you want to delete "{selectedResource.name}"?
                    {isMultiItem(selectedResource) && (
                      <span className="block mt-1 text-orange-600 font-medium">
                        This will delete all {selectedResource.resourceItems.length} items in this resource.
                      </span>
                    )}
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedResource(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Resource
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyResources;