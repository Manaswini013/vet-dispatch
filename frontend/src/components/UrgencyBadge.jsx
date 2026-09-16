const styles = {
  CRITICAL: 'border-red-200 bg-red-50 text-red-700',
  URGENT: 'border-orange-200 bg-orange-50 text-orange-700',
  NON_URGENT: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  UNKNOWN: 'border-slate-200 bg-slate-100 text-slate-600',
};

const labels = {
  CRITICAL: 'CRITICAL',
  URGENT: 'URGENT',
  NON_URGENT: 'NON-URGENT',
  UNKNOWN: 'MORE INFO',
};

function UrgencyBadge({ level }) {
  const normalized = String(level || 'UNKNOWN').toUpperCase();
  return (
    <span className={`status-pill ${styles[normalized] || styles.UNKNOWN}`}>
      {labels[normalized] || labels.UNKNOWN}
    </span>
  );
}

export default UrgencyBadge;
