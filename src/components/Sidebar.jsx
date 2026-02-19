// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { 
//   FaHome, 
//   FaBuilding, 
//   FaBriefcase, 
//   FaHandshake, 
//   FaEnvelopeOpenText,
//   FaSignOutAlt,
//   FaGraduationCap,
//   FaUser,
//   FaIndustry
// } from 'react-icons/fa';


// const Sidebar = ({ user, onLogout }) => {
//   const menuItems = [
//     { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
//     { path: '/companies', icon: FaBuilding, label: 'Companies' },
//     { path: '/job-posting', icon: FaBriefcase, label: 'Job Posting' },
//     { path: '/paid-client', icon: FaHandshake, label: 'Paid Client' },
//     { path: '/requests', icon: FaEnvelopeOpenText, label: 'Requests' },
//   ];

//   return (
//     <div className="h-screen w-64 bg-gradient-to-b from-emerald-600 to-teal-700 text-white flex flex-col shadow-2xl fixed left-0 top-0">
//       {/* Logo Section */}
//       <div className="p-6 border-b border-emerald-500 border-opacity-50">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-white rounded-xl">
//             <FaIndustry className="text-3xl text-emerald-600" />
//           </div>
//           <div>
//             <h1 className="text-xl font-bold font-sora">Company</h1>
//             <p className="text-xs text-emerald-100 font-sora">Company Management</p>
//           </div>
//         </div>
//       </div>

//       {/* Navigation Menu */}
//       <nav className="flex-1 px-4 py-6 overflow-y-auto">
//         <ul className="space-y-2">
//           {menuItems.map((item) => (
//             <li key={item.path}>
//               <NavLink
//                 to={item.path}
//                 className={({ isActive }) =>
//                   `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-sora ${
//                     isActive
//                       ? 'bg-white text-emerald-600 shadow-lg transform scale-105'
//                       : 'text-emerald-50 hover:bg-emerald-500 hover:bg-opacity-50 hover:transform hover:translate-x-1'
//                   }`
//                 }
//               >
//                 <item.icon className="text-xl" />
//                 <span className="font-medium">{item.label}</span>
//               </NavLink>
//             </li>
//           ))}
//         </ul>
//       </nav>

//       {/* User Profile Section */}
//       <div className="p-4 border-t border-emerald-500 border-opacity-50">
//         <div className="bg-emerald-500 bg-opacity-30 rounded-xl p-4 mb-3">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
//               <FaUser className="text-emerald-600" />
//             </div>
//             <div className="flex-1 overflow-hidden">
//               <p className="font-semibold text-sm truncate font-sora">{user?.full_name || 'User'}</p>
//               <p className="text-xs text-emerald-100 truncate font-sora">{user?.email || 'email@example.com'}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2 text-xs">
//             <span className="px-2 py-1 bg-emerald-600 rounded-md font-sora">
//               {user?.role?.toUpperCase() || 'USER'}
//             </span>
//           </div>
//         </div>

//         {/* Logout Button */}
//         <button
//           onClick={onLogout}
//           className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-sora"
//         >
//           <FaSignOutAlt />
//           <span className="font-medium">Logout</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;




// ─────────────────────────────────────────────────────────────────────────────
// src/components/Sidebar.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Briefcase, Handshake,
  Mail, LogOut, User, Layers, ChevronRight,
} from 'lucide-react';
import apiService from '../services/api';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/companies', icon: Building2, label: 'Companies' },
  { to: '/job-posting', icon: Briefcase, label: 'Job Posting' },
  { to: '/paid-client', icon: Handshake, label: 'Paid Client' },
  { to: '/requests', icon: Mail, label: 'Requests' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('tpo_user');
    if (!raw || raw === 'undefined') return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const user = getStoredUser();


  const handleLogout = async () => {
    await apiService.logout();
    navigate('/login');
  };

  return (
    <aside className="flex flex-col h-screen w-[220px] flex-shrink-0 shadow-2xl z-20"
      style={{ background: '#1e1b4b' }}>

      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b border-indigo-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center">
            <Layers size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight tracking-wide">iStudio</p>
            <p className="text-indigo-400 text-[11px]">Company Portal</p>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-0.5">
        <p className="text-indigo-500 text-[10px] font-bold uppercase tracking-widest px-3 mb-2">
          Main Menu
        </p>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium group
               ${isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'}`
            }>
            {({ isActive }) => (
              <>
                <Icon size={17} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="opacity-60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User card + logout ── */}
      <div className="px-3 pb-5 border-t border-indigo-900 pt-4 space-y-2">
        <div className="flex items-center gap-3 bg-indigo-900/60 rounded-xl px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-white" />
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-xs font-semibold truncate">
              {user?.full_name ?? user?.name ?? 'Admin'}
            </p>
            <p className="text-indigo-400 text-[11px] truncate">{user?.email ?? ''}</p>
          </div>
        </div>

        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-red-400
                     hover:bg-red-950/40 hover:text-red-300 transition-all text-sm font-medium">
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}