// Delete User Modal Component
import React, { useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";

export const DeleteUserModal = ({ user, onConfirm, onCancel, isLoading }) => {
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
        className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg transform transition-all duration-200 scale-95 opacity-100 animate-fadeIn"
      >
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-full">
            <Trash2 size={24} className="text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Confirm Deletion
          </h2>
        </div>

        <p className="text-gray-600 mb-6">
          Are you sure you want to permanently delete user{" "}
          <strong>
            {user.firstName} {user.lastName}
          </strong>
          ? This action cannot be undone.
        </p>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            disabled={isLoading}
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
