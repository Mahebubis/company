
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { createPortal } from 'react-dom';
import {
  Building2, Search, RefreshCw, X, ChevronDown, ChevronUp,
  ChevronsUpDown, LogIn, Globe, ShieldCheck, Shield,
  ExternalLink, SlidersHorizontal, AlertTriangle, Loader2,
  Mail, MessageSquare, Phone, GraduationCap, Briefcase, Check,
  Calendar, Filter, MapPin, DollarSign, Users, TrendingUp,
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
// const FEATURE_GRID = 'repeat(9, 1fr)';
const FEATURE_GRID = 'repeat(15, 1fr)';
const INDUSTRY_TYPE_OPTIONS = ['Startup', 'MNC', 'HR Consultant', 'NGO', 'MSME'];
const STATUS_OPTIONS = ['active', 'blocked'];
const VERIFIED_OPTIONS = ['Verified', 'Not Verified'];
const PER_PAGE_OPTIONS = [10, 25, 50, 100, 200, 500];
const JOB_TYPE_OPTIONS = ['Jobs', 'Internships'];
// const FEATURE_OPTIONS = ['chat', 'interview', 'assignment', 'database_visit', 'invited', 'saved'];
const FEATURE_OPTIONS = [
  'internship',
  'job',
  'chat',
  'interview',
  'assignment',
  'database_visit',
  'invited',
  'saved_visit',
  'saved',
  'filter_applied',
  'clicked_resume',
  'clicked_full_detail',
  'clicked_invite',
  'clicked_save',
  'clicked_unsave'
];

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

function fmtDateShort(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
}

function avatarColor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360},60%,52%)`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATE RANGE PICKER — Dual Calendar Modal (portal-based)
// ─────────────────────────────────────────────────────────────────────────────
function DateRangeFilter({ value, onChange, onApply, label, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef();
  const modalRef = useRef();
  const [leftMonth, setLeftMonth] = useState(dayjs().subtract(1, 'month'));
  const [rightMonth, setRightMonth] = useState(dayjs());
  const [hoverDate, setHoverDate] = useState(null);



  const openModal = (e) => {
    e.stopPropagation();
    if (disabled) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    setOpen(o => !o);
  };

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (!modalRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) setOpen(false);
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', h), 100);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', h); };
  }, [open]);

  const hasValue = value?.from || value?.to;

  const isSelected = (d) => {
    const curr = d.format('YYYY-MM-DD');
    return curr === value?.from || curr === value?.to;
  };

  const isInRange = (d) => {
    const curr = d.format('YYYY-MM-DD');
    const from = value?.from;
    const to = value?.to || hoverDate;
    if (!from) return false;
    if (to) {
      const [a, b] = from < to ? [from, to] : [to, from];
      return curr > a && curr < b;
    }
    return false;
  };

  const handleSelect = (d) => {
    const date = d.format('YYYY-MM-DD');
    if (!value.from || (value.from && value.to)) {
      onChange({ from: date, to: '' });
    } else {
      if (date < value.from) onChange({ from: date, to: value.from });
      else onChange({ ...value, to: date });
    }
  };

  const renderCalendar = (month, setMonth) => {
    const start = month.startOf('month').startOf('week');
    const end = month.endOf('month').endOf('week');
    const days = [];
    let d = start;
    while (d.isBefore(end) || d.isSame(end, 'day')) { days.push(d); d = d.add(1, 'day'); }
    const inMonth = (day) => day.month() === month.month();

    return (
      <div className="flex flex-col gap-1.5 w-[195px]">
        <div className="flex items-center justify-between px-1">
          <button onClick={() => setMonth(m => m.subtract(1, 'month'))}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 text-sm">‹</button>
          <span className="text-[11px] font-bold text-slate-700">{month.format('MMMM YYYY')}</span>
          <button onClick={() => setMonth(m => m.add(1, 'month'))}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 text-sm">›</button>
        </div>
        <div className="grid grid-cols-7">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(dn => (
            <div key={dn} className="text-center text-[9px] font-bold text-slate-400 py-0.5">{dn}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dateStr = day.format('YYYY-MM-DD');
            const selected = isSelected(day);
            const inRange = isInRange(day);
            const isFrom = dateStr === value?.from;
            const isTo = dateStr === value?.to;
            const isToday = dateStr === dayjs().format('YYYY-MM-DD');
            const inCurMonth = inMonth(day);
            return (
              <button key={i}
                onMouseEnter={() => value?.from && !value?.to && setHoverDate(dateStr)}
                onMouseLeave={() => setHoverDate(null)}
                onClick={() => handleSelect(day)}
                className={`relative h-6 text-[10px] font-medium transition-all
                  ${!inCurMonth ? 'opacity-25' : ''}
                  ${selected
                    ? isFrom && isTo ? 'rounded-full bg-indigo-600 text-white'
                      : isFrom ? 'rounded-l-full bg-indigo-600 text-white'
                        : 'rounded-r-full bg-indigo-600 text-white'
                    : inRange ? 'bg-indigo-100 text-indigo-700'
                      : isToday ? 'text-indigo-600 font-bold hover:bg-indigo-50 rounded-full'
                        : 'text-slate-600 hover:bg-slate-100 rounded-full'
                  }`}>
                {isToday && !selected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
                )}
                {day.date()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const modal = open ? createPortal(
    <div ref={modalRef}
      style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 99999 }}
      onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden', minWidth: 420 }}>
        <div style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', padding: '8px 12px' }}
          className="flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5">
            <Calendar size={11} />
            <span className="text-[11px] font-bold">{label} Date Range</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <div className="flex items-center gap-1 rounded px-1.5 py-0.5" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <span style={{ opacity: 0.7 }}>From:</span>
              <span className="font-bold">{value?.from ? fmtDateShort(value.from) : '—'}</span>
            </div>
            <span style={{ opacity: 0.6 }}>→</span>
            <div className="flex items-center gap-1 rounded px-1.5 py-0.5" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <span style={{ opacity: 0.7 }}>To:</span>
              <span className="font-bold">{value?.to ? fmtDateShort(value.to) : '—'}</span>
            </div>
          </div>
        </div>
        <div className="flex divide-x divide-slate-100" style={{ background: '#ffffff' }}>
          <div className="p-3">{renderCalendar(leftMonth, setLeftMonth)}</div>
          <div className="p-3">{renderCalendar(rightMonth, setRightMonth)}</div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 flex-wrap"
          style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Quick:</span>
          {[
            { label: 'Last 7d', fn: () => onChange({ from: dayjs().subtract(6, 'day').format('YYYY-MM-DD'), to: dayjs().format('YYYY-MM-DD') }) },
            { label: 'Last 30d', fn: () => onChange({ from: dayjs().subtract(29, 'day').format('YYYY-MM-DD'), to: dayjs().format('YYYY-MM-DD') }) },
            { label: 'This month', fn: () => onChange({ from: dayjs().startOf('month').format('YYYY-MM-DD'), to: dayjs().endOf('month').format('YYYY-MM-DD') }) },
            { label: 'Last month', fn: () => onChange({ from: dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'), to: dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD') }) },
          ].map(q => (
            <button key={q.label} onClick={q.fn}
              className="px-2 py-0.5 rounded border border-slate-200 text-[9px] font-semibold text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
              style={{ background: '#ffffff' }}>
              {q.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between px-3 py-2"
          style={{ borderTop: '1px solid #f1f5f9', background: '#ffffff' }}>
          <button onClick={() => onChange({ from: '', to: '' })}
            className="text-[10px] text-red-400 hover:text-red-600 font-semibold transition-colors">Clear</button>
          <div className="flex gap-1.5">
            <button onClick={() => setOpen(false)}
              className="px-3 py-1 rounded-lg text-[10px] text-slate-600 font-semibold transition-all"
              style={{ border: '1px solid #e2e8f0', background: '#ffffff' }}>Cancel</button>
            <button onClick={() => { onApply?.(); setOpen(false); }}
              className="px-4 py-1 rounded-lg text-white text-[10px] font-bold transition-all"
              style={{ background: '#4f46e5' }}>Apply</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div ref={triggerRef} className="relative inline-block">
      <button disabled={disabled} onClick={openModal}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-medium transition-all
          ${disabled ? 'opacity-40 cursor-not-allowed bg-slate-100'
            : hasValue ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
              : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50'}`}>
        <Calendar size={10} />
        {hasValue
          ? `${value.from ? fmtDateShort(value.from) : '∞'} → ${value.to ? fmtDateShort(value.to) : '∞'}`
          : 'Date range'}
        {hasValue && (
          <span onClick={e => { e.stopPropagation(); onChange({ from: '', to: '' }); }}
            className="ml-1 hover:text-red-500"><X size={9} /></span>
        )}
      </button>
      {modal}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-SELECT DROPDOWN WITH SEARCH
