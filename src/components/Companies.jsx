import React from 'react';
import { FaBuilding } from 'react-icons/fa';

const Companies = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaBuilding className="text-3xl text-emerald-600" />
        <h1 className="text-3xl font-bold text-gray-900 font-sora">Companies</h1>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <p className="text-gray-600 font-sora">Companies management coming soon...</p>
      </div>
    </div>
  );
};

export default Companies;