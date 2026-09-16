import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, PencilLine, ShieldAlert, Sparkles } from 'lucide-react';
import EmergencyButton from '../components/EmergencyButton.jsx';
import Navbar from '../components/Navbar.jsx';
import TriageCard from '../components/TriageCard.jsx';
import VoiceRecorder from '../components/VoiceRecorder.jsx';
import { analyzeText, analyzeVoice, createCase } from '../services/api.js';

const DEMO_LOCATION = {
  latitude: 17.385,
  longitude: 78.4867,
  address: 'Hyderabad',
};

function ReportEmergency() {
  const [description, setDescription] = useState('');
  const [triage, setTriage] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState('');
  const [farmerInfo, setFarmerInfo] = useState({ name: '', phone: '', address: DEMO_LOCATION.address, latitude: DEMO_LOCATION.latitude, longitude: DEMO_LOCATION.longitude });
  const [dispatchResult, setDispatchResult] = useState(null);
  const [showDispatchForm, setShowDispatchForm] = useState(false);
  const textareaRef = useRef(null);

  const handleVoiceResult = async (payload) => {
    if (payload.error) {
      setError(payload.error);
      return;
    }

    if (payload.audioBlob) {
      setIsAnalyzing(true);
      setError('');
      try {
        const result = await analyzeVoice(payload.audioBlob);
        const nextText = result?.transcription?.text || '';
        setTranscript(nextText);
        setDescription(nextText);
        setTriage(result?.triage || null);
      } catch (err) {
        setError(err.message || 'Something went wrong while analyzing the report.');
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }
  };

  const handleTextSubmit = async () => {
    if (!description.trim()) {
      setError('Please describe what is happening to the animal.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    try {
      const result = await analyzeText(description);
      setTriage(result?.triage || null);
      setTranscript(description);
    } catch (err) {
      setError(err.message || 'Something went wrong while analyzing the report.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDispatchRequest = async () => {
    if (!description.trim()) {
      setError('Please add the animal description before requesting veterinary help.');
      return;
    }

    setIsRequesting(true);
    setError('');
    try {
      const body = {
        farmer_name: farmerInfo.name || undefined,
        farmer_phone: farmerInfo.phone || undefined,
        description,
        latitude: Number(farmerInfo.latitude),
        longitude: Number(farmerInfo.longitude),
        address: farmerInfo.address || 'Hyderabad',
      };

      const result = await createCase(body);
      setDispatchResult(result?.dispatch || null);
      setShowDispatchForm(false);
    } catch (err) {
      setError(err.message || 'Unable to request veterinary help right now.');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="shell py-8 md:py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Emergency reporting</div>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">What is happening to your animal?</h2>
                <p className="mt-2 text-slate-600">Describe the problem in your own words.</p>
              </div>
              <div className="flex items-center justify-center">
                <VoiceRecorder onAnalysis={handleVoiceResult} loading={isAnalyzing} disabled={isRequesting} />
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            {transcript && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">You said:</div>
                <p className="text-base leading-7 text-slate-700">{transcript}</p>
              </div>
            )}

            <div className="mt-6">
              <label htmlFor="animal-description" className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
              <textarea
                id="animal-description"
                ref={textareaRef}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Example: My goat has been vomiting and is very weak..."
                className="input-field min-h-[150px] resize-none"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <EmergencyButton onClick={handleTextSubmit} variant="primary" className="flex-1">
                {isAnalyzing ? 'Analyzing...' : 'Analyze Emergency'}
              </EmergencyButton>
              <button type="button" className="secondary-button" onClick={() => setDescription('')}>
                Clear
              </button>
            </div>
          </div>

          {isAnalyzing && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <Sparkles className="animate-pulse text-sky-600" size={18} />
                <span className="font-medium">Analyzing your report...</span>
              </div>
            </div>
          )}

          {triage && (
            <div className="space-y-5">
              <TriageCard triage={triage} />

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex items-center gap-2 text-slate-900">
                  <ShieldAlert size={18} className="text-red-500" />
                  <h3 className="text-xl font-bold">Get a veterinarian</h3>
                </div>

                {!showDispatchForm && (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <EmergencyButton onClick={() => setShowDispatchForm(true)} variant="danger">
                      Request Veterinary Help
                    </EmergencyButton>
                  </div>
                )}

                {showDispatchForm && (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Name (optional)</label>
                      <input value={farmerInfo.name} onChange={(event) => setFarmerInfo({ ...farmerInfo, name: event.target.value })} className="input-field" placeholder="Farmer name" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Phone (optional)</label>
                      <input value={farmerInfo.phone} onChange={(event) => setFarmerInfo({ ...farmerInfo, phone: event.target.value })} className="input-field" placeholder="Phone" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
                      <input value={farmerInfo.address} onChange={(event) => setFarmerInfo({ ...farmerInfo, address: event.target.value })} className="input-field" placeholder="Address" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Latitude</label>
                      <input value={farmerInfo.latitude} type="number" step="0.0001" onChange={(event) => setFarmerInfo({ ...farmerInfo, latitude: event.target.value })} className="input-field" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Longitude</label>
                      <input value={farmerInfo.longitude} type="number" step="0.0001" onChange={(event) => setFarmerInfo({ ...farmerInfo, longitude: event.target.value })} className="input-field" />
                    </div>
                    <div className="md:col-span-2 flex flex-wrap gap-3">
                      <button type="button" className="secondary-button" onClick={() => setFarmerInfo({ ...farmerInfo, latitude: DEMO_LOCATION.latitude, longitude: DEMO_LOCATION.longitude, address: DEMO_LOCATION.address })}>
                        <MapPin size={15} className="mr-2" />
                        Use demo location
                      </button>
                      <EmergencyButton onClick={handleDispatchRequest} variant="primary" className="flex-1 min-w-[220px]">
                        {isRequesting ? 'Finding veterinarian...' : 'Find a Veterinarian'}
                      </EmergencyButton>
                    </div>
                  </div>
                )}
              </div>

              {dispatchResult && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
                  {dispatchResult.assigned ? (
                    <>
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Veterinarian Assigned</div>
                      <div className="mt-3 text-2xl font-bold text-slate-900">{dispatchResult.vet_name}</div>
                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Estimated arrival</div>
                          <div className="mt-2 text-2xl font-bold text-slate-900">{dispatchResult.estimated_arrival_minutes} min</div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Distance</div>
                          <div className="mt-2 text-2xl font-bold text-slate-900">{dispatchResult.distance_km} km</div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Status</div>
                          <div className="mt-2 text-xl font-bold text-slate-900">{dispatchResult.case_status}</div>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-700">{dispatchResult.reason}</p>
                    </>
                  ) : (
                    <>
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Dispatch status</div>
                      <div className="mt-3 text-2xl font-bold text-slate-900">No veterinarian is currently available.</div>
                      <p className="mt-3 text-sm text-slate-700">Your emergency has been placed in the waiting queue.</p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {!triage && !isAnalyzing && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              <PencilLine className="mx-auto mb-3 text-slate-400" size={28} />
              <div className="text-lg font-semibold text-slate-700">Your triage result will appear here.</div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default ReportEmergency;
