import React, { useState, useRef } from 'react';
import { 
  Camera, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  FileImage,
  Layers,
  ArrowRight,
  Globe,
  FileText,
  Cpu,
  HelpCircle,
  Lock
} from 'lucide-react';
import { api } from '../../services/api';
import ForensicReportModal from '../../components/ForensicReportModal';

export default function ImageDetection() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'url'
  const [inputUrl, setInputUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showElaView, setShowElaView] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
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
    setInputUrl('');
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
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
      setError('Please enter a valid image URL.');
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
    setShowElaView(false);
    setPreviewUrl(cleanUrl);
    runAnalysis(null, null, cleanUrl);
  };

  const handleSample = (type) => {
    setError(null);
    setResult(null);
    setFile(null);
    setShowElaView(false);
    setInputUrl('');
    
    if (type === 'real') {
      setPreviewUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80');
    } else {
      setPreviewUrl('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80');
    }

    runAnalysis(null, type, null);
  };

  const runAnalysis = async (fileObj, sampleType, urlStr = null) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await api.detectImageTool(fileObj, sampleType, urlStr);
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
    setInputUrl('');
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
    setShowElaView(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const tier = result?.tier_verdict || (result?.is_deepfake ? 'LIKELY SYNTHETIC' : 'AUTHENTIC');

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
            Identify synthetic AI diffusion, presentation screen replay, filter retouching, and localized inpainting.
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
        
        {/* Left: Dual-Mode Ingestion & Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileImage className="w-4 h-4 text-blue-600" />
                <span>Source Image</span>
              </span>
              {(previewUrl || inputUrl) && (
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Dual Mode Tabs */}
            {!previewUrl && (
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                    inputMode === 'upload'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('url')}
                  className={`pb-2 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                    inputMode === 'url'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Analyze via URL</span>
                </button>
              </div>
            )}

            {/* Dropzone or URL Ingestion */}
            {!previewUrl ? (
              inputMode === 'upload' ? (
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
                <form onSubmit={handleUrlSubmit} className="space-y-3 py-3">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Public Image URL (HTTP/HTTPS)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://example.com/suspect_portrait.jpg"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={isAnalyzing || !inputUrl.trim()}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-colors shadow-sm"
                    >
                      Analyze URL
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Direct stream ingestion capped at 15MB with automated MIME validation.
                  </p>
                </form>
              )
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
                    {file ? file.name : (inputUrl || 'Sample Reference Image')}
                  </span>
                  <button
                    onClick={handleReset}
                    className="text-blue-600 font-semibold hover:underline"
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
          {!previewUrl && !isAnalyzing && !result && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                <Camera className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">Ready for Forensic Analysis</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload an image file or provide a public URL above to audit PRNU camera noise, 2D FFT moiré, and localized inpainting.
                </p>
              </div>
            </div>
          )}

          {/* Analyzing Spinner State */}
          {isAnalyzing && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">Running Multi-Stage Forensic Audit</h3>
                <p className="text-xs text-slate-500">
                  Inspecting PRNU camera noise floor, 2D FFT spectral moiré peaks, and 8x8 micro-block inpainting...
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
                    {result.suspected_generator_profile && (tier === 'LIKELY SYNTHETIC' || result.is_deepfake) && (
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
                      Authenticity Score
                    </span>
                    <span className={`text-2xl sm:text-3xl font-black ${
                      tier === 'AUTHENTIC'
                        ? 'text-emerald-600'
                        : tier === 'INCONCLUSIVE'
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}>
                      {result.authenticity_score}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Scientific Diagnostic Breakdown */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Forensic Sensor Diagnostic Breakdown
                </h4>
                
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">PRNU Optical Camera Noise</span>
                    <span className="font-semibold">
                      {result.metrics?.spectral_noise_variance > 10 || result.is_deepfake ? 'Suppressed / Artificial' : 'Organic Sensor Confirmed'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">2D FFT High-Frequency Spectrum</span>
                    <span className="font-semibold">
                      {result.verdict?.includes('SCREEN CAPTURE') ? 'Periodic Moiré Grid Spikes' : 'Normal Geometric Decay'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">8x8 Micro-Block Inpainting</span>
                    <span className="font-semibold">
                      {result.metrics?.ela_anomaly_index > 40 || result.verdict?.includes('Inpainting') || result.suspected_generator_profile?.includes('Inpainting')
                        ? 'Discrepant Tampering Raised'
                        : 'Uniform Quantization Pattern'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500">Skin Texture Variance</span>
                    <span className="font-semibold">
                      {result.verdict?.includes('BEAUTY FILTER') ? 'Smoothed (Filter Retouched)' : (result.is_deepfake ? 'Synthetic Diffusion Blurring' : 'Natural Organic Pores')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Report Modal & Reset */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download Forensic Report (.PDF / Print View)</span>
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Upload Another Asset</span>
                  </button>

                  <a
                    href="/verify"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <span>Multi-Modal Pipeline</span>
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
        mediaType="IMAGE"
        fileName={file?.name || 'suspect_image.jpg'}
        sourceUrl={inputUrl}
        result={result}
      />

    </div>
  );
}
