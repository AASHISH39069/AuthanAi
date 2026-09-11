import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  Video, 
  Mic, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function Home() {
  const scrollToTools = () => {
    const el = document.getElementById('detection-tools');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      
      {/* SECTION 1: Minimal Hero */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[20rem] bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-mono font-medium shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Forensics & Identity Defense</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
            Verify Real People.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">
              Stop Synthetic Deepfakes.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Fast, accurate forensic detection for AI-generated images, deepfake videos, and synthetic cloned voice.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              to="/verify"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all duration-200 active:scale-95 group"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Multi-Modal Verification</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={scrollToTools}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-sm transition-all duration-200"
            >
              <span>Explore Detection Tools</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: Quick Launch Tools (Single 3-Column Row) */}
      <section id="detection-tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
        <div className="border-t border-slate-200/80 pt-12">
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <span>Standalone Detection Tools</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Analyze individual media assets using targeted forensic models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Image Forensics */}
            <Link
              to="/tools/image-detection"
              className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <span>Image Forensics</span>
                    <span className="text-sm">📷</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Detect manipulated photos & AI portraits
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>Launch Analyzer</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 2: Video Forensics */}
            <Link
              to="/tools/video-detection"
              className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                    <span>Video Forensics</span>
                    <span className="text-sm">🎥</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Detect face-swaps & temporal artifacts
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                <span>Launch Analyzer</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 3: Audio Forensics */}
            <Link
              to="/tools/voice-detection"
              className="group p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all duration-200 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-200">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors flex items-center gap-1.5">
                    <span>Audio Forensics</span>
                    <span className="text-sm">🎙️</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Inspect cloned voices & synthetic speech
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-cyan-700">
                <span>Launch Analyzer</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>

          </div>
        </div>
      </section>

    </div>
  );
}
