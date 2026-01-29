
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
        return { 
          bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', 
          icon: 'fa-shield-check', label: 'Verified Safe', meter: '10%', meterColor: 'bg-emerald-500' 
        };
      case SafetyLevel.SUSPICIOUS:
        return { 
          bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', 
          icon: 'fa-triangle-exclamation', label: 'Potentially Risky', meter: '60%', meterColor: 'bg-amber-500' 
        };
      case SafetyLevel.DANGEROUS:
        return { 
          bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', 
          icon: 'fa-skull-crossbones', label: 'Highly Dangerous', meter: '95%', meterColor: 'bg-rose-500' 
        };
      default:
        return { 
          bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', 
          icon: 'fa-circle-question', label: 'Undetermined', meter: '50%', meterColor: 'bg-slate-500' 
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`p-8 rounded-[2.5rem] border ${styles.bg} ${styles.border} animate-in slide-in-from-bottom-6 duration-700 shadow-2xl relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-black/30 ${styles.text} shadow-inner`}>
            <i className={`fa-solid ${styles.icon}`}></i>
          </div>
          <div>
            <h3 className={`text-xl font-black ${styles.text} tracking-tight`}>{styles.label}</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Neural Threat Level</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFeedback('up')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active-scale ${feedback === 'up' ? 'bg-emerald-500 text-white' : 'glass-card text-slate-500'}`}><i className="fa-solid fa-thumbs-up text-xs"></i></button>
          <button onClick={() => setFeedback('down')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active-scale ${feedback === 'down' ? 'bg-rose-500 text-white' : 'glass-card text-slate-500'}`}><i className="fa-solid fa-thumbs-down text-xs"></i></button>
        </div>
      </div>

      {/* Risk Meter */}
      <div className="mb-8 space-y-2">
        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500 px-1">
          <span>Safe</span>
          <span>Risk Probability: {styles.meter}</span>
          <span>Danger</span>
        </div>
        <div className="h-3 w-full bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${styles.meterColor}`} 
            style={{ width: styles.meter, boxShadow: `0 0 10px ${styles.meterColor}` }}
          ></div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="bg-black/20 p-5 rounded-3xl border border-white/5">
          <p className="text-slate-200 text-xs leading-relaxed font-medium italic">"{result.explanation}"</p>
        </div>

        {result.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Guardian Checklist</h4>
            <div className="grid gap-2">
              {result.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 transition-colors hover:border-white/10">
                  <i className="fa-solid fa-shield-check text-indigo-400 text-xs"></i>
                  <span className="text-[11px] text-slate-300 font-medium">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 flex flex-col gap-3">
          {result.level === SafetyLevel.DANGEROUS && (
            <>
              <button onClick={() => onAction?.('emergency')} className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-2xl shadow-xl transition-all active-scale danger-pulse">ACTIVATE EMERGENCY SOS</button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => alert('Blocked!')} className="py-3 glass-card text-white text-[10px] font-bold rounded-xl border border-white/10 active-scale uppercase tracking-wider">Block Sender</button>
                <button onClick={() => alert('Reported!')} className="py-3 glass-card text-white text-[10px] font-bold rounded-xl border border-white/10 active-scale uppercase tracking-wider">Report Fraud</button>
              </div>
            </>
          )}
          {result.level === SafetyLevel.SUSPICIOUS && (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => alert('Contacting Bank...')} className="py-4 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-black rounded-2xl active-scale uppercase tracking-wider">Contact Bank</button>
              <button onClick={() => alert('Requesting Human Review...')} className="py-4 glass-card text-white text-[10px] font-black rounded-2xl border border-white/10 active-scale uppercase tracking-wider">Verify Manually</button>
            </div>
          )}
          {result.level === SafetyLevel.SAFE && (
            <button 
              onClick={() => onAction?.('trust')} 
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white text-xs font-black rounded-2xl transition-all active-scale shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <i className="fa-solid fa-handshake-simple"></i> Mark as Trusted Device
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
