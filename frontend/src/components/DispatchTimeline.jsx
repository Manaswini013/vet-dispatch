function DispatchTimeline({ caseItem }) {
  if (!caseItem) return null;

  const events = [
    { time: caseItem.created_at ? new Date(caseItem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—', label: 'Case reported' },
    { time: caseItem.urgency ? 'AI' : '—', label: `AI classified as ${caseItem.urgency || 'UNKNOWN'}` },
    { time: caseItem.assigned_vet_id ? 'Dispatch' : '—', label: caseItem.assigned_vet_id ? `Vet ${caseItem.assigned_vet_id} selected` : 'Evaluation pending' },
    { time: caseItem.estimated_arrival_minutes ? `${caseItem.estimated_arrival_minutes} min` : '—', label: 'ETA calculated' },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Dispatch Timeline</div>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={`${event.label}-${index}`} className="flex gap-3">
            <div className="relative flex w-20 flex-col items-center">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-900" />
              {index < events.length - 1 && <div className="mt-1 h-full w-px bg-slate-200" />}
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{event.time}</div>
              <div className="text-sm text-slate-700">{event.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DispatchTimeline;
