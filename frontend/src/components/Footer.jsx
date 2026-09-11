import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Terminal, 
  Camera, 
  Video, 
  Mic, 
  Fingerprint, 
  Code2, 
  Layers,
  ExternalLink
} from 'lucide-react';

export default function Footer() {
  const engineeringTeam = [
    { name: "Aashish", role: "Lead AI & Deepfake Forensics" },
    { name: "Vinay Dixit", role: "Backend & Architecture" },
    { name: "Akash Mochi", role: "ML Pipelines & Liveness" },
    { name: "Vansh Malikan", role: "Full-Stack & UI/UX" },
  ];

  return (
    <footer className="bg-black text-neutral-400 border-t border-neutral-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Column 1: Brand & Tagline */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20 text-white group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Authen<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">AI</span>
              </span>
            </Link>

            <p className="text-xs font-mono font-bold text-blue-400 tracking-wider uppercase">
              "Verify the Person. Trust the Identity."
            </p>

            <p className="text-neutral-400 text-xs leading-relaxed">
              AuthenAI is an enterprise-grade cyber-forensics platform pioneering multi-modal zero-trust synthetic identity defense. By cross-correlating document pixel Error Level Analysis (ELA), real-time biometric liveness, and synthetic voice harmonics, AuthenAI exposes deepfakes and algorithmic impersonation before fraud occurs.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>Multi-Modal Forensics Engine v2026.2</span>
            </div>
          </div>

          {/* Column 2: Deepfake Detection Tools */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Detection Tools</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link 
                  to="/tools/image-detection" 
                  className="text-neutral-300 hover:text-blue-400 transition-colors flex items-center gap-2 group"
                >
                  <Camera className="w-3.5 h-3.5 text-neutral-500 group-hover:text-blue-400 transition-colors" />
                  <span>Deepfake Image Detection</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/tools/video-detection" 
                  className="text-neutral-300 hover:text-blue-400 transition-colors flex items-center gap-2 group"
                >
                  <Video className="w-3.5 h-3.5 text-neutral-500 group-hover:text-blue-400 transition-colors" />
                  <span>Deepfake Video Detection</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/tools/voice-detection" 
                  className="text-neutral-300 hover:text-blue-400 transition-colors flex items-center gap-2 group"
                >
                  <Mic className="w-3.5 h-3.5 text-neutral-500 group-hover:text-blue-400 transition-colors" />
                  <span>Deepfake Voice Detection</span>
                </Link>
              </li>
              <li className="pt-1">
                <Link 
                  to="/verify" 
                  className="text-blue-400 font-semibold hover:text-blue-300 transition-colors flex items-center gap-1.5"
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Multi-Modal KYC Audit</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </Link>
              </li>
              <li className="pt-2 border-t border-neutral-800">
                <Link 
                  to="/about" 
                  className="text-neutral-400 hover:text-neutral-200 transition-colors text-[11px]"
                >
                  About Us & Threat Model
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Engineering Core Team */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-1.5 mb-3">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Engineering Core Team</span>
            </h4>
            <div className="space-y-2">
              {engineeringTeam.map((dev, i) => (
                <div 
                  key={i} 
                  className="text-xs p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors"
                >
                  <div className="font-bold text-neutral-200">{dev.name}</div>
                  <div className="text-[11px] text-blue-400 font-mono mt-0.5">{dev.role}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Contact & Secretariat */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white mb-3">
              Contact & Secretariat
            </h4>
            <div className="space-y-3 text-xs text-neutral-400">
              <div className="flex items-start gap-2.5">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <a 
                  href="mailto:contact@authenai.internal" 
                  className="hover:text-blue-400 transition-colors break-all"
                >
                  contact@authenai.internal
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-neutral-300 font-mono">+91 98765 43210</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-snug">Innovation & Incubation Labs, Tech Corridor, National Hub, India</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Pure Pitch Black & High Contrast */}
        <div className="mt-14 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-neutral-400">
            © 2026 AuthenAI Engineering Team. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-neutral-400 font-mono text-[11px]">
            <span>STRICTLY ZERO DATA RETENTION</span>
            <span>•</span>
            <span>EPHEMERAL RAM BIOMETRICS PROCESSING</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
