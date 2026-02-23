// import React from 'react';
// import { FaBriefcase } from 'react-icons/fa';

// const JobPosting = () => {
//   return (
//     <div className="p-6">
//       <div className="flex items-center gap-3 mb-6">
//         <FaBriefcase className="text-3xl text-blue-600" />
//         <h1 className="text-3xl font-bold text-gray-900 font-sora">Job Posting</h1>
//       </div>
//       <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
//         <p className="text-gray-600 font-sora">Job posting management coming soon...</p>
//       </div>
//     </div>
//   );
// };

// export default JobPosting;






import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Briefcase, Search, RefreshCw, X, ChevronDown, ChevronUp,
  ChevronsUpDown, ExternalLink, SlidersHorizontal, AlertTriangle,
  Loader2, Check, MessageSquare, GraduationCap, Building2,
  ArrowLeft, FileText, Users, TrendingUp, Clock, CheckCircle2,
  XCircle, Send, ClipboardList, BarChart3, Download,
} from 'lucide-react';
import apiService from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const JOB_TYPE_OPTIONS = ['internship', 'job', 'contract'];
const STATUS_OPTIONS = ['Active', 'Close', 'Draft'];
const JOB_MODE_OPTIONS = ['wfo', 'wfh', 'hybrid', 'field'];
const PER_PAGE_OPTIONS = [10, 25, 50, 100, 200];

const STATUS_COLOR = {
  Active: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  Close: 'bg-red-100 text-red-700 border-red-300',
  Draft: 'bg-slate-100 text-slate-600 border-slate-300',
};
const TYPE_COLOR = {
  internship: 'bg-violet-100 text-violet-700 border-violet-300',
  job: 'bg-blue-100 text-blue-700 border-blue-300',
  contract: 'bg-amber-100 text-amber-700 border-amber-300',
};
const MODE_COLOR = {
  wfo: 'bg-sky-100 text-sky-700',
  wfh: 'bg-teal-100 text-teal-700',
  hybrid: 'bg-indigo-100 text-indigo-700',
  field: 'bg-orange-100 text-orange-700',
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };
}

function Badge({ label, cls }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px]
                      font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────
