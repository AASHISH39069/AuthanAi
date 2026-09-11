import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Verification from './pages/Verification';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import ImageDetection from './pages/tools/ImageDetection';
import VideoDetection from './pages/tools/VideoDetection';
import VoiceDetection from './pages/tools/VoiceDetection';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-blue-600 selection:text-white cyber-grid-bg relative">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/verify" element={<Verification />} />
            <Route path="/about" element={<About />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Dedicated Standalone Deepfake Detection Tools */}
            <Route path="/tools/image-detection" element={<ImageDetection />} />
            <Route path="/tools/video-detection" element={<VideoDetection />} />
            <Route path="/tools/voice-detection" element={<VoiceDetection />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
