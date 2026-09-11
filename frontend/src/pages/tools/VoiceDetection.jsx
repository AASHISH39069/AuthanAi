import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight,
  Play,
  Pause,
  StopCircle
} from 'lucide-react';
import { api } from '../../services/api';

export default function VoiceDetection() {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('audio/')) {
      setError('Please select a valid audio file (WAV, MP3, M4A, or OGG).');
      return;
    }
    setError(null);
    setResult(null);
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setAudioUrl(url);
    runAnalysis(selectedFile, null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSample = (type) => {
    setError(null);
    setResult(null);
    setFile(null);
    if (type === 'real') {
      setAudioUrl('https://upload.wikimedia.org/wikipedia/commons/2/22/George_W_Bush_Speech.ogg');
    } else {
      setAudioUrl('https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg');
    }
    runAnalysis(null, type);
  };

  const startMicRecord = async () => {
    setError(null);
    setResult(null);
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const recordUrl = URL.createObjectURL(blob);
        setAudioUrl(recordUrl);
        const recordedFile = new File([blob], 'mic-sample.webm', { type: 'audio/webm' });
        setFile(recordedFile);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        runAnalysis(recordedFile, null);
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 4) {
            stopMicRecord();
            return 4;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      setError('Could not access microphone. Please check permissions or upload an audio file.');
    }
  };

  const stopMicRecord = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const runAnalysis = async (fileObj, sampleType) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await api.detectVoiceTool(fileObj, sampleType);
      setResult(data);
    } catch (err) {
      setError('Analysis failed. Please check network connection or try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAudioUrl(null);
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
    setIsRecording(false);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-medium mb-1.5">
            <Mic className="w-3.5 h-3.5" />
            <span>VOICE FORENSICS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Deepfake Voice Detection
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Inspect AI voice clones, ElevenLabs-style neural TTS, and synthetic monotone speech.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSample('real')}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sample Human Voice</span>
          </button>
          <button
            type="button"
            onClick={() => handleSample('deepfake')}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors disabled:opacity-50"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sample Cloned Voice</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Ingestion / Audio Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-cyan-600" />
                <span>Audio Source</span>
              </span>
              {(audioUrl || isRecording) && (
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Dropzone or Mic Recording */}
            {!audioUrl && !isRecording ? (
              <div className="space-y-3">
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-cyan-500 bg-cyan-50/50'
                      : 'border-slate-300 hover:border-cyan-400 bg-slate-50/60 hover:bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    Click to browse or drop audio here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    WAV, MP3, M4A, or OGG (Max 25MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />
                </div>

                <div className="text-center">
                  <span className="text-xs text-slate-400 block mb-2">or</span>
                  <button
                    type="button"
                    onClick={startMicRecord}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Mic className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Record 4s Speech via Microphone</span>
                  </button>
                </div>
              </div>
            ) : isRecording ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto animate-pulse">
                  <Mic className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-800">Recording Voice Sample</p>
                  <p className="text-xs text-slate-500 font-mono">{4 - recordingTime}s remaining</p>
                </div>
                <button
                  onClick={stopMicRecord}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 mx-auto shadow-sm"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>Stop & Audit</span>
                </button>
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-[240px]">
                    {file ? file.name : 'Audio Stream Sample'}
                  </span>
                  <button
                    onClick={togglePlayback}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/70">
                  <span>Audio Ingestion Complete</span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-cyan-700 font-semibold hover:underline"
                  >
                    Replace Audio
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

          </div>
        </div>

        {/* Right: Clean Immediate Verdict Dashboard */}
        <div className="lg:col-span-6 space-y-4">

          {/* Idle State */}
          {!audioUrl && !isRecording && !isAnalyzing && !result && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                <Mic className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">Ready for Acoustic Inspection</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload an audio track or record your voice to evaluate vocoder frequency cutoffs and pitch modulation.
                </p>
              </div>
            </div>
          )}

          {/* Analyzing Spinner State */}
          {isAnalyzing && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">Analyzing Voice</h3>
                <p className="text-xs text-slate-500">
                  Auditing neural vocoder cutoffs, harmonic dispersion, and zero-crossing dynamics...
                </p>
              </div>
            </div>
          )}

          {/* Result Card: Minimalist, Immediate, Human-Built */}
          {result && !isAnalyzing && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Main Verdict Card */}
              <div className={`p-6 rounded-2xl border shadow-sm ${
                result.is_synthetic 
                  ? 'bg-rose-50/70 border-rose-200' 
                  : 'bg-emerald-50/70 border-emerald-200'
              }`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase ${
                      result.is_synthetic 
                        ? 'bg-rose-100 text-rose-700 border border-rose-300' 
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    }`}>
                      {result.is_synthetic ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>DEEPFAKE DETECTED</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>AUTHENTIC</span>
                        </>
                      )}
                    </span>
                    <div className="text-xs text-slate-600 pt-1 leading-relaxed">
                      {result.details}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                      Authenticity Score
                    </span>
                    <span className={`text-2xl sm:text-3xl font-black ${
                      result.is_synthetic ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {result.naturalness_score ?? result.authenticity_score}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Simple Bullet Points */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Diagnostic Summary
                </h4>
                
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Acoustic Spectrum</span>
                    <span className="font-semibold">
                      {result.is_synthetic ? 'Vocoder Cutoff (>7.5kHz)' : 'Full Organic Frequency'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Pitch Modulation</span>
                    <span className="font-semibold">
                      {result.is_synthetic ? 'Robotic Monotone Pattern' : 'Natural Human Dynamics'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500">Vocal Tract</span>
                    <span className="font-semibold">
                      {result.is_synthetic ? 'Synthetic Phase Jitter' : 'Biological Formant Resonance'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reset Action */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Upload Another File</span>
                </button>

                <a
                  href="/verify"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:text-cyan-900 hover:underline"
                >
                  <span>Multi-Modal Audit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
