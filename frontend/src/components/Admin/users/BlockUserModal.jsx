// Block User Modal Component
import React, { useRef, useEffect } from "react";

export const BlockUserModal = ({
  user,
  reason,
  onReasonChange,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onCancel();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-lg transform transition-all duration-200 scale-95 opacity-100 animate-fadeIn"
      >
        <h2 className="text-xl font-semibold mb-4 text-red-500">Block User</h2>
        <p className="text-gray-200 mb-4">
          You are about to block{" "}
          <strong>
            {user.firstName} {user.lastName}
          </strong>
          . Please provide a reason:
        </p>

        <textarea
          rows={4}
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Enter reason for blocking this user..."
          className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          disabled={isLoading}
        />

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!reason.trim() || isLoading}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>Block</span>
          </button>
        </div>
      </div>
    </div>
  );
};