function FilterDropdown({ value, onChange, options, placeholder, colorFn }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative w-full" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-1 px-2 py-1 rounded-lg
                   border border-slate-200 bg-white text-[11px] text-slate-500
                   hover:border-indigo-300 hover:bg-indigo-50 transition-all">
        {value
          ? <Badge label={value} cls={colorFn ? colorFn(value) : 'bg-indigo-100 text-indigo-700 border-indigo-300'} />
          : <span className="truncate">{placeholder}</span>}
        <ChevronDown size={11} className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200
                        rounded-xl shadow-xl z-50 min-w-[150px] overflow-hidden">
          <div className="p-1 max-h-48 overflow-y-auto">
            <button onClick={() => { onChange(''); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-[11px] text-slate-400 rounded-lg hover:bg-slate-50">
              — All —
            </button>
            {options.map(opt => (
              <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-2 py-1.5 rounded-lg hover:bg-indigo-50 ${value === opt ? 'bg-indigo-50' : ''}`}>
                <Badge label={opt} cls={colorFn ? colorFn(opt) : 'bg-indigo-100 text-indigo-700 border-indigo-300'} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${color} bg-white`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color.replace('border-', 'bg-').replace(/\b(\w+)-\d+\b/g, (m) => m.replace(/\d+/, '100'))}`}>
        <Icon size={16} className={color.replace('border-', 'text-')} />
      </div>
      <div>
        <p className="text-lg font-black text-slate-800 leading-tight">{value ?? 0}</p>
        <p className="text-[11px] text-slate-500 font-medium">{label}</p>
        {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE CHIP (same as Companies)
// ─────────────────────────────────────────────────────────────────────────────
function FChip({ count, active, title }) {
  return (
    <div title={`${title}: ${count}`}
      className={`relative flex items-center justify-center w-7 h-6 rounded
                  border-2 cursor-default select-none
                  ${active ? 'bg-emerald-50 border-emerald-400' : 'bg-red-50 border-red-300'}`}>
      {active && count > 0 && (
        <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[8px]
                         font-black rounded-full min-w-[15px] h-[15px] flex items-center
                         justify-center px-0.5 leading-none z-10 shadow border border-white">
          {count > 999 ? '999+' : count}
        </span>
      )}
      {active
        ? <Check size={10} className="text-emerald-600 stroke-[3]" />
        : <X size={10} className="text-red-400 stroke-[3]" />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function JobPosting() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const employerId = searchParams.get('employer_id') ?? '';

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [company, setCompany] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, per_page: 25, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [sortCol, setSortCol] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [filters, setFilters] = useState({
    status: '', job_type: '', job_mode: '',
  });

  // Column widths
  const [colW, setColW] = useState({
    no: 44, title: 220, status: 100, type: 110, mode: 100,
    applications: 260, features: 200, compensation: 140,
    openings: 80, created: 120, deadline: 110, location: 140,
  });
  const resizing = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // ─── FETCH ────────────────────────────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = {
        search,
        status: filters.status,
        job_type: filters.job_type,
        job_mode: filters.job_mode,
        sort_col: sortCol,
        sort_dir: sortDir,
        page,
        per_page: perPage,
      };
      if (employerId) params.employer_id = employerId;

      const data = await apiService.getJobsList(params);
      setJobs(data.jobs);
      setStats(data.stats);
      setPagination(data.pagination);
      if (data.company) setCompany(data.company);
    } catch (e) {
      setError(e?.message ?? 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [search, filters, sortCol, sortDir, page, perPage, employerId]);

  useEffect(() => {
    const t = setTimeout(fetchJobs, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchJobs]);

  // ─── SORT / FILTER ────────────────────────────────────────────────────────
  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };
  const setFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };
  const resetAll = () => {
    setSearch('');
    setFilters({ status: '', job_type: '', job_mode: '' });
    setPage(1);
  };

  // ─── COLUMN RESIZE ────────────────────────────────────────────────────────
  const startResize = useCallback((col, e) => {
    e.preventDefault();
    resizing.current = col;
    startX.current = e.clientX;
    startWidth.current = colW[col];
    const onMove = (ev) => {
      if (!resizing.current) return;
      setColW(prev => ({ ...prev, [resizing.current]: Math.max(60, startWidth.current + ev.clientX - startX.current) }));
    };
    const onUp = () => {
      resizing.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [colW]);

  // ─── PAGINATION ───────────────────────────────────────────────────────────
  const totalPages = pagination.total_pages;
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, 6, 7];
    if (page >= totalPages - 3) return Array.from({ length: 7 }, (_, i) => totalPages - 6 + i);
    return Array.from({ length: 7 }, (_, i) => page - 3 + i);
  }, [page, totalPages]);

  // ─── SORT ICON ────────────────────────────────────────────────────────────
  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <ChevronsUpDown size={11} className="text-slate-400 flex-shrink-0" />;
    return sortDir === 'asc'
      ? <ChevronUp size={11} className="text-indigo-600 flex-shrink-0" />
      : <ChevronDown size={11} className="text-indigo-600 flex-shrink-0" />;
  };

  // ─── COL HEADER ───────────────────────────────────────────────────────────
  const ColHeader = ({ col, label, sortKey, children }) => (
    <th style={{ width: colW[col], minWidth: colW[col], position: 'relative' }}
      className="bg-slate-50 border-b border-r border-slate-200 p-0 group align-top">
      <div className="flex flex-col h-full">
        <button onClick={() => sortKey && handleSort(sortKey)}
          className={`flex items-center gap-1 px-3 py-2 text-[10px] font-bold
                      text-slate-500 uppercase tracking-wider w-full text-left
                      ${sortKey ? 'hover:text-indigo-700 cursor-pointer' : 'cursor-default'}`}>
          {label} {sortKey && <SortIcon col={sortKey} />}
        </button>
        {children && <div className="px-2 pb-2">{children}</div>}
      </div>
      <div onMouseDown={(e) => startResize(col, e)}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize
                   hover:bg-indigo-400 group-hover:bg-slate-300 bg-transparent transition-colors"
        style={{ zIndex: 5 }} />
    </th>
  );

  const activeFilters = Object.entries(filters).filter(([, v]) => v);

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200
                      bg-white flex-shrink-0 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {employerId && (
            <button onClick={() => navigate('/companies')}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center
                         justify-center hover:bg-slate-50 transition-all text-slate-500">
              <ArrowLeft size={15} />
            </button>
          )}
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Briefcase size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
              {employerId && company ? (
                <>
                  <span className="text-slate-400 font-medium text-sm">{company.name} /</span>
                  Jobs
                </>
              ) : 'All Jobs'}
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                {pagination.total}
              </span>
            </h1>
            <p className="text-slate-400 text-xs">
              {employerId ? `Filtered by employer ID: ${employerId}` : 'All job postings & internships'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Title, company, location…"
              className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64 bg-slate-50" />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>
          <button onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200
                       text-xs text-slate-600 hover:bg-slate-50 transition-all">
            <RefreshCw size={12} /> Reset
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Per page</span>
            <select value={perPage} onChange={e => { setPerPage(+e.target.value); setPage(1); }}
              className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs
                         focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
              {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      {stats && (
        <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-slate-200
                        flex-shrink-0 flex-wrap">
          <StatCard icon={Briefcase} label="Total Jobs" value={stats.total_jobs} color="border-indigo-200 text-indigo-600" />
          <StatCard icon={GraduationCap} label="Internships" value={stats.total_internships} color="border-violet-200 text-violet-600" />
          <StatCard icon={CheckCircle2} label="Active" value={stats.active_jobs} color="border-emerald-200 text-emerald-600" />
          <StatCard icon={XCircle} label="Closed" value={stats.closed_jobs} color="border-red-200 text-red-600" />
          <StatCard icon={Users} label="Total Applicants" value={stats.total_applications} color="border-sky-200 text-sky-600" />
          <StatCard icon={TrendingUp} label="Hired" value={stats.total_hired} color="border-teal-200 text-teal-600" />
        </div>
      )}

      {/* ── Active filter chips ── */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 px-6 py-2 bg-indigo-50 border-b
                        border-indigo-100 flex-shrink-0 flex-wrap">
          <SlidersHorizontal size={12} className="text-indigo-400" />
          <span className="text-[11px] text-indigo-500 font-semibold">Filters:</span>
          {activeFilters.map(([k, v]) => (
            <button key={k} onClick={() => setFilter(k, '')}
              className="flex items-center gap-1 px-2 py-0.5 bg-indigo-200 text-indigo-800
                         rounded-full text-[11px] hover:bg-indigo-300 transition-all">
              {v} <X size={9} />
            </button>
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 px-6 py-2 bg-red-50 border-b border-red-100
                        text-red-600 text-xs flex-shrink-0">
          <AlertTriangle size={14} /> {error}
          <button onClick={fetchJobs} className="ml-auto underline">Retry</button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20">
            <Loader2 size={28} className="animate-spin text-indigo-600" />
          </div>
        )}

        <table className="border-collapse text-sm"
          style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}>

          <thead className="sticky top-0 z-10">
            <tr>
              {/* # */}
              <th style={{ width: colW.no, minWidth: colW.no }}
                className="bg-slate-50 border-b border-r border-slate-200 px-3 py-2
                           text-[10px] font-bold text-slate-400 uppercase text-center">
                #
              </th>

              <ColHeader col="title" label="Job Title" sortKey="job_title">
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search title…"
                  className="w-full text-[11px] border border-slate-200 rounded-lg px-2 py-1
                             focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white" />
              </ColHeader>

              <ColHeader col="status" label="Status" sortKey="status">
                <FilterDropdown value={filters.status} onChange={v => setFilter('status', v)}
                  options={STATUS_OPTIONS} placeholder="All"
                  colorFn={v => STATUS_COLOR[v] ?? 'bg-slate-100 text-slate-600 border-slate-300'} />
              </ColHeader>

              <ColHeader col="type" label="Type" sortKey="job_type">
                <FilterDropdown value={filters.job_type} onChange={v => setFilter('job_type', v)}
                  options={JOB_TYPE_OPTIONS} placeholder="All"
                  colorFn={v => TYPE_COLOR[v] ?? 'bg-slate-100 text-slate-600 border-slate-300'} />
              </ColHeader>

              <ColHeader col="mode" label="Mode" sortKey="job_mode">
                <FilterDropdown value={filters.job_mode} onChange={v => setFilter('job_mode', v)}
                  options={JOB_MODE_OPTIONS} placeholder="All"
                  colorFn={v => `${MODE_COLOR[v] ?? 'bg-slate-100 text-slate-600'} border-transparent`} />
              </ColHeader>

              <ColHeader col="applications" label="Applications" sortKey="total_applications" />
              <ColHeader col="features" label="Features Used" />
              <ColHeader col="compensation" label="Compensation" sortKey="compensation_amount" />
              <ColHeader col="openings" label="Openings" sortKey="openings" />
              <ColHeader col="created" label="Posted On" sortKey="created_at" />
              <ColHeader col="deadline" label="Deadline" sortKey="end_date" />
              <ColHeader col="location" label="Location" />
            </tr>
          </thead>

          <tbody>
            {!loading && jobs.length === 0 && (
              <tr>
                <td colSpan={12} className="py-20 text-center text-slate-400">
                  <Briefcase size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No jobs found</p>
                  <p className="text-xs mt-1">Try adjusting your search or filters</p>
                </td>
              </tr>
            )}

            {jobs.map((j, idx) => {
              const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
              const posted = fmtDate(j.created_at);
              const dl = fmtDate(j.end_date);
              const total = j.total_applications ?? 0;

              return (
                <tr key={j.job_id}
                  className="border-b border-slate-100 hover:bg-indigo-50/60 transition-colors group"
                  style={{ background: rowBg }}>

                  {/* # */}
                  <td className="px-3 py-2.5 text-xs text-slate-400 text-center" style={{ width: colW.no }}>
                    {(page - 1) * perPage + idx + 1}
                  </td>

                  {/* Title */}
                  <td className="px-3 py-2.5 overflow-hidden" style={{ width: colW.title }}>
                    <p className="font-semibold text-slate-800 text-xs truncate">{j.job_title}</p>
                    <p className="text-slate-400 text-[10px] truncate mt-0.5">ID: {j.job_id}</p>
                    {/* {j.company_name && (
                      <p className="text-indigo-500 text-[10px] truncate flex items-center gap-1 mt-0.5">
                        <Building2 size={9} /> {j.company_name}
                      </p>
                    )} */}
                    {j.company_name && (
                      <div className="mt-0.5 space-y-0.5">
                        <p className="text-indigo-500 text-[10px] truncate flex items-center gap-1">
                          <Building2 size={9} /> {j.company_name}
                        </p>

                        {j.company_email && (
                          <p className="text-slate-400 text-[10px] truncate">
                            📧 {j.company_email}
                          </p>
                        )}

                        {j.company_phone && (
                          <p className="text-slate-400 text-[10px] truncate">
                            📞 {j.company_phone}
                          </p>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5 text-center" style={{ width: colW.status }}>
                    <Badge label={j.status} cls={STATUS_COLOR[j.status] ?? 'bg-slate-100 text-slate-600 border-slate-300'} />
                  </td>

                  {/* Type */}
                  <td className="px-3 py-2.5 text-center" style={{ width: colW.type }}>
                    <Badge label={j.job_type} cls={TYPE_COLOR[j.job_type] ?? 'bg-slate-100 text-slate-600 border-slate-300'} />
                  </td>

                  {/* Mode */}
                  <td className="px-3 py-2.5 text-center" style={{ width: colW.mode }}>
                    {j.job_mode
                      ? <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px]
                                          font-semibold ${MODE_COLOR[j.job_mode] ?? 'bg-slate-100 text-slate-600'}`}>
                        {j.job_mode?.toUpperCase()}
                      </span>
                      : <span className="text-slate-300">—</span>}
                  </td>

                  {/* Applications — the key column */}
                  <td className="px-2 py-2" style={{ width: colW.applications }}>
                    <div className="rounded-lg border border-slate-200 overflow-hidden shadow-sm bg-white text-[10px]">
                      {/* Total row */}
                      <div className="flex items-center justify-between px-3 py-1.5
                                      bg-indigo-600 text-white">
                        <span className="font-bold flex items-center gap-1">
                          <Users size={10} /> Total Applications
                        </span>
                        <span className="font-black text-sm">{total}</span>
                      </div>
                      {/* Sub rows */}
                      <div className="grid grid-cols-4 divide-x divide-slate-100">
                        <div className="flex flex-col items-center py-1.5 px-1">
                          <span className="font-black text-slate-700 text-xs">{j.received_count ?? 0}</span>
                          <span className="text-[9px] text-slate-400 font-medium">Received</span>
                        </div>
                        <div className="flex flex-col items-center py-1.5 px-1">
                          <span className="font-black text-amber-600 text-xs">{j.shortlisted_count ?? 0}</span>
                          <span className="text-[9px] text-slate-400 font-medium">Shortlisted</span>
                        </div>
                        <div className="flex flex-col items-center py-1.5 px-1">
                          <span className="font-black text-emerald-600 text-xs">{j.hired_count ?? 0}</span>
                          <span className="text-[9px] text-slate-400 font-medium">Hired</span>
                        </div>
                        <div className="flex flex-col items-center py-1.5 px-1">
                          <span className="font-black text-red-500 text-xs">{j.rejected_count ?? 0}</span>
                          <span className="text-[9px] text-slate-400 font-medium">Rejected</span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      {total > 0 && (
                        <div className="flex h-1.5 mx-2 mb-1.5 rounded-full overflow-hidden bg-slate-100">
                          <div className="bg-amber-400 transition-all"
                            style={{ width: `${((j.shortlisted_count ?? 0) / total) * 100}%` }} />
                          <div className="bg-emerald-500 transition-all"
                            style={{ width: `${((j.hired_count ?? 0) / total) * 100}%` }} />
                          <div className="bg-red-400 transition-all"
                            style={{ width: `${((j.rejected_count ?? 0) / total) * 100}%` }} />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Features — C, I, A, S */}
                  <td className="px-2 py-2" style={{ width: colW.features }}>
                    <div className="rounded-lg border-2 border-slate-200 overflow-hidden shadow-sm bg-white">
                      {/* Header */}
                      <div className="grid grid-cols-4 divide-x divide-slate-200 border-b-2 border-slate-200">
                        {[
                          { key: 'C', label: 'Chat', color: 'bg-sky-50 text-sky-600' },
                          { key: 'I', label: 'Interview', color: 'bg-violet-50 text-violet-600' },
                          { key: 'A', label: 'Assignment', color: 'bg-amber-50 text-amber-600' },
                          { key: 'S', label: 'Submitted', color: 'bg-teal-50 text-teal-600' },
                        ].map(f => (
                          <div key={f.key}
                            className={`flex items-center justify-center py-1 ${f.color}`}>
                            <span className="text-[9px] font-black uppercase tracking-widest">{f.key}</span>
                          </div>
                        ))}
                      </div>
                      {/* Chips */}
                      <div className="grid grid-cols-4 divide-x divide-slate-100 bg-white">
                        <div className="flex items-center justify-center p-1.5">
                          <FChip count={j.feat_chat_count} active={j.feat_chat_count > 0} title="Chats" />
                        </div>
                        <div className="flex items-center justify-center p-1.5">
                          <FChip count={j.feat_interview_count} active={j.feat_interview_count > 0} title="Interviews" />
                        </div>
                        <div className="flex items-center justify-center p-1.5">
                          <FChip count={j.feat_assignment_count} active={j.feat_assignment_count > 0} title="Assignments" />
                        </div>
                        <div className="flex items-center justify-center p-1.5">
                          <FChip count={j.feat_submitted_count} active={j.feat_submitted_count > 0} title="Submitted" />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Compensation */}
                  <td className="px-3 py-2.5 text-xs" style={{ width: colW.compensation }}>
                    {j.compensation_type === 'Fixed' || j.compensation_amount > 0 ? (
                      <div>
                        <p className="font-semibold text-slate-700">
                          {j.compensation_currency ?? 'INR'} {Number(j.compensation_amount ?? 0).toLocaleString('en-IN')}
                        </p>
                        <p className="text-slate-400 text-[10px]">{j.compensation_type} / {j.compensation_period}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">
                        {j.compensation_type === 'Negotiable' ? 'Negotiable' : '—'}
                      </span>
                    )}
                  </td>

                  {/* Openings */}
                  <td className="px-3 py-2.5 text-center text-xs font-bold text-slate-700" style={{ width: colW.openings }}>
                    {j.openings ?? '—'}
                  </td>

                  {/* Posted */}
                  <td className="px-3 py-2.5 text-xs text-slate-600" style={{ width: colW.created }}>
                    {posted
                      ? <><p className="font-medium">{posted.date}</p><p className="text-slate-400 text-[10px]">{posted.time}</p></>
                      : <span className="text-slate-300">—</span>}
                  </td>

                  {/* Deadline */}
                  <td className="px-3 py-2.5 text-xs" style={{ width: colW.deadline }}>
                    {dl
                      ? (
                        <div>
                          <p className={`font-medium ${new Date(j.end_date) < new Date() && j.status === 'Active' ? 'text-red-500' : 'text-slate-700'}`}>
                            {dl.date}
                          </p>
                          {new Date(j.end_date) < new Date() && j.status === 'Active' && (
                            <p className="text-red-400 text-[10px]">Expired</p>
                          )}
                        </div>
                      )
                      : <span className="text-slate-300">—</span>}
                  </td>

                  {/* Location */}
                  <td className="px-3 py-2.5 text-xs text-slate-600 overflow-hidden" style={{ width: colW.location }}>
                    {j.location
                      ? <p className="truncate">{j.location}</p>
                      : <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-white flex-shrink-0">
        <p className="text-xs text-slate-500">
          Showing <strong>{pagination.total === 0 ? 0 : (page - 1) * perPage + 1}</strong>
          {' – '}
          <strong>{Math.min(page * perPage, pagination.total)}</strong>
          {' of '}
          <strong>{pagination.total}</strong> jobs
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(1)} disabled={page === 1}
            className="px-2 py-1 rounded-lg text-xs border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-50">«</button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-2.5 py-1 rounded-lg text-xs border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-50">‹</button>
          {pageNumbers.map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-7 h-7 rounded-lg text-xs font-medium border transition-all
                ${page === p ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-2.5 py-1 rounded-lg text-xs border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-50">›</button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
            className="px-2 py-1 rounded-lg text-xs border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-50">»</button>
        </div>
      </div>
    </div>
  );
}