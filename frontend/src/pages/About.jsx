import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Terminal, 
  Cpu, 
  Lock, 
  CheckCircle2, 
  AlertOctagon, 
  Sparkles,
  User,
  ExternalLink,
  Layers
} from 'lucide-react';

export default function About() {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  const team = [
    {
      name: "Aashish",
      role: "Lead AI & Deepfake Forensic Engineer",
      email: "aashish@authenai.internal",
      phone: "+91 98111 01001",
      location: "New Delhi, India",
      image: "/assets/aashish.jpg",
      initials: "AA",
      color: "from-blue-500 to-cyan-500",
      accent: "text-blue-600",
      bio: "Leads research and algorithm design for Error Level Analysis (ELA) and cross-modal artifact detection. Specializes in spatial frequency analysis, neural vocoder detection, and zero-shot synthetic face classification.",
      focus: ["JPEG ELA Compression Models", "Deepfake Frame Discrepancies", "Audio Vocoder Harmonics"]
    },
    {
      name: "Vinay Dixit",
      role: "System Architect & API Engineer",
      email: "vinay.dixit@authenai.internal",
      phone: "+91 98222 02002",
      location: "Uttar Pradesh, India",
      image: "/assets/vinay.jpg",
      initials: "VD",
      color: "from-cyan-500 to-blue-600",
      accent: "text-cyan-600",
      bio: "Designs AuthenAI's distributed high-throughput asynchronous backend architecture. Engineered the low-latency multi-part streaming pipeline, token cryptographic session manager, and FastAPI core infrastructure.",
      focus: ["FastAPI Microservice Engine", "Cryptographic Session Tokens", "High-Throughput IO Pipelines"]
    },
    {
      name: "Akash Mochi",
      role: "Computer Vision & Liveness Specialist",
      email: "akash.mochi@authenai.internal",
      phone: "+91 98333 03003",
      location: "Rajasthan, India",
      image: "/assets/akash.jpg",
      initials: "AM",
      color: "from-indigo-500 to-blue-500",
      accent: "text-indigo-600",
      bio: "Focuses on interactive behavioral liveness challenges, micro-gestural verification, and 3D facial landmark mesh tracking to neutralize replay attacks, silicon mask spoofs, and live video injection.",
      focus: ["3D Facial Landmark Tracking", "Micro-Gesture Validation", "Anti-Screen Replay Filters"]
    },
    {
      name: "Vansh Malikan",
      role: "Full-Stack Engineer & Decision Systems",
      email: "vansh.malikan@authenai.internal",
      phone: "+91 98444 04004",
      location: "Haryana, India",
      image: "/assets/vansh.jpg",
      initials: "VM",
      color: "from-teal-500 to-cyan-500",
      accent: "text-teal-600",
      bio: "Architects the weighted heuristic decision aggregator and cyber-forensic user experience. Bridges complex mathematical multi-modal anomaly matrices into actionable enterprise risk dashboards.",
      focus: ["Cross-Modal Decision Fusion", "Forensic Evidence UX", "Real-Time Sensor Integration"]
    }
  ];

  return (
    <div className="relative overflow-hidden pt-8 pb-20 text-slate-900">
      {/* Background Ambience */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 bg-blue-400/10 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono uppercase tracking-wider">
            Engineering & Forensic Architecture
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AuthenAI</span>
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Pioneering a zero-trust multi-modal identity verification framework designed to combat modern hyper-realistic generative AI impersonation.
          </p>
        </div>

        {/* Section: Why Multi-Modal Defense Matters */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Multi-Modal Defense vs. Single Biometric Fraud
              </h2>
              <p className="text-xs font-mono text-blue-600 font-semibold">
                Architectural Threat Model & Mathematical Justification
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed text-slate-600 pt-2">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>The Vulnerability of Single Biometrics</span>
              </h3>
              <p>
                In the era of modern diffusion models and open-source neural voice clones, relying on a single biometric signal (such as a selfie photo or a voice recording) has become dangerous. A fraudster with access to a target's social media can synthesize 10 seconds of clear speech or run real-time face-swap software into a virtual webcam driver.
              </p>
              <p>
                Similarly, static ID photo submissions are easily bypassed by AI generative inpainting models that replicate holographic textures and micro-text fonts while altering names and birth dates.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>The AuthenAI Multi-Modal Paradigm</span>
              </h3>
              <p>
                AuthenAI enforces a <strong className="text-slate-900">non-separable multi-modal cross-correlation</strong> rule. An attacker would have to simultaneously forge:
              </p>
              <ul className="space-y-1.5 pl-4 border-l-2 border-slate-200 text-xs font-mono text-slate-600">
                <li>1. The microscopic JPEG compression grid of the physical ID card (ELA).</li>
                <li>2. 3D biometric skull geometry matching the credential portrait.</li>
                <li>3. Micro-ocular blinks and involuntary head rotations in response to random 3-second challenges.</li>
                <li>4. Natural vocal tract harmonic dispersion without synthetic vocoder cutoff frequencies.</li>
              </ul>
              <p className="text-xs text-blue-700 font-mono font-semibold">
                The probability of simultaneously spoofing all four distinct forensic layers approaches zero.
              </p>
            </div>
          </div>
        </div>

        {/* Section: Developer Profile Cards */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Engineering Core Team
            </h2>
            <p className="text-sm text-slate-600">
              The engineers and researchers behind the AuthenAI multi-modal verification prototype.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {team.map((member, index) => {
              const hasError = imageErrors[index];
              return (
                <div
                  key={index}
                  className="group p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 transition-all duration-300 shadow-md hover:shadow-lg flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Photo / Avatar + Basic Info */}
                    <div className="flex items-start gap-4 mb-4">
                      
                      {/* Avatar with clean UI fallback */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 flex items-center justify-center">
                        {!hasError ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            onError={() => handleImageError(index)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-bold text-lg font-mono shadow-inner`}>
                            {member.initials}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {member.name}
                        </h3>
                        <p className={`text-xs font-mono font-medium ${member.accent} mb-1.5`}>
                          {member.role}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{member.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {member.bio}
                    </p>

                    {/* Focus / Skills Chips */}
                    <div className="space-y-1.5 mb-5">
                      <p className="text-[11px] font-mono uppercase text-slate-500 font-semibold">Forensics Focus:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {member.focus.map((tag, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Contact Details Card Footer */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 font-mono">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors truncate"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </a>
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Incubation & Lab Info */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 text-center text-xs text-slate-600 font-mono space-y-1 shadow-sm">
          <p className="text-slate-800 font-semibold">
            Engineered at Innovation & Incubation Labs, Tech Corridor, National Hub, India.
          </p>
          <p className="text-slate-500">
            For academic verification audits and enterprise evaluation requests: <span className="text-blue-600 font-bold">contact@authenai.internal</span>
          </p>
        </div>

      </div>
    </div>
  );
}
