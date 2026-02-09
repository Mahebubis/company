import React from 'react';
import { FaBriefcase } from 'react-icons/fa';

const JobPosting = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaBriefcase className="text-3xl text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900 font-sora">Job Posting</h1>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <p className="text-gray-600 font-sora">Job posting management coming soon...</p>
      </div>
    </div>
  );
};

export default JobPosting;