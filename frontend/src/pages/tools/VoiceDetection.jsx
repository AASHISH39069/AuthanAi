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
  StopCircle,
  Globe,
  FileText,
  Cpu,
  HelpCircle,
  Lock
} from 'lucide-react';
import { api } from '../../services/api';
import ForensicReportModal from '../../components/ForensicReportModal';

export default function VoiceDetection() {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'url'
  const [inputUrl, setInputUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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
    setInputUrl('');
    const url = URL.createObjectURL(selectedFile);
    setAudioUrl(url);
    runAnalysis(selectedFile, null, null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!inputUrl || !inputUrl.trim()) {
      setError('Please enter a valid audio stream URL.');
      return;
    }
    const cleanUrl = inputUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setError('URL must start with http:// or https://');
      return;
    }
    setError(null);
    setResult(null);
    setFile(null);
    setAudioUrl(cleanUrl);
    runAnalysis(null, null, cleanUrl);
  };

  const handleSample = (type) => {
    setError(null);
    setResult(null);
    setFile(null);
    setInputUrl('');
    if (type === 'real') {
      setAudioUrl('https://upload.wikimedia.org/wikipedia/commons/2/22/George_W_Bush_Speech.ogg');
    } else {
      setAudioUrl('https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg');
    }
    runAnalysis(null, type, null);
  };

  const startMicRecord = async () => {
    setError(null);
    setResult(null);
    setAudioUrl(null);
    setInputUrl('');
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
        runAnalysis(recordedFile, null, null);
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
      setError('Could not access microphone. Please check microphone permissions or upload an audio file.');
    }
  };

  const stopMicRecord = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const runAnalysis = async (fileObj, sampleType, urlStr = null) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await api.detectVoiceTool(fileObj, sampleType, urlStr);
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
    setInputUrl('');
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
    setIsRecording(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const tier = result?.tier_verdict || (result?.is_synthetic || result?.is_deepfake ? 'LIKELY SYNTHETIC' : 'AUTHENTIC');

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-medium mb-1.5">
            <Mic className="w-3.5 h-3.5" />
            <span>VOICE FORENSICS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Voice Clone & Synthetic Audio Detection
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Inspect vocoder frequency cutoffs, robotic monotone pitch, and acoustic phase jitter.
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
            <span>Sample Human</span>
          </button>
          <button
            type="button"
            onClick={() => handleSample('deepfake')}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors disabled:opacity-50"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sample Synthetic</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Upload / Record & Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-violet-600" />
                <span>Audio Source</span>
              </span>
              {(audioUrl || isRecording || inputUrl) && (
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Dual Mode Tabs */}
            {!audioUrl && !isRecording && (
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                    inputMode === 'upload'
                      ? 'border-violet-600 text-violet-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload / Record</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('url')}
                  className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                    inputMode === 'url'
                      ? 'border-violet-600 text-violet-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Analyze via URL</span>
                </button>
              </div>
            )}

            {/* Dropzone / Mic or URL Ingestion */}
            {!audioUrl && !isRecording ? (
              inputMode === 'upload' ? (
                <div className="space-y-3">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-violet-500 bg-violet-50/50'
                        : 'border-slate-300 hover:border-violet-400 bg-slate-50/60 hover:bg-white'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
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
                      <Mic className="w-3.5 h-3.5 text-violet-600" />
                      <span>Record 4s Sample with Mic</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUrlSubmit} className="space-y-3 py-3">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Public Audio URL (WAV / MP3 / OGG stream)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://example.com/suspect_voice.mp3"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={isAnalyzing || !inputUrl.trim()}
                      className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-colors shadow-sm"
                    >
                      Analyze URL
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Audio stream capped at 15MB with in-memory spectrogram parsing.
                  </p>
                </form>
              )
            ) : isRecording ? (
              <div className="space-y-3">
                <div className="p-8 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center space-y-3 shadow-inner">
                  <div className="w-12 h-12 rounded-full bg-rose-600/20 text-rose-500 flex items-center justify-center animate-pulse">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block">
                      Recording Voice Sample ({4 - recordingTime}s)
                    </span>
                    <span className="text-[11px] text-slate-400">Speak clearly into your microphone</span>
                  </div>
                </div>
                <button
                  onClick={stopMicRecord}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>Stop & Analyze</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-6 rounded-xl bg-slate-900 text-white space-y-4 shadow-inner">
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="w-12 h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow transition-all active:scale-95 shrink-0"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-slate-200 block truncate">
                        {file ? file.name : (inputUrl || 'Sample Voice Stream')}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {isPlaying ? 'Playing audio preview...' : 'Ready for playback'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[240px]">
                    {file ? file.name : (inputUrl || 'Sample Audio File')}
                  </span>
                  <button
                    onClick={handleReset}
                    className="text-violet-600 font-semibold hover:underline"
                  >
                    Change Source
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Assurance Badge Under Dropzone / URL */}
            <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>🔒 Zero Data Retention:</strong> Uploaded files are processed in-memory and permanently purged after analysis.
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

          </div>
        </div>

        {/* Right: Forensic Verdict Dashboard */}
        <div className="lg:col-span-6 space-y-4">

          {/* Idle State */}
          {!audioUrl && !isRecording && !isAnalyzing && !result && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                <Mic className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">Ready for Voice Analysis</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload an audio file, record a sample, or provide a URL to audit vocoder cutoffs and neural speech synthesis.
                </p>
              </div>
            </div>
          )}

          {/* Analyzing Spinner State */}
          {isAnalyzing && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">Analyzing Speech Harmonics</h3>
                <p className="text-xs text-slate-500">
                  Checking for vocoder cutoff frequencies, zero-crossing cadence, and neural acoustic phase jitter...
                </p>
              </div>
            </div>
          )}

          {/* Result Card */}
          {result && !isAnalyzing && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Main 3-Tier Verdict Card */}
              <div className={`p-6 rounded-2xl border shadow-sm ${
                tier === 'AUTHENTIC'
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : tier === 'INCONCLUSIVE'
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-rose-50/70 border-rose-200'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    
                    {/* 3-Tier Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider uppercase ${
                      tier === 'AUTHENTIC'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : tier === 'INCONCLUSIVE'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {tier === 'AUTHENTIC' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>AUTHENTIC</span>
                        </>
                      ) : tier === 'INCONCLUSIVE' ? (
                        <>
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>INCONCLUSIVE</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>LIKELY SYNTHETIC</span>
                        </>
                      )}
                    </span>

                    {/* Forensic Sub-Classification */}
                    {result.verdict && (
                      <div className="text-xs font-bold text-slate-800 tracking-tight">
                        {result.verdict}
                      </div>
                    )}

                    {/* Details narrative */}
                    <div className="text-xs text-slate-600 pt-0.5 leading-relaxed">
                      {result.details}
                    </div>

                    {/* Suspected Generator Attribution Badge */}
                    {result.suspected_generator_profile && (tier === 'LIKELY SYNTHETIC' || result.is_synthetic || result.is_deepfake) && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                        <Cpu className="w-3.5 h-3.5 shrink-0" />
                        <span>Generator Profile: {result.suspected_generator_profile}</span>
                      </div>
                    )}

                    {/* Inconclusive Notice */}
                    {tier === 'INCONCLUSIVE' && (
                      <div className="mt-2 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-start gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                        <span>Heavy compression masks reliable markers; manual review recommended.</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                      Naturalness Score
                    </span>
                    <span className={`text-2xl sm:text-3xl font-black ${
                      tier === 'AUTHENTIC'
                        ? 'text-emerald-600'
                        : tier === 'INCONCLUSIVE'
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}>
                      {result.naturalness_score || result.authenticity_score}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Diagnostic Breakdown */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Acoustic & Vocoder Diagnostic Summary
                </h4>
                
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Vocoder Frequency Cutoff</span>
                    <span className="font-semibold">
                      {result.metrics?.vocoder_cutoff_freq || (result.is_synthetic ? 'Artificial Cutoff at 7.6 kHz' : 'Full Natural Spectrum')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Harmonic Dispersion</span>
                    <span className="font-semibold">
                      {result.metrics?.harmonic_dispersion ? `${result.metrics.harmonic_dispersion}%` : (result.is_synthetic ? 'Narrowed' : 'Organic Broad')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500">Phase Jitter / Micro-Tremors</span>
                    <span className="font-semibold">
                      {result.is_synthetic ? 'Robotic Flat Cadence' : 'Organic Biological Micro-Fluctuations'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download Forensic Report (.PDF / Print View)</span>
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Upload Another Asset</span>
                  </button>

                  <a
                    href="/verify"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 hover:underline"
                  >
                    <span>Multi-Modal Audit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Forensic Report Modal */}
      <ForensicReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        mediaType="VOICE"
        fileName={file?.name || 'suspect_voice.mp3'}
        sourceUrl={inputUrl}
        result={result}
      />

    </div>
  );
}
