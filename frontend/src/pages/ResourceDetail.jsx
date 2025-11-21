"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useResourceStore } from "../store/resourceStore";
import MarkdownRenderer from "../components/MarkdownRenderer";

import {
  ArrowLeft,
  ExternalLink,
  Download,
  Eye,
  Calendar,
  User,
  Star,
  MessageSquare,
  FileText,
  ImageIcon,
  Link as LinkIcon,
  Code,
  Share2,
  BookmarkPlus,
  Layers,
  ChevronRight,
} from "lucide-react";

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getResourceById, rateResource, downloadResource } =
    useResourceStore();
  const [resource, setResource] = useState(null);
  const [similarResources, setSimilarResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const resourceData = await getResourceById(id);
        setResource(resourceData.resource);
        setSimilarResources(resourceData.similar || []);
      } catch (err) {
        setError("Failed to load resource");
        console.error("Error fetching resource:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResource();
    }
  }, [id, getResourceById]);

  console.log("Similar Resources :", similarResources);
  const getTypeIcon = (type) => {
    const iconMap = {
      pdf: <FileText className="w-5 h-5 text-red-600" />,
      image: <ImageIcon className="w-5 h-5 text-purple-600" />,
      link: <LinkIcon className="w-5 h-5 text-blue-600" />,
      blog: <MessageSquare className="w-5 h-5 text-green-600" />,
      markdown: <Code className="w-5 h-5 text-orange-600" />,
      mixed: <Layers className="w-5 h-5 text-indigo-600" />,
    };
    return iconMap[type] || <FileText className="w-5 h-5 text-gray-600" />;
  };

  const getFileUrl = (path) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `http://localhost:5000${path}`;
  };
  const API_URL = "http://localhost:5000";

  const handleDownload = async (itemIndex = null) => {
    try {
      const params = itemIndex !== null ? `?itemIndex=${itemIndex}` : "";
      const result = await downloadResource(resource._id + params);

      if (itemIndex !== null && result.downloadUrl) {
        window.open(`${API_URL}${result.downloadUrl}`, "_blank");
      } else if (result.items) {
        // Multiple items - open detail view or first item
        if (result.items[0]?.downloadUrl) {
          window.open(`${API_URL}${result.items[0].downloadUrl}`, "_blank");
        }
      } else if (result.downloadUrl) {
        window.open(`${API_URL}${result.downloadUrl}`, "_blank");
      }

      setResource((prev) => ({ ...prev, downloads: result.downloads }));
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: resource.name,
        text: resource.content?.description || "Check out this resource",
        url: window.location.href,
      });
    } catch (err) {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-900">Loading resource...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Resource Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The resource you are looking for does not exist."}
          </p>
          <button
            onClick={() => navigate("/resources")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  // Check if this is a multi-item resource
  const isMultiItem =
    resource.resourceItems && resource.resourceItems.length > 0;
  const items = isMultiItem
    ? resource.resourceItems
    : [
        {
          itemType: resource.type || resource.primaryType,
          content: resource.content,
        },
      ];

  const renderItemContent = (item, itemIndex) => {
    if (!item || !item.content) {
      return (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <p className="text-gray-600">No content available for this item.</p>
        </div>
      );
    }

    switch (item.itemType) {
      case "pdf":
        return (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-center mb-4">
              <FileText className="w-16 h-16 mx-auto text-red-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                PDF Document
              </h3>
              <p className="text-gray-600 mb-4">
                {item.content.fileName || `Document ${itemIndex + 1}`}
              </p>
              {item.content.fileSize && (
                <p className="text-sm text-gray-500 mb-4">
                  File size:{" "}
                  {(item.content.fileSize / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
              {item.content.description && (
                <p className="text-gray-700 mb-4">{item.content.description}</p>
              )}
            </div>

            {item.content.url && (
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() =>
                    window.open(getFileUrl(item.content.url), "_blank")
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <ExternalLink size={18} />
                  <span>Open PDF</span>
                </button>
                <button
                  onClick={() => handleDownload(isMultiItem ? itemIndex : null)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Download size={18} />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>
        );

      case "image":
        return (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            {item.content.url ? (
              <div className="text-center">
                <img
                  src={getFileUrl(item.content.url)}
                  alt={item.content.description || `Image ${itemIndex + 1}`}
                  className="max-w-full h-auto rounded-lg mx-auto mb-4"
                  style={{ maxHeight: "600px" }}
                />
                {item.content.description && (
                  <p className="text-gray-700 mb-4">
                    {item.content.description}
                  </p>
                )}
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() =>
                      window.open(getFileUrl(item.content.url), "_blank")
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <ExternalLink size={16} />
                    <span>Open Full Size</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(isMultiItem ? itemIndex : null)
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-600">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Image not available</p>
              </div>
            )}
          </div>
        );

      case "link":
        return (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-center">
              <LinkIcon className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                External Link
              </h3>
              {item.content.title && (
                <p className="text-gray-700 mb-4">{item.content.title}</p>
              )}
              {item.content.description && (
                <p className="text-gray-600 mb-4">{item.content.description}</p>
              )}
              {item.content.siteName && (
                <p className="text-sm text-gray-500 mb-4">
                  From: {item.content.siteName}
                </p>
              )}
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => window.open(item.content.url, "_blank")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <ExternalLink size={18} />
                  <span>Visit Link</span>
                </button>
              </div>
            </div>
          </div>
        );

      case "markdown":
      return (
        <MarkdownRenderer 
          content={item.content.text}
          description={item.content.description}
        />
      );

      case "blog":
        return (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            {item.content.description && (
              <div className="mb-4 pb-4 border-b">
                <p className="text-gray-700">{item.content.description}</p>
              </div>
            )}
            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {item.content.text || "No blog content available."}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <p className="text-gray-700">
              {item.content.text || item.content.url || "No content available."}
            </p>
          </div>
        );
    }
  };

  const handleRatingSubmit = async () => {
    if (userRating === 0) return;

    try {
      setSubmittingRating(true);
      await rateResource(id, userRating, reviewText);
      const updatedResource = await getResourceById(id);
      setResource(updatedResource.resource);
      setUserRating(0);
      setReviewText("");
      setHoverRating(0);
    } catch (err) {
      console.error("Error submitting rating:", err);
    } finally {
      setSubmittingRating(false);
    }
  };

  const StarRating = ({
    rating,
    onRatingChange,
    onHover,
    onLeave,
    interactive = false,
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-2xl transition-colors ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            } ${
              interactive
                ? "hover:text-yellow-300 cursor-pointer"
                : "cursor-default"
            }`}
            onClick={() =>
              interactive && onRatingChange && onRatingChange(star)
            }
            onMouseEnter={() => interactive && onHover && onHover(star)}
            onMouseLeave={() => interactive && onLeave && onLeave()}
            disabled={!interactive}
          >
            <Star className={star <= rating ? "fill-current" : ""} size={20} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/resources")}
            className="text-blue-600 hover:text-blue-700 mb-6 flex items-center gap-2 transition-colors bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg"
          >
            <ArrowLeft size={20} />
            Back to Resources
          </button>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  {getTypeIcon(
                    resource.primaryType || resource.type || "mixed"
                  )}
                  <h1 className="text-3xl font-bold text-gray-900">
                    {resource.name}
                  </h1>
                </div>
                {resource.content?.description && (
                  <p className="text-gray-600 text-lg mb-4">
                    {resource.content.description}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Share Resource"
                >
                  <Share2 size={18} />
                </button>
                {/* <button
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Bookmark"
                >
                  <BookmarkPlus size={18} />
                </button> */}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {(
                  resource.primaryType ||
                  resource.type ||
                  "mixed"
                ).toUpperCase()}
              </span>
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {resource.subject}
              </span>
              {isMultiItem && (
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Layers className="w-3 h-3" />
                  <span>{items.length} items</span>
                </span>
              )}
              {resource.isFeatured && (
                <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Featured
                </span>
              )}
            </div>

            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {resource.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{resource.views || 0} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>{resource.downloads || 0} downloads</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>
                  {resource.uploadedBy?.firstName}{" "}
                  {resource.uploadedBy?.lastName}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Item Navigation */}
        {isMultiItem && items.length > 1 && (
          <div className="bg-white rounded-lg p-4 shadow-lg mb-8">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <Layers className="w-5 h-5" />
              <span>Resource Items ({items.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setActiveItemIndex(index)}
                  className={`flex items-center space-x-2 p-3 rounded-lg transition-all ${
                    activeItemIndex === index
                      ? "bg-blue-100 border-2 border-blue-500 text-blue-900"
                      : "bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {getTypeIcon(item.itemType)}
                  <span className="flex-1 text-left text-sm font-medium capitalize">
                    {item.itemType} {index + 1}
                  </span>
                  {activeItemIndex === index && <ChevronRight size={16} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Display */}
        <div className="mb-8">
          {isMultiItem ? (
            <div>
              <div className="bg-white p-6 shadow-lg rounded-lg mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-blue-900">
                  {getTypeIcon(items[activeItemIndex].itemType)}
                  <span className="font-medium capitalize">
                    {items[activeItemIndex].itemType} - Item{" "}
                    {activeItemIndex + 1} of {items.length}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setActiveItemIndex(Math.max(0, activeItemIndex - 1))
                    }
                    disabled={activeItemIndex === 0}
                    className="px-3 py-1 bg-gray-100 text-blue-900 rounded text-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setActiveItemIndex(
                        Math.min(items.length - 1, activeItemIndex + 1)
                      )
                    }
                    disabled={activeItemIndex === items.length - 1}
                    className="px-3 py-1  bg-gray-100 text-blue-900 rounded text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
              {renderItemContent(items[activeItemIndex], activeItemIndex)}
            </div>
          ) : (
            renderItemContent(items[0], 0)
          )}
        </div>

        {/* Rating Section */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Rate this Resource
          </h3>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4 mb-2">
              <StarRating rating={Math.round(resource.averageRating || 0)} />
              <span className="text-gray-900 text-lg font-semibold">
                {resource.averageRating
                  ? resource.averageRating.toFixed(1)
                  : "0.0"}
                /5
              </span>
              <span className="text-gray-600">
                ({resource.totalRatings || 0}{" "}
                {resource.totalRatings === 1 ? "rating" : "ratings"})
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-900 font-medium mb-2">
                Your Rating
              </label>
              <StarRating
                rating={hoverRating || userRating}
                onRatingChange={setUserRating}
                onHover={setHoverRating}
                onLeave={() => setHoverRating(0)}
                interactive={true}
              />
              {userRating > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  You rated this {userRating} star{userRating !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-900 font-medium mb-2">
                Review (Optional)
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this resource..."
                className="w-full bg-gray-50 text-gray-900 rounded-lg p-3 border border-gray-300 focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-600 mt-1">
                {reviewText.length}/500 characters
              </p>
            </div>

            <button
              onClick={handleRatingSubmit}
              disabled={userRating === 0 || submittingRating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
            >
              {submittingRating ? "Submitting..." : "Submit Rating"}
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        {resource.ratings && resource.ratings.length > 0 && (
          <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Reviews
            </h3>
            <div className="space-y-4">
              {resource.ratings.map((rating, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-4 last:border-b-0"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={rating.rating} />
                    <span className="text-gray-600 text-sm">
                      {rating.userId
                        ? `${rating.userId.firstName} ${rating.userId.lastName}`
                        : "Anonymous"}
                    </span>
                    <span className="text-gray-600 text-sm">•</span>
                    <span className="text-gray-600 text-sm">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {rating.review && (
                    <p className="text-gray-700">{rating.review}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Resources */}
        {similarResources.length > 0 && (
          <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Similar Resources
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {similarResources.map((similar) => (
                <div
                  key={similar._id}
                  onClick={() => navigate(`/resources/${similar._id}`)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {getTypeIcon(similar.primaryType || similar.type)}
                    <h4 className="font-medium text-gray-900">
                      {similar.name}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {similar.subject}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-current text-yellow-400" />
                      <span>
                        {similar.averageRating
                          ? similar.averageRating.toFixed(1)
                          : "0.0"}
                      </span>
                    </div>
                    <span>{similar.views || 0} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceDetail;
