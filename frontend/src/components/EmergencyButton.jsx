import { ArrowRight } from 'lucide-react';

function EmergencyButton({ children, onClick, variant = 'primary', className = '', type = 'button' }) {
  const styles = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-500',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${styles[variant]} ${className}`}
    >
      {children}
      {variant !== 'secondary' && <ArrowRight size={16} />}
    </button>
  );
}

export default EmergencyButton;
