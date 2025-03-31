import React from 'react'
import { FiUpload, FiFilm } from "react-icons/fi";
import { NavLink } from "react-router-dom";

const NoVideo = () => {
  return (
    <div className="flex flex-col items-center justify-center pb-16 px-4 text-center">
      {/* Animated illustration */}
      <div className="relative w-64 h-64 mb-8">
        {/* Purple gradient circle background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#ae7aff] to-[#7f5af0] rounded-full opacity-10 blur-sm" />
        
        {/* Film reel with empty frames */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <div className="relative">
            {/* Film reel */}
            <div className="w-24 h-24 rounded-full border-4 border-[#ae7aff] flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#7f5af0]" />
            </div>
            
            {/* Empty film strip */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-40 h-16 bg-gray-100 dark:bg-gray-800 rounded-sm shadow-md flex space-x-2 p-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-sm" />
              ))}
            </div>
          </div>
        </div>
        
      </div>

      {/* Message */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        No Videos Uploaded Yet
      </h2>
      <p className="text-gray-600 dark:text-gray-300 max-w-md mb-6">
        Your uploaded videos will appear here. Start by sharing your first video with the community!
      </p>

    </div>
  );
};

export default NoVideo;

