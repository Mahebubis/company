// import React from 'react';
// import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
// import { FaBuilding, FaBriefcase, FaHandshake, FaEnvelopeOpenText } from 'react-icons/fa';

// const Dashboard = () => {
//   // Data for Companies Pie Chart
//   const companiesData = [
//     { name: 'Active', value: 45, color: '#10b981' },
//     { name: 'Inactive', value: 15, color: '#ef4444' },
//     { name: 'Verified', value: 38, color: '#3b82f6' },
//     { name: 'Not Verified', value: 22, color: '#f59e0b' }
//   ];

//   // Data for Job Posting Pie Chart
//   const jobsData = [
//     { name: 'Active Jobs', value: 28, color: '#10b981' },
//     { name: 'Closed Jobs', value: 12, color: '#ef4444' },
//     { name: 'Shortlisted', value: 156, color: '#3b82f6' },
//     { name: 'Rejected', value: 89, color: '#f59e0b' },
//     { name: 'Hired', value: 45, color: '#8b5cf6' }
//   ];

//   // Data for Paid Clients Pie Chart
//   const paidClientsData = [
//     { name: 'Active', value: 0, color: '#10b981' },
//     { name: 'Inactive', value: 0, color: '#ef4444' }
//   ];

//   // Data for Requests Pie Chart
//   const requestsData = [
//     { name: 'Pending', value: 0, color: '#f59e0b' },
//     { name: 'Approved', value: 0, color: '#10b981' },
//     { name: 'Rejected', value: 0, color: '#ef4444' }
//   ];

//   const StatCard = ({ icon: Icon, title, value, color, pieData, step }) => {
//     return (
//       <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
//         <div className="flex items-start justify-between mb-4">
//           <div className="flex-1">
//             <div className="flex items-center gap-3 mb-3">
//               <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
//                 <Icon className={`text-2xl ${color.replace('bg-', 'text-')}`} />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-500 font-sora">{title}</p>
//                 <h3 className="text-3xl font-bold text-gray-900 font-sora mt-1">{value}</h3>
//               </div>
//             </div>
            
//             {/* Step indicator */}
//             <div className="flex items-center gap-2 mt-3">
//               <div className={`w-10 h-10 rounded-full ${color} bg-opacity-20 flex items-center justify-center`}>
//                 <span className={`text-sm font-bold ${color.replace('bg-', 'text-')} font-sora`}>{step}</span>
//               </div>
//               <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent"></div>
//             </div>
//           </div>

//           {/* Mini Pie Chart */}
//           <div className="w-32 h-32 ml-4">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={pieData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={25}
//                   outerRadius={45}
//                   paddingAngle={2}
//                   dataKey="value"
//                 >
//                   {pieData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip 
//                   contentStyle={{ 
//                     backgroundColor: 'white', 
//                     border: 'none', 
//                     borderRadius: '8px',
//                     boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
//                     fontFamily: 'Sora'
//                   }}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Legend */}
//         <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
//           {pieData.map((item, index) => (
//             <div key={index} className="flex items-center gap-2">
//               <div 
//                 className="w-3 h-3 rounded-full" 
//                 style={{ backgroundColor: item.color }}
//               ></div>
//               <span className="text-xs text-gray-600 font-sora truncate">{item.name}</span>
//               <span className="text-xs font-semibold text-gray-900 ml-auto font-sora">{item.value}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="p-6 space-y-6">
//       {/* Page Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 font-sora">Dashboard Overview</h1>
//         <p className="text-gray-600 mt-2 font-sora">Track your placement activities and manage recruitment</p>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <StatCard
//           icon={FaBuilding}
//           title="Companies"
//           value="60"
//           color="bg-emerald-500"
//           pieData={companiesData}
//           step="1"
//         />

//         <StatCard
//           icon={FaBriefcase}
//           title="Job Posting"
//           value="40"
//           color="bg-blue-500"
//           pieData={jobsData}
//           step="2"
//         />

//         <StatCard
//           icon={FaHandshake}
//           title="Paid Client"
//           value="0"
//           color="bg-purple-500"
//           pieData={paidClientsData}
//           step="3"
//         />

//         <StatCard
//           icon={FaEnvelopeOpenText}
//           title="Requests"
//           value="0"
//           color="bg-orange-500"
//           pieData={requestsData}
//           step="4"
//         />
//       </div>

