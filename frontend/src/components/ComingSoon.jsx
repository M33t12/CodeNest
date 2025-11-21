// components/ComingSoon.jsx
import React from "react";
import { Clock } from "lucide-react";

const ComingSoon = ({ title = "Feature Coming Soon", description = "This feature is currently under development and will be available shortly." }) => {
  return (
    <div className="flex flex-col mt-2 mr-2 ml-2 items-center justify-center h-80 text-center p-6 bg-white rounded-2xl shadow-md border border-gray-200">
      <Clock className="text-blue-600 mb-4" size={48} />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 max-w-md">{description}</p>
    </div>
  );
};

export default ComingSoon;
