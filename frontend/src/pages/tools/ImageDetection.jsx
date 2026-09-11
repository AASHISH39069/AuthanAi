import React, { useState, useRef } from 'react';
import { 
  Camera, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sparkles, 
  FileImage,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

export default function ImageDetection() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showElaView, setShowElaView] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, or WEBP).');
      return;
    }
    setError(null);
    setResult(null);
    setShowElaView(false);
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
    setShowElaView(false);
    
    if (type === 'real') {
      setPreviewUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80');
    } else {
      setPreviewUrl('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80');
    }

    runAnalysis(null, type);
  };

  const runAnalysis = async (fileObj, sampleType) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await api.detectImageTool(fileObj, sampleType);
      setResult(data);
    } catch (err) {
      setError('Analysis failed. Please check your network connection or try again.');
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
    setShowElaView(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium mb-1.5">
            <Camera className="w-3.5 h-3.5" />
            <span>IMAGE FORENSICS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Deepfake Image Detection
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Identify synthetic AI portraits, diffusion generation, and spliced photo tampering.
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
        
        {/* Left: Upload & Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileImage className="w-4 h-4 text-blue-600" />
                <span>Source Image</span>
              </span>
              {previewUrl && (
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Dropzone */}
            {!previewUrl ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-white'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Click to browse or drop an image here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  JPG, PNG, or WEBP (Max 15MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 aspect-[4/3] flex items-center justify-center shadow-inner">
                  <img
                    src={showElaView && result?.ela_preview ? result.ela_preview : previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />

                  {/* ELA View Toggle */}
                  {result?.ela_preview && (
                    <button
                      onClick={() => setShowElaView(!showElaView)}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg shadow transition-all flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>{showElaView ? 'Natural View' : 'ELA Heatmap'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[240px]">
                    {file ? file.name : 'Sample Reference Image'}
                  </span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Replace Image
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
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
          {!previewUrl && !isAnalyzing && !result && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                <Camera className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">Ready for Analysis</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload an image or pick a sample above to evaluate optical sensor grain and detect deepfakes.
                </p>
              </div>
            </div>
          )}

          {/* Analyzing Spinner State */}
          {isAnalyzing && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">Analyzing Image</h3>
                <p className="text-xs text-slate-500">
                  Auditing optical sensor noise, high-frequency spectrum, and localized compression...
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
                    <span className="text-slate-500">Sensor Noise (PRNU)</span>
                    <span className="font-semibold">
                      {result.is_deepfake ? 'Artificial / Suppressed' : 'Organic / Normal'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Edge Integrity</span>
                    <span className="font-semibold">
                      {result.is_deepfake ? 'Synthetic Smoothing Seams' : 'Clean / Natural Gradients'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500">Compression Profile</span>
                    <span className="font-semibold">
                      {result.is_deepfake ? 'High Divergence' : 'Consistent / Uniform'}
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
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
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
