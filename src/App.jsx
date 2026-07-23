import { useState, Fragment, useEffect } from 'react';
import {
  Download, Plus, Trash2, ChevronDown, ChevronUp,
  Pencil, Check, X, AlertTriangle, AlertCircle,
  CheckCircle2, Clock, BarChart2, BookOpen, Zap,
  Target, Users, Calendar, TrendingUp, Search
} from 'lucide-react';

// ─── MILESTONE DEFINITIONS (user can visually see the breakdown) ───────────────
const MILESTONES = [
  { id: 'team',       label: 'Pembentukan Tim & Rapat Awal',    pct: 10 },
  { id: 'proposal',   label: 'Pembuatan Proposal Kegiatan',      pct: 15 },
  { id: 'submission', label: 'Pengajuan Proposal ke Sekolah',    pct: 10 },
  { id: 'approval',   label: 'Acc Sekolah / Sponsor / Izin',     pct: 15 },
  { id: 'prep',       label: 'Persiapan Teknis & Logistik',      pct: 15 },
  { id: 'gladi',      label: 'Gladi Bersih / Final Check',       pct: 10 },
  { id: 'exec',       label: 'Pelaksanaan Event / Program',      pct: 15 },
  { id: 'eval',       label: 'Evaluasi & Laporan (LPJ)',         pct: 10 },
];

const calcProgress = (checked = []) =>
  MILESTONES.reduce((s, m) => (checked.includes(m.id) ? s + m.pct : s), 0);

