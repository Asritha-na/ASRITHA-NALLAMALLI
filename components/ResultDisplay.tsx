
import React, { useState } from 'react';
import { SafetyLevel, AnalysisResult } from '../types';

interface ResultDisplayProps {
  result: AnalysisResult;
  onAction?: (action: string) => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onAction }) => {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const getStyles = () => {
    switch (result.level) {
      case SafetyLevel.SAFE:
        return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: 'fa-shield-check', label: 'Safe to Proceed' };
      case SafetyLevel.SUSPICIOUS:
        return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'fa-triangle-exclamation', label: 'Suspicious Activity' };
      case SafetyLevel.DANGEROUS:
        return { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', icon: 'fa-skull-crossbones', label: 'High Risk / Dangerous' };
      default:
        return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', icon: 'fa-circle-question', label: 'Unknown' };
    }
  };

  const styles = getStyles();

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    console.log(`[USER FEEDBACK] Result: ${result.level}, Feedback: ${type}`);
  };

  return (
    <div className={`mt-8 p-6 rounded-2xl border ${styles.bg} ${styles.border} animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl shadow-black/40`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-black/20 ${styles.text}`}>
            <i className={`fa-solid ${styles.icon}`}></i>
          </div>
          <div>
            <h3 className={`text-xl font-bold ${styles.text}`}>{styles.label}</h3>
            <p className="text-slate-400 text-xs">AI Security Analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleFeedback('up')} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${feedback === 'up' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-400 hover:text-emerald-400'}`} aria-label="Helpful"><i className="fa-solid fa-thumbs-up text-xs"></i></button>
          <button onClick={() => handleFeedback('down')} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${feedback === 'down' ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-400 hover:text-rose-400'}`} aria-label="Not helpful"><i className="fa-solid fa-thumbs-down text-xs"></i></button>
        </div>
      </div>
      
      <div className="space-y-5">
        <div>
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Analysis Verdict</h4>
          <p className="text-slate-200 leading-relaxed text-sm bg-black/20 p-3 rounded-xl border border-white/5">{result.explanation}</p>
        </div>

        {result.recommendations.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Smart Recommendations</h4>
            <ul className="space-y-2">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-300 text-xs bg-white/5 p-2 rounded-lg"><i className="fa-solid fa-check text-blue-400 mt-1"></i><span>{rec}</span></li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2 flex flex-wrap gap-3">
          {result.level === SafetyLevel.DANGEROUS && (
            <>
              <button onClick={() => onAction?.('emergency')} className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95">I Need Help</button>
              <div className="flex gap-2 w-full">
                <button onClick={() => alert('Sender Blocked Successfully')} className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-bold rounded-lg border border-white/10 transition-all">Block Sender</button>
                <button onClick={() => alert('Message Reported to CyberCell')} className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-bold rounded-lg border border-white/10 transition-all">Report Message</button>
              </div>
            </>
          )}
          {result.level === SafetyLevel.SUSPICIOUS && (
            <>
              <button onClick={() => alert('Connecting to Bank Security...')} className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all active:scale-95">Contact Bank</button>
              <button onClick={() => alert('Manual verification requested.')} className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold rounded-xl border border-white/10 transition-all">Verify Manually</button>
            </>
          )}
          {result.level === SafetyLevel.SAFE && (
            <button 
              onClick={() => onAction?.('trust')} 
              className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
            >
              <i className="fa-solid fa-handshake"></i> Mark as Trusted
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