// ─────────────────────────────────────────────────────────────────────────────
function MultiSelectDropdown({ values = [], onChange, options, placeholder, colorFn, label }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef();

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) { setOpen(false); setSearch(''); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const hasValue = values.length > 0;

  const toggle = (opt) => {
    if (values.includes(opt)) onChange(values.filter(v => v !== opt));
    else onChange([...values, opt]);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-medium transition-all w-full
          ${hasValue ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
            : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50'}`}>
        <Filter size={9} />
        <span className="truncate flex-1 text-left">
          {hasValue ? values.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ') : placeholder}
        </span>
        {hasValue && (
          <span onClick={e => { e.stopPropagation(); onChange([]); }} className="hover:text-red-500 flex-shrink-0">
            <X size={9} />
          </span>
        )}
        <ChevronDown size={9} className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 min-w-[180px] overflow-hidden"
          onClick={e => e.stopPropagation()}>
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${label}...`}
                className="w-full pl-6 pr-2 py-1 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-slate-50"
                autoFocus />
            </div>
          </div>
          <div className="p-1 max-h-44 overflow-y-auto">
            {filtered.length === 0 && <p className="text-[10px] text-slate-400 text-center py-2">No results</p>}
            {filtered.map(opt => {
              const selected = values.includes(opt);
              return (
                <button key={opt} onClick={() => toggle(opt)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] transition-colors
                    ${selected ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                  <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all
                    ${selected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                    {selected && <Check size={9} className="text-white stroke-[3]" />}
                  </div>
                  <span className={`${colorFn ? `px-1.5 py-0.5 rounded-full font-semibold ${colorFn(opt)}` : 'text-slate-700 font-medium'}`}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1).replace('_', ' ')}
                  </span>
                </button>
              );
            })}
          </div>
          {values.length > 0 && (
            <div className="border-t border-slate-100 p-1.5">
              <button onClick={() => onChange([])}
                className="w-full text-[10px] text-red-400 hover:text-red-600 font-medium transition-colors">
                Clear all ({values.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NUMBER RANGE FILTER
// ─────────────────────────────────────────────────────────────────────────────
function NumberRangeFilter({ value, onChange, placeholder = ['Min', 'Max'] }) {
  const hasValue = value?.min || value?.max;
  return (
    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
      <input type="number" min="0" placeholder={placeholder[0]}
        value={value?.min ?? ''}
        onChange={e => onChange({ ...value, min: e.target.value })}
        className={`w-full text-[10px] border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300 transition-all
          ${hasValue ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white'}`} />
      <input type="number" min="0" placeholder={placeholder[1]}
        value={value?.max ?? ''}
        onChange={e => onChange({ ...value, max: e.target.value })}
        className={`w-full text-[10px] border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300 transition-all
          ${hasValue ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white'}`} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER DROPDOWN (single select)
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
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 min-w-[160px] overflow-hidden">
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
// INLINE EDITABLE SELECT
// ─────────────────────────────────────────────────────────────────────────────
function InlineSelect({ value, options, colorFn, placeholder, onSave }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 group/btn">
        {value
          ? <Badge label={value} colorKey={colorFn(value)} />
          : <span className="text-slate-300 text-[11px] italic">{placeholder}</span>}
        <ChevronDown size={9} className="text-slate-300 group-hover/btn:text-slate-500 transition-colors" />
      </button>
      {open && (
        <div className="fixed bg-white border border-slate-200 rounded-xl shadow-2xl z-[999] min-w-[170px] overflow-hidden"
          style={{ top: ref.current?.getBoundingClientRect().bottom + 4, left: ref.current?.getBoundingClientRect().left }}>
          <div className="p-1 max-h-52 overflow-y-auto">
            <button onClick={() => { onSave(null); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-[11px] text-slate-400 rounded-lg hover:bg-slate-50">
              — Clear —
            </button>
            {options.map(opt => (
              <button key={opt} onClick={() => { onSave(opt); setOpen(false); }}
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
// INLINE COMMENT
// ─────────────────────────────────────────────────────────────────────────────
function InlineComment({ value, onSave }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const ref = useRef();

  useEffect(() => { if (open) setDraft(value ?? ''); }, [open, value]);
  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const preview = value ? (value.length > 30 ? value.slice(0, 30) + '…' : value) : null;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 max-w-[140px] text-left group/c">
        <MessageSquare size={11} className="text-slate-300 group-hover/c:text-indigo-400 flex-shrink-0 transition-colors" />
        {preview
          ? <span className="text-[10px] text-slate-500 truncate">{preview}</span>
          : <span className="text-[10px] text-slate-300 italic">Add note…</span>}
      </button>
      {open && (
        <div className="fixed bg-white border border-slate-200 rounded-xl shadow-2xl z-[999] w-64 p-3"
          style={{ top: ref.current?.getBoundingClientRect().bottom + 4, left: ref.current?.getBoundingClientRect().left }}>
          <p className="text-[11px] font-semibold text-slate-600 mb-2">Comment / Note</p>
          <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={4}
            className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-300 resize-none"
            placeholder="Write a note about this company…" />
          <div className="flex gap-2 mt-2">
            <button onClick={() => { onSave(draft); setOpen(false); }}
              className="flex-1 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors font-semibold">Save</button>
            <button onClick={() => setOpen(false)}
              className="flex-1 py-1 border border-slate-200 text-slate-600 text-xs rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE CHIP
// ─────────────────────────────────────────────────────────────────────────────
function FeatureChip({ count, active, title }) {
  return (
    <div title={`${title}: ${count}`}
      className={`relative flex items-center justify-center w-9 h-7 rounded cursor-default select-none font-bold text-[10px]
        ${active ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-700' : 'bg-red-50 border-2 border-red-300 text-red-400'}`}>
      {active && count > 0 && (
        <span className="absolute -top-2.5 -right-2.5 bg-indigo-600 text-white text-[9px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none z-10 shadow-md border border-white">
          {count > 999 ? '999+' : count}
        </span>
      )}
      {active ? <Check size={13} className="text-emerald-500 stroke-[3]" /> : <X size={13} className="text-red-400 stroke-[3]" />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER TAG
// ─────────────────────────────────────────────────────────────────────────────
function FilterTag({ label, onRemove }) {
  return (
    <button onClick={onRemove}
      className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full text-[10px] font-semibold hover:bg-indigo-200 transition-all">
      {label} <X size={8} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOTAL APPLICATIONS MINI WIDGET
// ─────────────────────────────────────────────────────────────────────────────
function AppStats({ c }) {
  const total = c.total_applications ?? 0;
  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden shadow-sm bg-white text-[10px]">
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-indigo-600 text-white">
        <span className="font-bold flex items-center gap-1"><Users size={9} /> Applications</span>
        <span className="font-black text-sm">{total}</span>
      </div>
      <div className="grid grid-cols-5 divide-x divide-slate-100">
        {[
          { key: 'posted_count', label: 'Posted', cls: 'text-indigo-600' },
          { key: 'received_count', label: 'Received', cls: 'text-slate-700' },
          { key: 'shortlisted_count', label: 'Short.', cls: 'text-amber-600' },
          { key: 'hired_count', label: 'Hired', cls: 'text-emerald-600' },
          { key: 'rejected_count', label: 'Rejected', cls: 'text-red-500' },
        ].map(s => (
          <div key={s.key} className="flex flex-col items-center py-1.5 px-1">
            <span className={`font-black text-xs ${s.cls}`}>{c[s.key] ?? 0}</span>
            <span className="text-[8px] text-slate-400 font-medium">{s.label}</span>
          </div>
        ))}
      </div>
      {total > 0 && (
        <div className="flex h-1.5 mx-2 mb-1.5 rounded-full overflow-hidden bg-slate-100">
          <div className="bg-amber-400 transition-all" style={{ width: `${((c.shortlisted_count ?? 0) / total) * 100}%` }} />
          <div className="bg-emerald-500 transition-all" style={{ width: `${((c.hired_count ?? 0) / total) * 100}%` }} />
          <div className="bg-red-400 transition-all" style={{ width: `${((c.rejected_count ?? 0) / total) * 100}%` }} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATIONS COLUMN FILTER DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────
function AppFilterDropdown({ appFilter, setAppFilter, appDateRange, setAppDateRange, setPage }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const APP_STATUS_OPTIONS = ['posted', 'received', 'shortlisted', 'hired', 'rejected'];
  const APP_STATUS_COLORS = {
    posted: 'bg-indigo-100 text-indigo-700',
    received: 'bg-slate-100 text-slate-700',
    shortlisted: 'bg-amber-100 text-amber-700',
    hired: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
  };
  const isSingleAppStatus = appFilter.length === 1;

  const [tempDateRange, setTempDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const hasValue = appFilter.length > 0 || appDateRange.from || appDateRange.to;

  const toggle = (opt) => {
    if (appFilter.includes(opt)) setAppFilter(appFilter.filter(v => v !== opt));
    else setAppFilter([...appFilter, opt]);
    setPage(1);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-medium transition-all w-full
          ${hasValue ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50'}`}>
        <Filter size={9} />
        <span className="truncate flex-1 text-left">
          {hasValue ? (appFilter.length > 0 ? appFilter.join(', ') : 'Date filtered') : 'Filter applications'}
        </span>
        {hasValue && (
          <span onClick={e => { e.stopPropagation(); setAppFilter([]); setAppDateRange({ from: '', to: '' }); }}
            className="hover:text-red-500"><X size={9} /></span>
        )}
        <ChevronDown size={9} className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 min-w-[220px]"
          onClick={e => e.stopPropagation()}>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Status Filter</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {APP_STATUS_OPTIONS.map(opt => (
              <button key={opt} onClick={() => toggle(opt)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all
                  ${appFilter.includes(opt) ? 'bg-indigo-600 text-white border-indigo-600' : `${APP_STATUS_COLORS[opt]} border-transparent hover:border-indigo-300`}`}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>

          {(appFilter.length > 0 || appDateRange.from || appDateRange.to) && (
            <button onClick={() => { setAppFilter([]); setAppDateRange({ from: '', to: '' }); setTempDateRange({ from: '', to: '' }); }}
              className="w-full mt-2 text-[10px] text-red-400 hover:text-red-600 font-medium border-t border-slate-100 pt-2">
              Clear all application filters
            </button>
          )}
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
  const location = useLocation();

  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, per_page: 25, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  // Core filters
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [perPage, setPerPage] = useState(25);
  const [sortCol, setSortCol] = useState('registered_at');
  const [sortDir, setSortDir] = useState('desc');
  const [filters, setFilters] = useState({
    status: '', is_email_verified: '', industry: '', industry_type: '',
  });

  // Advanced filters
  const [jobTypeFilter, setJobTypeFilter] = useState([]);          // Jobs / Internships
  const [featuresFilter, setFeaturesFilter] = useState([]);        // chat/interview/assignment/database_visit/invited
  const [featDateRange, setFeatDateRange] = useState({ from: '', to: '' });
  const [tempFeatDateRange, setTempFeatDateRange] = useState({ from: '', to: '' });
  const isSingleFeature = featuresFilter.length === 1;

  const [registeredDateRange, setRegisteredDateRange] = useState({ from: '', to: '' });
  const [lastLoginDateRange, setLastLoginDateRange] = useState({ from: '', to: '' });
  const [locationSearch, setLocationSearch] = useState('');
  const [websiteSearch, setWebsiteSearch] = useState('');
  const [noteSearch, setNoteSearch] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [websiteInput, setWebsiteInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [tokensFilter, setTokensFilter] = useState({});            // {min, max}

  // Application filter
  const [appStatusFilter, setAppStatusFilter] = useState([]);
  const [appDateRange, setAppDateRange] = useState({ from: '', to: '' });
  const [resetKey, setResetKey] = useState(0);

  const [colW, setColW] = useState({
    no: 44, name: 220, jobs: 160, applications: 300, registered: 130,
    lastlogin: 130, features: 520, status: 100, verified: 100,
    website: 160, industry: 190, comment: 170, tokens: 160,
    location: 150, actions: 130,
  });
  const resizing = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const handleExport = async () => {
    try {
      setExporting(true);

      const exportParams = {
        search,
        status: filters.status,
        industry: filters.industry,
        industry_type: filters.industry_type,
        sort_col: sortCol,
        sort_dir: sortDir,

        job_types: jobTypeFilter.join(','),
        features: featuresFilter.join(','),

        feat_date_from: isSingleFeature ? featDateRange.from : '',
        feat_date_to: isSingleFeature ? featDateRange.to : '',

        registered_from: registeredDateRange.from,
        registered_to: registeredDateRange.to,

        last_login_from: lastLoginDateRange.from,
        last_login_to: lastLoginDateRange.to,

        location_search: locationSearch,
        website_search: websiteSearch,
        note_search: noteSearch,

        tokens_min: tokensFilter.min ?? '',
        tokens_max: tokensFilter.max ?? '',

        app_status: appStatusFilter.join(','),
        app_date_from: appDateRange.from,
        app_date_to: appDateRange.to,
      };

      // Add is_email_verified only if set
      if (filters.is_email_verified === 'Verified') exportParams.is_email_verified = 1;
      if (filters.is_email_verified === 'Not Verified') exportParams.is_email_verified = 0;

      const params = new URLSearchParams(exportParams);

      const res = await fetch(`https://company.internshipstudio.com/api/companies/export.php?${params}`, {
        credentials: 'include'
      });

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `companies_export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (e) {
      alert('Export failed');
    } finally {
      setExporting(false);
    }
  };
  // ─── FETCH ────────────────────────────────────────────────────────────────
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
        // Advanced
        job_types: jobTypeFilter.join(','),
        features: featuresFilter.join(','),
        feat_date_from: isSingleFeature ? featDateRange.from : '',
        feat_date_to: isSingleFeature ? featDateRange.to : '',
        registered_from: registeredDateRange.from,
        registered_to: registeredDateRange.to,
        last_login_from: lastLoginDateRange.from,
        last_login_to: lastLoginDateRange.to,
        location_search: locationSearch,
        website_search: websiteSearch,
        note_search: noteSearch,
        tokens_min: tokensFilter.min ?? '',
        tokens_max: tokensFilter.max ?? '',
        app_status: appStatusFilter.join(','),
        app_date_from: appDateRange.from,
        app_date_to: appDateRange.to,
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
  }, [
    search, filters, sortCol, sortDir, page, perPage,
    jobTypeFilter, featuresFilter, featDateRange, registeredDateRange,
    lastLoginDateRange, locationSearch, websiteSearch, noteSearch,
    tokensFilter, appStatusFilter, appDateRange, isSingleFeature,
  ]);

  useEffect(() => {
    const t = setTimeout(fetchCompanies, 400);
    return () => clearTimeout(t);
  }, [fetchCompanies]);

  // ─── INLINE UPDATE ────────────────────────────────────────────────────────
  const updateField = useCallback(async (employer_id, field, value) => {
    setCompanies(prev => prev.map(c => c.employer_id === employer_id ? { ...c, [field]: value } : c));
    try {
      await apiService.updateCompany({ employer_id, field, value });
    } catch {
      alert('Failed to save. Please try again.');
      fetchCompanies();
    }
  }, [fetchCompanies]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) { setSearch(searchParam); setPage(1); }
  }, [location.search]);

  // ─── SORT / FILTER ────────────────────────────────────────────────────────
  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };
  const setFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };

  const resetAll = () => {
    setSearch('');
    setSearchInput('');
    setFilters({ status: '', is_email_verified: '', industry: '', industry_type: '' });
    setJobTypeFilter([]);
    setFeaturesFilter([]);
    setFeatDateRange({ from: '', to: '' });
    setTempFeatDateRange({ from: '', to: '' });
    setRegisteredDateRange({ from: '', to: '' });
    setLastLoginDateRange({ from: '', to: '' });
    setLocationSearch('');
    setLocationInput('');
    setWebsiteSearch('');
    setWebsiteInput('');
    setNoteSearch('');
    setNoteInput('');
    setTokensFilter({});
    setAppStatusFilter([]);
    setAppDateRange({ from: '', to: '' });
    setResetKey(k => k + 1);
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
      setColW(prev => ({ ...prev, [resizing.current]: Math.max(50, startWidth.current + ev.clientX - startX.current) }));
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

  // ─── SORT ICON + COL HEADER ───────────────────────────────────────────────
  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <ChevronsUpDown size={11} className="text-slate-400 flex-shrink-0" />;
    return sortDir === 'asc'
      ? <ChevronUp size={11} className="text-indigo-600 flex-shrink-0" />
      : <ChevronDown size={11} className="text-indigo-600 flex-shrink-0" />;
  };

  const ColHeader = ({ col, label, sortKey, children, filterActive }) => (
    <th style={{ width: colW[col], minWidth: colW[col], position: 'relative' }}
      className="bg-slate-50 border-b border-r border-slate-200 p-0 group align-top">
      <div className="flex flex-col h-full">
        <button onClick={() => sortKey && handleSort(sortKey)}
          className={`flex items-center gap-1 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-full text-left relative
            ${sortKey ? 'hover:text-indigo-700 cursor-pointer' : 'cursor-default'}`}>
          {filterActive && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500 z-[21]" />}
          {label} {sortKey && <SortIcon col={sortKey} />}
        </button>
        {children && <div className="px-2 pb-2 space-y-1">{children}</div>}
      </div>
      <div onMouseDown={e => startResize(col, e)}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-indigo-400 group-hover:bg-slate-300 bg-transparent transition-colors"
        style={{ zIndex: 5 }} />
    </th>
  );

  // ─── ACTIVE FILTER TAGS ───────────────────────────────────────────────────
  const activeFilterTags = useMemo(() => {
    const tags = [];
    if (filters.status) tags.push({ label: `Status: ${filters.status}`, clear: () => setFilter('status', '') });
    if (filters.is_email_verified) tags.push({ label: `Verified: ${filters.is_email_verified}`, clear: () => setFilter('is_email_verified', '') });
    if (filters.industry) tags.push({ label: `Industry: ${filters.industry}`, clear: () => setFilter('industry', '') });
    if (filters.industry_type) tags.push({ label: `Type: ${filters.industry_type}`, clear: () => setFilter('industry_type', '') });
    jobTypeFilter.forEach(t => tags.push({ label: `Job type: ${t}`, clear: () => setJobTypeFilter(v => v.filter(x => x !== t)) }));
    featuresFilter.forEach(f => tags.push({ label: `Feature: ${f}`, clear: () => setFeaturesFilter(v => v.filter(x => x !== f)) }));
    if (featDateRange.from || featDateRange.to) tags.push({ label: `Feat date: ${featDateRange.from || '∞'}→${featDateRange.to || '∞'}`, clear: () => setFeatDateRange({ from: '', to: '' }) });
    if (registeredDateRange.from || registeredDateRange.to) tags.push({ label: `Registered: ${registeredDateRange.from || '∞'}→${registeredDateRange.to || '∞'}`, clear: () => setRegisteredDateRange({ from: '', to: '' }) });
    if (lastLoginDateRange.from || lastLoginDateRange.to) tags.push({ label: `Last login: ${lastLoginDateRange.from || '∞'}→${lastLoginDateRange.to || '∞'}`, clear: () => setLastLoginDateRange({ from: '', to: '' }) });
    if (locationSearch) tags.push({ label: `Location: ${locationSearch}`, clear: () => setLocationSearch('') });
    if (websiteSearch) tags.push({ label: `Website: ${websiteSearch}`, clear: () => setWebsiteSearch('') });
    if (noteSearch) tags.push({ label: `Note: ${noteSearch}`, clear: () => setNoteSearch('') });
    if (tokensFilter.min || tokensFilter.max) tags.push({ label: `Tokens: ${tokensFilter.min || 0}–${tokensFilter.max || '∞'}`, clear: () => setTokensFilter({}) });
    appStatusFilter.forEach(s => tags.push({ label: `App: ${s}`, clear: () => setAppStatusFilter(v => v.filter(x => x !== s)) }));
    if (appDateRange.from || appDateRange.to) tags.push({ label: `App date: ${appDateRange.from || '∞'}→${appDateRange.to || '∞'}`, clear: () => setAppDateRange({ from: '', to: '' }) });
    return tags;
  }, [filters, jobTypeFilter, featuresFilter, featDateRange, registeredDateRange, lastLoginDateRange, locationSearch, websiteSearch, noteSearch, tokensFilter, appStatusFilter, appDateRange]);



  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white flex-shrink-0 gap-4 flex-wrap">
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

            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
              placeholder="Name, email, phone… (Enter)"
              className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-60 bg-slate-50"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs transition-all font-medium
              ${exporting
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
              }`}
          >
            {exporting ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                ⬇ Export Excel
              </>
            )}
          </button>

          {activeFilterTags.length > 0 ? (
            <button onClick={resetAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-xs text-red-600 bg-red-50 hover:bg-red-100 transition-all font-medium">
              <RefreshCw size={12} /> Reset all ({activeFilterTags.length})
            </button>
          ) : (
            <button onClick={resetAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-all">
              <RefreshCw size={12} /> Reset
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Per page</span>
            <select value={perPage} onChange={e => { setPerPage(+e.target.value); setPage(1); }}
              className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
              {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Active filter chips ── */}
      {activeFilterTags.length > 0 && (
        <div className="flex items-center gap-2 px-6 py-2 bg-indigo-50 border-b border-indigo-100 flex-shrink-0 flex-wrap">
          <SlidersHorizontal size={12} className="text-indigo-400 flex-shrink-0" />
          <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Active Filters:</span>
          {activeFilterTags.map((tag, i) => (
            <FilterTag key={i} label={tag.label} onRemove={tag.clear} />
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 px-6 py-2 bg-red-50 border-b border-red-100 text-red-600 text-xs flex-shrink-0">
          <AlertTriangle size={14} /> {error}
          <button onClick={fetchCompanies} className="ml-auto underline">Retry</button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-20">
            <Loader2 size={28} className="animate-spin text-indigo-600" />
          </div>
        )}

        <table className="border-collapse text-sm" style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}>
          <thead className="sticky top-0 z-[20]">
            <tr>
              {/* # */}
              <th style={{ width: colW.no, minWidth: colW.no }}
                className="bg-slate-50 border-b border-r border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-400 uppercase text-center">
                #
              </th>


              <ColHeader col="name" label="Company" sortKey="employer_name" />

              {/* Jobs / Internships */}
              <ColHeader col="jobs" label="Jobs / Internships" sortKey="job_count"
                filterActive={jobTypeFilter.length > 0}>
                <MultiSelectDropdown
                  values={jobTypeFilter}
                  onChange={v => { setJobTypeFilter(v); setPage(1); }}
                  options={JOB_TYPE_OPTIONS}
                  placeholder="Filter by type"
                  label="job type"
                />
              </ColHeader>


              <ColHeader
                col="applications"
                label="Total Applications"
                sortKey="total_applications"
                filterActive={appStatusFilter.length > 0 || appDateRange.from || appDateRange.to}
              >

                <div className="space-y-1">

                  <AppFilterDropdown
                    appFilter={appStatusFilter}
                    setAppFilter={setAppStatusFilter}
                    appDateRange={appDateRange}
                    setAppDateRange={setAppDateRange}
                    setPage={setPage}
                  />

                  <DateRangeFilter
                    value={appDateRange}
                    onChange={(v) => {
                      if (appStatusFilter.length !== 1) return;
                      setAppDateRange(v);
                      setPage(1);
                    }}
                    label="Application"
                    disabled={appStatusFilter.length !== 1}
                  />

                  {appStatusFilter.length !== 1 && (
                    <p className="text-[9px] text-slate-400 italic">
                      Select exactly 1 status to enable date filter
                    </p>
                  )}

                </div>
              </ColHeader>

              {/* Registered */}
              <ColHeader col="registered" label="Registered" sortKey="registered_at"
                filterActive={!!(registeredDateRange.from || registeredDateRange.to)}>
                <DateRangeFilter
                  value={registeredDateRange}
                  onChange={v => { setRegisteredDateRange(v); setPage(1); }}
                  label="Registered"
                />
              </ColHeader>

              {/* Last Login */}
              <ColHeader col="lastlogin" label="Last Login" sortKey="last_login"
                filterActive={!!(lastLoginDateRange.from || lastLoginDateRange.to)}>
                <DateRangeFilter
                  value={lastLoginDateRange}
                  onChange={v => { setLastLoginDateRange(v); setPage(1); }}
                  label="Last Login"
                />
              </ColHeader>

              {/* Features */}
              <ColHeader col="features" label="Features Used"
                filterActive={featuresFilter.length > 0 || featDateRange.from || featDateRange.to}>
                <div className="space-y-1">
                  <MultiSelectDropdown
                    values={featuresFilter}
                    onChange={v => { setFeaturesFilter(v); setPage(1); }}
                    options={FEATURE_OPTIONS}
                    placeholder="Filter features"
                    label="features"
                  />
                  <DateRangeFilter
                    value={tempFeatDateRange}
                    onChange={v => { if (!isSingleFeature) return; setTempFeatDateRange(v); }}
                    onApply={() => { setFeatDateRange(tempFeatDateRange); setPage(1); }}
                    label="Feature"
                    disabled={!isSingleFeature}
                  />
                  {!isSingleFeature && featuresFilter.length !== 1 && (
                    <p className="text-[9px] text-slate-400 italic">Select exactly 1 feature to enable date filter</p>
                  )}
                </div>
              </ColHeader>

              {/* Status */}
              <ColHeader col="status" label="Status" sortKey="status" filterActive={!!filters.status}>
                <FilterDropdown value={filters.status} onChange={v => setFilter('status', v)}
                  options={STATUS_OPTIONS} placeholder="All"
                  colorFn={v => v === 'active' ? 'green' : 'red'} />
              </ColHeader>

              {/* Verified */}
              <ColHeader col="verified" label="Verified" sortKey="is_email_verified" filterActive={!!filters.is_email_verified}>
                <FilterDropdown value={filters.is_email_verified} onChange={v => setFilter('is_email_verified', v)}
                  options={VERIFIED_OPTIONS} placeholder="All"
                  colorFn={v => v === 'Verified' ? 'green' : 'amber'} />
              </ColHeader>

              {/* Website */}
              <ColHeader col="website" label="Website" filterActive={!!websiteSearch}>
                <input
                  key={`website-${resetKey}`}
                  defaultValue={websiteInput}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const v = e.target.value;
                      setWebsiteInput(v);
                      setWebsiteSearch(v);
                      setPage(1);
                    }
                  }}
                  placeholder="Search website… (Enter)"
                  className="w-full text-[11px] border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white"
                />
              </ColHeader>

              {/* Industry / Type */}
              <ColHeader col="industry" label="Industry / Type"
                filterActive={!!(filters.industry || filters.industry_type)}>
                <div className="flex flex-col gap-1">
                  <FilterDropdown value={filters.industry} onChange={v => setFilter('industry', v)}
                    options={INDUSTRY_OPTIONS} placeholder="Industry"
                    colorFn={v => INDUSTRY_COLORS[v] ?? 'gray'} />
                  <FilterDropdown value={filters.industry_type} onChange={v => setFilter('industry_type', v)}
                    options={INDUSTRY_TYPE_OPTIONS} placeholder="Type"
                    colorFn={v => TYPE_COLORS[v] ?? 'gray'} />
                </div>
              </ColHeader>

              {/* Location */}
              <ColHeader col="location" label="Location" filterActive={!!locationSearch}>
                <input
                  key={`location-${resetKey}`}
                  defaultValue={locationInput}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const v = e.target.value;
                      setLocationInput(v);
                      setLocationSearch(v);
                      setPage(1);
                    }
                  }}
                  placeholder="Search location… (Enter)"
                  className="w-full text-[11px] border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white"
                />
              </ColHeader>

              {/* Note */}
              <ColHeader col="comment" label="Note" filterActive={!!noteSearch}>
                <input
                  key={`note-${resetKey}`}
                  defaultValue={noteInput}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const v = e.target.value;
                      setNoteInput(v);
                      setNoteSearch(v);
                      setPage(1);
                    }
                  }}
                  placeholder="Search notes… (Enter)"
                  className="w-full text-[11px] border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white"
                />
              </ColHeader>

              {/* Tokens */}
              <ColHeader col="tokens" label="Tokens Used" sortKey="tokens_used"
                filterActive={!!(tokensFilter.min || tokensFilter.max)}>
                <NumberRangeFilter
                  value={tokensFilter}
                  onChange={v => { setTokensFilter(v); setPage(1); }}
                  placeholder={['Min', 'Max']}
                />
              </ColHeader>

              {/* Actions (sticky right) */}
              <th style={{ width: colW.actions, minWidth: colW.actions }}
                className="bg-slate-50 border-b border-r border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase sticky right-0 z-20 shadow-[-6px_0_12px_rgba(0,0,0,0.06)]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {!loading && companies.length === 0 && (
              <tr>
                <td colSpan={16} className="py-20 text-center text-slate-400">
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
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                            style={{ background: avatarColor(c.name) }}>
                            {c.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      <div className="overflow-hidden">
                        <p className="font-semibold text-slate-800 text-[14px] truncate">{c.name}</p>
                        <p className="text-[10px] text-slate-400">ID: {c.employer_id}</p>
                        {c.email && (
                          <p className="flex items-center gap-1 text-slate-600 text-[11px] truncate">
                            <Mail size={11} className="text-slate-400" />{c.email}
                          </p>
                        )}
                        {c.phone && (
                          <p className="flex items-center gap-1 text-slate-500 text-[11px] truncate">
                            <Phone size={11} className="text-slate-400" />{c.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Jobs / Internships */}
                  <td className="px-3 py-2.5" style={{ width: colW.jobs }}>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => { if (c.job_count > 0) navigate(`/job-posting?employer_id=${c.employer_id}`); }}
                        disabled={c.job_count === 0}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold w-fit transition-colors
                          ${c.job_count === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                        {c.job_count} total <ExternalLink size={8} />
                      </button>
                      <div className="flex items-center gap-1 flex-wrap">
                        {c.active_jobs > 0 && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                            {c.active_jobs} active
                          </span>
                        )}
                        {c.closed_jobs > 0 && (
                          <span className="text-[10px] font-semibold text-red-800 bg-red-100 px-1.5 py-0.5 rounded-md">
                            {c.closed_jobs} closed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {c.internship_count > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md font-medium">
                            <GraduationCap size={9} /> {c.internship_count}
                          </span>
                        )}
                        {c.job_only_count > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md font-medium">
                            <Briefcase size={9} /> {c.job_only_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Total Applications */}
                  <td className="px-2 py-2" style={{ width: colW.applications }}>
                    <AppStats c={c} />
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

                  {/* Features */}
                  <td className="px-2 py-2" style={{ width: colW.features }}>
                    <div className="rounded-lg border-2 border-slate-200 overflow-hidden shadow-sm bg-white">
                      {/* Header row */}

                      {/* <div
                        className="grid border-b-2 border-slate-200"
                        style={{ gridTemplateColumns: FEATURE_GRID }}
                      >
                        
                        <div className="col-span-2 flex items-center justify-center py-1 bg-indigo-50 border-r-2 border-slate-200">
                          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">JP</span>
                        </div>

                        
                        <div className="col-span-1 flex items-center justify-center py-1 bg-sky-50 border-r border-slate-200">
                          <span className="text-[9px] font-black text-sky-600 uppercase tracking-widest">C</span>
                        </div>

                        
                        <div className="col-span-1 flex items-center justify-center py-1 bg-violet-50 border-r border-slate-200">
                          <span className="text-[9px] font-black text-violet-600 uppercase tracking-widest">I</span>
                        </div>

                        
                        <div className="col-span-1 flex items-center justify-center py-1 bg-amber-50 border-r-2 border-slate-200">
                          <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">A</span>
                        </div>

                        
                        <div className="col-span-4 flex items-center justify-center py-1 bg-emerald-50">
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">D</span>
                        </div>
                      </div> */}

                      <div
                        className="grid border-b-2 border-slate-200"
                        style={{ gridTemplateColumns: FEATURE_GRID }}
                      >

                        {/* JP */}
                        <div className="col-span-2 flex items-center justify-center py-1 bg-indigo-50 border-r-2 border-slate-200">
                          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">JP</span>
                        </div>

                        {/* C */}
                        <div className="col-span-1 flex items-center justify-center py-1 bg-sky-50 border-r border-slate-200">
                          <span className="text-[9px] font-black text-sky-600 uppercase tracking-widest">C</span>
                        </div>

                        {/* I */}
                        <div className="col-span-1 flex items-center justify-center py-1 bg-violet-50 border-r border-slate-200">
                          <span className="text-[9px] font-black text-violet-600 uppercase tracking-widest">I</span>
                        </div>

                        {/* A */}
                        <div className="col-span-1 flex items-center justify-center py-1 bg-amber-50 border-r-2 border-slate-200">
                          <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">A</span>
                        </div>

                        {/* D */}
                        <div className="col-span-5 flex items-center justify-center py-1 bg-emerald-50 border-r-2 border-slate-200">
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">D</span>
                        </div>

                        {/* Clicked */}
                        {/* <div className="col-span-6 flex items-center justify-center py-1 bg-rose-50"> */}
                        <div className="col-span-5 flex items-center justify-center py-1 bg-rose-50 border-l-2 border-slate-200">
                          <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest">Clkd</span>
                        </div>

                      </div>
                      {/* <div
                        className="grid border-b border-slate-200 bg-slate-50"
                        style={{ gridTemplateColumns: FEATURE_GRID }}
                      >

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

                        <div className="flex items-center justify-center py-0.5 border-r border-slate-200">
                          <span className="text-[8px] font-semibold text-slate-400">I</span>
                        </div>

                        <div className="flex items-center justify-center py-0.5 border-r border-slate-200">
                          <span className="text-[9px] font-semibold text-slate-400">SV</span>
                        </div>

                        <div className="flex items-center justify-center py-0.5">
                          <span className="text-[9px] font-semibold text-slate-400">S</span>
                        </div>
                      </div> */}
                      <div
                        className="grid border-b border-slate-200 bg-slate-50"
                        style={{ gridTemplateColumns: FEATURE_GRID }}
                      >

                        {/* JP */}
                        <div className="flex items-center justify-center py-0.5 border-r border-slate-200">
                          <span className="text-[8px] font-semibold text-slate-400">I</span>
                        </div>

                        <div className="flex items-center justify-center py-0.5 border-r-2 border-slate-200">
                          <span className="text-[8px] font-semibold text-slate-400">J</span>
                        </div>

                        {/* C */}
                        <div className="border-r border-slate-200" />

                        {/* I */}
                        <div className="border-r border-slate-200" />

                        {/* A */}
                        <div className="border-r-2 border-slate-200" />

                        {/* D */}
                        <div className="flex items-center justify-center py-0.5 border-r border-slate-200">
                          <span className="text-[8px] font-semibold text-slate-400">V</span>
                        </div>

                        <div className="flex items-center justify-center py-0.5 border-r border-slate-200">
                          <span className="text-[8px] font-semibold text-slate-400">I</span>
                        </div>

                        <div className="flex items-center justify-center py-0.5 border-r border-slate-200">
                          <span className="text-[8px] font-semibold text-slate-400">SV</span>
                        </div>

                        <div className="flex items-center justify-center py-0.5 border-r border-slate-200">
                          <span className="text-[8px] font-semibold text-slate-400">S</span>
                        </div>

                        <div className="flex items-center justify-center py-0.5 border-r-2 border-slate-200">
                          <span className="text-[8px] font-semibold text-slate-400">FA</span>
                        </div>

                        {/* Clicked */}
                        <div className="flex items-center justify-center py-0.5 border-r border-slate-200">
                          <span className="text-[8px] font-semibold text-slate-400">R</span>
                        </div>

                        <div className="flex items-center justify-center py-0.5 border-r border-slate-200">
                          <span className="text-[8px] font-semibold text-slate-400">F</span>
                        </div>

                        <div className="flex items-center justify-center py-0.5 border-r border-slate-200">
                          <span className="text-[8px] font-semibold text-slate-400">I</span>
                        </div>

                        <div className="flex items-center justify-center py-0.5 border-r border-slate-200">
                          <span className="text-[8px] font-semibold text-slate-400">S</span>
                        </div>

                        <div className="flex items-center justify-center py-0.5">
                          <span className="text-[8px] font-semibold text-slate-400">U</span>
                        </div>

                      </div>
                      {/* Data row */}
                      {/* <div className="grid bg-white"

                        style={{ gridTemplateColumns: FEATURE_GRID }}
                      >
                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_internship_count} active={c.feat_internship_count > 0} title="Internships" />
                        </div>
                        <div className="flex items-center justify-center p-1.5 border-r-2 border-slate-200">
                          <FeatureChip count={c.feat_job_count} active={c.feat_job_count > 0} title="Jobs" />
                        </div>
                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_chat_count} active={c.feat_chat_count > 0} title="Chats" />
                        </div>
                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_interview_count} active={c.feat_interview_count > 0} title="Interviews" />
                        </div>
                        <div className="flex items-center justify-center p-1.5 border-r-2 border-slate-200">
                          <FeatureChip count={c.feat_assignment_count} active={c.feat_assignment_count > 0} title="Assignments" />
                        </div>
                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_visit_count} active={c.feat_visit_count > 0} title="DB Visits" />
                        </div>
                        <div className="flex items-center justify-center p-1.5">
                          <FeatureChip count={c.feat_invited_count} active={c.feat_invited_count > 0} title="Invited" />
                        </div>
                        <div className="flex items-center justify-center p-1.5">
                          <FeatureChip count={c.feat_saved_visit_count} active={c.feat_saved_visit_count > 0} title="Saved Visited" />
                        </div>

                        <div className="flex items-center justify-center p-1.5">
                          <FeatureChip count={c.feat_saved_count} active={c.feat_saved_count > 0} title="Total Saved" />
                        </div>



                        <div className="flex items-center justify-center p-1.5">
                          <FeatureChip count={c.feat_filter_applied_count} active={c.feat_filter_applied_count > 0} title="Filter Applied" />
                        </div><div className="flex items-center justify-center p-1.5">
                          <FeatureChip count={c.feat_clicked_resume_count} active={c.feat_clicked_resume_count > 0} title="Resume Click" />
                        </div><div className="flex items-center justify-center p-1.5">
                          <FeatureChip count={c.feat_clicked_full_detail_count} active={c.feat_clicked_full_detail_count > 0} title="Full Detail Click" />
                        </div><div className="flex items-center justify-center p-1.5">
                          <FeatureChip count={c.feat_clicked_invite_count} active={c.feat_clicked_invite_count > 0} title="Invite Click" />
                        </div><div className="flex items-center justify-center p-1.5">
                          <FeatureChip count={c.feat_clicked_save_count} active={c.feat_clicked_save_count > 0} title="Save Click" />
                        </div><div className="flex items-center justify-center p-1.5">
                          <FeatureChip count={c.feat_clicked_unsave_count} active={c.feat_clicked_unsave_count > 0} title="Unsave Click" />
                        </div>
                      </div> */}
                      <div className="grid bg-white" style={{ gridTemplateColumns: FEATURE_GRID }}>

                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_internship_count} active={c.feat_internship_count > 0} title="Internships" />
                        </div>

                        <div className="flex items-center justify-center p-1.5 border-r-2 border-slate-200">
                          <FeatureChip count={c.feat_job_count} active={c.feat_job_count > 0} title="Jobs" />
                        </div>

                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_chat_count} active={c.feat_chat_count > 0} title="Chat" />
                        </div>

                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_interview_count} active={c.feat_interview_count > 0} title="Interview" />
                        </div>

                        <div className="flex items-center justify-center p-1.5 border-r-2 border-slate-200">
                          <FeatureChip count={c.feat_assignment_count} active={c.feat_assignment_count > 0} title="Assignment" />
                        </div>

                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_visit_count} active={c.feat_visit_count > 0} title="DB Visit" />
                        </div>

                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_invited_count} active={c.feat_invited_count > 0} title="Invited" />
                        </div>

                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_saved_visit_count} active={c.feat_saved_visit_count > 0} title="Saved Visit" />
                        </div>

                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_saved_count} active={c.feat_saved_count > 0} title="Saved" />
                        </div>

                        <div className="flex items-center justify-center p-1.5 border-r-2 border-slate-200">
                          <FeatureChip count={c.feat_filter_applied_count} active={c.feat_filter_applied_count > 0} title="Filter Applied" />
                        </div>

                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_clicked_resume_count} active={c.feat_clicked_resume_count > 0} title="Resume Click" />
                        </div>

                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_clicked_full_detail_count} active={c.feat_clicked_full_detail_count > 0} title="Full Detail Click" />
                        </div>

                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_clicked_invite_count} active={c.feat_clicked_invite_count > 0} title="Invite Click" />
                        </div>

                        <div className="flex items-center justify-center p-1.5 border-r border-slate-200">
                          <FeatureChip count={c.feat_clicked_save_count} active={c.feat_clicked_save_count > 0} title="Save Click" />
                        </div>

                        <div className="flex items-center justify-center p-1.5">
                          <FeatureChip count={c.feat_clicked_unsave_count} active={c.feat_clicked_unsave_count > 0} title="Unsave Click" />
                        </div>

                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5 text-center" style={{ width: colW.status }}>
                    {c.status === 'active'
                      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Active
                      </span>
                      : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />Blocked
                      </span>}
                  </td>

                  {/* Verified */}
                  <td className="px-3 py-2.5 text-center" style={{ width: colW.verified }}>
                    {c.is_email_verified
                      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-blue-100 text-blue-700 font-semibold">
                        <ShieldCheck size={11} /> Yes
                      </span>
                      : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-amber-100 text-amber-700 font-semibold">
                        <Shield size={11} /> No
                      </span>}
                  </td>

                  {/* Website */}
                  <td className="px-3 py-2.5 text-center" style={{ width: colW.website }}>
                    {c.website
                      ? <a href={c.website} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg text-[11px] transition-colors">
                        <Globe size={11} /> Visit
                      </a>
                      : <span className="text-slate-300 text-xs">—</span>}
                  </td>

                  {/* Industry / Type */}
                  <td className="px-3 py-2.5 overflow-hidden" style={{ width: colW.industry }}>
                    <div className="flex flex-col gap-1.5">
                      <InlineSelect value={c.industry} options={INDUSTRY_OPTIONS}
                        colorFn={v => INDUSTRY_COLORS[v] ?? 'gray'} placeholder="Set industry"
                        onSave={v => updateField(c.employer_id, 'industry', v)} />
                      <InlineSelect value={c.industry_type} options={INDUSTRY_TYPE_OPTIONS}
                        colorFn={v => TYPE_COLORS[v] ?? 'gray'} placeholder="Set type"
                        onSave={v => updateField(c.employer_id, 'industry_type', v)} />
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-3 py-2.5 text-xs text-slate-600 overflow-hidden" style={{ width: colW.location }}>
                    {c.location
                      ? <div className="flex items-center gap-1">
                        <MapPin size={10} className="text-slate-400 flex-shrink-0" />
                        <p className="truncate">{c.location}</p>
                      </div>
                      : <span className="text-slate-300">—</span>}
                  </td>

                  {/* Note */}
                  <td className="px-3 py-2.5 overflow-hidden" style={{ width: colW.comment }}>
                    <InlineComment value={c.comment_note}
                      onSave={v => updateField(c.employer_id, 'comment_note', v)} />
                  </td>

                  {/* Tokens */}
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

                  {/* Actions — sticky right */}
                  <td className="px-3 py-2.5 text-center sticky right-0 z-10 shadow-[-6px_0_12px_rgba(0,0,0,0.06)]"
                    style={{ width: colW.actions, background: rowBg }}>
                    <div className="flex flex-col gap-1 items-center">
                      <a href={`https://hire.internshipstudio.com/login?risky_login=${c.employer_id}`}
                        target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-bold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm whitespace-nowrap">
                        <LogIn size={11} /> Login
                      </a>
                      <button onClick={() => alert(`Send email to ${c.email}`)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 text-[11px] font-semibold transition-colors border border-sky-200">
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

      {/* ── Pagination ── */}
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