//       {/* Quick Actions */}
//       <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white mt-8">
//         <h3 className="text-xl font-bold mb-4 font-sora">Quick Actions</h3>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 transform hover:scale-105">
//             <div className="text-center">
//               <FaBuilding className="text-3xl mx-auto mb-2" />
//               <p className="text-sm font-medium font-sora">Add Company</p>
//             </div>
//           </button>
//           <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 transform hover:scale-105">
//             <div className="text-center">
//               <FaBriefcase className="text-3xl mx-auto mb-2" />
//               <p className="text-sm font-medium font-sora">Post Job</p>
//             </div>
//           </button>
//           <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 transform hover:scale-105">
//             <div className="text-center">
//               <FaHandshake className="text-3xl mx-auto mb-2" />
//               <p className="text-sm font-medium font-sora">View Clients</p>
//             </div>
//           </button>
//           <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 transform hover:scale-105">
//             <div className="text-center">
//               <FaEnvelopeOpenText className="text-3xl mx-auto mb-2" />
//               <p className="text-sm font-medium font-sora">Check Requests</p>
//             </div>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;






// ─────────────────────────────────────────────────────────────────────────────
// src/pages/Dashboard.jsx
// Fetches real stats from /api/companies/dashboard.php
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Briefcase, Handshake, Mail,
  TrendingUp, Users, ShieldCheck, AlertTriangle,
  RefreshCw, ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import apiService from '../services/api';

// ── colour helpers ────────────────────────────────────────────────────────────
const PIE_COMPANY = [
  { key: 'active',       label: 'Active',       color: '#10b981' },
  { key: 'blocked',      label: 'Blocked',      color: '#ef4444' },
  { key: 'verified',     label: 'Verified',     color: '#6366f1' },
  { key: 'not_verified', label: 'Not Verified', color: '#f59e0b' },
];
const PIE_JOBS = [
  { key: 'active',      label: 'Active',      color: '#10b981' },
  { key: 'closed',      label: 'Closed',      color: '#ef4444' },
  { key: 'shortlisted', label: 'Shortlisted', color: '#6366f1' },
  { key: 'rejected',    label: 'Rejected',    color: '#f59e0b' },
  { key: 'hired',       label: 'Hired',       color: '#8b5cf6' },
];

// ── sub-components ────────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;
}

