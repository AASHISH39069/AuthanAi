import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  Menu, 
  X, 
  ChevronDown, 
  Camera, 
  Video, 
  Mic, 
  Sparkles,
  Fingerprint
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
  }, [location]);

  // Handle outside click for desktop dropdown
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const isToolActive = location.pathname.startsWith('/tools');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
              Authen<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI</span>
            </span>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500 -mt-1">
              Deepfake Forensics
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium">
          
          {/* Home */}
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              location.pathname === '/' 
                ? 'text-blue-600 bg-blue-50 font-semibold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Home
          </Link>

          {/* Deepfake Detection Tools Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              onMouseEnter={() => setToolsDropdownOpen(true)}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                isToolActive
                  ? 'text-blue-600 bg-blue-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <span>Deepfake Detection Tools</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${toolsDropdownOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
            </button>

            {/* Dropdown Menu */}
            {toolsDropdownOpen && (
              <div 
                onMouseLeave={() => setToolsDropdownOpen(false)}
                className="absolute left-0 mt-1.5 w-64 rounded-xl bg-white border border-slate-200 shadow-lg shadow-slate-900/10 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="space-y-1">
                  <Link
                    to="/tools/image-detection"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      location.pathname === '/tools/image-detection'
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                    <span>Deepfake Image Detection</span>
                  </Link>

                  <Link
                    to="/tools/video-detection"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      location.pathname === '/tools/video-detection'
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Video className="w-3.5 h-3.5" />
                    </div>
                    <span>Deepfake Video Detection</span>
                  </Link>

                  <Link
                    to="/tools/voice-detection"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      location.pathname === '/tools/voice-detection'
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                      <Mic className="w-3.5 h-3.5" />
                    </div>
                    <span>Deepfake Voice Detection</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Multi-Modal Audit */}
          <Link
            to="/verify"
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              location.pathname === '/verify'
                ? 'text-blue-600 bg-blue-50 font-semibold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Fingerprint className="w-4 h-4 text-blue-600" />
            <span>Multi-Modal Audit</span>
          </Link>

          {/* About Us */}
          <Link
            to="/about"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              location.pathname === '/about'
                ? 'text-blue-600 bg-blue-50 font-semibold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            About Us
          </Link>

        </nav>

        {/* Right CTA Button & Live Status (Strictly NO Pricing, Credits, or Sign In) */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono font-medium text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>AI ENGINES ONLINE</span>
          </div>

          <button
            onClick={() => navigate('/verify')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 transition-all duration-200 active:scale-95 group"
          >
            <span>Start Verification</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-4 duration-200">
          <Link
            to="/"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Home
          </Link>

          {/* Mobile Tools Collapsible */}
          <div>
            <button
              onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <span>Deepfake Detection Tools</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileToolsOpen ? 'rotate-180' : ''}`} />
            </button>

            {mobileToolsOpen && (
              <div className="pl-4 pr-2 py-1 space-y-1 bg-slate-50/70 rounded-xl my-1 border border-slate-100">
                <Link
                  to="/tools/image-detection"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>📷 Deepfake Image Detection</span>
                </Link>
                <Link
                  to="/tools/video-detection"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100"
                >
                  <Video className="w-3.5 h-3.5 text-indigo-600" />
                  <span>🎥 Deepfake Video Detection</span>
                </Link>
                <Link
                  to="/tools/voice-detection"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100"
                >
                  <Mic className="w-3.5 h-3.5 text-cyan-600" />
                  <span>🎙️ Deepfake Voice Detection</span>
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/verify"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Multi-Modal Audit
          </Link>

          <Link
            to="/about"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            About Us
          </Link>

          <div className="pt-3">
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/verify'); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md shadow-blue-600/25"
            >
              <span>Start Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
