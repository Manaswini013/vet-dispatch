import { AlertTriangle, Clock3, MapPin, ShieldAlert, Stethoscope } from 'lucide-react';
import UrgencyBadge from './UrgencyBadge.jsx';

function TriageCard({ triage }) {
  if (!triage) return null;

  const species = triage.animal?.species || 'Unknown animal';
  const confidence = typeof triage.confidence === 'number' ? Math.round(triage.confidence * 100) : 0;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">AI Triage Assessment</div>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{species}</h3>
        </div>
        <UrgencyBadge level={triage.urgency} />
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <ShieldAlert size={16} />
            Emergency status
          </div>
          <div className="text-lg font-bold text-slate-900">
            {triage.urgency === 'CRITICAL' && 'Immediate veterinary attention recommended.'}
            {triage.urgency === 'URGENT' && 'Veterinary attention needed soon.'}
            {triage.urgency === 'NON_URGENT' && 'No obvious emergency indicators were identified from the information provided.'}
            {triage.urgency === 'UNKNOWN' && 'More information needed before a clear urgency can be assessed.'}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><Stethoscope size={16} /> Symptoms</div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {(triage.symptoms || []).length ? triage.symptoms.map((item) => <li key={item}>{item}</li>) : <li>No symptoms provided.</li>}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><Clock3 size={16} /> Duration</div>
            <p className="text-sm text-slate-700">{triage.duration || 'Not provided'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><AlertTriangle size={16} /> Red flags</div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            {(triage.red_flags || []).length ? triage.red_flags.map((flag) => <li key={flag}>{flag}</li>) : <li>No emergency red flags identified.</li>}
          </ul>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">AI confidence</div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{confidence}%</div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Follow-up</div>
            <div className="mt-2 text-sm text-slate-700">{triage.follow_up_question || 'No follow-up question required.'}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"><MapPin size={16} /> Assessment</div>
          <p className="text-sm leading-6 text-slate-700">{triage.reason || 'The information provided was reviewed for urgency and reporting context.'}</p>
        </div>
      </div>
    </div>
  );
}

export default TriageCard;
