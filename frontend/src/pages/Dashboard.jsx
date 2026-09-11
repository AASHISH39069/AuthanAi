import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('ALL');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory();
      setHistory(data);
    } catch (err) {
      console.warn('Failed to load history from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterTier === 'ALL' || item.risk_level === filterTier;
    return matchesSearch && matchesFilter;
  });

  const exportCSV = () => {
    const headers = ["Session ID", "Date", "Name", "Risk Level", "Risk Score", "Confidence", "Status"];
    const rows = history.map(item => [
      item.session_id,
      item.date,
      item.name,
      item.risk_level,
      `${item.risk_score}/100`,
      `${item.confidence}%`,
      item.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AuthenAI_Verification_Audits.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-900">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono uppercase tracking-wider mb-2">
            Audit Trail
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Verification History Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Historical identity audits, risk heuristics, and confidence records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Records</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-1 shadow-sm">
          <span className="text-xs font-mono uppercase text-slate-500 font-semibold">Total Audits</span>
          <div className="text-3xl font-extrabold font-mono text-slate-900">{history.length}</div>
          <span className="text-[11px] text-blue-600 font-mono font-medium">Multi-Modal Sessions</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-1 shadow-sm">
          <span className="text-xs font-mono uppercase text-slate-500 font-semibold">Verified Authentic</span>
          <div className="text-3xl font-extrabold font-mono text-emerald-600">
            {history.filter(h => h.risk_level === "LOW RISK").length}
          </div>
          <span className="text-[11px] text-emerald-600 font-mono font-medium">Passed Integrity Threshold</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-1 shadow-sm">
          <span className="text-xs font-mono uppercase text-slate-500 font-semibold">Review Required</span>
          <div className="text-3xl font-extrabold font-mono text-amber-600">
            {history.filter(h => h.risk_level === "MEDIUM RISK").length}
          </div>
          <span className="text-[11px] text-amber-600 font-mono font-medium">Secondary Check</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-1 shadow-sm">
          <span className="text-xs font-mono uppercase text-slate-500 font-semibold">Flagged Fraud / Deepfake</span>
          <div className="text-3xl font-extrabold font-mono text-rose-600">
            {history.filter(h => h.risk_level === "HIGH RISK").length}
          </div>
          <span className="text-[11px] text-rose-600 font-mono font-medium">Synthetic Rejection</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Session ID or Citizen Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-mono text-slate-500 flex items-center gap-1 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Tier:</span>
          </span>
          {["ALL", "LOW RISK", "MEDIUM RISK", "HIGH RISK"].map((tier) => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                filterTier === tier
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {tier === "ALL" ? "All" : tier.replace(" RISK", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Audit History Table */}
      <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-6">Tracking Session</th>
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6">Citizen Subject</th>
                <th className="py-3.5 px-6">Risk Tier</th>
                <th className="py-3.5 px-6">Score</th>
                <th className="py-3.5 px-6">Confidence</th>
                <th className="py-3.5 px-6">Action Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-blue-600">
                      {row.session_id}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(row.date).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {row.name}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${
                        row.risk_level === "LOW RISK"
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : row.risk_level === "MEDIUM RISK"
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                        {row.risk_level}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {row.risk_score} <span className="text-slate-400">/100</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {row.confidence}%
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">
                      {row.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No matching verification audit records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
