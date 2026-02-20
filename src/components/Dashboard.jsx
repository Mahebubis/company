import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Briefcase, Handshake, Mail,
  RefreshCw, AlertTriangle, TrendingUp, TrendingDown,
  Users, ShieldCheck, Shield, Star, GraduationCap,
  ArrowRight, Activity, Clock, CheckCircle2, XCircle,
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import apiService from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// COLOUR PALETTE
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  indigo:  '#6366f1',
  violet:  '#8b5cf6',
  emerald: '#10b981',
  red:     '#ef4444',
  amber:   '#f59e0b',
  sky:     '#0ea5e9',
  pink:    '#ec4899',
  teal:    '#14b8a6',
  orange:  '#f97316',
  slate:   '#64748b',
};

const PIE_COMPANY = [
  { key: 'active',       label: 'Active',       color: C.emerald },
  { key: 'blocked',      label: 'Blocked',      color: C.red     },
  { key: 'not_verified', label: 'Unverified',   color: C.amber   },
  { key: 'verified',     label: 'Verified',     color: C.indigo  },
];

const PIE_JOBS = [
  { key: 'active',           label: 'Active',      color: C.emerald },
  { key: 'closed',           label: 'Closed',      color: C.red     },
  { key: 'internship_count', label: 'Internships', color: C.violet  },
  { key: 'job_count',        label: 'Jobs',        color: C.sky     },
];

const INDUSTRY_COLORS = [
  C.indigo, C.violet, C.emerald, C.amber, C.sky,
  C.pink, C.teal, C.orange, C.red, C.slate,
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function fmtNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n ?? 0;
}

