import { Link, useLocation } from 'react-router-dom';
import { PawPrint } from 'lucide-react';

function Navbar() {
  const location = useLocation();
  const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Report', to: '/report' },
    { label: 'Vet Dashboard', to: '/vet' },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="shell flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3" aria-label="VetRescue home">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <PawPrint size={18} />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">VetRescue</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Emergency Animal Care</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${location.pathname === item.to ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          AI Online
        </div>
      </div>
    </header>
  );
}

export default Navbar;
