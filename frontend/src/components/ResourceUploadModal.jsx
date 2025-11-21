"use client"

import { useState, useEffect } from "react"
import { X, Upload, Link, FileText, Image, Code, Plus, Trash2, GripVertical } from "lucide-react"

const ResourceUploadModal = ({ 
  onClose, 
  onUpload, 
  onSave,
  csSubjects, 
  resourceTypes,
  editMode = false,
  existingResource = null
}) => {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    tags: [],
  })
  
  // Multi-item state
  const [resourceItems, setResourceItems] = useState([
    {
      id: Date.now(),
      itemType: "pdf",
      content: {
        url: "",
        text: "",
        description: "",
        title: "",
      },
      file: null,
    }
  ])
  
  const [tagInput, setTagInput] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // Initialize form with existing resource data in edit mode
  useEffect(() => {
    if (editMode && existingResource) {
      setFormData({
        name: existingResource.name || "",
        subject: existingResource.subject || "",
        tags: existingResource.tags || [],
      })
      
      if (existingResource.resourceItems && existingResource.resourceItems.length > 0) {
        setResourceItems(existingResource.resourceItems.map((item, idx) => ({
          id: Date.now() + idx,
          itemType: item.itemType,
          content: { ...item.content },
          file: null,
        })))
      }
    }
  }, [editMode, existingResource])

  const addResourceItem = () => {
    setResourceItems([...resourceItems, {
      id: Date.now(),
      itemType: "pdf",
      content: {
        url: "",
        text: "",
        description: "",
        title: "",
      },
      file: null,
    }])
  }

  const removeResourceItem = (id) => {
    if (resourceItems.length > 1) {
      setResourceItems(resourceItems.filter(item => item.id !== id))
    }
  }

  const updateResourceItem = (id, field, value) => {
    setResourceItems(resourceItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const updateItemContent = (id, contentField, value) => {
    setResourceItems(resourceItems.map(item => 
      item.id === id ? {
        ...item,
        content: { ...item.content, [contentField]: value }
      } : item
    ))
  }

  const handleFileSelect = (id, e) => {
    const file = e.target.files[0]
    if (!file) return

    const item = resourceItems.find(i => i.id === id)
    if (!item) return

    try {
      // Validate file type
      const validTypes = {
        pdf: ["application/pdf"],
        image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
      }

      if (validTypes[item.itemType] && !validTypes[item.itemType].includes(file.type)) {
        alert(`Please select a valid ${item.itemType} file`)
        return
      }

      // Validate file size
      const maxSizes = {
        pdf: 16 * 1024 * 1024,
        image: 8 * 1024 * 1024,
      }

      if (file.size > maxSizes[item.itemType]) {
        alert(`File size must be less than ${maxSizes[item.itemType] / 1024 / 1024}MB`)
        return
      }

      updateResourceItem(id, 'file', file)
      
      // Auto-fill resource name if empty (only for first item and not in edit mode)
      if (!editMode && !formData.name.trim() && resourceItems[0].id === id) {
        setFormData(prev => ({
          ...prev,
          name: file.name.replace(/\.[^/.]+$/, ""),
        }))
      }

      console.log("File selected for item:", id, file.name)
    } catch (error) {
      console.error("File selection error:", error)
      alert("Error selecting file: " + error.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      // Validate form data
      if (!formData.name.trim() || !formData.subject) {
        throw new Error("Name and subject are required")
      }

      if (resourceItems.length === 0) {
        throw new Error("At least one resource item is required")
      }

      // Validate each item
      for (let i = 0; i < resourceItems.length; i++) {
        const item = resourceItems[i]
        
        if (item.itemType === "link" && !item.content.url) {
          throw new Error(`Item ${i + 1}: URL is required for link resources`)
        }

        if ((item.itemType === "blog" || item.itemType === "markdown") && 
            (!item.content.text || item.content.text.trim().length < 50)) {
          throw new Error(`Item ${i + 1}: ${item.itemType} content must be at least 50 characters long`)
        }

        if ((item.itemType === "pdf" || item.itemType === "image") && 
            !item.file && !item.content.url && !editMode) {
          throw new Error(`Item ${i + 1}: Please select a ${item.itemType} file or provide a URL`)
        }
      }

      console.log(editMode ? "Updating resource..." : "Submitting resource...")

      // Create FormData
      const uploadData = new FormData()
      uploadData.append('name', formData.name.trim())
      uploadData.append('subject', formData.subject)
      uploadData.append('tags', JSON.stringify(formData.tags.filter(tag => tag.trim())))
      
      // Prepare resourceItems without files
      const itemsData = resourceItems.map((item, index) => ({
        itemType: item.itemType,
        content: item.content,
        order: index
      }))
      
      uploadData.append('resourceItems', JSON.stringify(itemsData))

      // Add files with indexed field names
      resourceItems.forEach((item, index) => {
        if (item.file) {
          uploadData.append(`file_${index}`, item.file)
        }
      })

      if (editMode) {
        await onSave(uploadData)
      } else {
        await onUpload(uploadData)
      }
      
      // Reset form
      setFormData({
        name: "",
        subject: "",
        tags: [],
      })
      setResourceItems([{
        id: Date.now(),
        itemType: "pdf",
        content: {
          url: "",
          text: "",
          description: "",
          title: "",
        },
        file: null,
      }])
      
    } catch (error) {
      console.error(editMode ? "Update failed:" : "Upload failed:", error)
      alert((editMode ? "Update failed: " : "Upload failed: ") + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }

  const getTypeIcon = (type) => {
    const icons = {
      pdf: FileText,
      image: Image,
      link: Link,
      blog: Code,
      markdown: FileText,
    }
    const IconComponent = icons[type] || Upload
    return <IconComponent className="w-5 h-5" />
  }

  const renderItemContent = (item) => {
    switch (item.itemType) {
      case "pdf":
      case "image":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload {item.itemType.toUpperCase()} File {!editMode && '*'}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept={item.itemType === "pdf" ? ".pdf" : "image/*"}
                  onChange={(e) => handleFileSelect(item.id, e)}
                  className="hidden"
                  id={`file-upload-${item.id}`}
                />
                <label htmlFor={`file-upload-${item.id}`} className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      {item.file ? (
                        <div className="space-y-1">
                          <div className="font-medium text-green-600">
                            Selected: {item.file.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(item.file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="font-medium">Click to upload</span>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.itemType === "pdf" ? "PDF only, max 16MB" : "Images only, max 8MB"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or provide URL (optional)
              </label>
              <input
                type="url"
                value={item.content.url}
                onChange={(e) => updateItemContent(item.id, 'url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`https://example.com/file.${item.itemType === "pdf" ? "pdf" : "jpg"}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={item.content.description || ""}
                onChange={(e) => updateItemContent(item.id, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of this file"
              />
            </div>
          </div>
        )

      case "link":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL *</label>
              <input
                type="url"
                required
                value={item.content.url}
                onChange={(e) => updateItemContent(item.id, 'url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link Title</label>
              <input
                type="text"
                value={item.content.title || ""}
                onChange={(e) => updateItemContent(item.id, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Custom title for the link"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={item.content.description || ""}
                onChange={(e) => updateItemContent(item.id, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description"
              />
            </div>
          </div>
        )

      case "blog":
      case "markdown":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content * (Minimum 50 characters)
              </label>
              <textarea
                required
                rows={6}
                value={item.content.text || ""}
                onChange={(e) => updateItemContent(item.id, 'text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={item.itemType === "markdown" ? "Enter markdown content..." : "Enter blog content..."}
                minLength={50}
              />
              <div className="text-sm text-gray-500 mt-1">
                {(item.content.text || "").length}/50 characters minimum
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={item.content.description || ""}
                onChange={(e) => updateItemContent(item.id, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white text-black rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {editMode ? "Edit Resource" : "Upload Multi-Item Resource"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resource Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter resource name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
              <select
                required
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Subject</option>
                {csSubjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resource Items */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Resource Items</h3>
              <button
                type="button"
                onClick={addResourceItem}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-6">
              {resourceItems.map((item, index) => (
                <div key={item.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">Item {index + 1}</span>
                    </div>
                    {resourceItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeResourceItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  {/* Item Type Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Item Type *</label>
                    <div className="grid grid-cols-5 gap-2">
                      {resourceTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => updateResourceItem(item.id, 'itemType', type)}
                          disabled={editMode}
                          className={`flex items-center justify-center space-x-2 p-2 border rounded-lg transition-colors ${
                            item.itemType === type
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 hover:border-gray-400"
                          } ${editMode ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {getTypeIcon(type)}
                          <span className="text-xs capitalize">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Item Content */}
                  {renderItemContent(item)}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Maximum 10)
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add tags (press Enter)"
                disabled={formData.tags.length >= 10}
              />
              <button
                type="button"
                onClick={addTag}
                disabled={formData.tags.length >= 10 || !tagInput.trim()}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{editMode ? "Updating..." : "Uploading..."}</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>{editMode ? "Update Resource" : "Upload Resource"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResourceUploadModal