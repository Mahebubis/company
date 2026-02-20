import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Search, RefreshCw, X, ChevronDown, ChevronUp,
  ChevronsUpDown, LogIn, Globe, ShieldCheck, Shield,
  ExternalLink, SlidersHorizontal, AlertTriangle, Loader2,
  Mail, MessageSquare, Check, Briefcase, GraduationCap,
} from 'lucide-react';
import apiService from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const INDUSTRY_OPTIONS = [
  'Information Technology', 'Education & Training', 'Finance', 'Real Estate',
  'Healthcare', 'Consulting', 'Manufacturing', 'Retail', 'Telecommunications',
  'Food and Beverages', 'Media and Entertainment', 'Consumer Products',
  'Agriculture', 'Legal',
];
const INDUSTRY_TYPE_OPTIONS = ['Startup', 'MNC', 'HR Consultant', 'NGO', 'MSME'];
const STATUS_OPTIONS = ['active', 'blocked'];
const VERIFIED_OPTIONS = ['Verified', 'Not Verified'];
const PER_PAGE_OPTIONS = [10, 25, 50, 100, 200, 500];

// // Static feature flags — R=Register, P=Profile, D=Database, J=JobPost, E=Email, C=CIT
// const FEATURES = [
//   { key: 'R', label: 'Register', active: true },
//   { key: 'P', label: 'Profile', active: true },
//   { key: 'D', label: 'Database', active: false },
//   { key: 'J', label: 'Job Post', active: true },
//   { key: 'E', label: 'Email', active: false },
//   { key: 'C', label: 'CIT', active: true },
// ];

const INDUSTRY_COLORS = {
  'Information Technology': 'blue', 'Education & Training': 'purple',
  'Finance': 'amber', 'Real Estate': 'cyan', 'Healthcare': 'green',
  'Consulting': 'indigo', 'Manufacturing': 'gray', 'Retail': 'red',
  'Telecommunications': 'cyan', 'Food and Beverages': 'amber',
  'Media and Entertainment': 'purple', 'Consumer Products': 'green',
  'Agriculture': 'green', 'Legal': 'indigo',
};
const TYPE_COLORS = {
  Startup: 'amber', MNC: 'blue', 'HR Consultant': 'purple', NGO: 'green', MSME: 'red',
};
const BADGE_CLASS = {
  green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function Badge({ label, colorKey }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px]
                      font-semibold border ${BADGE_CLASS[colorKey] ?? BADGE_CLASS.gray}`}>
      {label}
    </span>
  );
}

function fmtDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };
}

function avatarColor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360},60%,52%)`;
}

