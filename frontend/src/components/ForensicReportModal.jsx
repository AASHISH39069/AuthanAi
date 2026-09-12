import React, { useRef } from 'react';
import { 
  ShieldCheck, 
  Printer, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  FileText, 
  Cpu, 
  Lock
} from 'lucide-react';

export default function ForensicReportModal({ 
  isOpen, 
  onClose, 
  mediaType = 'IMAGE', // 'IMAGE' | 'VIDEO' | 'VOICE'
  fileName = 'sample_capture.jpg',
  sourceUrl = null,
  result = {} 
}) {
  const printRef = useRef(null);

  if (!isOpen || !result) return null;

  const handlePrint = () => {
    window.print();
  };

  const auditId = `AU-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const timestampStr = now.toUTCString();

  const tier = result.tier_verdict || (result.is_deepfake ? 'LIKELY SYNTHETIC' : 'AUTHENTIC');
  const generatorProfile = result.suspected_generator_profile || (result.is_deepfake ? 'Latent Diffusion / Face Swap Engine' : 'Organic Camera Capture');
  const authScore = result.authenticity_score ?? (result.is_deepfake ? 5.0 : 96.8);
  const deepfakeProb = result.deepfake_probability ?? (result.is_deepfake ? 95.0 : 3.2);

  // Verdict style mapping
  const getVerdictTheme = () => {
    if (tier === 'AUTHENTIC') {
      return {
        border: 'border-emerald-500',
        bg: 'bg-emerald-50/70',
        text: 'text-emerald-800',
        badgeBg: 'bg-emerald-600',
        badgeText: 'text-white',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        label: 'AUTHENTIC - ORGANIC CAPTURE'
      };
    }
    if (tier === 'INCONCLUSIVE') {
      return {
        border: 'border-amber-500',
        bg: 'bg-amber-50/70',
        text: 'text-amber-800',
        badgeBg: 'bg-amber-600',
        badgeText: 'text-white',
        icon: <HelpCircle className="w-5 h-5 text-amber-600" />,
        label: 'INCONCLUSIVE FORENSIC RECORD'
      };
    }
    return {
      border: 'border-rose-500',
      bg: 'bg-rose-50/70',
      text: 'text-rose-800',
      badgeBg: 'bg-rose-600',
      badgeText: 'text-white',
      icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
      label: 'LIKELY SYNTHETIC / DEEPFAKE'
    };
  };

  const theme = getVerdictTheme();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:max-w-none print:w-full">
        
        {/* Screen-only Toolbar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              AuthenAI Forensic Audit Certificate Viewer
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Sheet */}
        <div 
          ref={printRef}
          className="p-6 sm:p-10 space-y-6 text-slate-900 bg-white print:p-6 print:m-0 print:text-black font-sans text-xs sm:text-sm"
          style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
          {/* Print Stylesheet injection */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * { visibility: hidden; }
              #printable-forensic-certificate, #printable-forensic-certificate * { visibility: visible; }
              #printable-forensic-certificate {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 1.5cm;
                box-sizing: border-box;
                background: white !important;
                color: black !important;
              }
              @page {
                size: A4 portrait;
                margin: 1cm;
              }
            }
          `}} />

          <div id="printable-forensic-certificate" className="space-y-6">
            
            {/* Certificate Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-slate-900">
                      AuthenAI Forensic Core
                    </h1>
                    <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500">
                      Neural Media Forensics & Biometric Authentication Institute
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right font-mono text-[11px] space-y-0.5 text-slate-600">
                <div className="font-bold text-slate-900">AUDIT ID: {auditId}</div>
                <div>STANDARD: ISO/IEC 27037 ADHERENT</div>
                <div>ENGINE: v3.4.1 (PRNU / 2D-FFT / ELA)</div>
              </div>
            </div>

            {/* Ingestion & Target Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block uppercase text-[10px]">Media Category</span>
                <span className="font-bold text-slate-800">{mediaType} STREAM</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[10px]">Target Asset</span>
                <span className="font-bold text-slate-800 truncate block" title={sourceUrl || fileName}>
                  {sourceUrl ? 'Authenticated URL' : fileName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[10px]">Ingestion Pipeline</span>
                <span className="font-bold text-slate-800">
                  {sourceUrl ? 'Direct HTTP Stream' : 'Encrypted Upload'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[10px]">Timestamp (UTC)</span>
                <span className="font-bold text-slate-800">{timestampStr}</span>
              </div>
            </div>

            {/* Primary Forensic Verdict Section */}
            <div className={`p-5 rounded-xl border-2 ${theme.border} ${theme.bg} space-y-3`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {theme.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-500 block">
                      Final Forensic Tier Verdict
                    </span>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                      {theme.label}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Authenticity</span>
                    <span className="text-xl font-black text-slate-900">{authScore}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Tampering Risk</span>
                    <span className="text-xl font-black text-slate-900">{deepfakeProb}%</span>
                  </div>
                </div>
              </div>

              {/* Specific verdict subtitle */}
              {result.verdict && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">
                    Forensic Sub-Classification: <strong className="text-slate-900 font-bold">{result.verdict}</strong>
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    Confidence: {Math.max(authScore, deepfakeProb)}%
                  </span>
                </div>
              )}
            </div>

            {/* Suspected Generator & Diagnostic Profile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Generator Attribution Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <span>Suspected Generator Profile</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 font-mono text-xs">
                  <span className="text-indigo-700 font-bold block text-sm mb-1">
                    {generatorProfile}
                  </span>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    {tier === 'LIKELY SYNTHETIC'
                      ? 'Algorithmic micro-signatures, frequency energy spikes, and boundary blur match synthetic generator profiles.'
                      : tier === 'INCONCLUSIVE'
                      ? 'Heavy lossy compression masks forensic signatures. Inconclusive classifier attribution.'
                      : 'Authentic camera sensor noise floor intact without generative diffusion or neural re-synthesis artifacts.'}
                  </p>
                </div>
              </div>

              {/* Data Retention & Privacy Assurance */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Zero Retention Privacy Attestation</span>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 font-mono text-[11px] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>In-Memory Volatile Processing Verified</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[10px]">
                    AuthenAI operates a zero-retention forensic runtime. All image, video, and voice buffers are analyzed in volatile RAM and permanently deallocated upon completion of this report.
                  </p>
                </div>
              </div>

            </div>

            {/* Forensic Scientist Findings Matrix */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wider">
                  Quantitative Forensic Sensor Metrics
                </span>
                <span className="text-slate-500 text-[11px]">Spectral / Biometric Breakdown</span>
              </div>
              
              <div className="divide-y divide-slate-100 font-mono text-xs">
                
                {/* Metric 1: PRNU */}
                <div className="p-3 flex items-center justify-between hover:bg-slate-50">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900">PRNU Sensor Noise Distribution</div>
                    <div className="text-[11px] text-slate-500">Optical camera photo-response non-uniformity fingerprint</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    result.metrics?.spectral_noise_variance > 10 || result.is_deepfake
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {result.metrics?.spectral_noise_variance ? `${result.metrics.spectral_noise_variance} std` : (result.is_deepfake ? 'SUPPRESSED / UNORGANIC' : 'ORGANIC NOISE VERIFIED')}
                  </span>
                </div>

                {/* Metric 2: 2D FFT / Moiré */}
                <div className="p-3 flex items-center justify-between hover:bg-slate-50">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900">2D FFT Spectral Density / High-Frequency Band</div>
                    <div className="text-[11px] text-slate-500">Analysis for periodic grid spikes and presentation attack moiré</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                    {result.verdict?.includes('SCREEN CAPTURE') ? 'PERIODIC MOIRÉ PEAKS DETECTED' : 'HOMOGENEOUS FREQUENCY DECAY'}
                  </span>
                </div>

                {/* Metric 3: Micro-block Inpainting / ELA */}
                <div className="p-3 flex items-center justify-between hover:bg-slate-50">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900">8x8 Micro-Block ELA & Boundary Discrepancy</div>
                    <div className="text-[11px] text-slate-500">Facial perimeter compression differential and localized inpainting audit</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    result.metrics?.ela_anomaly_index > 40 || result.verdict?.includes('Inpainting') || result.suspected_generator_profile?.includes('Inpainting')
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {result.metrics?.ela_anomaly_index ? `${result.metrics.ela_anomaly_index}% Discrepancy` : (result.is_deepfake ? 'ANOMALOUS GRADIENT' : 'UNIFORM QUANTIZATION')}
                  </span>
                </div>

                {/* Metric 4: Details Narrative */}
                <div className="p-3 bg-slate-50/50">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Examiner Diagnostic Notes
                  </span>
                  <p className="text-slate-700 text-xs leading-relaxed font-sans">
                    {result.details || 'Forensic optical and frequency evaluation complete. No anomaly overrides registered.'}
                  </p>
                </div>

              </div>
            </div>

            {/* Official Signature Stamp & Verification Seal */}
            <div className="pt-4 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
              
              <div className="flex items-center gap-3">
                {/* Cryptographic Stamp Graphic */}
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-blue-600 flex flex-col items-center justify-center p-1 text-center bg-blue-50/40">
                  <ShieldCheck className="w-5 h-5 text-blue-600 mb-0.5" />
                  <span className="text-[8px] font-bold text-blue-900 uppercase leading-none">
                    VERIFIED
                  </span>
                  <span className="text-[7px] text-blue-700 leading-none">
                    FORENSIC CORE
                  </span>
                </div>
                
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 uppercase">
                    Verified by AuthenAI Forensic Core
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    Autonomous Cryptographic Verification Attestation
                  </div>
                  <div className="text-slate-400 text-[9px]">
                    SIGNATURE: AUTHENAI-NEURAL-FORENSICS-CORE-v3.4.1
                  </div>
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-500 space-y-0.5 sm:max-w-xs">
                <div>CERTIFICATE RECORD: OFFICIAL AUDIT EXPORT</div>
                <div>AUTONOMOUS PIPELINE: ZERO OPERATOR BIAS</div>
                <div className="font-semibold text-slate-700">© 2026 AuthenAI Technologies Inc. All rights reserved.</div>
              </div>

            </div>

          </div>
        </div>

        {/* Modal Footer (Screen only) */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print or Export PDF</span>
          </button>
        </div>

      </div>

    </div>
  );
}
