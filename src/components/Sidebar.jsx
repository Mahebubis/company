// import { NavLink, useNavigate } from 'react-router-dom';
// import {
//   LayoutDashboard, Building2, Briefcase, Handshake,
//   Mail, LogOut, User, Layers, ChevronRight,
// } from 'lucide-react';
// // import apiService from '../services/api';

// const NAV_ITEMS = [
//   { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
//   { to: '/companies', icon: Building2, label: 'Companies' },
//   { to: '/job-posting', icon: Briefcase, label: 'Job Posting' },
//   { to: '/paid-client', icon: Handshake, label: 'Paid Client' },
//   { to: '/requests', icon: Mail, label: 'Requests' },
// ];

// // export default function Sidebar() {
// export default function Sidebar({ user, onLogout }) {
//   const navigate = useNavigate();
//   const getStoredUser = () => {
//     try {
//       const raw = localStorage.getItem('tpo_user');
//       if (!raw || raw === 'undefined') return null;
//       return JSON.parse(raw);
//     } catch {
//       return null;
//     }
//   };

//   const handleLogout = async () => {
//     await onLogout();        // This updates isAuthenticated = false
//     navigate('/login');      // Then redirect
//   };


//   return (
//     <aside className="flex flex-col h-screen w-[220px] flex-shrink-0 shadow-2xl z-20"
//       style={{ background: '#1e1b4b' }}>

//       {/* ── Logo ── */}
//       <div className="px-5 py-5 border-b border-indigo-900">
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center">
//             <Layers size={18} className="text-white" />
//           </div>
//           <div>
//             <p className="text-white font-bold text-sm leading-tight tracking-wide">iStudio</p>
//             <p className="text-indigo-400 text-[11px]">Company Portal</p>
//           </div>
//         </div>
//       </div>

//       {/* ── Nav ── */}
//       <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-0.5">
//         <p className="text-indigo-500 text-[10px] font-bold uppercase tracking-widest px-3 mb-2">
//           Main Menu
//         </p>
//         {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
//           <NavLink key={to} to={to}
//             className={({ isActive }) =>
//               `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium group
//                ${isActive
//                 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
//                 : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'}`
//             }>
//             {({ isActive }) => (
//               <>
//                 <Icon size={17} className="flex-shrink-0" />
//                 <span className="flex-1">{label}</span>
//                 {isActive && <ChevronRight size={14} className="opacity-60" />}
//               </>
//             )}
//           </NavLink>
//         ))}
//       </nav>

//       {/* ── User card + logout ── */}
//       <div className="px-3 pb-5 border-t border-indigo-900 pt-4 space-y-2">
//         <div className="flex items-center gap-3 bg-indigo-900/60 rounded-xl px-3 py-2.5">
//           <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
//             <User size={14} className="text-white" />
//           </div>
//           <div className="overflow-hidden">
//             <p className="text-white text-xs font-semibold truncate">
//               {user?.full_name ?? user?.name ?? 'Admin'}
//             </p>
//             <p className="text-indigo-400 text-[11px] truncate">{user?.email ?? ''}</p>
//           </div>
//         </div>

//         <button onClick={handleLogout}
//           className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-red-400
//                      hover:bg-red-950/40 hover:text-red-300 transition-all text-sm font-medium">
//           <LogOut size={15} />
//           <span>Sign Out</span>
//         </button>
//       </div>
//     </aside>
//   );
// }









import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Briefcase, Handshake,
  Mail, LogOut, User, Layers, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/companies', icon: Building2,       label: 'Companies' },
  { to: '/job-posting', icon: Briefcase,     label: 'Job Posting' },
  { to: '/paid-client', icon: Handshake,     label: 'Paid Client' },
  { to: '/requests', icon: Mail,             label: 'Requests' },
];

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout();
    navigate('/login');
  };

  return (
    <aside
      className="group/sidebar flex flex-col h-screen flex-shrink-0 shadow-2xl z-20
                 overflow-hidden transition-all duration-300 ease-in-out
                 w-[64px] hover:w-[220px]"
      style={{ background: '#1e1b4b' }}>

      {/* ── Logo ── */}
      <div className="px-3 py-5 border-b border-indigo-900 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <Layers size={18} className="text-white" />
          </div>
          {/* Label fades in on expand */}
          <div className="overflow-hidden whitespace-nowrap
                          opacity-0 group-hover/sidebar:opacity-100
                          transition-opacity duration-200 delay-100">
            <p className="text-white font-bold text-sm leading-tight tracking-wide">iStudio</p>
            <p className="text-indigo-400 text-[11px]">Company Portal</p>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-2 py-5 overflow-y-auto overflow-x-hidden space-y-0.5">
        {/* Section label */}
        <p className="text-indigo-500 text-[10px] font-bold uppercase tracking-widest
                      px-2 mb-2 whitespace-nowrap overflow-hidden
                      opacity-0 group-hover/sidebar:opacity-100
                      transition-opacity duration-200 delay-100">
          Main Menu
        </p>

        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-150
               text-sm font-medium group/item overflow-hidden whitespace-nowrap
               ${isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'}`
            }>
            {({ isActive }) => (
              <>
                {/* Icon always visible */}
                <Icon size={18} className="flex-shrink-0" />

                {/* Label fades in */}
                <span className="flex-1 opacity-0 group-hover/sidebar:opacity-100
                                 transition-opacity duration-200 delay-100">
                  {label}
                </span>

                {/* Arrow only when active */}
                {isActive && (
                  <ChevronRight size={14}
                    className="opacity-0 group-hover/sidebar:opacity-60
                               transition-opacity duration-200 delay-100 flex-shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User card + logout ── */}
      <div className="px-2 pb-5 border-t border-indigo-900 pt-4 space-y-2 flex-shrink-0">

        {/* User card */}
        <div className="flex items-center gap-3 bg-indigo-900/60 rounded-xl px-2 py-2.5
                        overflow-hidden whitespace-nowrap">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center
                          justify-center flex-shrink-0">
            <User size={14} className="text-white" />
          </div>
          <div className="overflow-hidden opacity-0 group-hover/sidebar:opacity-100
                          transition-opacity duration-200 delay-100">
            <p className="text-white text-xs font-semibold truncate">
              {user?.full_name ?? user?.name ?? 'Admin'}
            </p>
            <p className="text-indigo-400 text-[11px] truncate">{user?.email ?? ''}</p>
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-red-400
                     hover:bg-red-950/40 hover:text-red-300 transition-all
                     text-sm font-medium overflow-hidden whitespace-nowrap">
          <LogOut size={18} className="flex-shrink-0" />
          <span className="opacity-0 group-hover/sidebar:opacity-100
                           transition-opacity duration-200 delay-100">
            Sign Out
          </span>
        </button>

      </div>
    </aside>
  );
}