// ─────────────────────────────────────────────────────────────────────────────
// INLINE EDITABLE SELECT (for industry / industry_type)
// ─────────────────────────────────────────────────────────────────────────────
function InlineSelect({ value, options, colorFn, placeholder, onSave }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSelect = (opt) => {
    onSave(opt);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 group/btn">
        {value
          ? <Badge label={value} colorKey={colorFn(value)} />
          : <span className="text-slate-300 text-[11px] italic">{placeholder}</span>}
        <ChevronDown size={9} className="text-slate-300 group-hover/btn:text-slate-500 transition-colors" />
      </button>

      {open && (
        <div className="fixed bg-white border border-slate-200
                  rounded-xl shadow-2xl z-[999] min-w-[170px] overflow-hidden"
          style={{
            top: ref.current?.getBoundingClientRect().bottom + 4,
            left: ref.current?.getBoundingClientRect().left,
          }}>
          <div className="p-1 max-h-52 overflow-y-auto">
            <button onClick={() => handleSelect(null)}
              className="w-full text-left px-3 py-1.5 text-[11px] text-slate-400 rounded-lg hover:bg-slate-50">
              — Clear —
            </button>
            {options.map(opt => (
              <button key={opt} onClick={() => handleSelect(opt)}
                className={`w-full text-left px-2 py-1.5 rounded-lg hover:bg-indigo-50 ${value === opt ? 'bg-indigo-50' : ''}`}>
                <Badge label={opt} colorKey={colorFn(opt)} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INLINE COMMENT (textarea popup)
// ─────────────────────────────────────────────────────────────────────────────
function InlineComment({ value, onSave }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const ref = useRef();

  useEffect(() => {
    if (open) setDraft(value ?? '');
  }, [open, value]);

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSave = () => {
    onSave(draft);
    setOpen(false);
  };

  const preview = value
    ? value.length > 30 ? value.slice(0, 30) + '…' : value
    : null;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 max-w-[140px] text-left group/c">
        <MessageSquare size={11} className="text-slate-300 group-hover/c:text-indigo-400 flex-shrink-0 transition-colors" />
        {preview
          ? <span className="text-[10px] text-slate-500 truncate">{preview}</span>
          : <span className="text-[10px] text-slate-300 italic">Add note…</span>}
      </button>

      {open && (
        <div className="fixed bg-white border border-slate-200
                  rounded-xl shadow-2xl z-[999] w-64 p-3"
          style={{
            top: ref.current?.getBoundingClientRect().bottom + 4,
            left: ref.current?.getBoundingClientRect().left,
          }}>
          <p className="text-[11px] font-semibold text-slate-600 mb-2">Comment / Note</p>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={4}
            className="w-full text-xs border border-slate-200 rounded-lg p-2
                       focus:outline-none focus:ring-1 focus:ring-indigo-300 resize-none"
            placeholder="Write a note about this company…"
          />
          <div className="flex gap-2 mt-2">
            <button onClick={handleSave}
              className="flex-1 py-1 bg-indigo-600 text-white text-xs rounded-lg
                         hover:bg-indigo-700 transition-colors font-semibold">
              Save
            </button>
            <button onClick={() => setOpen(false)}
              className="flex-1 py-1 border border-slate-200 text-slate-600 text-xs
                         rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// FEATURE CHIP
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// FEATURE CHIP
// ─────────────────────────────────────────────────────────────────────────────
// function FeatureChip({ count, active, title }) {
//   return (
//     <div title={`${title}: ${count}`}
//       className={`relative flex items-center justify-center w-8 h-6 rounded
//                   border cursor-default select-none
//                   ${active
//           ? 'bg-emerald-50 border-emerald-300'
//           : 'bg-red-50 border-red-200'}`}>
//       {active && count > 0 && (
//         <span className="absolute -top-2 -right-2 bg-indigo-600 text-white
//                          text-[8px] font-black rounded-full min-w-[15px] h-[15px]
//                          flex items-center justify-center px-0.5 leading-none z-10 shadow">
//           {count > 99 ? '99+' : count}
//         </span>
//       )}
//       {active
//         ? <Check size={11} className="text-emerald-600 stroke-[3]" />
//         : <X size={11} className="text-red-400 stroke-[3]" />}
//     </div>
//   );
// }

function FeatureChip({ count, active, title }) {
  return (
    <div title={`${title}: ${count}`}
      className={`relative flex items-center justify-center w-9 h-7 rounded
                  cursor-default select-none font-bold text-[10px]
                  ${active
          ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-700'
          : 'bg-red-50 border-2 border-red-300 text-red-400'}`}>
      {active && count > 0 && (
        <span className="absolute -top-2.5 -right-2.5 bg-indigo-600 text-white
                         text-[9px] font-black rounded-full min-w-[18px] h-[18px]
                         flex items-center justify-center px-1 leading-none z-10
                         shadow-md border border-white">
          {count > 999 ? '999+' : count}
        </span>
      )}
      {active
        ? <Check size={13} className="text-emerald-500 stroke-[3]" />
        : <X size={13} className="text-red-400 stroke-[3]" />}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// FILTER DROPDOWN (header filters)
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
          ? <Badge label={value} colorKey={colorFn ? colorFn(value) : 'indigo'} />
          : <span className="truncate">{placeholder}</span>}
        <ChevronDown size={11} className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200
                        rounded-xl shadow-xl z-50 min-w-[160px] overflow-hidden">
          <div className="p-1 max-h-52 overflow-y-auto">
            <button onClick={() => { onChange(''); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-[11px] text-slate-400 rounded-lg hover:bg-slate-50">
              — All —
            </button>
            {options.map(opt => (
              <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-2 py-1.5 rounded-lg hover:bg-indigo-50 ${value === opt ? 'bg-indigo-50' : ''}`}>
                <Badge label={opt} colorKey={colorFn ? colorFn(opt) : 'indigo'} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Companies() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, per_page: 25, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [sortCol, setSortCol] = useState('registered_at');
  const [sortDir, setSortDir] = useState('desc');
  const [filters, setFilters] = useState({
    status: '', is_email_verified: '', industry: '', industry_type: '',
  });

  const [colW, setColW] = useState({
    no: 44, name: 200, contact: 180, status: 90, verified: 90,
    industry: 180, comment: 160, jobs: 140, registered: 130,
    lastlogin: 120, website: 90, tokens: 90, features: 300,
    email: 80, actions: 120,
  });
  const resizing = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH
  // ─────────────────────────────────────────────────────────────────────────
  const fetchCompanies = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = {
        search,
        status: filters.status,
        industry: filters.industry,
        industry_type: filters.industry_type,
        sort_col: sortCol,
        sort_dir: sortDir,
        page,
        per_page: perPage,
      };
      if (filters.is_email_verified === 'Verified') params.is_email_verified = 1;
      if (filters.is_email_verified === 'Not Verified') params.is_email_verified = 0;

      const data = await apiService.getCompaniesList(params);
      setCompanies(data.companies);
      setPagination(data.pagination);
    } catch (e) {
      setError(e?.message ?? 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, [search, filters, sortCol, sortDir, page, perPage]);

  useEffect(() => {
    const t = setTimeout(fetchCompanies, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchCompanies]);

  // ─────────────────────────────────────────────────────────────────────────
  // INLINE UPDATE
  // ─────────────────────────────────────────────────────────────────────────
  const updateField = useCallback(async (employer_id, field, value) => {
    // optimistic UI update
    setCompanies(prev => prev.map(c =>
      c.employer_id === employer_id ? { ...c, [field]: value } : c
    ));
    try {
      await apiService.updateCompany({ employer_id, field, value });
    } catch {
      alert('Failed to save. Please try again.');
      fetchCompanies(); // revert
    }
  }, [fetchCompanies]);

  // ─────────────────────────────────────────────────────────────────────────
  // SORT / FILTER
  // ─────────────────────────────────────────────────────────────────────────
  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  const setFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };

  const resetAll = () => {
    setSearch('');
    setFilters({ status: '', is_email_verified: '', industry: '', industry_type: '' });
    setPage(1);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // COLUMN RESIZE
  // ─────────────────────────────────────────────────────────────────────────
  const startResize = useCallback((col, e) => {
    e.preventDefault();
    resizing.current = col;
    startX.current = e.clientX;
    startWidth.current = colW[col];
    const onMove = (ev) => {
      if (!resizing.current) return;
      const delta = ev.clientX - startX.current;
      setColW(prev => ({ ...prev, [resizing.current]: Math.max(50, startWidth.current + delta) }));
    };
    const onUp = () => {
      resizing.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [colW]);

  // ─────────────────────────────────────────────────────────────────────────
  // PAGINATION
  // ─────────────────────────────────────────────────────────────────────────
  const totalPages = pagination.total_pages;

  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (page <= 4) {
      for (let i = 1; i <= 7; i++) pages.push(i);
    } else if (page >= totalPages - 3) {
      for (let i = totalPages - 6; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = page - 3; i <= page + 3; i++) pages.push(i);
    }
    return pages;
  }, [page, totalPages]);

  // ─────────────────────────────────────────────────────────────────────────
  // SORT ICON + COL HEADER
  // ─────────────────────────────────────────────────────────────────────────
  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <ChevronsUpDown size={11} className="text-slate-400 flex-shrink-0" />;
    return sortDir === 'asc'
      ? <ChevronUp size={11} className="text-indigo-600 flex-shrink-0" />
      : <ChevronDown size={11} className="text-indigo-600 flex-shrink-0" />;
  };

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

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200
                      bg-white flex-shrink-0 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
              Companies
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                {pagination.total}
              </span>
            </h1>
            <p className="text-slate-400 text-xs">All registered employers</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Name, email, phone…"
              className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-300 w-60 bg-slate-50" />
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
          <button onClick={fetchCompanies} className="ml-auto underline">Retry</button>
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

              <ColHeader col="name" label="Company" sortKey="employer_name">
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search…"
                  className="w-full text-[11px] border border-slate-200 rounded-lg px-2 py-1
                             focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white" />
              </ColHeader>

              {/* <ColHeader col="contact" label="Email & Phone" sortKey="employer_email" /> */}

              <ColHeader col="jobs" label="Jobs / Internships" sortKey="job_count" />
              <ColHeader col="registered" label="Registered" sortKey="registered_at" />
              <ColHeader col="lastlogin" label="Last Login" sortKey="last_login" />

              <ColHeader col="features" label="Features used" />

              <ColHeader col="status" label="Status" sortKey="status">
                <FilterDropdown value={filters.status} onChange={v => setFilter('status', v)}
                  options={STATUS_OPTIONS} placeholder="All"
                  colorFn={v => v === 'active' ? 'green' : 'red'} />
              </ColHeader>

              <ColHeader col="verified" label="Verified" sortKey="is_email_verified">
                <FilterDropdown value={filters.is_email_verified}
                  onChange={v => setFilter('is_email_verified', v)}
                  options={VERIFIED_OPTIONS} placeholder="All"
                  colorFn={v => v === 'Verified' ? 'green' : 'amber'} />
              </ColHeader>

              <ColHeader col="website" label="Website" />

              <ColHeader col="industry" label="Industry / Type" sortKey="industry">
                <div className="flex flex-col gap-1">
                  <FilterDropdown value={filters.industry} onChange={v => setFilter('industry', v)}
                    options={INDUSTRY_OPTIONS} placeholder="Industry"
                    colorFn={v => INDUSTRY_COLORS[v] ?? 'gray'} />
                  <FilterDropdown value={filters.industry_type} onChange={v => setFilter('industry_type', v)}
                    options={INDUSTRY_TYPE_OPTIONS} placeholder="Type"
                    colorFn={v => TYPE_COLORS[v] ?? 'gray'} />
                </div>
              </ColHeader>

              <ColHeader col="comment" label="Note" />


              <ColHeader col="tokens" label="Tokens Used" sortKey="tokens_used" />

              {/* <ColHeader col="email" label="Email" /> */}

              {/* sticky login column */}
              {/* <th style={{ width: colW.actions, minWidth: colW.actions }}
                className="bg-slate-50 border-b border-r border-slate-200 px-3 py-2
                           text-[10px] font-bold text-slate-500 uppercase sticky right-0
                           shadow-[-6px_0_12px_rgba(0,0,0,0.06)]">
                Actions
              </th> */}
              <th
                style={{ width: colW.actions, minWidth: colW.actions }}
                className="bg-slate-50 border-b border-r border-slate-200 px-3 py-2
             text-[10px] font-bold text-slate-500 uppercase
             sticky right-0 z-20
             shadow-[-6px_0_12px_rgba(0,0,0,0.06)]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {!loading && companies.length === 0 && (
              <tr>
                <td colSpan={15} className="py-20 text-center text-slate-400">
                  <Building2 size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No companies found</p>
                  <p className="text-xs mt-1">Try adjusting your search or filters</p>
                </td>
              </tr>
            )}

            {companies.map((c, idx) => {
              const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
              const reg = fmtDate(c.registered_at);
              const lastLogin = fmtDate(c.last_login);

              return (
                <tr key={c.employer_id}
                  className="border-b border-slate-100 hover:bg-indigo-50/60 transition-colors group"
                  style={{ background: rowBg }}>

                  {/* # */}
                  <td className="px-3 py-2.5 text-xs text-slate-400 text-center" style={{ width: colW.no }}>
                    {(page - 1) * perPage + idx + 1}
                  </td>

                  {/* Company Name */}
                  <td className="px-3 py-2.5 overflow-hidden" style={{ width: colW.name }}>
                    <div className="flex items-center gap-2">
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
                      <div className="overflow-hidden">
                        <p className="font-semibold text-slate-800 text-[14px] truncate">{c.name}</p>
                        {/* <p className="text-slate-400 text-[10px]">ID: {c.employer_id}</p> */}
                        <p className="text-slate-600 text-[12px]">{c.email}</p>
                        <p className="text-slate-500 text-[11px]">{c.phone ?? '—'}</p>
                        {/* <div className="px-3 py-2.5 overflow-hidden" style={{ width: colW.contact }}>
                    <p className="text-slate-800 text-xs font-medium truncate">{c.email}</p>
                    <p className="text-slate-400 text-[11px]">{c.phone ?? '—'}</p>
                  </div> */}
                      </div>
                      {/* Email & Phone */}
                  
                    </div>
                  </td>


                  {/* Jobs / Internships */}
                  <td className="px-3 py-2.5" style={{ width: colW.jobs }}>
                    <div className="flex flex-col gap-1">
                      {/* Total clickable */}
                      {/* <button
                        onClick={() => navigate(`/job-posting?employer_id=${c.employer_id}`)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg
                                   bg-indigo-600 text-white text-[11px] font-bold
                                   hover:bg-indigo-700 transition-colors w-fit">
                        {c.job_count} total <ExternalLink size={8} />
                      </button> */}
                      <button
                        onClick={() => {
                          if (c.job_count > 0) {
                            navigate(`/job-posting?employer_id=${c.employer_id}`);
                          }
                        }}
                        disabled={c.job_count === 0}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg
    text-[11px] font-bold w-fit transition-colors
    ${c.job_count === 0
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                      >
                        {c.job_count} total <ExternalLink size={8} />
                      </button>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1">
                          {c.active_jobs > 0 && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100
                     px-1.5 py-0.5 rounded-md">
                              {c.active_jobs} active
                            </span>
                          )}
                          {c.closed_jobs > 0 && (
                            <span className="text-[10px] font-semibold text-red-800 bg-red-100
                     px-1.5 py-0.5 rounded-md">
                              {c.closed_jobs} closed
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {c.internship_count > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-purple-600
                                           bg-purple-50 px-1.5 py-0.5 rounded-md font-medium">
                            <GraduationCap size={9} /> {c.internship_count}
                          </span>
                        )}
                        {c.job_only_count > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600
                                           bg-blue-50 px-1.5 py-0.5 rounded-md font-medium">
                            <Briefcase size={9} /> {c.job_only_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Registered */}
                  <td className="px-3 py-2.5 text-xs text-slate-600" style={{ width: colW.registered }}>
                    {reg
                      ? <><p className="font-medium">{reg.date}</p><p className="text-slate-400 text-[10px]">{reg.time}</p></>
                      : <span className="text-slate-300">—</span>}
                  </td>

                  {/* Last Login */}
                  <td className="px-3 py-2.5 text-xs text-slate-600" style={{ width: colW.lastlogin }}>
                    {lastLogin
                      ? <><p className="font-medium">{lastLogin.date}</p><p className="text-slate-400 text-[10px]">{lastLogin.time}</p></>
                      : <span className="text-slate-300 text-[11px]">Never</span>}
                  </td>

                  {/* Features — professional mini table */}
                  <td className="px-2 py-2" style={{ width: colW.features }}>
                    <div className="rounded-lg border-2 border-slate-200 overflow-hidden shadow-sm bg-white">

                      {/* ── Header row ── */}
                      <div className="grid border-b-2 border-slate-200"
                        style={{ gridTemplateColumns: '1fr 0.6fr 0.6fr 0.6fr 1fr' }}>

                        {/* JP */}
                        <div className="flex items-center justify-center py-1 bg-indigo-50
                      border-r-2 border-slate-200">
                          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">JP</span>
                        </div>
                        {/* C */}
                        <div className="flex items-center justify-center py-1 bg-sky-50
                      border-r border-slate-200">
                          <span className="text-[9px] font-black text-sky-600 uppercase tracking-widest">C</span>
                        </div>
                        {/* I */}
                        <div className="flex items-center justify-center py-1 bg-violet-50
                      border-r border-slate-200">
                          <span className="text-[9px] font-black text-violet-600 uppercase tracking-widest">I</span>
                        </div>
                        {/* A */}
                        <div className="flex items-center justify-center py-1 bg-amber-50
                      border-r-2 border-slate-200">
                          <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">A</span>
                        </div>
                        {/* D */}
                        <div className="flex items-center justify-center py-1 bg-emerald-50">
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">D</span>
                        </div>
                      </div>

                      {/* ── Sub-header row (only JP and D have sub-labels) ── */}
                      <div className="grid border-b border-slate-200 bg-slate-50"
                        style={{ gridTemplateColumns: '0.5fr 0.5fr 0.6fr 0.6fr 0.6fr 0.5fr 0.5fr' }}>
                        <div className="flex items-center justify-center py-0.5 border-r border-slate-200">
                          <span className="text-[8px] font-semibold text-slate-400">I</span>
                        </div>
                        <div className="flex items-center justify-center py-0.5 border-r-2 border-slate-200">
                          <span className="text-[8px] font-semibold text-slate-400">J</span>
                        </div>
                        <div className="border-r border-slate-200" />
                        <div className="border-r border-slate-200" />
                        <div className="border-r-2 border-slate-200" />
                        <div className="flex items-center justify-center py-0.5 border-r border-slate-200">
                          <span className="text-[8px] font-semibold text-slate-400">V</span>
                        </div>
                        <div className="flex items-center justify-center py-0.5">
                          <span className="text-[8px] font-semibold text-slate-400">I</span>
                        </div>
                      </div>

                      {/* ── Data row ── */}
                      <div className="grid bg-white"
                        style={{ gridTemplateColumns: '0.5fr 0.5fr 0.6fr 0.6fr 0.6fr 0.5fr 0.5fr' }}>
                        {/* JP/I */}
                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_internship_count}
                            active={c.feat_internship_count > 0} title="Internships" />
                        </div>
                        {/* JP/J */}
                        <div className="flex items-center justify-center p-1.5 border-r-2 border-slate-200">
                          <FeatureChip count={c.feat_job_count}
                            active={c.feat_job_count > 0} title="Jobs" />
                        </div>
                        {/* C */}
                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_chat_count}
                            active={c.feat_chat_count > 0} title="Chats" />
                        </div>
                        {/* I */}
                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_interview_count}
                            active={c.feat_interview_count > 0} title="Interviews" />
                        </div>
                        {/* A */}
                        <div className="flex items-center justify-center p-1.5 border-r-2 border-slate-200">
                          <FeatureChip count={c.feat_assignment_count}
                            active={c.feat_assignment_count > 0} title="Assignments" />
                        </div>
                        {/* D/V */}
                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_visit_count}
                            active={c.feat_visit_count > 0} title="DB Visits" />
                        </div>
                        {/* D/I */}
                        <div className="flex items-center justify-center p-1.5">
                          <FeatureChip count={c.feat_invited_count}
                            active={c.feat_invited_count > 0} title="Invited" />
                        </div>
                      </div>

                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5 text-center" style={{ width: colW.status }}>
                    {c.status === 'active'
                      ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                         text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                         text-[11px] font-semibold bg-red-100 text-red-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Blocked
                        </span>
                      )
                    }
                  </td>

                  {/* Verified */}
                  <td className="px-3 py-2.5 text-center" style={{ width: colW.verified }}>
                    {c.is_email_verified
                      ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                         text-[11px] bg-blue-100 text-blue-700 font-semibold">
                          <ShieldCheck size={11} /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                         text-[11px] bg-amber-100 text-amber-700 font-semibold">
                          <Shield size={11} /> No
                        </span>
                      )
                    }
                  </td>

                  {/* Website */}
                  <td className="px-3 py-2.5 text-center" style={{ width: colW.website }}>
                    {c.website
                      ? (
                        <a href={c.website} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100
                                     text-slate-600 hover:bg-indigo-100 hover:text-indigo-700
                                     rounded-lg text-[11px] transition-colors">
                          <Globe size={11} /> Visit
                        </a>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                  </td>

                  {/* Industry / Type — inline editable */}
                  <td className="px-3 py-2.5 overflow-hidden" style={{ width: colW.industry }}>
                    <div className="flex flex-col gap-1.5">
                      <InlineSelect
                        value={c.industry}
                        options={INDUSTRY_OPTIONS}
                        colorFn={v => INDUSTRY_COLORS[v] ?? 'gray'}
                        placeholder="Set industry"
                        onSave={v => updateField(c.employer_id, 'industry', v)}
                      />
                      <InlineSelect
                        value={c.industry_type}
                        options={INDUSTRY_TYPE_OPTIONS}
                        colorFn={v => TYPE_COLORS[v] ?? 'gray'}
                        placeholder="Set type"
                        onSave={v => updateField(c.employer_id, 'industry_type', v)}
                      />
                    </div>
                  </td>

                  {/* Comment / Note — inline editable */}
                  <td className="px-3 py-2.5 overflow-hidden" style={{ width: colW.comment }}>
                    <InlineComment
                      value={c.comment_note}
                      onSave={v => updateField(c.employer_id, 'comment_note', v)}
                    />
                  </td>





                  {/* Tokens Used */}
                  <td className="px-3 py-2.5 text-center" style={{ width: colW.tokens }}>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-black text-slate-800">{c.tokens_used}</span>
                      <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, c.tokens_used)}%`,
                            background: c.tokens_used > 50
                              ? 'linear-gradient(90deg,#6366f1,#8b5cf6)'
                              : 'linear-gradient(90deg,#f59e0b,#ef4444)',
                          }} />
                      </div>
                    </div>
                  </td>

                  {/* Features Used — static */}
                  {/* <td className="px-3 py-2.5" style={{ width: colW.features }}>
                    <div className="flex items-center gap-1 flex-wrap">
                      {FEATURES.map(f => (
                        <div key={f.key} title={f.label}
                          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px]
                                      font-bold border ${f.active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-400 border-red-100'}`}>
                          {f.key}
                          {f.active
                            ? <Check size={8} className="text-emerald-600" />
                            : <X size={8} className="text-red-400" />}
                        </div>
                      ))}
                    </div>
                  </td> */}




                  {/* Send Email */}
                  {/* <td className="px-3 py-2.5 text-center" style={{ width: colW.email }}>
                    <button
                      onClick={() => alert(`Send email to ${c.email}`)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg
                                 bg-sky-100 text-sky-700 hover:bg-sky-200 text-[11px]
                                 font-semibold transition-colors border border-sky-200">
                      <Mail size={11} /> Send
                    </button>
                  </td> */}

                  {/* Login — sticky right */}
                  {/* <td className="px-3 py-2.5 text-center sticky right-0 shadow-[-6px_0_12px_rgba(0,0,0,0.06)]"
                    style={{ width: colW.actions, background: rowBg }}>
                    <a href={`https://hire.internshipstudio.com/login?risky_login=${c.employer_id}`}
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                                 bg-gradient-to-r from-indigo-600 to-violet-600 text-white
                                 text-[11px] font-bold hover:from-indigo-700 hover:to-violet-700
                                 transition-all shadow-sm whitespace-nowrap">
                      <LogIn size={11} /> Login
                    </a>
                  </td> */}

                  {/* Actions — sticky right */}
                  <td
                    className="px-3 py-2.5 text-center sticky right-0 z-10
             shadow-[-6px_0_12px_rgba(0,0,0,0.06)]"
                    style={{
                      width: colW.actions,
                      background: rowBg,
                    }}
                  >

                    <div className="flex flex-col gap-1 items-center">

                      {/* Login */}
                      <a href={`https://hire.internshipstudio.com/login?risky_login=${c.employer_id}`}
                        target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                 bg-gradient-to-r from-indigo-600 to-violet-600 text-white
                 text-[11px] font-bold hover:from-indigo-700 hover:to-violet-700
                 transition-all shadow-sm whitespace-nowrap">
                        <LogIn size={11} /> Login
                      </a>

                      {/* Send Email */}
                      <button
                        onClick={() => alert(`Send email to ${c.email}`)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg
                 bg-sky-100 text-sky-700 hover:bg-sky-200 text-[11px]
                 font-semibold transition-colors border border-sky-200">
                        <Mail size={11} /> Send Email
                      </button>

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination footer ── */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-white flex-shrink-0">
        <p className="text-xs text-slate-500">
          Showing <strong>{pagination.total === 0 ? 0 : (page - 1) * perPage + 1}</strong>
          {' – '}
          <strong>{Math.min(page * perPage, pagination.total)}</strong>
          {' of '}
          <strong>{pagination.total}</strong> companies
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