import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Mic, ShieldCheck, Stethoscope } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';

function FarmerHome() {
  const trustItems = ['AI-assisted triage', 'Fast vet dispatch', 'Any animal'];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="shell py-10 md:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-5 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
              Emergency response, simplified
            </div>
            <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Your animal needs help?
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
              Tell us what is happening. Our AI will organize the information for a veterinarian and help prioritize the emergency.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/report" className="primary-button text-center">
                Report an Emergency
              </Link>
              <Link to="/report" className="secondary-button text-center">
                I want to type instead
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {trustItems.map((item) => (
                <div key={item} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                  <ShieldCheck size={15} className="text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="rounded-[28px] bg-slate-900 p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Speak naturally</div>
                  <div className="mt-2 text-2xl font-bold">Telugu • Hindi • English • More</div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg">
                  <Mic size={28} />
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <Activity className="text-red-300" size={18} />
                  Emergency triage in plain language
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-orange-300" />
                  <div className="h-3 w-3 rounded-full bg-emerald-300" />
                  <div className="h-3 w-3 rounded-full bg-slate-300" />
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                <Stethoscope className="mx-auto text-slate-700" size={18} />
                <div className="mt-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Triage</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                <Activity className="mx-auto text-slate-700" size={18} />
                <div className="mt-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Dispatch</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                <ArrowRight className="mx-auto text-slate-700" size={18} />
                <div className="mt-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Support</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default FarmerHome;