const getStatusInfo = (pct) => {
  if (pct === 100) return { label: 'Selesai ✓',    bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' };
  if (pct > 0)     return { label: 'On Progress',  bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500'    };
  return                   { label: 'Belum Mulai', bg: 'bg-slate-100',   text: 'text-slate-500',   dot: 'bg-slate-300'   };
};

const getDaysLeft = (endDate) => {
  if (!endDate) return null;
  return Math.ceil((new Date(endDate) - new Date()) / 86400000);
};

const ZONE_CONFIG = {
  'Zona Merah':  {
    rowBg: 'bg-red-50/70',
    leftBar: 'border-l-4 border-l-red-500',
    badge: 'bg-red-100 text-red-800',
    icon: AlertTriangle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    cardBorder: 'border-red-200',
    cardBg: 'bg-red-50',
    label: '🔴 Zona Merah',
    desc: 'Harus segera diselesaikan',
    emoji: '🔴',
  },
  'Zona Kuning': {
    rowBg: 'bg-amber-50/70',
    leftBar: 'border-l-4 border-l-amber-500',
    badge: 'bg-amber-100 text-amber-800',
    icon: AlertCircle,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    cardBorder: 'border-amber-200',
    cardBg: 'bg-amber-50',
    label: '🟡 Zona Kuning',
    desc: 'Penting, bisa dipending sementara',
    emoji: '🟡',
  },
  'Zona Hijau':  {
    rowBg: 'bg-emerald-50/70',
    leftBar: 'border-l-4 border-l-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800',
    icon: CheckCircle2,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    cardBorder: 'border-emerald-200',
    cardBg: 'bg-emerald-50',
    label: '🟢 Zona Hijau',
    desc: 'Bisa ditunda, eksekusi jika sempat',
    emoji: '🟢',
  },
};

const PROGRESS_COLOR = (pct) => {
  if (pct === 100) return '#059669';
  if (pct >= 70)   return '#2563eb';
  if (pct >= 40)   return '#f59e0b';
  return '#e2e8f0';
};

// ─── INITIAL DATA ──────────────────────────────────────────────────────────────
const INITIAL_TASKS = [
  {
    id: 1, name: 'LDKS Pengurus Baru', type: 'Program OSIS',
    priority: 'Zona Merah', startDate: '2026-06-01', endDate: '2026-06-20',
    pic: 'Divisi 1 & Ketos',
    description: 'Pelatihan dasar kepemimpinan untuk pengurus baru angkatan kelas 10.',
    notes: 'Izin sekolah sudah aman, tunggu konfirmasi villa.',
    milestones: ['team', 'proposal', 'submission', 'approval', 'prep'],
  },
  {
    id: 2, name: 'Classmeet Semester Ganjil', type: 'Event Acara',
    priority: 'Zona Kuning', startDate: '2026-07-05', endDate: '2026-07-15',
    pic: 'Divisi Olahraga',
    description: 'Lomba antar kelas setelah UAS (E-sport, Futsal, Basket).',
    notes: 'Masih cari sponsor hadiah.',
    milestones: ['team'],
  },
  {
    id: 3, name: 'Pembaruan Mading Sekolah', type: 'Program OSIS',
    priority: 'Zona Hijau', startDate: '2026-05-25', endDate: '2026-06-30',
    pic: 'Divisi Mading/Humas',
    description: 'Mengganti tema mading setiap bulan dengan konten edukatif.',
    notes: 'Bisa ditunda kalau LDKS belum beres.',
    milestones: [],
  },
];

const INITIAL_HEADER = {
  title: 'Tracker Prioritas OSIS',
  subtitle: 'Manajemen Event & Program Kerja berbasis Zona Prioritas',
  school: 'SMA Negeri / Swasta',
  period: 'Periode 2025/2026',
  ketua: 'Ketua OSIS',
};

// ─── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tasks, setTasks] = useState(() => {
    try { const s = localStorage.getItem("osis-tasks"); return s ? JSON.parse(s) : INITIAL_TASKS; }
    catch { return INITIAL_TASKS; }
  });
  const [header, setHeader] = useState(() => {
    try { const s = localStorage.getItem("osis-header"); return s ? JSON.parse(s) : INITIAL_HEADER; }
    catch { return INITIAL_HEADER; }
  });
  const [headerDraft, setHeaderDraft] = useState(() => {
    try { const s = localStorage.getItem("osis-header"); return s ? JSON.parse(s) : INITIAL_HEADER; }
    catch { return INITIAL_HEADER; }
  });
  useEffect(() => { localStorage.setItem("osis-tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("osis-header", JSON.stringify(header)); }, [header]);
  const [editHeader, setEditHeader] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filterZone, setFilterZone] = useState('all');
  const [search,     setSearch]     = useState('');

  // ── Task helpers ──────────────────────────────────────────────────────────────
  const updateTask = (id, field, val) =>
    setTasks(p => p.map(t => t.id === id ? { ...t, [field]: val } : t));

  const toggleMs = (id, msId) =>
    setTasks(p => p.map(t => {
      if (t.id !== id) return t;
      const ms = t.milestones.includes(msId)
        ? t.milestones.filter(m => m !== msId)
        : [...t.milestones, msId];
      return { ...t, milestones: ms };
    }));

  const addTask = () => {
    const newTask = {
      id: Date.now(), name: 'Program / Event Baru', type: 'Event Acara',
      priority: 'Zona Hijau', startDate: '', endDate: '', pic: '',
      description: '', notes: '', milestones: [],
    };
    setTasks(p => [...p, newTask]);
    setExpandedId(newTask.id);
  };

  const deleteTask = (id) => {
    if (expandedId === id) setExpandedId(null);
    setTasks(p => p.filter(t => t.id !== id));
  };

  // ── Export CSV ────────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const h = ['No','Nama Program/Event','Kategori','Prioritas','PIC','Tgl Mulai','Deadline','Progress (%)','Status','Milestone Selesai','Deskripsi','Catatan'];
    const rows = tasks.map((t, i) => {
      const pct  = calcProgress(t.milestones);
      const stat = getStatusInfo(pct).label;
      const ms   = t.milestones.map(id => MILESTONES.find(m => m.id === id)?.label).join('; ');
      return [i+1, t.name, t.type, t.priority, t.pic, t.startDate, t.endDate, pct, stat, ms, t.description, t.notes]
        .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
    });
    const csv  = [h.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `Tracker_OSIS_${header.school}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const total      = tasks.length;
  const selesai    = tasks.filter(t => calcProgress(t.milestones) === 100).length;
  const onProgress = tasks.filter(t => { const p = calcProgress(t.milestones); return p > 0 && p < 100; }).length;
  const belumMulai = tasks.filter(t => calcProgress(t.milestones) === 0).length;
  const countRed   = tasks.filter(t => t.priority === 'Zona Merah').length;
  const avgPct     = total > 0 ? Math.round(tasks.reduce((s,t) => s + calcProgress(t.milestones), 0) / total) : 0;

  // ── Filtered tasks ────────────────────────────────────────────────────────────
  const filtered = tasks
    .filter(t => filterZone === 'all' || t.priority === filterZone)
    .filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.pic.toLowerCase().includes(search.toLowerCase()));

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100">

      {/* ── HERO HEADER ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
        {/* Top decorative bar */}
        <div className="h-1 bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500" />

        <div className="max-w-7xl mx-auto px-5 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

            {/* Left: Identity */}
            {editHeader ? (
              <div className="flex-1 space-y-3">
                <input
                  className="w-full bg-white/10 text-white text-xl font-bold rounded-xl px-4 py-2.5 border border-white/20 focus:outline-none focus:border-white/50 placeholder-white/40"
                  value={headerDraft.title}
                  onChange={e => setHeaderDraft({...headerDraft, title: e.target.value})}
                  placeholder="Judul tracker..."
                />
                <input
                  className="w-full bg-white/10 text-white/80 text-sm rounded-xl px-4 py-2 border border-white/20 focus:outline-none focus:border-white/50 placeholder-white/40"
                  value={headerDraft.subtitle}
                  onChange={e => setHeaderDraft({...headerDraft, subtitle: e.target.value})}
                  placeholder="Subtitle / deskripsi..."
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    className="bg-white/10 text-white/80 text-sm rounded-xl px-4 py-2 border border-white/20 focus:outline-none focus:border-white/50 placeholder-white/40"
                    value={headerDraft.school}
                    onChange={e => setHeaderDraft({...headerDraft, school: e.target.value})}
                    placeholder="🏫 Nama sekolah..."
                  />
                  <input
                    className="bg-white/10 text-white/80 text-sm rounded-xl px-4 py-2 border border-white/20 focus:outline-none focus:border-white/50 placeholder-white/40"
                    value={headerDraft.period}
                    onChange={e => setHeaderDraft({...headerDraft, period: e.target.value})}
                    placeholder="📅 Periode..."
                  />
                  <input
                    className="bg-white/10 text-white/80 text-sm rounded-xl px-4 py-2 border border-white/20 focus:outline-none focus:border-white/50 placeholder-white/40"
                    value={headerDraft.ketua}
                    onChange={e => setHeaderDraft({...headerDraft, ketua: e.target.value})}
                    placeholder="👤 Ketua OSIS..."
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => { setHeader(headerDraft); setEditHeader(false); }}
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Check size={15} /> Simpan
                  </button>
                  <button
                    onClick={() => { setHeaderDraft(header); setEditHeader(false); }}
                    className="flex items-center gap-2 px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors"
                  >
                    <X size={15} /> Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">🎯</div>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight leading-tight">{header.title}</h1>
                </div>
                <p className="text-slate-400 text-sm ml-13 pl-1 mt-1">{header.subtitle}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3 ml-1">
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <BookOpen size={13} className="text-slate-500" /> {header.school}
                  </span>
                  <span className="w-px h-3 bg-slate-600" />
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar size={13} className="text-slate-500" /> {header.period}
                  </span>
                  <span className="w-px h-3 bg-slate-600" />
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Users size={13} className="text-slate-500" /> {header.ketua}
                  </span>
                </div>
              </div>
            )}

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {!editHeader && (
                <button
                  onClick={() => { setHeaderDraft(header); setEditHeader(true); }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors border border-white/10"
                >
                  <Pencil size={14} /> Edit Info
                </button>
              )}
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-emerald-900/30"
              >
                <Download size={15} /> Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-5 py-5 space-y-5">

        {/* STAT ROW */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { icon: Target,     label: 'Total',       value: total,      cls: 'text-slate-800' },
            { icon: Clock,      label: 'Belum Mulai', value: belumMulai, cls: 'text-slate-500' },
            { icon: Zap,        label: 'On Progress', value: onProgress, cls: 'text-blue-600'  },
            { icon: CheckCircle2, label: 'Selesai',   value: selesai,    cls: 'text-emerald-600'},
            { icon: AlertTriangle, label: 'Zona Merah',value: countRed,  cls: 'text-red-600'   },
            { icon: TrendingUp, label: 'Avg Progress',value: `${avgPct}%`, cls:'text-violet-600'},
          ].map(({ icon: Icon, label, value, cls }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1.5">
              <Icon size={16} className={`${cls} opacity-80`} />
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide leading-none">{label}</p>
              <p className={`text-2xl font-extrabold ${cls} leading-none`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ZONE SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(ZONE_CONFIG).map(([zone, cfg]) => {
            const Icon  = cfg.icon;
            const cnt   = tasks.filter(t => t.priority === zone).length;
            const done  = tasks.filter(t => t.priority === zone && calcProgress(t.milestones) === 100).length;
            const avgZ  = cnt > 0 ? Math.round(tasks.filter(t => t.priority === zone).reduce((s, t) => s + calcProgress(t.milestones), 0) / cnt) : 0;
            return (
              <div key={zone} className={`bg-white rounded-2xl p-5 shadow-sm border ${cfg.cardBorder} relative overflow-hidden`}>
                {/* Decorative blob */}
                <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full ${cfg.iconBg} opacity-40`} />
                <div className="relative flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl ${cfg.iconBg} shrink-0`}>
                    <Icon size={20} className={cfg.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm">{cfg.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{cfg.desc}</p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="progress-fill h-full rounded-full"
                          style={{ width: `${avgZ}%`, background: PROGRESS_COLOR(avgZ) }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600 tabular-nums shrink-0">{avgZ}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{done}/{cnt} proker selesai</p>
                  </div>
                  <span className="text-3xl font-extrabold text-slate-200 tabular-nums select-none">{cnt}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* FILTER + SEARCH BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all',          label: '📋 Semua',       count: tasks.length },
              { id: 'Zona Merah',   label: '🔴 Zona Merah',  count: tasks.filter(t => t.priority === 'Zona Merah').length },
              { id: 'Zona Kuning',  label: '🟡 Zona Kuning', count: tasks.filter(t => t.priority === 'Zona Kuning').length },
              { id: 'Zona Hijau',   label: '🟢 Zona Hijau',  count: tasks.filter(t => t.priority === 'Zona Hijau').length },
            ].map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setFilterZone(id)}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  filterZone === id
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {label}
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                  filterZone === id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>{count}</span>
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama / PIC..."
              className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 w-52"
            />
          </div>
        </div>

        {/* ── MAIN TABLE ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
              <thead>
                <tr className="bg-slate-800 text-white">
                  {[
                    { label: '#',                    w: 'w-8'   },
                    { label: 'Nama Program / Event', w: 'min-w-[180px]' },
                    { label: 'Kategori',             w: 'w-32'  },
                    { label: 'Prioritas',            w: 'w-36'  },
                    { label: 'PIC / Divisi',         w: 'w-36'  },
                    { label: 'Tgl Mulai',            w: 'w-28'  },
                    { label: 'Deadline',             w: 'w-40'  },
                    { label: 'Progress',             w: 'min-w-[160px]' },
                    { label: 'Status',               w: 'w-28'  },
                    { label: '',                     w: 'w-10'  },
                  ].map(({ label, w }) => (
                    <th key={label} className={`px-3 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider ${w}`}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((task, idx) => {
                  const pct        = calcProgress(task.milestones);
                  const stat       = getStatusInfo(pct);
                  const cfg        = ZONE_CONFIG[task.priority];
                  const daysLeft   = getDaysLeft(task.endDate);
                  const isExpanded = expandedId === task.id;

                  return (
                    <Fragment key={task.id}>
                      {/* ── MAIN ROW ── */}
                      <tr
                        className={`task-row ${cfg.rowBg} ${cfg.leftBar} border-b border-slate-100 hover:brightness-[0.97]`}
                      >
                        {/* # */}
                        <td className="px-3 py-3 text-slate-400 text-xs font-mono">{idx + 1}</td>

                        {/* Name */}
                        <td className="px-3 py-3">
                          <input
                            type="text" value={task.name}
                            onChange={e => updateTask(task.id, 'name', e.target.value)}
                            className="cell-input font-semibold text-slate-800 py-0.5"
                            placeholder="Nama kegiatan..."
                          />
                        </td>

                        {/* Type */}
                        <td className="px-3 py-3">
                          <select
                            value={task.type}
                            onChange={e => updateTask(task.id, 'type', e.target.value)}
                            className="cell-input text-slate-600 text-xs py-0.5 cursor-pointer"
                          >
                            <option>Event Acara</option>
                            <option>Program OSIS</option>
                          </select>
                        </td>

                        {/* Priority */}
                        <td className="px-3 py-3">
                          <select
                            value={task.priority}
                            onChange={e => updateTask(task.id, 'priority', e.target.value)}
                            className="cell-input font-semibold text-xs py-0.5 cursor-pointer"
                          >
                            <option value="Zona Merah">🔴 Zona Merah</option>
                            <option value="Zona Kuning">🟡 Zona Kuning</option>
                            <option value="Zona Hijau">🟢 Zona Hijau</option>
                          </select>
                        </td>

                        {/* PIC */}
                        <td className="px-3 py-3">
                          <input
                            type="text" value={task.pic}
                            onChange={e => updateTask(task.id, 'pic', e.target.value)}
                            className="cell-input text-slate-600 text-xs py-0.5"
                            placeholder="PIC / Divisi..."
                          />
                        </td>

                        {/* Start date */}
                        <td className="px-3 py-3">
                          <input
                            type="date" value={task.startDate}
                            onChange={e => updateTask(task.id, 'startDate', e.target.value)}
                            className="cell-input text-slate-500 text-xs py-0.5"
                          />
                        </td>

                        {/* Deadline */}
                        <td className="px-3 py-3">
                          <input
                            type="date" value={task.endDate}
                            onChange={e => updateTask(task.id, 'endDate', e.target.value)}
                            className="cell-input text-slate-700 font-semibold text-xs py-0.5"
                          />
                          {daysLeft !== null && task.endDate && (
                            <div className={`inline-flex items-center gap-1 text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full ${
                              daysLeft < 0    ? 'bg-red-100 text-red-700 pulse-red' :
                              daysLeft <= 3   ? 'bg-red-100 text-red-700'      :
                              daysLeft <= 7   ? 'bg-orange-100 text-orange-700':
                              daysLeft <= 14  ? 'bg-amber-100 text-amber-700'  :
                                                'bg-slate-100 text-slate-500'
                            }`}>
                              <Clock size={9} />
                              {daysLeft < 0
                                ? `Telat ${Math.abs(daysLeft)}h!`
                                : daysLeft === 0 ? 'Hari ini!'
                                : `${daysLeft}h lagi`}
                            </div>
                          )}
                        </td>

                        {/* Progress */}
                        <td className="px-3 py-3">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : task.id)}
                            className="w-full text-left group"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden min-w-[80px]">
                                <div
                                  className="progress-fill h-full rounded-full"
                                  style={{ width: `${pct}%`, background: PROGRESS_COLOR(pct) }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-700 w-8 tabular-nums text-right shrink-0">{pct}%</span>
                              {isExpanded
                                ? <ChevronUp size={12} className="text-slate-400 shrink-0" />
                                : <ChevronDown size={12} className="text-slate-400 shrink-0" />}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 group-hover:text-blue-500 transition-colors truncate">
                              {task.milestones.length}/{MILESTONES.length} tahap · tap edit
                            </p>
                          </button>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${stat.bg} ${stat.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${stat.dot}`} />
                            {stat.label}
                          </span>
                        </td>

                        {/* Delete */}
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>

                      {/* ── EXPANDED MILESTONE ROW ── */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 border-b-2 border-slate-200">
                          <td colSpan={10} className="px-5 py-5">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                              {/* LEFT: Milestones */}
                              <div>
                                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                                  <BarChart2 size={13} /> Checklist Milestone Progress
                                </h4>
                                <div className="space-y-1.5">
                                  {MILESTONES.map((ms, msIdx) => {
                                    const done = task.milestones.includes(ms.id);
                                    return (
                                      <label
                                        key={ms.id}
                                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border transition-all select-none ${
                                          done
                                            ? 'bg-emerald-50 border-emerald-200'
                                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={done}
                                          onChange={() => toggleMs(task.id, ms.id)}
                                          className="shrink-0"
                                        />
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                          done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                        }`}>{msIdx + 1}</span>
                                        <span className={`flex-1 text-sm ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                          {ms.label}
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                          done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                                        }`}>+{ms.pct}%</span>
                                      </label>
                                    );
                                  })}
                                </div>

                                {/* Total progress */}
                                <div className="mt-3 p-3.5 bg-white rounded-2xl border border-slate-200">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-600">Total Progress Keseluruhan</span>
                                    <span className="text-base font-extrabold text-slate-800">{pct}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                    <div
                                      className="progress-fill h-full rounded-full"
                                      style={{ width: `${pct}%`, background: PROGRESS_COLOR(pct) }}
                                    />
                                  </div>
                                  <p className="text-xs text-slate-400 mt-1.5">
                                    {task.milestones.length} dari {MILESTONES.length} tahap selesai
                                  </p>
                                </div>
                              </div>

                              {/* RIGHT: Notes */}
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                    📝 Deskripsi Kegiatan
                                  </label>
                                  <textarea
                                    value={task.description}
                                    onChange={e => updateTask(task.id, 'description', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white leading-relaxed"
                                    rows={3}
                                    placeholder="Tulis deskripsi singkat kegiatan ini..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                    💬 Catatan / Update Terbaru
                                  </label>
                                  <textarea
                                    value={task.notes}
                                    onChange={e => updateTask(task.id, 'notes', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white leading-relaxed"
                                    rows={3}
                                    placeholder="Kendala, update terbaru, atau hal yang perlu diingat..."
                                  />
                                </div>

                                {/* Info badges */}
                                <div className="flex flex-wrap gap-2">
                                  <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold ${cfg.badge}`}>
                                    {cfg.label}
                                  </span>
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${stat.bg} ${stat.text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${stat.dot}`} />
                                    {stat.label}
                                  </span>
                                  {task.pic && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600">
                                      <Users size={11} /> {task.pic}
                                    </span>
                                  )}
                                  {daysLeft !== null && task.endDate && (
                                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold ${
                                      daysLeft < 0    ? 'bg-red-100 text-red-700'     :
                                      daysLeft <= 7   ? 'bg-orange-100 text-orange-700':
                                                        'bg-blue-50 text-blue-700'
                                    }`}>
                                      <Clock size={11} />
                                      {daysLeft < 0
                                        ? `Telat ${Math.abs(daysLeft)} hari!`
                                        : daysLeft === 0 ? 'Deadline hari ini!'
                                        : `${daysLeft} hari menuju deadline`}
                                    </span>
                                  )}
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-semibold text-slate-500">Tidak ada proker di zona ini.</p>
              <p className="text-sm mt-1">Coba ubah filter atau tambahkan proker baru.</p>
            </div>
          )}

          {/* Add button */}
          <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-200 flex justify-center">
            <button
              onClick={addTask}
              className="flex items-center gap-2 px-7 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-sm shadow-blue-200 text-sm"
            >
              <Plus size={17} />
              Tambah Program / Event Baru
            </button>
          </div>
        </div>

        {/* ── MILESTONE LEGEND ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
            <BarChart2 size={13} /> Panduan Tahapan & Bobot Progress
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MILESTONES.map((ms, i) => (
              <div key={ms.id} className="flex items-start gap-2.5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-slate-700 font-semibold leading-snug">{ms.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-bold">+{ms.pct}% progress</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 pb-4">
          Tracker Prioritas OSIS • Data tersimpan sementara di browser • Export CSV untuk backup permanen
        </p>

      </div>
    </div>
  );
}
