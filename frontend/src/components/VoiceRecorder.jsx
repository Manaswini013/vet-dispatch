import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

function VoiceRecorder({ onAnalysis, loading, disabled = false }) {
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const [status, setStatus] = useState('idle');
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsed(0);
  };

  const startRecording = async () => {
    if (disabled || loading) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      onAnalysis({ error: 'Microphone access is not available in this browser.' });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
      ];
      const mimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stopTimer();
        const audioType = recorder.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(chunksRef.current, { type: audioType });
        setStatus('idle');
        if (audioBlob.size === 0) {
          onAnalysis({ error: 'No audio was captured. Please try again.' });
          return;
        }
        onAnalysis({ audioBlob });
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250);
      setStatus('recording');
      startTimer();
    } catch (error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        onAnalysis({ error: 'Microphone access is required for voice reporting.' });
      } else {
        onAnalysis({ error: 'Something went wrong while setting up the microphone.' });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setStatus('processing');
    }
  };

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        type="button"
        aria-label={status === 'recording' ? 'Stop recording' : 'Start recording'}
        onClick={status === 'recording' ? stopRecording : startRecording}
        disabled={disabled || loading}
        whileTap={{ scale: 0.97 }}
        animate={status === 'recording' ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={{ duration: 0.8, repeat: status === 'recording' ? Infinity : 0 }}
        className={`relative flex h-24 w-24 items-center justify-center rounded-full border-4 text-white shadow-xl transition ${
          status === 'recording'
            ? 'border-red-200 bg-red-500 hover:bg-red-600'
            : 'border-sky-200 bg-slate-900 hover:bg-slate-800'
        } ${disabled || loading ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        {status === 'recording' ? <Square size={28} /> : <Mic size={28} />}
        {status === 'recording' && <span className="absolute -inset-2 rounded-full border border-red-300/80" />}
      </motion.button>

      <div className="flex min-h-8 items-center gap-2 text-sm text-slate-600">
        {status === 'recording' ? (
          <>
            <Volume2 className="animate-pulse text-red-500" size={16} />
            <span className="font-medium text-slate-800">Listening...</span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{formatTime(elapsed)}</span>
          </>
        ) : status === 'processing' ? (
          <span className="font-medium text-slate-700">Analyzing your report...</span>
        ) : (
          <span className="font-medium text-slate-700">Tap to speak</span>
        )}
      </div>
    </div>
  );
}

export default VoiceRecorder;
