import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { createPortal } from 'react-dom';  // ← ADD THIS
import {
  Briefcase, Search, RefreshCw, X, ChevronDown, ChevronUp,
  ChevronsUpDown, SlidersHorizontal, AlertTriangle,
  Loader2, Check, GraduationCap, Building2,
  ArrowLeft, Users, TrendingUp, CheckCircle2,
  XCircle, Calendar, Filter, MapPin, DollarSign,
  MessageSquare, Video, ClipboardList, Send,
} from 'lucide-react';
import apiService from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const JOB_TYPE_OPTIONS = ['internship', 'job', 'contract'];
const STATUS_OPTIONS = ['Active', 'Close', 'Draft'];
const JOB_MODE_OPTIONS = ['wfo', 'wfh', 'hybrid', 'field'];
const PER_PAGE_OPTIONS = [10, 25, 50, 100, 200];
const APPLICATION_STATUS_OPTIONS = ['received', 'shortlisted', 'hired', 'rejected'];
const FEATURE_OPTIONS = ['chat', 'interview', 'assignment', 'submitted'];
const COMPENSATION_TYPE_OPTIONS = ['Fixed', 'Negotiable', 'Unpaid', 'Performance Based'];
const COMPENSATION_PERIOD_OPTIONS = ['month', 'week', 'day', 'hour', 'year', 'project'];

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
const APP_STATUS_COLOR = {
  received: 'bg-slate-100 text-slate-700',
  shortlisted: 'bg-amber-100 text-amber-700',
  hired: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};
