"use client"

import { useState } from "react"
import { X, Download, Star, Eye, Calendar, User, Tag, Share2 } from "lucide-react"
import { useResourceStore } from "../store/resourceStore"

const ResourceDetailModal = ({ resource, onClose }) => {
  const [userRating, setUserRating] = useState(0)
  const [review, setReview] = useState("")
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const { rateResource, downloadResource } = useResourceStore()

  const handleRating = async () => {
    if (userRating === 0) return

    setIsSubmittingRating(true)
    try {
      await rateResource(resource._id, userRating, review)
      setUserRating(0)
      setReview("")
    } catch (error) {
      console.error("Failed to rate resource:", error)
    } finally {
      setIsSubmittingRating(false)
    }
  }

  const handleDownload = async () => {
    try {
      await downloadResource(resource._id)
      if (resource.content?.url) {
        window.open(resource.content.url, "_blank")
      }
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.name,
          text: resource.content?.description || "Check out this resource",
          url: window.location.href,
        })
      } catch (error) {
        console.log("Share cancelled")
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white text-black rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-start">
          <div className="flex-1 mr-4">
            <h2 className="text-2xl font-bold text-gray-900">{resource.name}</h2>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <User size={16} />
                <span>
                  by {resource.uploadedBy?.firstName} {resource.uploadedBy?.lastName}
                </span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar size={16} />
                <span>{formatDate(resource.createdAt)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye size={16} />
                <span>{resource.views || 0} views</span>
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Resource Info */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              {/* Description */}
              {resource.content?.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{resource.content.description}</p>
                </div>
              )}

              {/* Content Preview */}
              {resource.content?.text && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Content Preview</h3>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {resource.content.text.substring(0, 500)}
                      {resource.content.text.length > 500 && "..."}
                    </pre>
                  </div>
                </div>
              )}

              {/* Reviews */}
              {resource.ratings?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Reviews</h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {resource.ratings.map((rating, index) => (
                      <div key={index} className="border-b pb-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                className={star <= rating.rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">
                            {rating.userId?.firstName} {rating.userId?.lastName}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(rating.createdAt)}</span>
                        </div>
                        {rating.review && <p className="text-sm text-gray-700">{rating.review}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Resource Stats */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Resource Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subject:</span>
                    <span className="font-medium">{resource.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium capitalize">{resource.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rating:</span>
                    <div className="flex items-center space-x-1">
                      <Star size={16} className="text-yellow-400 fill-current" />
                      <span className="font-medium">{resource.averageRating?.toFixed(1) || "N/A"}</span>
                      <span className="text-gray-500">({resource.totalRatings || 0})</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Downloads:</span>
                    <span className="font-medium">{resource.downloads || 0}</span>
                  </div>
                  {resource.content?.fileSize && (
                    <div className="flex justify-between">
                      <span>File Size:</span>
                      <span className="font-medium">{resource.formattedFileSize}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {resource.tags?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center space-x-1">
                    <Tag size={16} />
                    <span>Tags</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                {resource.content?.url && (
                  <button
                    onClick={handleDownload}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download size={16} />
                    <span>Download/View</span>
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>

              {/* Rate Resource */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Rate this Resource</h3>
                <div className="space-y-3">
                  <div className="flex justify-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={24}
                        className={`cursor-pointer transition-colors ${
                          star <= userRating ? "text-yellow-400 fill-current" : "text-gray-300 hover:text-yellow-200"
                        }`}
                        onClick={() => setUserRating(star)}
                      />
                    ))}
                  </div>

                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Write a review (optional)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none"
                  />

                  <button
                    onClick={handleRating}
                    disabled={userRating === 0 || isSubmittingRating}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingRating ? "Submitting..." : "Submit Rating"}
                  </button>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResourceDetailModal
