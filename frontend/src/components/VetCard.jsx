import { MapPin, Phone, Stethoscope, UserCheck, Activity } from 'lucide-react';
import UrgencyBadge from './UrgencyBadge.jsx';

function VetCard({ vet, onStatusChange }) {
  const status = vet?.status || 'AVAILABLE';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-slate-900">{vet.name}</div>
          <div className="mt-1 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            <Activity size={12} /> {status}
          </div>
        </div>
        <UrgencyBadge level={status === 'AVAILABLE' ? 'NON_URGENT' : status === 'ON_VISIT' ? 'URGENT' : 'UNKNOWN'} />
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2"><Phone size={14} /> {vet.phone || 'No phone provided'}</div>
        <div className="flex items-center gap-2"><Stethoscope size={14} /> {vet.specializations?.join(', ') || 'General'} </div>
        <div className="flex items-center gap-2"><MapPin size={14} /> {vet.latitude}, {vet.longitude}</div>
        <div className="flex items-center gap-2"><UserCheck size={14} /> Active cases: {vet.total_active_cases || 0}</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {['AVAILABLE', 'ON_VISIT', 'OFFLINE'].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onStatusChange?.(vet.id, option)}
            className={`rounded-xl px-2.5 py-2 text-[11px] font-semibold ${
              status === option ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default VetCard;