function avatarColor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360},60%,52%)`;
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: '2-digit',
  });
}

function fillTrend(rawData, days = 14, dateKey = 'date') {
  const map = {};
  rawData.forEach(r => { map[r[dateKey]] = r.count; });
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      count: map[key] ?? 0,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────
function Sk({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-xl px-3 py-2">
      <p className="text-[11px] text-slate-500 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-bold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, bg, to, loading, badge, trend }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => to && navigate(to)}
      className={`relative overflow-hidden rounded-2xl p-5 border border-slate-100
                  bg-white shadow-sm flex flex-col gap-2 group
                  ${to ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''}`}
    >
      {/* background accent */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10"
        style={{ background: color }} />

      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}
          style={{ background: bg }}>
          <Icon size={18} style={{ color }} />
        </div>
        {badge !== undefined && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            +{badge} today
          </span>
        )}
      </div>

      <div>
        {loading
          ? <><Sk className="w-20 h-8 mb-1" /><Sk className="w-28 h-3" /></>
          : <>
            <p className="text-3xl font-black text-slate-900 tabular-nums leading-none">
              {fmtNum(value)}
            </p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </>
        }
      </div>

      {sub && !loading && (
        <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 mt-1">{sub}</p>
      )}

      {to && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight size={14} style={{ color }} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DONUT CARD
// ─────────────────────────────────────────────────────────────────────────────
function DonutCard({ title, pieConf, sourceObj, loading }) {
  const pieData = pieConf.map(d => ({ ...d, value: sourceObj?.[d.key] ?? 0 }))
    .filter(d => d.value > 0);

  const total = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
      {loading
        ? <Sk className="h-40" />
        : (
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0" style={{ width: 130, height: 130 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%"
                    innerRadius={38} outerRadius={58}
                    paddingAngle={3} dataKey="value" stroke="none">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              {pieConf.map((d, i) => {
                const val = sourceObj?.[d.key] ?? 0;
                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: d.color }} />
                    <span className="text-[11px] text-slate-500 flex-1 truncate">{d.label}</span>
                    <span className="text-[11px] font-bold text-slate-800">{val}</span>
                    <span className="text-[10px] text-slate-400 w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI METRIC ROW
// ─────────────────────────────────────────────────────────────────────────────
function MetricRow({ label, value, color = '#6366f1', max }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-slate-500 w-28 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] font-bold text-slate-700 w-8 text-right">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await apiService.getDashboardStats();
      setStats(data);
    } catch (e) {
      setError(e?.message ?? 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Build trend chart data
  const companyTrend = fillTrend(stats?.weekly_trend ?? [], 14);
  const jobTrend     = fillTrend(stats?.job_trend    ?? [], 14);

  // Merge both trends
  const combinedTrend = companyTrend.map((d, i) => ({
    day: d.day,
    companies: d.count,
    jobs: jobTrend[i]?.count ?? 0,
  }));

  const industryChart = (stats?.industry_breakdown ?? []).slice(0, 8).map((r, i) => ({
    name: r.industry.length > 13 ? r.industry.slice(0, 11) + '…' : r.industry,
    count: r.count,
    color: INDUSTRY_COLORS[i % INDUSTRY_COLORS.length],
  }));

  const typeChart = (stats?.type_breakdown ?? []).map((r, i) => ({
    name: r.type,
    value: r.count,
    color: INDUSTRY_COLORS[i % INDUSTRY_COLORS.length],
  })).filter(d => d.value > 0);

  const topMax = stats?.top_companies?.[0]?.job_count ?? 1;

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto p-6 bg-slate-50">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={fetchStats} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200
                     bg-white text-sm text-slate-600 hover:bg-slate-50 transition-all
                     disabled:opacity-50 shadow-sm">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200
                        text-red-600 rounded-xl text-sm flex-shrink-0">
          <AlertTriangle size={15} /> {error}
          <button onClick={fetchStats} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      {/* ── Row 1 — 4 stat cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Companies" icon={Building2} loading={loading}
          value={stats?.companies?.total}
          sub={`${stats?.companies?.active ?? 0} active · ${stats?.companies?.blocked ?? 0} blocked`}
          color={C.indigo} bg="#eef2ff"
          badge={stats?.companies?.registered_today}
          to="/companies" />

        <StatCard label="Job Postings" icon={Briefcase} loading={loading}
          value={stats?.jobs?.total}
          sub={`${stats?.jobs?.active ?? 0} active · ${stats?.jobs?.closed ?? 0} closed`}
          color={C.violet} bg="#f5f3ff"
          badge={stats?.jobs?.posted_today}
          to="/job-posting" />

        <StatCard label="Paid Clients" icon={Handshake} loading={loading}
          value={stats?.paid_clients?.total}
          sub={`${stats?.paid_clients?.active ?? 0} active · ${stats?.paid_clients?.inactive ?? 0} inactive`}
          color={C.sky} bg="#f0f9ff"
          to="/paid-client" />

        <StatCard label="Requests" icon={Mail} loading={loading}
          value={stats?.requests?.total}
          sub={`${stats?.requests?.pending ?? 0} pending · ${stats?.requests?.approved ?? 0} approved`}
          color={C.amber} bg="#fffbeb"
          to="/requests" />
      </div>

      {/* ── Row 2 — Quick metrics bar ── */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: 'Registered Today',   value: stats?.companies?.registered_today,      icon: TrendingUp,    color: C.emerald, bg: '#ecfdf5' },
          { label: 'This Week',          value: stats?.companies?.registered_this_week,   icon: Activity,      color: C.indigo,  bg: '#eef2ff' },
          { label: 'This Month',         value: stats?.companies?.registered_this_month,  icon: Users,         color: C.violet,  bg: '#f5f3ff' },
          { label: 'Email Verified',     value: stats?.companies?.verified,               icon: ShieldCheck,   color: C.sky,     bg: '#f0f9ff' },
          { label: 'Never Logged In',    value: (stats?.companies?.total ?? 0) - (stats?.companies?.ever_logged_in ?? 0), icon: Clock, color: C.amber, bg: '#fffbeb' },
          { label: 'Special Event',      value: stats?.companies?.special_event,          icon: Star,          color: C.pink,    bg: '#fdf4ff' },
        ].map((m, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: m.bg }}>
              <m.icon size={14} style={{ color: m.color }} />
            </div>
            <div className="min-w-0">
              {loading
                ? <><Sk className="w-10 h-5 mb-1" /><Sk className="w-16 h-2.5" /></>
                : <>
                  <p className="text-lg font-black text-slate-900 leading-none tabular-nums">{m.value ?? 0}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{m.label}</p>
                </>
              }
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 3 — Trend chart + donut cards ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Combined trend — col-span-2 */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Registrations & Job Postings — Last 14 Days</h3>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: C.indigo }} />
                Companies
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: C.violet }} />
                Jobs
              </span>
            </div>
          </div>
          {loading
            ? <Sk className="h-44" />
            : (
              <ResponsiveContainer width="100%" height={176}>
                <AreaChart data={combinedTrend}>
                  <defs>
                    <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.indigo} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={C.indigo} stopOpacity={0}   />
                    </linearGradient>
                    <linearGradient id="gj" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.violet} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={C.violet} stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="companies" name="Companies"
                    stroke={C.indigo} strokeWidth={2} fill="url(#gc)" />
                  <Area type="monotone" dataKey="jobs" name="Jobs"
                    stroke={C.violet} strokeWidth={2} fill="url(#gj)" />
                </AreaChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Company Status donut */}
        <DonutCard title="Company Status" pieConf={PIE_COMPANY}
          sourceObj={stats?.companies} loading={loading} />
      </div>

      {/* ── Row 4 — Job donut + Industry bar + Type pie ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Job Status donut */}
        <DonutCard title="Job Breakdown" pieConf={PIE_JOBS}
          sourceObj={stats?.jobs} loading={loading} />

        {/* Industry bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Top Industries</h3>
          {loading
            ? <Sk className="h-44" />
            : (
              <ResponsiveContainer width="100%" height={176}>
                <BarChart data={industryChart} layout="vertical" barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9, fill: '#94a3b8' }}
                    axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={72}
                    tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Companies" radius={[0, 6, 6, 0]}>
                    {industryChart.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Company Type pie */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-800 text-sm mb-3">Company Type</h3>
          {loading
            ? <Sk className="h-44" />
            : (
              <>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={typeChart} cx="50%" cy="50%"
                      outerRadius={58} paddingAngle={3}
                      dataKey="value" stroke="none">
                      {typeChart.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5 mt-2">
                  {typeChart.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: d.color }} />
                      <span className="text-[11px] text-slate-500 flex-1">{d.name}</span>
                      <span className="text-[11px] font-bold text-slate-700">{d.value}</span>
                    </div>
                  ))}
                  {typeChart.length === 0 && (
                    <p className="text-[11px] text-slate-400 text-center py-4">No data yet</p>
                  )}
                </div>
              </>
            )
          }
        </div>
      </div>

      {/* ── Row 5 — Top companies + Recent registrations ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Top Companies by jobs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Top Companies by Jobs</h3>
            <button onClick={() => navigate('/companies')}
              className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5">
              View all <ArrowRight size={10} />
            </button>
          </div>
          {loading
            ? <div className="flex flex-col gap-3">{[...Array(5)].map((_, i) => <Sk key={i} className="h-10" />)}</div>
            : (
              <div className="flex flex-col gap-2">
                {(stats?.top_companies ?? []).map((c, i) => (
                  <div key={c.employer_id}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/job-posting?employer_id=${c.employer_id}`)}>
                    <span className="text-[11px] font-bold text-slate-300 w-4">{i + 1}</span>
                    {c.logo
                      ? <img src={c.logo} alt="" className="w-8 h-8 rounded-lg object-contain border border-slate-100 flex-shrink-0" />
                      : (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center
                                        text-white text-xs font-black flex-shrink-0"
                          style={{ background: avatarColor(c.name) }}>
                          {c.name?.charAt(0).toUpperCase()}
                        </div>
                      )
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{c.name}</p>
                      <MetricRow label="" value={c.job_count} max={topMax} color={C.indigo} />
                    </div>
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                      <span className="text-xs font-black text-slate-700">{c.job_count}</span>
                      {c.active_jobs > 0 && (
                        <span className="text-[10px] text-emerald-600 font-medium">
                          {c.active_jobs} active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {(stats?.top_companies ?? []).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
                )}
              </div>
            )
          }
        </div>

        {/* Recent Registrations */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Recent Registrations</h3>
            <button onClick={() => navigate('/companies')}
              className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5">
              View all <ArrowRight size={10} />
            </button>
          </div>
          {loading
            ? <div className="flex flex-col gap-3">{[...Array(5)].map((_, i) => <Sk key={i} className="h-12" />)}</div>
            : (
              <div className="flex flex-col gap-1">
                {(stats?.recent_registrations ?? []).map(c => (
                  <div key={c.employer_id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => navigate('/companies')}>
                    {c.logo
                      ? <img src={c.logo} alt="" className="w-9 h-9 rounded-lg object-contain border border-slate-100 flex-shrink-0" />
                      : (
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center
                                        text-white text-xs font-black flex-shrink-0"
                          style={{ background: avatarColor(c.name) }}>
                          {c.name?.charAt(0).toUpperCase()}
                        </div>
                      )
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{c.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{c.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                        ${c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {c.status}
                      </span>
                      <div className="flex items-center gap-1">
                        {c.is_email_verified
                          ? <CheckCircle2 size={10} className="text-blue-500" />
                          : <XCircle size={10} className="text-amber-400" />}
                        <span className="text-[10px] text-slate-400">{fmtDate(c.registered_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {(stats?.recent_registrations ?? []).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
                )}
              </div>
            )
          }
        </div>
      </div>

      {/* ── Row 6 — Job quick stats ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Internships',     value: stats?.jobs?.internship_count, icon: GraduationCap, color: C.violet, bg: '#f5f3ff' },
          { label: 'Jobs',            value: stats?.jobs?.job_count,        icon: Briefcase,     color: C.sky,    bg: '#f0f9ff' },
          { label: 'CIT Postings',    value: stats?.jobs?.is_cit,           icon: Star,          color: C.amber,  bg: '#fffbeb' },
          { label: 'Posted This Week',value: stats?.jobs?.posted_this_week, icon: TrendingUp,    color: C.emerald,bg: '#ecfdf5' },
        ].map((m, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4
                                  flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: m.bg }}>
              <m.icon size={18} style={{ color: m.color }} />
            </div>
            <div>
              {loading
                ? <><Sk className="w-12 h-6 mb-1" /><Sk className="w-20 h-2.5" /></>
                : <>
                  <p className="text-2xl font-black text-slate-900 tabular-nums leading-none">{m.value ?? 0}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{m.label}</p>
                </>
              }
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}