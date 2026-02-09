import React from 'react';
import { FaHandshake } from 'react-icons/fa';

const PaidClient = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaHandshake className="text-3xl text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-900 font-sora">Paid Client</h1>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <p className="text-gray-600 font-sora">Paid client management coming soon...</p>
      </div>
    </div>
  );
};

export default PaidClient;