function MiniPie({ data, sourceObj }) {
  const pieData = data.map(d => ({ ...d, value: sourceObj?.[d.key] ?? 0 }));
  return (
    <div className="h-24">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={pieData} cx="50%" cy="50%" innerRadius={22} outerRadius={38}
            paddingAngle={2} dataKey="value" stroke="none">
            {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
          </Pie>
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,.15)', padding: '4px 8px' }}
            formatter={(v, n) => [v, n]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, gradient, pieData, sourceObj, to, loading }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => to && navigate(to)}
      className={`rounded-2xl p-5 text-white shadow-lg flex flex-col gap-3 select-none
                  ${to ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-transform' : ''}`}
      style={{ background: gradient }}>
      {/* top row */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{label}</p>
          {loading
            ? <Skeleton className="w-16 h-9 mt-1 bg-white/20" />
            : <p className="text-4xl font-black mt-0.5 tabular-nums">{value ?? 0}</p>
          }
          {sub && <p className="text-white/50 text-[11px] mt-0.5">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Icon size={20} />
        </div>
      </div>

      {/* mini pie */}
      {pieData && sourceObj && !loading && <MiniPie data={pieData} sourceObj={sourceObj} />}
      {pieData && loading && <Skeleton className="h-24 bg-white/20" />}

      {/* legend */}
      {pieData && !loading && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {pieData.map((d, i) => (
            <span key={i} className="flex items-center gap-1 text-[11px] text-white/75">
              <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
              {d.label} <strong className="text-white">{sourceObj?.[d.key] ?? 0}</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getDashboardStats();
      setStats(data);
    } catch (e) {
      setError(e?.message ?? 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  // Build weekly trend chart data (fill missing days with 0)
  const weeklyChart = (() => {
    const map = {};
    (stats?.weekly_trend ?? []).forEach(r => { map[r.date] = r.count; });
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return {
        day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        companies: map[key] ?? 0,
      };
    });
  })();

  const industryChart = (stats?.industry_breakdown ?? []).slice(0, 8).map(r => ({
    name: r.industry.length > 14 ? r.industry.slice(0, 12) + '…' : r.industry,
    count: r.count,
  }));

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto p-6">

      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm">Real-time recruitment metrics</p>
        </div>
        <button onClick={fetchStats} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200
                     text-sm text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200
                        text-red-600 rounded-xl text-sm">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Companies" icon={Building2} loading={loading}
          value={stats?.companies?.total}
          sub={`${stats?.companies?.active ?? 0} active · ${stats?.companies?.blocked ?? 0} blocked`}
          gradient="linear-gradient(135deg,#6366f1,#4f46e5)"
          pieData={PIE_COMPANY} sourceObj={stats?.companies}
          to="/companies"
        />
        <StatCard
          label="Job Postings" icon={Briefcase} loading={loading}
          value={stats?.jobs?.total}
          sub={`${stats?.jobs?.active ?? 0} active · ${stats?.jobs?.closed ?? 0} closed`}
          gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)"
          pieData={PIE_JOBS} sourceObj={stats?.jobs}
          to="/job-posting"
        />
        <StatCard
          label="Paid Clients" icon={Handshake} loading={loading}
          value={stats?.paid_clients?.total}
          sub={`${stats?.paid_clients?.active ?? 0} active`}
          gradient="linear-gradient(135deg,#06b6d4,#0891b2)"
          to="/paid-client"
        />
        <StatCard
          label="Requests" icon={Mail} loading={loading}
          value={stats?.requests?.total}
          sub={`${stats?.requests?.pending ?? 0} pending`}
          gradient="linear-gradient(135deg,#f59e0b,#d97706)"
          to="/requests"
        />
      </div>

      {/* charts row */}
      <div className="grid grid-cols-3 gap-4 min-h-0">

        {/* weekly trend */}
        <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm mb-4">
            New Company Registrations — Last 7 Days
          </h3>
          {loading
            ? <Skeleton className="h-44 w-full" />
            : (
              <ResponsiveContainer width="100%" height={176}>
                <AreaChart data={weeklyChart}>
                  <defs>
                    <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontSize: 12 }} />
                  <Area type="monotone" dataKey="companies" stroke="#6366f1"
                    strokeWidth={2.5} fill="url(#gc)" name="Registrations" />
                </AreaChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* company status donut */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm mb-2">Company Status</h3>
          {loading
            ? <Skeleton className="h-44 w-full" />
            : (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={PIE_COMPANY.map(d => ({ ...d, value: stats?.companies?.[d.key] ?? 0 }))}
                      cx="50%" cy="50%" innerRadius={45} outerRadius={68}
                      paddingAngle={3} dataKey="value" stroke="none">
                      {PIE_COMPANY.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5 mt-1">
                  {PIE_COMPANY.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: d.color }} />{d.label}
                      </span>
                      <span className="font-bold text-slate-800">
                        {stats?.companies?.[d.key] ?? 0}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )
          }
        </div>
      </div>

      {/* industry breakdown bar chart */}
      {(industryChart.length > 0 || loading) && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Companies by Industry</h3>
          {loading
            ? <Skeleton className="h-36 w-full" />
            : (
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={industryChart} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
                  <Bar dataKey="count" name="Companies" radius={[6, 6, 0, 0]}
                    fill="url(#barGrad)" />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>
      )}

      {/* quick actions */}
      <div className="rounded-2xl p-5 text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg,#1e1b4b,#4f46e5)' }}>
        <h3 className="font-bold text-sm mb-3">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Building2, label: 'Companies',    to: '/companies'   },
            { icon: Briefcase, label: 'Job Posting',  to: '/job-posting' },
            { icon: Handshake, label: 'Paid Clients', to: '/paid-client' },
            { icon: Mail,      label: 'Requests',     to: '/requests'    },
          ].map((a, i) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const navigate = useNavigate(); // safe — constant array
            return (
              <button key={i} onClick={() => navigate(a.to)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/10
                           hover:bg-white/20 transition-all text-xs font-medium">
                <a.icon size={22} />
                {a.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}