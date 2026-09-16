import { Clock3, MapPin, User, Stethoscope } from 'lucide-react';
import UrgencyBadge from './UrgencyBadge.jsx';

function formatRelativeTime(createdAt) {
  if (!createdAt) return 'Unknown time';
  const value = new Date(createdAt);
  if (Number.isNaN(value.getTime())) return 'Unknown time';
  return value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function CaseCard({ caseItem, onAssign, onComplete, onCancel }) {
  const status = caseItem?.status || 'WAITING';
  const urgency = caseItem?.urgency || 'UNKNOWN';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Case #{caseItem?.id?.slice(-6) || '---'}</div>
          <div className="mt-1 text-lg font-bold text-slate-900">{caseItem?.animal?.species || 'Unknown animal'}</div>
        </div>
        <UrgencyBadge level={urgency} />
      </div>

      <div className="space-y-3 text-sm text-slate-600">
        <div className="flex items-center gap-2"><Stethoscope size={14} /> {caseItem?.symptoms?.join(', ') || 'No symptoms listed'}</div>
        <div className="flex items-center gap-2"><MapPin size={14} /> {caseItem?.location?.address || 'Location pending'}</div>
        <div className="flex items-center gap-2"><Clock3 size={14} /> {formatRelativeTime(caseItem?.created_at)}</div>
        <div className="flex items-center gap-2"><User size={14} /> {caseItem?.assigned_vet_id ? `Assigned to ${caseItem.assigned_vet_id}` : 'Waiting for assignment'}</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {status === 'WAITING' && (
          <button type="button" onClick={() => onAssign?.(caseItem.id)} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Assign Vet</button>
        )}
        {status === 'ASSIGNED' && (
          <button type="button" onClick={() => onComplete?.(caseItem.id)} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Complete</button>
        )}
        {(status === 'WAITING' || status === 'ASSIGNED') && (
          <button type="button" onClick={() => onCancel?.(caseItem.id)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">Cancel</button>
        )}
      </div>
    </div>
  );
}

export default CaseCard;
