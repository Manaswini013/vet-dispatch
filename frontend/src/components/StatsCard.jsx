function StatsCard({ label, value, tone = 'slate' }) {
  const tones = {
    critical: 'bg-red-50 text-red-700 border-red-100',
    urgent: 'bg-orange-50 text-orange-700 border-orange-100',
    waiting: 'bg-slate-100 text-slate-700 border-slate-200',
    available: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${tones[tone] || tones.slate}`}>
        {label}
      </div>
      <div className="mt-4 text-3xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

export default StatsCard;
