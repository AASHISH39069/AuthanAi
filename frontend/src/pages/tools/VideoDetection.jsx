import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Camera, 
  ArrowRight,
  Play,
  Pause,
  StopCircle
} from 'lucide-react';
import { api } from '../../services/api';

export default function VideoDetection() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunksRef = useRef([]);
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
    if (!selectedFile.type.startsWith('video/')) {
      setError('Please select a video file (MP4 or WEBM).');
      return;
    }
    setError(null);
    setResult(null);
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
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
      setPreviewUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    } else {
      setPreviewUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4');
    }
    runAnalysis(null, type);
  };

  const startWebcamRecord = async () => {
    setError(null);
    setResult(null);
    setPreviewUrl(null);
    recordedChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const recordUrl = URL.createObjectURL(blob);
        setPreviewUrl(recordUrl);
        const recordedFile = new File([blob], 'webcam-sample.webm', { type: 'video/webm' });
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
          if (prev >= 5) {
            stopWebcamRecord();
            return 5;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      setError('Could not access camera. Please check camera permissions or upload a video file.');
    }
  };

  const stopWebcamRecord = () => {
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
      const data = await api.detectVideoTool(fileObj, sampleType);
      setResult(data);
    } catch (err) {
      setError('Analysis failed. Please check network connection or try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
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
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium mb-1.5">
            <Video className="w-3.5 h-3.5" />
            <span>VIDEO FORENSICS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Deepfake Video Detection
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Detect facial replacement, temporal frame flicker, and synthetic AI avatars.
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
            <span>Sample Real</span>
          </button>
          <button
            type="button"
            onClick={() => handleSample('deepfake')}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors disabled:opacity-50"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sample Deepfake</span>
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
                <Video className="w-4 h-4 text-indigo-600" />
                <span>Video Source</span>
              </span>
              {(previewUrl || isRecording) && (
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Dropzone & Live Record Option */}
            {!previewUrl && !isRecording ? (
              <div className="space-y-3">
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-indigo-500 bg-indigo-50/50'
                      : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    Click to browse or drop video here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    MP4 or WEBM (Max 50MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />
                </div>

                <div className="text-center">
                  <span className="text-xs text-slate-400 block mb-2">or</span>
                  <button
                    type="button"
                    onClick={startWebcamRecord}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Record 5s Video with Camera</span>
                  </button>
                </div>
              </div>
            ) : isRecording ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-inner">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>Recording ({5 - recordingTime}s)</span>
                  </div>
                </div>
                <button
                  onClick={stopWebcamRecord}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>Stop & Analyze</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center group shadow-inner">
                  <video
                    ref={videoRef}
                    src={previewUrl}
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[240px]">
                    {file ? file.name : 'Sample Reference Video'}
                  </span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Replace Video
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm"
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
          {!previewUrl && !isRecording && !isAnalyzing && !result && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                <Video className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">Ready for Video Inspection</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload an MP4/WEBM clip or record a 5-second sample to audit temporal continuity and face swapping.
                </p>
              </div>
            </div>
          )}

          {/* Analyzing Spinner State */}
          {isAnalyzing && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">Analyzing Video</h3>
                <p className="text-xs text-slate-500">
                  Tracking facial perimeter alignment, optical flow stability, and biological blink cadence...
                </p>
              </div>
            </div>
          )}

          {/* Result Card: Minimalist, Immediate, Human-Built */}
          {result && !isAnalyzing && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Main Verdict Card */}
              <div className={`p-6 rounded-2xl border shadow-sm ${
                result.is_deepfake 
                  ? 'bg-rose-50/70 border-rose-200' 
                  : 'bg-emerald-50/70 border-emerald-200'
              }`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase ${
                      result.is_deepfake 
                        ? 'bg-rose-100 text-rose-700 border border-rose-300' 
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    }`}>
                      {result.is_deepfake ? (
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
                      result.is_deepfake ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {result.authenticity_score}%
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
                    <span className="text-slate-500">Temporal Motion</span>
                    <span className="font-semibold">
                      {result.is_deepfake ? 'Unnatural Inter-Frame Jitter' : 'Natural Organic Flow'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Facial Blending</span>
                    <span className="font-semibold">
                      {result.is_deepfake ? 'Warp Seams Detected' : 'Continuous Boundaries'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500">Blink Continuity</span>
                    <span className="font-semibold">
                      {result.is_deepfake ? 'Erratic / Masked' : 'Biological Rhythm'}
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
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
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
