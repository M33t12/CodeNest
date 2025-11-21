import React from "react"
import { 
  Star, 
  ExternalLink, 
  MessageSquare, 
  FileIcon, 
  FileTextIcon, 
  Link as LinkIcon,
  ImageIcon,
  Eye,
  Download,
  Calendar,
  User,
  Code,
  Layers
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useResourceStore } from "../store/resourceStore"

const ResourceCard = ({ resource, viewMode = "grid" }) => {
  const navigate = useNavigate()
  const { downloadResource } = useResourceStore()

  const getTypeIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FileTextIcon className="w-5 h-5 text-red-600" />
      case "image":
        return <ImageIcon className="w-5 h-5 text-purple-600" />
      case "link":
        return <LinkIcon className="w-5 h-5 text-blue-600" />
      case "blog":
        return <MessageSquare className="w-5 h-5 text-green-600" />
      case "markdown":
        return <Code className="w-5 h-5 text-orange-600" />
      case "mixed":
        return <Layers className="w-5 h-5 text-indigo-600" />
      default:
        return <FileIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "pdf":
        return "bg-red-100 text-red-800"
      case "image":
        return "bg-purple-100 text-purple-800"
      case "link":
        return "bg-blue-100 text-blue-800"
      case "blog":
        return "bg-green-100 text-green-800"
      case "markdown":
        return "bg-orange-100 text-orange-800"
      case "mixed":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleResourceClick = () => {
    navigate(`/resources/${resource._id}`)
  }

  const handleDownload = async (e) => {
    e.stopPropagation()
    try {
      await downloadResource(resource._id)
      // For multi-item resources, navigate to detail page
      if (resource.resourceItems && resource.resourceItems.length > 1) {
        navigate(`/resources/${resource._id}`)
      } else if (resource.content?.url) {
        window.open(resource.content.url, '_blank')
      }
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  const StarRating = ({ rating, size = "w-4 h-4" }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= Math.round(rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    )
  }

  // Check if this is a multi-item resource
  const isMultiItem = resource.resourceItems && resource.resourceItems.length > 1
  const displayType = resource.primaryType || resource.type || 'mixed'

  // Get item types for multi-item resources
  const getItemTypes = () => {
    if (resource.resourceItems && resource.resourceItems.length > 0) {
      const types = [...new Set(resource.resourceItems.map(item => item.itemType))]
      return types
    }
    return []
  }

  if (viewMode === "list") {
    return (
      <div 
        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 border-blue-500"
        onClick={handleResourceClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="flex-shrink-0">
              {getTypeIcon(displayType)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {resource.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(displayType)}`}>
                  {displayType.toUpperCase()}
                </span>
                {isMultiItem && (
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Layers className="w-3 h-3" />
                    <span>{resource.resourceItems.length} items</span>
                  </span>
                )}
                {resource.isFeatured && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Featured
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <span className="font-medium">{resource.subject}</span>
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{resource.uploadedBy?.firstName} {resource.uploadedBy?.lastName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Show item types for multi-item resources */}
              {isMultiItem && (
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-xs text-gray-600">Contains:</span>
                  {getItemTypes().map((type, idx) => (
                    <span key={idx} className="flex items-center space-x-1 bg-gray-100 px-2 py-0.5 rounded text-xs">
                      {getTypeIcon(type)}
                      <span className="capitalize">{type}</span>
                    </span>
                  ))}
                </div>
              )}
              
              {resource.content?.description && (
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                  {resource.content.description}
                </p>
              )}
              
              {resource.tags && resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {resource.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{resource.tags.length - 3} more</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2 ml-4">
            <div className="flex items-center space-x-1">
              <StarRating rating={resource.averageRating || 0} />
              <span className="text-sm text-gray-600 ml-1">
                {resource.averageRating ? resource.averageRating.toFixed(1) : '0.0'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{resource.views || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="w-3 h-3" />
                <span>{resource.downloads || 0}</span>
              </div>
            </div>
            
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>View</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer overflow-hidden"
      onClick={handleResourceClick}
    >
      {/* Header with badges */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            {getTypeIcon(displayType)}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(displayType)}`}>
              {displayType.toUpperCase()}
            </span>
            {isMultiItem && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium flex items-center space-x-1">
                <Layers className="w-3 h-3" />
                <span>{resource.resourceItems.length}</span>
              </span>
            )}
            {resource.isFeatured && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                Featured
              </span>
            )}
          </div>
          
          <button
            onClick={handleDownload}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ExternalLink size={18} />
          </button>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {resource.name}
        </h3>

        <div className="text-sm text-gray-600 mb-3">
          <div className="font-medium mb-1">{resource.subject}</div>
          <div className="flex items-center space-x-1 text-xs">
            <User className="w-3 h-3" />
            <span>{resource.uploadedBy?.firstName} {resource.uploadedBy?.lastName}</span>
          </div>
        </div>

        {/* Show item types for multi-item resources */}
        {isMultiItem && (
          <div className="flex flex-wrap gap-1 mb-3">
            {getItemTypes().map((type, idx) => (
              <span key={idx} className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded text-xs text-gray-700">
                {getTypeIcon(type)}
                <span className="capitalize">{type}</span>
              </span>
            ))}
          </div>
        )}

        {resource.content?.description && (
          <p className="text-gray-700 text-sm mb-3 line-clamp-3">
            {resource.content.description}
          </p>
        )}

        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {resource.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                #{tag}
              </span>
            ))}
            {resource.tags.length > 2 && (
              <span className="text-xs text-gray-500">+{resource.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <StarRating rating={resource.averageRating || 0} />
            <span className="text-sm text-gray-600 ml-1">
              {resource.averageRating ? resource.averageRating.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-gray-500">
              ({resource.totalRatings || 0})
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{resource.views || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download className="w-3 h-3" />
              <span>{resource.downloads || 0}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}

export default ResourceCard