import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FaBuilding, FaBriefcase, FaHandshake, FaEnvelopeOpenText } from 'react-icons/fa';

const Dashboard = () => {
  // Data for Companies Pie Chart
  const companiesData = [
    { name: 'Active', value: 45, color: '#10b981' },
    { name: 'Inactive', value: 15, color: '#ef4444' },
    { name: 'Verified', value: 38, color: '#3b82f6' },
    { name: 'Not Verified', value: 22, color: '#f59e0b' }
  ];

  // Data for Job Posting Pie Chart
  const jobsData = [
    { name: 'Active Jobs', value: 28, color: '#10b981' },
    { name: 'Closed Jobs', value: 12, color: '#ef4444' },
    { name: 'Shortlisted', value: 156, color: '#3b82f6' },
    { name: 'Rejected', value: 89, color: '#f59e0b' },
    { name: 'Hired', value: 45, color: '#8b5cf6' }
  ];

  // Data for Paid Clients Pie Chart
  const paidClientsData = [
    { name: 'Active', value: 0, color: '#10b981' },
    { name: 'Inactive', value: 0, color: '#ef4444' }
  ];

  // Data for Requests Pie Chart
  const requestsData = [
    { name: 'Pending', value: 0, color: '#f59e0b' },
    { name: 'Approved', value: 0, color: '#10b981' },
    { name: 'Rejected', value: 0, color: '#ef4444' }
  ];

  const StatCard = ({ icon: Icon, title, value, color, pieData, step }) => {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon className={`text-2xl ${color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 font-sora">{title}</p>
                <h3 className="text-3xl font-bold text-gray-900 font-sora mt-1">{value}</h3>
              </div>
            </div>
            
            {/* Step indicator */}
            <div className="flex items-center gap-2 mt-3">
              <div className={`w-10 h-10 rounded-full ${color} bg-opacity-20 flex items-center justify-center`}>
                <span className={`text-sm font-bold ${color.replace('bg-', 'text-')} font-sora`}>{step}</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent"></div>
            </div>
          </div>

          {/* Mini Pie Chart */}
          <div className="w-32 h-32 ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={45}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    fontFamily: 'Sora'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
          {pieData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs text-gray-600 font-sora truncate">{item.name}</span>
              <span className="text-xs font-semibold text-gray-900 ml-auto font-sora">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-sora">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2 font-sora">Track your placement activities and manage recruitment</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatCard
          icon={FaBuilding}
          title="Companies"
          value="60"
          color="bg-emerald-500"
          pieData={companiesData}
          step="1"
        />

        <StatCard
          icon={FaBriefcase}
          title="Job Posting"
          value="40"
          color="bg-blue-500"
          pieData={jobsData}
          step="2"
        />

        <StatCard
          icon={FaHandshake}
          title="Paid Client"
          value="0"
          color="bg-purple-500"
          pieData={paidClientsData}
          step="3"
        />

        <StatCard
          icon={FaEnvelopeOpenText}
          title="Requests"
          value="0"
          color="bg-orange-500"
          pieData={requestsData}
          step="4"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white mt-8">
        <h3 className="text-xl font-bold mb-4 font-sora">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <FaBuilding className="text-3xl mx-auto mb-2" />
              <p className="text-sm font-medium font-sora">Add Company</p>
            </div>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <FaBriefcase className="text-3xl mx-auto mb-2" />
              <p className="text-sm font-medium font-sora">Post Job</p>
            </div>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <FaHandshake className="text-3xl mx-auto mb-2" />
              <p className="text-sm font-medium font-sora">View Clients</p>
            </div>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <FaEnvelopeOpenText className="text-3xl mx-auto mb-2" />
              <p className="text-sm font-medium font-sora">Check Requests</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;