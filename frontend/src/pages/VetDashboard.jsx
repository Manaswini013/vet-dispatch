import { useEffect, useMemo, useState } from 'react';
import { BellRing, HeartPulse, Plus, RefreshCw, Users } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import StatsCard from '../components/StatsCard.jsx';
import CaseCard from '../components/CaseCard.jsx';
import VetCard from '../components/VetCard.jsx';
import ErrorState from '../components/ErrorState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import DispatchTimeline from '../components/DispatchTimeline.jsx';
import { assignCase, cancelCase, completeCase, getCaseQueue, getVets, updateVetStatus, addVet } from '../services/api.js';

function VetDashboard() {
  const [queue, setQueue] = useState({ critical: [], urgent: [], non_urgent: [], unknown: [] });
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newVet, setNewVet] = useState({ name: '', phone: '', specializations: 'general', latitude: '17.3850', longitude: '78.4867' });

  const refreshData = async () => {
    setLoading(true);
    setError('');
    try {
      const [queueResponse, vetResponse] = await Promise.all([getCaseQueue(), getVets()]);
      setQueue(queueResponse?.queue || { critical: [], urgent: [], non_urgent: [], unknown: [] });
      setVets(vetResponse?.vets || []);
    } catch (err) {
      setError('Veterinary AI service is unavailable. Make sure the local AI backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const timer = setInterval(refreshData, 5000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const allCases = [...(queue.critical || []), ...(queue.urgent || []), ...(queue.non_urgent || []), ...(queue.unknown || [])];
    return {
      critical: (queue.critical || []).length,
      urgent: (queue.urgent || []).length,
      waiting: allCases.length,
      available: (vets || []).filter((vet) => vet.status === 'AVAILABLE').length,
    };
  }, [queue, vets]);

  const handleAssignment = async (caseId) => {
    try {
      await assignCase(caseId);
      await refreshData();
    } catch (err) {
      setError(err.message || 'Unable to assign a vet right now.');
    }
  };

  const handleComplete = async (caseId) => {
    try {
      await completeCase(caseId);
      await refreshData();
    } catch (err) {
      setError(err.message || 'Unable to complete the case.');
    }
  };

  const handleCancel = async (caseId) => {
    try {
      await cancelCase(caseId);
      await refreshData();
    } catch (err) {
      setError(err.message || 'Unable to cancel the case.');
    }
  };

  const handleStatusChange = async (vetId, status) => {
    try {
      await updateVetStatus(vetId, status);
      await refreshData();
    } catch (err) {
      setError(err.message || 'Unable to update status.');
    }
  };

  const handleAddVet = async () => {
    try {
      const payload = {
        name: newVet.name,
        phone: newVet.phone,
        specializations: (newVet.specializations || 'general').split(',').map((item) => item.trim()).filter(Boolean),
        latitude: Number(newVet.latitude),
        longitude: Number(newVet.longitude),
      };
      await addVet(payload);
      setShowModal(false);
      setNewVet({ name: '', phone: '', specializations: 'general', latitude: '17.3850', longitude: '78.4867' });
      await refreshData();
    } catch (err) {
      setError(err.message || 'Unable to add a veterinarian.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="shell py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Dispatch center</div>
            <h1 className="mt-2 text-3xl font-black text-slate-900">Emergency Dispatch</h1>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={refreshData} className="secondary-button">
              <RefreshCw size={16} className="mr-2" /> Refresh
            </button>
            <button type="button" onClick={() => setShowModal(true)} className="primary-button">
              <Plus size={16} className="mr-2" /> Add Vet
            </button>
          </div>
        </div>

        {error && <div className="mb-6"><ErrorState title="Service unavailable" message={error} onRetry={refreshData} /></div>}

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <StatsCard label="Critical Cases" value={stats.critical} tone="critical" />
          <StatsCard label="Urgent Cases" value={stats.urgent} tone="urgent" />
          <StatsCard label="Waiting" value={stats.waiting} tone="waiting" />
          <StatsCard label="Available Vets" value={stats.available} tone="available" />
        </div>

        {loading ? (
          <LoadingState message="Loading emergency queue..." />
        ) : (
          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="mb-5 flex items-center gap-2">
                  <BellRing className="text-red-600" size={18} />
                  <h2 className="text-xl font-bold text-slate-900">Emergency Queue</h2>
                </div>

                <div className="space-y-5">
                  {['CRITICAL', 'URGENT', 'NON_URGENT', 'UNKNOWN'].map((level) => {
                    const items = queue[level.toLowerCase().replace('_', '_')] || queue[level === 'NON_URGENT' ? 'non_urgent' : level === 'URGENT' ? 'urgent' : level === 'CRITICAL' ? 'critical' : 'unknown'] || [];
                    return (
                      <div key={level}>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{level}</div>
                          <div className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{items.length}</div>
                        </div>
                        <div className="space-y-3">
                          {items.length ? items.map((caseItem) => (
                            <CaseCard
                              key={caseItem.id}
                              caseItem={caseItem}
                              onAssign={handleAssignment}
                              onComplete={handleComplete}
                              onCancel={handleCancel}
                            />
                          )) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                              No active emergencies
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="mb-5 flex items-center gap-2">
                  <Users className="text-sky-600" size={18} />
                  <h2 className="text-xl font-bold text-slate-900">Veterinarians</h2>
                </div>

                {vets.length ? (
                  <div className="space-y-3">
                    {vets.map((vet) => (
                      <VetCard key={vet.id} vet={vet} onStatusChange={handleStatusChange} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">No veterinarians found</div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="mb-4 flex items-center gap-2">
                  <HeartPulse className="text-emerald-600" size={18} />
                  <h2 className="text-xl font-bold text-slate-900">Dispatch History</h2>
                </div>
                <DispatchTimeline caseItem={queue.critical?.[0] || queue.urgent?.[0] || queue.non_urgent?.[0] || queue.unknown?.[0]} />
              </div>
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Add Veterinarian</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-sm text-slate-500">Close</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                <input value={newVet.name} onChange={(event) => setNewVet({ ...newVet, name: event.target.value })} className="input-field" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                <input value={newVet.phone} onChange={(event) => setNewVet({ ...newVet, phone: event.target.value })} className="input-field" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Specializations</label>
                <input value={newVet.specializations} onChange={(event) => setNewVet({ ...newVet, specializations: event.target.value })} className="input-field" placeholder="large_animals, general" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Latitude</label>
                  <input value={newVet.latitude} onChange={(event) => setNewVet({ ...newVet, latitude: event.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Longitude</label>
                  <input value={newVet.longitude} onChange={(event) => setNewVet({ ...newVet, longitude: event.target.value })} className="input-field" />
                </div>
              </div>

              <button type="button" onClick={handleAddVet} className="primary-button w-full">
                Save Veterinarian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VetDashboard;