const FEATURE_ICON = {
  chat: MessageSquare,
  interview: Video,
  assignment: ClipboardList,
  submitted: Send,
};
const FEATURE_COLOR = {
  chat: 'bg-sky-100 text-sky-700',
  interview: 'bg-violet-100 text-violet-700',
  assignment: 'bg-amber-100 text-amber-700',
  submitted: 'bg-teal-100 text-teal-700',
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

function fmtDateShort(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
}

function Badge({ label, cls }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOVER FILTER WRAPPER — shows filter UI only on column header hover
// ─────────────────────────────────────────────────────────────────────────────
function HoverFilter({ children, active, label }) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!pinned) return;
    const h = (e) => { if (!ref.current?.contains(e.target)) setPinned(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [pinned]);

  const show = hovered || pinned || active;

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => !pinned && setHovered(false)}
      onClick={() => setPinned(true)}
    >
      {active && (
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-500 z-10 border border-white" />
      )}
      <div className={`transition-all duration-150 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}`}>
        {children}
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// DATE RANGE PICKER — Dual Calendar Modal
// ─────────────────────────────────────────────────────────────────────────────
function DateRangeFilter({ value, onChange, onApply, label, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef();
  const modalRef = useRef();
  const [leftMonth, setLeftMonth] = useState(dayjs().subtract(1, 'month'));
  const [rightMonth, setRightMonth] = useState(dayjs());
  const [hoverDate, setHoverDate] = useState(null);

  // Position modal below trigger button
  const openModal = (e) => {
    e.stopPropagation();
    if (disabled) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
    });
    setOpen(o => !o);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (
        !modalRef.current?.contains(e.target) &&
        !triggerRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
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
      if (date < value.from) {
        onChange({ from: date, to: value.from });
      } else {
        onChange({ ...value, to: date });
      }
    }
  };

  const renderCalendar = (month, setMonth) => {
    const start = month.startOf('month').startOf('week');
    const end = month.endOf('month').endOf('week');
    const days = [];
    let d = start;
    while (d.isBefore(end) || d.isSame(end, 'day')) {
      days.push(d);
      d = d.add(1, 'day');
    }
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
                className={`
                  relative h-6 text-[10px] font-medium transition-all
                  ${!inCurMonth ? 'opacity-25' : ''}
                  ${selected
                    ? (isFrom && isTo)
                      ? 'rounded-full bg-indigo-600 text-white'
                      : isFrom
                        ? 'rounded-l-full bg-indigo-600 text-white'
                        : 'rounded-r-full bg-indigo-600 text-white'
                    : inRange
                      ? 'bg-indigo-100 text-indigo-700'
                      : isToday
                        ? 'text-indigo-600 font-bold hover:bg-indigo-50 rounded-full'
                        : 'text-slate-600 hover:bg-slate-100 rounded-full'
                  }
                `}>
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
    <div
      ref={modalRef}
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        zIndex: 99999,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden', minWidth: 420 }}>

        {/* Header */}
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

        {/* Calendars */}
        <div className="flex divide-x divide-slate-100" style={{ background: '#ffffff' }}>
          <div className="p-3" style={{ background: '#ffffff' }}>{renderCalendar(leftMonth, setLeftMonth)}</div>
          <div className="p-3" style={{ background: '#ffffff' }}>{renderCalendar(rightMonth, setRightMonth)}</div>
        </div>

        {/* Quick selects */}
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

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2"
          style={{ borderTop: '1px solid #f1f5f9', background: '#ffffff' }}>
          <button onClick={() => onChange({ from: '', to: '' })}
            className="text-[10px] text-red-400 hover:text-red-600 font-semibold transition-colors">
            Clear
          </button>
          <div className="flex gap-1.5">
            <button onClick={() => setOpen(false)}
              className="px-3 py-1 rounded-lg text-[10px] text-slate-600 font-semibold transition-all"
              style={{ border: '1px solid #e2e8f0', background: '#ffffff' }}>
              Cancel
            </button>
            <button onClick={() => { onApply?.(); setOpen(false); }}
              className="px-4 py-1 rounded-lg text-white text-[10px] font-bold transition-all"
              style={{ background: '#4f46e5' }}>
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div ref={triggerRef} className="relative inline-block">
      <button
        disabled={disabled}
        onClick={openModal}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-medium transition-all
          ${disabled
            ? 'opacity-40 cursor-not-allowed bg-slate-100'
            : hasValue
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
              : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50'
          }`}
      >
        <Calendar size={10} />
        {hasValue
          ? `${value.from ? fmtDateShort(value.from) : '∞'} → ${value.to ? fmtDateShort(value.to) : '∞'}`
          : 'Date range'}
        {hasValue && (
          <span onClick={(e) => { e.stopPropagation(); onChange({ from: '', to: '' }); }}
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
function MultiSelectDropdown({ values = [], onChange, options, placeholder, colorFn, iconFn, label }) {
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
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-medium transition-all w-full
          ${hasValue
            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
            : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50'}`}
      >
        <Filter size={9} />
        <span className="truncate flex-1 text-left">
          {hasValue ? values.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ') : placeholder}
        </span>
        {hasValue && (
          <span onClick={(e) => { e.stopPropagation(); onChange([]); }}
            className="hover:text-red-500 flex-shrink-0">
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
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${label}...`}
                className="w-full pl-6 pr-2 py-1 text-[11px] border border-slate-200 rounded-lg
                           focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-slate-50"
                autoFocus
              />
            </div>
          </div>
          <div className="p-1 max-h-44 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-[10px] text-slate-400 text-center py-2">No results</p>
            )}
            {filtered.map(opt => {
              const Icon = iconFn?.(opt);
              const selected = values.includes(opt);
              return (
                <button key={opt} onClick={() => toggle(opt)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] transition-colors
                    ${selected ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                  <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all
                    ${selected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                    {selected && <Check size={9} className="text-white stroke-[3]" />}
                  </div>
                  {Icon && <Icon size={10} className="flex-shrink-0 text-slate-400" />}
                  <span className={`${colorFn ? `px-1.5 py-0.5 rounded-full font-semibold ${colorFn(opt)}` : 'text-slate-700 font-medium'}`}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
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
// LOCATION MULTI-TAG INPUT
// ─────────────────────────────────────────────────────────────────────────────
function LocationTagInput({ values = [], onChange }) {
  const [input, setInput] = useState('');
  const inputRef = useRef();

  const add = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    const newVals = trimmed.split(',').map(v => v.trim()).filter(v => v && !values.includes(v));
    if (newVals.length > 0) onChange([...values, ...newVals]);
    setInput('');
  };

  const remove = (v) => onChange(values.filter(x => x !== v));

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(input);
    } else if (e.key === 'Backspace' && !input && values.length > 0) {
      remove(values[values.length - 1]);
    }
  };

  return (
    <div
      className="flex flex-wrap gap-1 min-h-[28px] px-2 py-1 border border-slate-200 rounded-lg
                 bg-white cursor-text hover:border-indigo-300 focus-within:ring-1 focus-within:ring-indigo-300
                 focus-within:border-indigo-300 transition-all"
      onClick={() => inputRef.current?.focus()}
    >
      {values.map(v => (
        <span key={v} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700
                                  rounded text-[10px] font-semibold">
          <MapPin size={8} />
          {v}
          <button onClick={(e) => { e.stopPropagation(); remove(v); }}
            className="hover:text-red-500 transition-colors">
            <X size={8} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => input && add(input)}
        placeholder={values.length === 0 ? 'Type & press Enter…' : '+ add more'}
        className="flex-1 min-w-[80px] text-[10px] outline-none bg-transparent text-slate-700
                   placeholder:text-slate-300"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPENSATION FILTER
// ─────────────────────────────────────────────────────────────────────────────
function CompensationFilter({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const hasValue = value?.types?.length > 0 || value?.periods?.length > 0 || value?.min || value?.max;

  const toggleArr = (key, val) => {
    const arr = value?.[key] ?? [];
    onChange({ ...value, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] });
  };

  const summary = () => {
    const parts = [];
    if (value?.types?.length) parts.push(value.types.join(', '));
    if (value?.min || value?.max) parts.push(`₹${value.min || 0}–${value.max || '∞'}`);
    if (value?.periods?.length) parts.push(value.periods.map(p => `/${p}`).join(', '));
    return parts.join(' · ') || 'All';
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-medium transition-all w-full
          ${hasValue
            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
            : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50'}`}
      >
        <DollarSign size={9} />
        <span className="truncate flex-1 text-left">{hasValue ? summary() : 'Filter compensation'}</span>
        {hasValue && (
          <span onClick={(e) => { e.stopPropagation(); onChange({}); }} className="hover:text-red-500">
            <X size={9} />
          </span>
        )}
        <ChevronDown size={9} className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 min-w-[220px]"
          onClick={e => e.stopPropagation()}>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Type</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {COMPENSATION_TYPE_OPTIONS.map(t => (
              <button key={t} onClick={() => toggleArr('types', t)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all
                  ${value?.types?.includes(t)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
                {t}
              </button>
            ))}
          </div>

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Amount Range (INR)</p>
          <div className="flex gap-2 mb-3">
            <input type="number" placeholder="Min" value={value?.min ?? ''}
              onChange={e => onChange({ ...value, min: e.target.value })}
              className="w-full text-[11px] border border-slate-200 rounded-lg px-2 py-1.5
                         focus:outline-none focus:ring-1 focus:ring-indigo-300" />
            <input type="number" placeholder="Max" value={value?.max ?? ''}
              onChange={e => onChange({ ...value, max: e.target.value })}
              className="w-full text-[11px] border border-slate-200 rounded-lg px-2 py-1.5
                         focus:outline-none focus:ring-1 focus:ring-indigo-300" />
          </div>

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Period</p>
          <div className="flex flex-wrap gap-1">
            {COMPENSATION_PERIOD_OPTIONS.map(p => (
              <button key={p} onClick={() => toggleArr('periods', p)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all
                  ${value?.periods?.includes(p)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
                /{p}
              </button>
            ))}
          </div>
          {hasValue && (
            <button onClick={() => onChange({})}
              className="w-full mt-3 text-[10px] text-red-400 hover:text-red-600 font-medium transition-colors border-t border-slate-100 pt-2">
              Clear compensation filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OPENINGS RANGE FILTER
// ─────────────────────────────────────────────────────────────────────────────
function OpeningsFilter({ value, onChange }) {
  const hasValue = value?.min || value?.max;
  return (
    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
      <input type="number" min="0" placeholder="Min"
        value={value?.min ?? ''}
        onChange={e => onChange({ ...value, min: e.target.value })}
        className={`w-full text-[10px] border rounded-lg px-2 py-1 focus:outline-none focus:ring-1
                   focus:ring-indigo-300 transition-all
                   ${hasValue ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white'}`} />
      <input type="number" min="0" placeholder="Max"
        value={value?.max ?? ''}
        onChange={e => onChange({ ...value, max: e.target.value })}
        className={`w-full text-[10px] border rounded-lg px-2 py-1 focus:outline-none focus:ring-1
                   focus:ring-indigo-300 transition-all
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
          ? <Badge label={value} cls={colorFn ? colorFn(value) : 'bg-indigo-100 text-indigo-700 border-indigo-300'} />
          : <span className="truncate">{placeholder}</span>}
        <ChevronDown size={11} className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 min-w-[150px] overflow-hidden">
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
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${color} bg-white`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color.replace('border-', 'bg-').replace(/\b(\w+)-\d+\b/g, (m) => m.replace(/\d+/, '100'))}`}>
        <Icon size={16} className={color.replace('border-', 'text-')} />
      </div>
      <div>
        <p className="text-lg font-black text-slate-800 leading-tight">{value ?? 0}</p>
        <p className="text-[11px] text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE CHIP
// ─────────────────────────────────────────────────────────────────────────────
function FChip({ count, active, title }) {
  return (
    <div title={`${title}: ${count}`}
      className={`relative flex items-center justify-center w-7 h-6 rounded border-2 cursor-default select-none
                  ${active ? 'bg-emerald-50 border-emerald-400' : 'bg-red-50 border-red-300'}`}>
      {active && count > 0 && (
        <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[8px] font-black rounded-full
                         min-w-[15px] h-[15px] flex items-center justify-center px-0.5 leading-none z-10 shadow border border-white">
          {count > 999 ? '999+' : count}
        </span>
      )}
      {active ? <Check size={10} className="text-emerald-600 stroke-[3]" /> : <X size={10} className="text-red-400 stroke-[3]" />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE FILTER SUMMARY TAG
// ─────────────────────────────────────────────────────────────────────────────
function FilterTag({ label, onRemove }) {
  return (
    <button onClick={onRemove}
      className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-800
                 border border-indigo-200 rounded-full text-[10px] font-semibold
                 hover:bg-indigo-200 transition-all">
      {label} <X size={8} />
    </button>
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
  const [exporting, setExporting] = useState(false);
  const [company, setCompany] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, per_page: 25, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Core filters ──
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [sortCol, setSortCol] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [filters, setFilters] = useState({ status: '', job_type: '', job_mode: '' });

  // ── Advanced column filters ──
  const [appStatusFilter, setAppStatusFilter] = useState([]);       // multi: received/shortlisted/hired/rejected
  const [featuresFilter, setFeaturesFilter] = useState([]);         // multi: chat/interview/assignment/submitted
  const isSingleAppStatus = appStatusFilter.length === 1;
  const isSingleFeature = featuresFilter.length === 1;
  const [postedDateRange, setPostedDateRange] = useState({ from: '', to: '' });
  const [deadlineDateRange, setDeadlineDateRange] = useState({ from: '', to: '' });
  // const [featDateRange, setFeatDateRange] = useState({ from: '', to: '' });
  // const [appDateRange, setAppDateRange] = useState({ from: '', to: '' });
  const [appDateRange, setAppDateRange] = useState({ from: '', to: '' });
  const [tempAppDateRange, setTempAppDateRange] = useState({ from: '', to: '' });

  const [featDateRange, setFeatDateRange] = useState({ from: '', to: '' });
  const [tempFeatDateRange, setTempFeatDateRange] = useState({ from: '', to: '' });
  const [locationFilter, setLocationFilter] = useState([]);         // multi-tag
  const [compensationFilter, setCompensationFilter] = useState({}); // {types, min, max, periods}
  const [openingsFilter, setOpeningsFilter] = useState({});         // {min, max}

  // Column widths
  const [colW, setColW] = useState({
    no: 44, title: 220, status: 100, type: 110, mode: 100,
    applications: 260, features: 200, compensation: 150,
    openings: 160, created: 140, deadline: 130, location: 160,
  });
  const resizing = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const handleExport = async () => {
    try {
      setExporting(true); // optional loader

      const params = new URLSearchParams({
        search,
        status: filters.status,
        job_type: filters.job_type,
        job_mode: filters.job_mode,
        sort_col: sortCol,
        sort_dir: sortDir,

        // multi filters
        app_status: appStatusFilter.join(','),
        features: featuresFilter.join(','),

        // dates
        posted_from: postedDateRange.from,
        posted_to: postedDateRange.to,
        deadline_from: deadlineDateRange.from,
        deadline_to: deadlineDateRange.to,

        // ✅ IMPORTANT (match API logic)
        app_date_from: appStatusFilter.length === 1 ? appDateRange.from : '',
        app_date_to: appStatusFilter.length === 1 ? appDateRange.to : '',

        feat_date_from: featuresFilter.length === 1 ? featDateRange.from : '',
        feat_date_to: featuresFilter.length === 1 ? featDateRange.to : '',

        // location
        locations: locationFilter.join(','),

        // compensation
        comp_types: compensationFilter.types?.join(',') ?? '',
        comp_min: compensationFilter.min ?? '',
        comp_max: compensationFilter.max ?? '',
        comp_periods: compensationFilter.periods?.join(',') ?? '',

        // openings
        openings_min: openingsFilter.min ?? '',
        openings_max: openingsFilter.max ?? '',
      });

      const response = await fetch(
        `https://company.internshipstudio.com/api/job_postings/export.php?${params.toString()}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();

      // ✅ force correct MIME (important for Excel)
      const file = new Blob([blob], {
        type: 'application/vnd.ms-excel',
      });

      const url = window.URL.createObjectURL(file);

      const a = document.createElement('a');
      a.href = url;
      a.download = `jobs_export_${new Date().toISOString().slice(0, 10)}.xls`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };
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
        // Advanced filters
        app_status: appStatusFilter.join(','),
        features: featuresFilter.join(','),
        posted_from: postedDateRange.from,
        posted_to: postedDateRange.to,
        deadline_from: deadlineDateRange.from,
        deadline_to: deadlineDateRange.to,
        // feat_date_from: featDateRange.from,
        // feat_date_to: featDateRange.to,
        // app_date_from: appDateRange.from,
        // app_date_to: appDateRange.to,
        app_date_from: isSingleAppStatus ? appDateRange.from : '',
        app_date_to: isSingleAppStatus ? appDateRange.to : '',
        feat_date_from: isSingleFeature ? featDateRange.from : '',
        feat_date_to: isSingleFeature ? featDateRange.to : '',
        locations: locationFilter.join(','),
        comp_types: compensationFilter.types?.join(',') ?? '',
        comp_min: compensationFilter.min ?? '',
        comp_max: compensationFilter.max ?? '',
        comp_periods: compensationFilter.periods?.join(',') ?? '',
        openings_min: openingsFilter.min ?? '',
        openings_max: openingsFilter.max ?? '',
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
  }, [
    search, filters, sortCol, sortDir, page, perPage, employerId,
    appStatusFilter, featuresFilter, postedDateRange, deadlineDateRange,
    featDateRange, appDateRange, locationFilter, compensationFilter, openingsFilter,
  ]);

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
    setAppStatusFilter([]);
    setFeaturesFilter([]);
    setPostedDateRange({ from: '', to: '' });
    setDeadlineDateRange({ from: '', to: '' });
    setFeatDateRange({ from: '', to: '' });
    setAppDateRange({ from: '', to: '' });
    setLocationFilter([]);
    setCompensationFilter({});
    setOpeningsFilter({});
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

  // ─── ACTIVE FILTER COUNT ──────────────────────────────────────────────────
  const activeFilterTags = useMemo(() => {
    const tags = [];
    if (filters.status) tags.push({ label: `Status: ${filters.status}`, clear: () => setFilter('status', '') });
    if (filters.job_type) tags.push({ label: `Type: ${filters.job_type}`, clear: () => setFilter('job_type', '') });
    if (filters.job_mode) tags.push({ label: `Mode: ${filters.job_mode}`, clear: () => setFilter('job_mode', '') });
    appStatusFilter.forEach(s => tags.push({ label: `App: ${s}`, clear: () => setAppStatusFilter(v => v.filter(x => x !== s)) }));
    featuresFilter.forEach(f => tags.push({ label: `Feature: ${f}`, clear: () => setFeaturesFilter(v => v.filter(x => x !== f)) }));
    if (postedDateRange.from || postedDateRange.to) tags.push({ label: `Posted: ${postedDateRange.from || '∞'}→${postedDateRange.to || '∞'}`, clear: () => setPostedDateRange({ from: '', to: '' }) });
    if (deadlineDateRange.from || deadlineDateRange.to) tags.push({ label: `Deadline: ${deadlineDateRange.from || '∞'}→${deadlineDateRange.to || '∞'}`, clear: () => setDeadlineDateRange({ from: '', to: '' }) });
    if (appDateRange.from || appDateRange.to) tags.push({ label: `App date: ${appDateRange.from || '∞'}→${appDateRange.to || '∞'}`, clear: () => setAppDateRange({ from: '', to: '' }) });
    if (featDateRange.from || featDateRange.to) tags.push({ label: `Feat date: ${featDateRange.from || '∞'}→${featDateRange.to || '∞'}`, clear: () => setFeatDateRange({ from: '', to: '' }) });
    locationFilter.forEach(l => tags.push({ label: `📍 ${l}`, clear: () => setLocationFilter(v => v.filter(x => x !== l)) }));
    if (compensationFilter.types?.length) tags.push({ label: `Comp: ${compensationFilter.types.join(', ')}`, clear: () => setCompensationFilter(v => ({ ...v, types: [] })) });
    if (compensationFilter.min || compensationFilter.max) tags.push({ label: `₹${compensationFilter.min || 0}–${compensationFilter.max || '∞'}`, clear: () => setCompensationFilter(v => ({ ...v, min: '', max: '' })) });
    if (compensationFilter.periods?.length) tags.push({ label: `Period: ${compensationFilter.periods.join(', ')}`, clear: () => setCompensationFilter(v => ({ ...v, periods: [] })) });
    if (openingsFilter.min || openingsFilter.max) tags.push({ label: `Openings: ${openingsFilter.min || 0}–${openingsFilter.max || '∞'}`, clear: () => setOpeningsFilter({}) });
    return tags;
  }, [filters, appStatusFilter, featuresFilter, postedDateRange, deadlineDateRange, appDateRange, featDateRange, locationFilter, compensationFilter, openingsFilter]);

  // ─── COL HEADER ───────────────────────────────────────────────────────────
  const ColHeader = ({ col, label, sortKey, children, filterActive }) => (
    <th style={{ width: colW[col], minWidth: colW[col], position: 'relative' }}
      className="bg-slate-50 border-b border-r border-slate-200 p-0 group align-top">
      <div className="flex flex-col h-full">
        <button onClick={() => sortKey && handleSort(sortKey)}
          className={`flex items-center gap-1 px-3 py-2 text-[10px] font-bold
                      text-slate-500 uppercase tracking-wider w-full text-left relative
                      ${sortKey ? 'hover:text-indigo-700 cursor-pointer' : 'cursor-default'}`}>
          {/* {filterActive && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500" />
          )} */}
          {filterActive && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500 z-[21]" />
          )}
          {label} {sortKey && <SortIcon col={sortKey} />}
        </button>
        {children && <div className="px-2 pb-2 space-y-1">{children}</div>}
      </div>
      <div onMouseDown={(e) => startResize(col, e)}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize
                   hover:bg-indigo-400 group-hover:bg-slate-300 bg-transparent transition-colors"
        style={{ zIndex: 5 }} />
    </th>
  );

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
                <><span className="text-slate-400 font-medium text-sm">{company.name} /</span>Jobs</>
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
          {activeFilterTags.length > 0 && (
            <button onClick={resetAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200
                         text-xs text-red-600 bg-red-50 hover:bg-red-100 transition-all font-medium">
              <RefreshCw size={12} /> Reset all ({activeFilterTags.length})
            </button>
          )}
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
          {activeFilterTags.length === 0 && (
            <button onClick={resetAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200
                         text-xs text-slate-600 hover:bg-slate-50 transition-all">
              <RefreshCw size={12} /> Reset
            </button>
          )}
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
        <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-slate-200 flex-shrink-0 flex-wrap">
          <StatCard icon={Briefcase} label="Total Jobs" value={stats.total_jobs} color="border-indigo-200 text-indigo-600" />
          <StatCard icon={GraduationCap} label="Internships" value={stats.total_internships} color="border-violet-200 text-violet-600" />
          <StatCard icon={CheckCircle2} label="Active" value={stats.active_jobs} color="border-emerald-200 text-emerald-600" />
          <StatCard icon={XCircle} label="Closed" value={stats.closed_jobs} color="border-red-200 text-red-600" />
          <StatCard icon={Users} label="Total Applicants" value={stats.total_applications} color="border-sky-200 text-sky-600" />
          <StatCard icon={TrendingUp} label="Hired" value={stats.total_hired} color="border-teal-200 text-teal-600" />
        </div>
      )}

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
          <button onClick={fetchJobs} className="ml-auto underline">Retry</button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto relative">
        {loading && (
          // <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20">
          <div className="absolute inset-0 bg-white flex items-center justify-center z-20">
            <Loader2 size={28} className="animate-spin text-indigo-600" />
          </div>
        )}

        <table className="border-collapse text-sm"
          style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}>

          <thead className="sticky top-0 z-[20]">
            <tr>
              {/* # */}
              <th style={{ width: colW.no, minWidth: colW.no }}
                className="bg-slate-50 border-b border-r border-slate-200 px-3 py-2
                           text-[10px] font-bold text-slate-400 uppercase text-center">
                #
              </th>

              {/* Job Title */}
              <ColHeader col="title" label="Job Title" sortKey="job_title">
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search title…"
                  className="w-full text-[11px] border border-slate-200 rounded-lg px-2 py-1
                             focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white" />
              </ColHeader>

              {/* Status */}
              <ColHeader col="status" label="Status" sortKey="status" filterActive={!!filters.status}>
                <FilterDropdown value={filters.status} onChange={v => setFilter('status', v)}
                  options={STATUS_OPTIONS} placeholder="All"
                  colorFn={v => STATUS_COLOR[v] ?? 'bg-slate-100 text-slate-600 border-slate-300'} />
              </ColHeader>

              {/* Type */}
              <ColHeader col="type" label="Type" sortKey="job_type" filterActive={!!filters.job_type}>
                <FilterDropdown value={filters.job_type} onChange={v => setFilter('job_type', v)}
                  options={JOB_TYPE_OPTIONS} placeholder="All"
                  colorFn={v => TYPE_COLOR[v] ?? 'bg-slate-100 text-slate-600 border-slate-300'} />
              </ColHeader>

              {/* Mode */}
              <ColHeader col="mode" label="Mode" sortKey="job_mode" filterActive={!!filters.job_mode}>
                <FilterDropdown value={filters.job_mode} onChange={v => setFilter('job_mode', v)}
                  options={JOB_MODE_OPTIONS} placeholder="All"
                  colorFn={v => `${MODE_COLOR[v] ?? 'bg-slate-100 text-slate-600'} border-transparent`} />
              </ColHeader>

              {/* Applications */}
              <ColHeader col="applications" label="Applications" sortKey="total_applications"
                filterActive={appStatusFilter.length > 0 || appDateRange.from || appDateRange.to}>
                <div className="space-y-1">
                  <MultiSelectDropdown
                    values={appStatusFilter}
                    onChange={(v) => { setAppStatusFilter(v); setPage(1); }}
                    options={APPLICATION_STATUS_OPTIONS}
                    placeholder="Filter by status"
                    colorFn={v => APP_STATUS_COLOR[v] ?? 'bg-slate-100 text-slate-600'}
                    label="application status"
                  />

                  <DateRangeFilter
                    value={tempAppDateRange}
                    onChange={(v) => {
                      if (!isSingleAppStatus) return;
                      setTempAppDateRange(v);
                    }}
                    onApply={() => {
                      setAppDateRange(tempAppDateRange);
                      setPage(1);
                    }}
                    label="Application"
                    disabled={!isSingleAppStatus}
                  />
                </div>
              </ColHeader>

              {/* Features */}
              <ColHeader col="features" label="Features Used"
                filterActive={featuresFilter.length > 0 || featDateRange.from || featDateRange.to}>
                <div className="space-y-1">
                  <MultiSelectDropdown
                    values={featuresFilter}
                    onChange={(v) => { setFeaturesFilter(v); setPage(1); }}
                    options={FEATURE_OPTIONS}
                    placeholder="Filter features"
                    colorFn={v => FEATURE_COLOR[v] ?? 'bg-slate-100 text-slate-600'}
                    iconFn={v => FEATURE_ICON[v]}
                    label="features"
                  />

                  <DateRangeFilter
                    value={tempFeatDateRange}
                    onChange={(v) => {
                      if (!isSingleFeature) return;
                      setTempFeatDateRange(v);
                    }}
                    onApply={() => {
                      setFeatDateRange(tempFeatDateRange);
                      setPage(1);
                    }}
                    label="Feature"
                    disabled={!isSingleFeature}
                  />
                </div>
              </ColHeader>

              {/* Compensation */}
              <ColHeader col="compensation" label="Compensation" sortKey="compensation_amount"
                filterActive={!!(compensationFilter.types?.length || compensationFilter.min || compensationFilter.max || compensationFilter.periods?.length)}>
                <CompensationFilter
                  value={compensationFilter}
                  onChange={(v) => { setCompensationFilter(v); setPage(1); }}
                />
              </ColHeader>

              {/* Openings */}
              <ColHeader col="openings" label="Openings" sortKey="openings"
                filterActive={!!(openingsFilter.min || openingsFilter.max)}>
                <OpeningsFilter
                  value={openingsFilter}
                  onChange={(v) => { setOpeningsFilter(v); setPage(1); }}
                />
              </ColHeader>

              {/* Posted On */}
              <ColHeader col="created" label="Posted On" sortKey="created_at"
                filterActive={!!(postedDateRange.from || postedDateRange.to)}>
                <DateRangeFilter
                  value={postedDateRange}
                  onChange={(v) => { setPostedDateRange(v); setPage(1); }}
                  label="Posted"
                />
              </ColHeader>

              {/* Deadline */}
              <ColHeader col="deadline" label="Deadline" sortKey="end_date"
                filterActive={!!(deadlineDateRange.from || deadlineDateRange.to)}>
                <DateRangeFilter
                  value={deadlineDateRange}
                  onChange={(v) => { setDeadlineDateRange(v); setPage(1); }}
                  label="Deadline"
                />
              </ColHeader>

              {/* Location */}
              <ColHeader col="location" label="Location"
                filterActive={locationFilter.length > 0}>
                <LocationTagInput
                  values={locationFilter}
                  onChange={(v) => { setLocationFilter(v); setPage(1); }}
                />
              </ColHeader>
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
                <tr key={`${j.job_id}-${j.employer_id}-${idx}`}
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
                    {j.company_name && (
                      <div className="mt-0.5 space-y-0.5">
                        <p className="text-indigo-500 text-[10px] truncate flex items-center gap-1">
                          <Building2 size={9} /> {j.company_name}
                        </p>
                        {j.company_email && <p className="text-slate-400 text-[10px] truncate">📧 {j.company_email}</p>}
                        {j.company_phone && <p className="text-slate-400 text-[10px] truncate">📞 {j.company_phone}</p>}
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
                      ? <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${MODE_COLOR[j.job_mode] ?? 'bg-slate-100 text-slate-600'}`}>
                        {j.job_mode?.toUpperCase()}
                      </span>
                      : <span className="text-slate-300">—</span>}
                  </td>

                  {/* Applications */}
                  <td className="px-2 py-2" style={{ width: colW.applications }}>
                    <div className="rounded-lg border border-slate-200 overflow-hidden shadow-sm bg-white text-[10px]">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-indigo-600 text-white">
                        <span className="font-bold flex items-center gap-1">
                          <Users size={10} /> Total Applications
                        </span>
                        <span className="font-black text-sm">{total}</span>
                      </div>
                      <div className="grid grid-cols-4 divide-x divide-slate-100">
                        {[
                          { key: 'received_count', label: 'Received', cls: 'text-slate-700' },
                          { key: 'shortlisted_count', label: 'Shortlisted', cls: 'text-amber-600' },
                          { key: 'hired_count', label: 'Hired', cls: 'text-emerald-600' },
                          { key: 'rejected_count', label: 'Rejected', cls: 'text-red-500' },
                        ].map(s => (
                          <div key={s.key} className="flex flex-col items-center py-1.5 px-1">
                            <span className={`font-black text-xs ${s.cls}`}>{j[s.key] ?? 0}</span>
                            <span className="text-[9px] text-slate-400 font-medium">{s.label}</span>
                          </div>
                        ))}
                      </div>
                      {total > 0 && (
                        <div className="flex h-1.5 mx-2 mb-1.5 rounded-full overflow-hidden bg-slate-100">
                          <div className="bg-amber-400 transition-all" style={{ width: `${((j.shortlisted_count ?? 0) / total) * 100}%` }} />
                          <div className="bg-emerald-500 transition-all" style={{ width: `${((j.hired_count ?? 0) / total) * 100}%` }} />
                          <div className="bg-red-400 transition-all" style={{ width: `${((j.rejected_count ?? 0) / total) * 100}%` }} />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Features */}
                  <td className="px-2 py-2" style={{ width: colW.features }}>
                    <div className="rounded-lg border-2 border-slate-200 overflow-hidden shadow-sm bg-white">
                      <div className="grid grid-cols-4 divide-x divide-slate-200 border-b-2 border-slate-200">
                        {[
                          { key: 'C', color: 'bg-sky-50 text-sky-600' },
                          { key: 'I', color: 'bg-violet-50 text-violet-600' },
                          { key: 'A', color: 'bg-amber-50 text-amber-600' },
                          { key: 'S', color: 'bg-teal-50 text-teal-600' },
                        ].map(f => (
                          <div key={f.key} className={`flex items-center justify-center py-1 ${f.color}`}>
                            <span className="text-[9px] font-black uppercase tracking-widest">{f.key}</span>
                          </div>
                        ))}
                      </div>
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
                    {dl ? (
                      <div>
                        <p className={`font-medium ${new Date(j.end_date) < new Date() && j.status === 'Active' ? 'text-red-500' : 'text-slate-700'}`}>
                          {dl.date}
                        </p>
                        {new Date(j.end_date) < new Date() && j.status === 'Active' && (
                          <p className="text-red-400 text-[10px]">Expired</p>
                        )}
                      </div>
                    ) : <span className="text-slate-300">—</span>}
                  </td>

                  {/* Location */}
                  <td className="px-3 py-2.5 text-xs text-slate-600 overflow-hidden" style={{ width: colW.location }}>
                    {j.location ? <p className="truncate">{j.location}</p> : <span className="text-slate-300">—</span>}
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