import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaBuilding, 
  FaBriefcase, 
  FaHandshake, 
  FaEnvelopeOpenText,
  FaSignOutAlt,
  FaGraduationCap,
  FaUser
} from 'react-icons/fa';

const Sidebar = ({ user, onLogout }) => {
  const menuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/companies', icon: FaBuilding, label: 'Companies' },
    { path: '/job-posting', icon: FaBriefcase, label: 'Job Posting' },
    { path: '/paid-client', icon: FaHandshake, label: 'Paid Client' },
    { path: '/requests', icon: FaEnvelopeOpenText, label: 'Requests' },
  ];

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-emerald-600 to-teal-700 text-white flex flex-col shadow-2xl fixed left-0 top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-emerald-500 border-opacity-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl">
            <FaGraduationCap className="text-3xl text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-sora">College Portal</h1>
            <p className="text-xs text-emerald-100 font-sora">TPO Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-sora ${
                    isActive
                      ? 'bg-white text-emerald-600 shadow-lg transform scale-105'
                      : 'text-emerald-50 hover:bg-emerald-500 hover:bg-opacity-50 hover:transform hover:translate-x-1'
                  }`
                }
              >
                <item.icon className="text-xl" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-emerald-500 border-opacity-50">
        <div className="bg-emerald-500 bg-opacity-30 rounded-xl p-4 mb-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <FaUser className="text-emerald-600" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-sm truncate font-sora">{user?.full_name || 'User'}</p>
              <p className="text-xs text-emerald-100 truncate font-sora">{user?.email || 'email@example.com'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-emerald-600 rounded-md font-sora">
              {user?.role?.toUpperCase() || 'USER'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-sora"
        >
          <FaSignOutAlt />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;