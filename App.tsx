
import React, { useState, useEffect, useMemo } from 'react';
import { Page, AnalysisResult, SafetyLevel, HistoryEntry, SafetyTip, UserBadge, QuizQuestion } from './types';
import { analyzeContent, getDailySafetyTip, getCyberSecurityAdvice } from './geminiService';
import ResultDisplay from './components/ResultDisplay';
import Onboarding from './components/Onboarding';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: 'q1', question: 'Do you need to enter your PIN to receive money in your UPI account?', options: ['Yes', 'No', 'Only for large amounts'], correctIndex: 1, explanation: 'PIN is ONLY for sending money. Scammers use "receive" links to trick you.' },
  { id: 'q2', question: 'A message says your bank account is blocked and asks you to click a link. What should you do?', options: ['Click to unblock', 'Call official bank number', 'Reply to message'], correctIndex: 1, explanation: 'Never click links in SMS. Always check with official sources like the bank app.' },
  { id: 'q3', question: 'What is the safest way to verify a suspicious job offer received on WhatsApp?', options: ['Pay fee', 'Check official website', 'Give Aadhaar'], correctIndex: 1, explanation: 'Real companies never ask for money on WhatsApp.' },
  { id: 'q4', question: 'A caller asks for your OTP to "update your KYC". Should you share it?', options: ['Yes, if they sound professional', 'No, never share OTP', 'Only the first 2 digits'], correctIndex: 1, explanation: 'Banks and official services NEVER ask for your OTP over a call.' },
  { id: 'q5', question: 'What does "https://" in a website URL indicate?', options: ['The site is 100% safe', 'Connection is encrypted', 'It is a government site'], correctIndex: 1, explanation: 'HTTPS means the connection is encrypted, but the site could still be malicious.' },
  { id: 'q6', question: 'You get a QR code to "receive a prize". What happens if you scan it?', options: ['You get the money', 'Scammer might withdraw money', 'Nothing happens'], correctIndex: 1, explanation: 'Scanning a QR and entering a PIN allows someone to WITHDRAW money from your account.' },
  { id: 'q7', question: 'What is a "cloned" social media profile?', options: ['A backup account', 'An identical fake account', 'A verified account'], correctIndex: 1, explanation: 'Scammers copy photos and names to create fake profiles of your friends to ask for money.' }
];

const BADGES: UserBadge[] = [
  { id: 'b1', name: 'Scam Hunter', icon: 'fa-user-ninja', color: 'bg-indigo-500' },
  { id: 'b2', name: 'Cyber Pro', icon: 'fa-medal', color: 'bg-emerald-500' },
  { id: 'b3', name: 'Digital Guardian', icon: 'fa-crown', color: 'bg-amber-500' },
  { id: 'b4', name: 'Shield Master', icon: 'fa-shield-heart', color: 'bg-rose-500' },
  { id: 'b5', name: 'UPI Expert', icon: 'fa-indian-rupee-sign', color: 'bg-cyan-500' },
  { id: 'b6', name: 'Link Detective', icon: 'fa-magnifying-glass', color: 'bg-blue-500' },
  { id: 'b7', name: 'Citizen Guardian', icon: 'fa-people-group', color: 'bg-violet-500' }
];

const PREBUILT_TIPS: SafetyTip[] = [
  { id: 'tip-1', title: 'The Electricity Bill Trap', content: '"Power will be cut tonight" is a common scam tactic. Banks never rush you via SMS.', category: 'PHISHING' },
  { id: 'tip-2', title: 'Cashback Scams', content: 'You never need to enter your PIN to receive money. If someone asks you to, it is a scam.', category: 'UPI' },
  { id: 'tip-3', title: 'Profile Impersonation', content: 'Check if the account has common followers. Scammers create "clone" accounts of friends.', category: 'SOCIAL' },
  { id: 'tip-4', title: '2FA Protection', content: 'Enable Two-Factor Authentication on WhatsApp to block hackers.', category: 'PASSWORD' },
];

const UPI_APPS = [
  { name: 'Google Pay', id: 'gpay', icon: 'fa-google' },
  { name: 'PhonePe', id: 'phonepe', icon: 'fa-mobile-screen' },
  { name: 'PayTM', id: 'paytm', icon: 'fa-wallet' },
  { name: 'Other', id: 'any', icon: 'fa-indian-rupee-sign' }
];

const SCAM_CATEGORIES = [
  { id: 'fraud', label: 'Financial Fraud', icon: 'fa-money-bill-transfer' },
  { id: 'otp', label: 'OTP/KYC Scam', icon: 'fa-key' },
  { id: 'threat', label: 'Threats/Extortion', icon: 'fa-mask' },
  { id: 'tele', label: 'Telemarketing', icon: 'fa-headset' },
  { id: 'other', label: 'Other', icon: 'fa-circle-question' }
];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [dailyTip, setDailyTip] = useState<{ title: string; content: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [queryResponse, setQueryResponse] = useState('');
  const [sosActive, setSosActive] = useState(false);
  
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<{ index: number; isCorrect: boolean } | null>(null);

  const [scamInput, setScamInput] = useState('');
  const [upiDetails, setUpiDetails] = useState({ name: '', upiId: '', purpose: '', selectedApp: 'any' });
  const [profileInput, setProfileInput] = useState({ username: '', platform: 'Instagram' });
  const [phoneInput, setPhoneInput] = useState('');

  // Report State
  const [reportForm, setReportForm] = useState({ number: '', category: 'fraud', note: '' });
  const [reportSuccess, setReportSuccess] = useState(false);

  // Demo Specific State
  const [demoState, setDemoState] = useState<'idle' | 'calling' | 'analyzing' | 'checked'>('idle');

  useEffect(() => {
    getDailySafetyTip().then(setDailyTip);
    if (!localStorage.getItem('cyberguardian_onboarding_seen')) setShowOnboarding(true);
    setHistory(JSON.parse(localStorage.getItem('cyberguardian_history') || '[]'));
    setFavorites(JSON.parse(localStorage.getItem('cyberguardian_favorites') || '[]'));
    setBadges(JSON.parse(localStorage.getItem('cyberguardian_badges') || '[]'));
  }, []);

  const securityScore = useMemo(() => {
    let score = 10;
    score += Math.min(badges.length * 10, 50);
    score += Math.min(history.length * 2, 20);
    if (quizCompleted) score += 20;
    return Math.min(score, 100);
  }, [badges, history, quizCompleted]);

  const scoreStatus = useMemo(() => {
    if (securityScore < 30) return { label: 'Vulnerable', color: 'text-rose-500' };
    if (securityScore < 60) return { label: 'Guarded', color: 'text-amber-500' };
    if (securityScore < 90) return { label: 'Protected', color: 'text-emerald-500' };
    return { label: 'Immune', color: 'text-cyan-400' };
  }, [securityScore]);

  const CIRCLE_RADIUS = 80;
  const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  const handleAnalysis = async (type: 'message' | 'upi' | 'profile' | 'phone') => {
    setLoading(true);
    let content = '';
    switch(type) {
      case 'message': content = scamInput; break;
      case 'upi': content = `Payee: ${upiDetails.name}, ID: ${upiDetails.upiId}, Purpose: ${upiDetails.purpose}`; break;
      case 'profile': content = profileInput.username; break;
      case 'phone': content = phoneInput; break;
    }

    const res = await analyzeContent(content, type);
    setResult(res);
    const newEntry: HistoryEntry = { id: Date.now().toString(), timestamp: Date.now(), type, input: content, result: res };
    const newHistory = [newEntry, ...history].slice(0, 30);
    setHistory(newHistory);
    localStorage.setItem('cyberguardian_history', JSON.stringify(newHistory));
    setLoading(false);
  };

  const askQuery = async () => {
    if (!userQuery.trim()) return;
    setLoading(true);
    try {
      const advice = await getCyberSecurityAdvice(userQuery);
      setQueryResponse(advice);
    } catch (error) {
      console.error("Advice query failed", error);
      setQueryResponse("I couldn't get safety advice right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitReport = () => {
    if (!reportForm.number) return;
    setLoading(true);
    // Simulate API call to crowd-sourced DB
    setTimeout(() => {
      setLoading(false);
      setReportSuccess(true);
      if (!badges.includes('b7')) {
        const newBadges = Array.from(new Set([...badges, 'b7']));
        setBadges(newBadges);
        localStorage.setItem('cyberguardian_badges', JSON.stringify(newBadges));
      }
      setTimeout(() => {
        setReportSuccess(false);
        setReportForm({ number: '', category: 'fraud', note: '' });
        navigateTo('home');
      }, 3000);
    }, 1500);
  };

  const startScamDemo = () => {
    setDemoState('calling');
    setTimeout(() => {
        setDemoState('analyzing');
        setTimeout(() => {
            setDemoState('checked');
            setPhoneInput('+91 98765 43210');
            navigateTo('phone-check');
            handleAnalysis('phone');
        }, 2000);
    }, 3000);
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    setResult(null);
    setQueryResponse('');
    setReportSuccess(false);
  };

  const renderHome = () => (
    <div className="space-y-8 page-enter">
      <div className="flex flex-col items-center justify-center pt-4 relative">
        <svg viewBox="0 0 192 192" className="w-48 h-48 transform -rotate-90">
          <circle cx="96" cy="96" r={CIRCLE_RADIUS} stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
          <circle 
            cx="96" cy="96" r={CIRCLE_RADIUS} 
            stroke="url(#scoreGradient)" strokeWidth="12" 
            fill="transparent" 
            strokeDasharray={CIRCUMFERENCE} 
            strokeDashoffset={CIRCUMFERENCE - (CIRCUMFERENCE * securityScore) / 100}
            strokeLinecap="round"
            className="security-ring transition-all duration-1000 ease-out"
            style={{ filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))' }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold text-white block leading-none">{securityScore}%</span>
          <div className="mt-1 flex flex-col">
            <span className={`text-[10px] font-black uppercase tracking-widest ${scoreStatus.color}`}>{scoreStatus.label}</span>
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">System Health</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { id: 'scam-check', icon: 'fa-message', label: 'Message Scan', color: 'from-blue-500 to-indigo-600' },
          { id: 'phone-check', icon: 'fa-phone-volume', label: 'Call Shield', color: 'from-cyan-500 to-blue-600' },
          { id: 'upi-check', icon: 'fa-indian-rupee-sign', label: 'UPI Verify', color: 'from-emerald-500 to-teal-600' },
          { id: 'report-number', icon: 'fa-bullhorn', label: 'Report Scam', color: 'from-violet-500 to-purple-600' },
          { id: 'emergency', icon: 'fa-circle-exclamation', label: 'SOS Emergency', color: 'from-rose-500 to-pink-600', pulse: true, fullWidth: true },
        ].map((card) => (
          <button 
            key={card.id} 
            onClick={() => navigateTo(card.id as Page)}
            className={`p-5 glass-card rounded-3xl flex flex-col items-start gap-4 transition-all hover:-translate-y-1 active:scale-95 ${card.pulse ? 'danger-pulse' : ''} ${card.fullWidth ? 'col-span-2 flex-row items-center py-6' : ''}`}
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-xl shadow-lg`}>
              <i className={`fa-solid ${card.icon}`}></i>
            </div>
            <span className="text-sm font-bold">{card.label}</span>
          </button>
        ))}
      </div>

      {/* Interactive Demo Block */}
      <div className="glass-card p-6 rounded-[2.5rem] bg-indigo-500/5 border-indigo-500/20 overflow-hidden relative group">
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <i className="fa-solid fa-play text-indigo-400 text-xs"></i>
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Interactive Scenarios</h4>
            </div>
            {demoState !== 'idle' && (
                <button onClick={() => setDemoState('idle')} className="text-[8px] text-slate-500 uppercase font-black hover:text-white transition-colors">Reset</button>
            )}
          </div>
          
          <h3 className="text-sm font-bold text-white">Scam Call Simulation</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Experience how CyberGuardian protects you from a live scam caller demanding urgent payment.</p>
          
          {demoState === 'idle' && (
            <button 
                onClick={startScamDemo}
                className="w-full py-4 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-[10px] font-black uppercase text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
            >
                Start Demo Scenario
            </button>
          )}

          {demoState === 'calling' && (
            <div className="flex items-center gap-4 p-4 bg-rose-500/20 border border-rose-500/30 rounded-2xl animate-pulse">
                <div className="w-10 h-10 bg-rose-600 rounded-full flex items-center justify-center text-white"><i className="fa-solid fa-phone"></i></div>
                <div className="flex-1">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Incoming Call</p>
                    <p className="text-xs font-bold text-white">+91 98765 43210</p>
                </div>
            </div>
          )}

          {demoState === 'analyzing' && (
            <div className="flex items-center gap-4 p-4 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white"><i className="fa-solid fa-brain animate-spin-slow"></i></div>
                <div className="flex-1">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Guardian Analyzing</p>
                    <p className="text-xs font-bold text-white">Verifying caller reputation...</p>
                </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {[
          { id: 'queries', icon: 'fa-robot', label: 'AI Advice', color: 'bg-blue-500/20 text-blue-400' },
          { id: 'history', icon: 'fa-clock-rotate-left', label: 'History', color: 'bg-slate-700/50 text-slate-400' },
          { id: 'awareness', icon: 'fa-graduation-cap', label: 'Learn', color: 'bg-indigo-500/20 text-indigo-400' },
        ].map((util) => (
          <button 
            key={util.id}
            onClick={() => navigateTo(util.id as Page)}
            className="flex-shrink-0 flex items-center gap-3 px-6 py-4 glass-card rounded-2xl active:scale-95 transition-all"
          >
            <div className={`w-8 h-8 rounded-xl ${util.color} flex items-center justify-center text-sm`}><i className={`fa-solid ${util.icon}`}></i></div>
            <span className="text-xs font-bold whitespace-nowrap">{util.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 pb-12 pt-6 flex flex-col items-center selection:bg-indigo-500/30">
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      
      <main className="w-full max-w-md">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigateTo('home')}>
             <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/40 transition-transform group-hover:rotate-6"><i className="fa-solid fa-shield-halved text-white text-lg"></i></div>
             <div>
               <h1 className="font-black text-xl tracking-tight leading-none">Guardian</h1>
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Safety Unit</span>
             </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigateTo('history')} className={`w-10 h-10 glass-card rounded-xl flex items-center justify-center transition-all ${currentPage === 'history' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}><i className="fa-solid fa-clock-rotate-left"></i></button>
            <button onClick={() => navigateTo('awareness')} className={`w-10 h-10 glass-card rounded-xl flex items-center justify-center transition-all ${currentPage === 'awareness' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}><i className="fa-solid fa-graduation-cap"></i></button>
          </div>
        </header>

        {currentPage === 'home' && renderHome()}
        
        {currentPage === 'report-number' && (
          <div className="space-y-6 page-enter">
            <div className="flex items-center gap-4">
              <button onClick={() => navigateTo('home')} className="w-10 h-10 glass-card rounded-2xl flex items-center justify-center"><i className="fa-solid fa-arrow-left"></i></button>
              <h2 className="text-xl font-bold text-violet-400">Add Scam Number</h2>
            </div>
            {reportSuccess ? (
              <div className="glass-card p-10 rounded-[3rem] text-center border-emerald-500/30 bg-emerald-500/5 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-4xl text-emerald-400 mx-auto mb-6 shadow-lg shadow-emerald-900/40">
                    <i className="fa-solid fa-check"></i>
                </div>
                <h3 className="text-2xl font-black text-white">Report Submitted</h3>
                <p className="text-xs text-slate-400 mt-2">You've protected the community by flagging this number. You earned the Citizen Guardian badge!</p>
              </div>
            ) : (
              <div className="glass-card p-6 rounded-[2.5rem] space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Phone Number</label>
                  <input 
                    value={reportForm.number} 
                    onChange={(e) => setReportForm({...reportForm, number: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm font-medium focus:ring-2 focus:ring-violet-500/50 outline-none transition-all" 
                    placeholder="Enter the scam number..." 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Type of Scam</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SCAM_CATEGORIES.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setReportForm({...reportForm, category: cat.id})}
                        className={`p-3 rounded-xl border text-[10px] font-bold flex items-center gap-2 transition-all ${reportForm.category === cat.id ? 'bg-violet-600 border-violet-500 text-white' : 'glass-card border-white/5 text-slate-500'}`}
                      >
                        <i className={`fa-solid ${cat.icon}`}></i>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Note (Optional)</label>
                  <textarea 
                    value={reportForm.note}
                    onChange={(e) => setReportForm({...reportForm, note: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs h-24 focus:ring-2 focus:ring-violet-500/50 outline-none"
                    placeholder="Briefly describe what happened..."
                  />
                </div>

                <button 
                    onClick={submitReport} 
                    disabled={loading || !reportForm.number}
                    className="w-full py-5 bg-violet-600 hover:bg-violet-500 rounded-[1.5rem] font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
                >
                  {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                  {loading ? 'SUBMITTING...' : 'ADD TO SCAM LIST'}
                </button>
              </div>
            )}
          </div>
        )}
        
        {currentPage === 'phone-check' && (
          <div className="space-y-6 page-enter">
            <div className="flex items-center gap-4">
              <button onClick={() => navigateTo('home')} className="w-10 h-10 glass-card rounded-2xl flex items-center justify-center"><i className="fa-solid fa-arrow-left"></i></button>
              <h2 className="text-xl font-bold">Call Risk Guard</h2>
            </div>
            <div className="glass-card p-6 rounded-[2.5rem] space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Unknown Caller Number</label>
                <div className="relative">
                  <input 
                    value={phoneInput} 
                    onChange={(e) => setPhoneInput(e.target.value)} 
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 pl-12 text-sm font-medium focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all" 
                    placeholder="Enter phone number..." 
                  />
                  <i className="fa-solid fa-phone-volume absolute left-5 top-5.5 text-slate-600"></i>
                </div>
              </div>
              <button onClick={() => handleAnalysis('phone')} disabled={loading || !phoneInput} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 rounded-[1.5rem] font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2">
                {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-magnifying-glass-chart"></i>}
                {loading ? 'CHECKING RISK...' : 'ANALYZE NUMBER'}
              </button>
            </div>
            {result && (
                <div className="space-y-4">
                    <ResultDisplay result={result} onAction={(a) => { if(a === 'emergency') navigateTo('emergency'); }} />
                    <button 
                        onClick={() => {setReportForm({...reportForm, number: phoneInput}); navigateTo('report-number');}}
                        className="w-full py-4 glass-card rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:text-rose-400 transition-colors flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-flag"></i> Report this number as scam
                    </button>
                    {(result.level === SafetyLevel.DANGEROUS || result.level === SafetyLevel.SUSPICIOUS) && (
                        <div className="p-6 glass-card rounded-[2rem] border-amber-500/30 bg-amber-500/5 animate-in slide-in-from-top-4">
                            <h4 className="text-amber-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <i className="fa-solid fa-triangle-exclamation"></i> Payment Risk Detected
                            </h4>
                            <p className="text-[11px] text-slate-300 mb-4 leading-relaxed font-medium">Scammers often use fake calls to trick users into UPI payments. Check the payment safety before proceeding.</p>
                            <button 
                                onClick={() => navigateTo('upi-check')}
                                className="w-full py-4 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg"
                            >
                                Run Payment Safety Check
                            </button>
                        </div>
                    )}
                </div>
            )}
          </div>
        )}

        {currentPage === 'upi-check' && (
          <div className="space-y-6 page-enter">
            <div className="flex items-center gap-4">
              <button onClick={() => navigateTo('home')} className="w-10 h-10 glass-card rounded-2xl flex items-center justify-center"><i className="fa-solid fa-arrow-left"></i></button>
              <h2 className="text-xl font-bold">UPI Payment Safety</h2>
            </div>
            <div className="glass-card p-6 rounded-[2.5rem] space-y-4">
              <input value={upiDetails.name} onChange={(e) => setUpiDetails({...upiDetails, name: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="Recipient Name" />
              <input value={upiDetails.upiId} onChange={(e) => setUpiDetails({...upiDetails, upiId: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="Recipient UPI ID (name@bank)" />
              <input value={upiDetails.purpose} onChange={(e) => setUpiDetails({...upiDetails, purpose: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="Purpose (Refund, Gift, Bill...)" />
              
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                {UPI_APPS.map(app => (
                  <button key={app.id} onClick={() => setUpiDetails({...upiDetails, selectedApp: app.id})} className={`flex-shrink-0 px-4 py-3 rounded-2xl flex items-center gap-2 border transition-all ${upiDetails.selectedApp === app.id ? 'bg-emerald-600 border-emerald-500 text-white' : 'glass-card text-slate-500'}`}>
                    <i className={`fa-solid ${app.icon} text-xs`}></i>
                    <span className="text-[10px] font-black">{app.name}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => handleAnalysis('upi')} disabled={loading || !upiDetails.upiId} className="w-full py-5 bg-emerald-600 rounded-2xl font-black text-sm active:scale-[0.98] transition-all">VERIFY RECIPIENT</button>
            </div>
            {result && (
              <div className="space-y-4 pb-10">
                <ResultDisplay result={result} onAction={(a) => { if(a === 'emergency') navigateTo('emergency'); }} />
                {result.level !== SafetyLevel.DANGEROUS && (
                  <button onClick={() => alert('Launching Payment App (Mock)')} className="w-full py-5 bg-white text-black rounded-2xl font-black text-sm shadow-2xl flex items-center justify-center gap-3">
                    <i className="fa-solid fa-paper-plane text-emerald-600"></i> PROCEED TO {upiDetails.selectedApp.toUpperCase()}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {currentPage === 'scam-check' && (
          <div className="space-y-6 page-enter">
            <div className="flex items-center gap-4">
              <button onClick={() => navigateTo('home')} className="w-10 h-10 glass-card rounded-2xl flex items-center justify-center"><i className="fa-solid fa-arrow-left"></i></button>
              <h2 className="text-xl font-bold">Message Scan</h2>
            </div>
            <div className="glass-card p-6 rounded-[2.5rem] space-y-6">
              <textarea 
                value={scamInput} onChange={(e) => setScamInput(e.target.value)}
                className="w-full h-40 bg-black/40 border border-white/5 rounded-3xl p-5 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none font-medium"
                placeholder="Paste the SMS or Link here..."
              />
              <button onClick={() => handleAnalysis('message')} disabled={loading || !scamInput} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-[1.5rem] font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2">
                {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-magnifying-glass-shield"></i>}
                {loading ? 'ANALYZING...' : 'CHECK FOR SCAM'}
              </button>
            </div>
            {result && <ResultDisplay result={result} onAction={(a) => { if(a === 'emergency') navigateTo('emergency'); }} />}
          </div>
        )}

        {currentPage === 'profile-check' && (
          <div className="space-y-6 page-enter">
            <div className="flex items-center gap-4">
              <button onClick={() => navigateTo('home')} className="w-10 h-10 glass-card rounded-2xl flex items-center justify-center"><i className="fa-solid fa-arrow-left"></i></button>
              <h2 className="text-xl font-bold">Profile Guard</h2>
            </div>
            <div className="glass-card p-6 rounded-[2.5rem] space-y-4">
              <input value={profileInput.username} onChange={(e) => setProfileInput({...profileInput, username: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs font-medium focus:ring-1 focus:ring-purple-500 outline-none" placeholder="@username" />
              <button onClick={() => handleAnalysis('profile')} disabled={loading || !profileInput.username} className="w-full py-5 bg-purple-600 rounded-2xl font-black text-sm shadow-lg">SCAN AUTHENTICITY</button>
            </div>
            {result && <ResultDisplay result={result} onAction={(a) => { if(a === 'emergency') navigateTo('emergency'); }} />}
          </div>
        )}

        {currentPage === 'queries' && (
          <div className="space-y-6 page-enter">
            <div className="flex items-center gap-4">
              <button onClick={() => navigateTo('home')} className="w-10 h-10 glass-card rounded-2xl flex items-center justify-center"><i className="fa-solid fa-arrow-left"></i></button>
              <h2 className="text-xl font-bold">AI Support</h2>
            </div>
            <div className="glass-card p-6 rounded-[2.5rem] space-y-4 shadow-2xl">
              <textarea value={userQuery} onChange={(e) => setUserQuery(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-3xl p-5 text-sm h-32 outline-none font-medium" placeholder="Ask about a suspicious call or message..." />
              <button onClick={askQuery} disabled={loading || !userQuery} className="w-full py-4 bg-blue-600 rounded-2xl font-black text-sm shadow-lg">{loading ? 'CONSULTING AI...' : 'GET ADVICE'}</button>
            </div>
            {queryResponse && <div className="p-6 glass-card rounded-3xl bg-blue-500/10 text-xs text-slate-300 italic animate-in fade-in duration-500">"{queryResponse}"</div>}
          </div>
        )}

        {currentPage === 'history' && (
          <div className="space-y-6 page-enter">
            <div className="flex items-center gap-4">
              <button onClick={() => navigateTo('home')} className="w-10 h-10 glass-card rounded-2xl flex items-center justify-center"><i className="fa-solid fa-arrow-left"></i></button>
              <h2 className="text-xl font-bold">Security Log</h2>
            </div>
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center p-12 glass-card rounded-3xl border-dashed">
                  <p className="text-slate-600 text-xs italic">No activity logs found.</p>
                </div>
              ) : (
                history.map(entry => (
                  <div key={entry.id} className="glass-card p-5 rounded-3xl space-y-3 cursor-pointer" onClick={() => {setResult(entry.result); setCurrentPage(entry.type === 'message' ? 'scam-check' : entry.type === 'upi' ? 'upi-check' : entry.type === 'phone' ? 'phone-check' : 'profile-check')}}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs bg-slate-800 text-slate-400`}><i className={`fa-solid ${entry.type === 'message' ? 'fa-message' : entry.type === 'upi' ? 'fa-indian-rupee-sign' : entry.type === 'phone' ? 'fa-phone-volume' : 'fa-user-shield'}`}></i></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{entry.type}</span>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-[8px] font-black ${entry.result.level === SafetyLevel.SAFE ? 'bg-emerald-500/20 text-emerald-400' : entry.result.level === SafetyLevel.SUSPICIOUS ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>{entry.result.level}</div>
                    </div>
                    <p className="text-xs text-white font-medium line-clamp-2 italic">"{entry.input}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {currentPage === 'emergency' && (
          <div className="space-y-6 page-enter pb-10">
            <div className="flex items-center gap-4">
              <button onClick={() => navigateTo('home')} className="w-10 h-10 glass-card rounded-2xl flex items-center justify-center"><i className="fa-solid fa-arrow-left"></i></button>
              <h2 className="text-2xl font-black text-rose-500 tracking-tight">Rescue Protocol</h2>
            </div>
            {sosActive ? (
              <div className="space-y-4">
                <div className="p-10 glass-card rounded-[3rem] text-center border-rose-500/40 bg-rose-500/10 animate-in zoom-in duration-700 shadow-2xl relative overflow-hidden">
                  <i className="fa-solid fa-user-shield text-7xl text-rose-500 mb-6 animate-pulse"></i>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Protocol Active</h2>
                  <p className="text-sm text-rose-200 mt-2 font-medium">Follow these exact steps now.</p>
                </div>
                <button onClick={() => setSosActive(false)} className="w-full py-3 glass-card rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:text-emerald-400 transition-colors">I am safe now / Deactivate</button>
              </div>
            ) : (
              <button onClick={() => setSosActive(true)} className="w-full py-12 bg-gradient-to-br from-rose-600 to-rose-800 text-white rounded-[2.5rem] font-black text-3xl shadow-2xl shadow-rose-900/40 active:scale-95 transition-all border border-rose-400/20 danger-pulse uppercase tracking-tighter">Activate SOS</button>
            )}
            <div className="space-y-4">
              {[
                { title: 'Freeze Bank Account', text: 'Call your bank or use the mobile app instantly to block all transactions.', icon: 'fa-bank' },
                { title: 'National Helpline 1930', text: 'Official Indian national cyber fraud reporting number. Available 24/7.', icon: 'fa-phone-volume' },
                { title: 'Save Evidence', text: 'Capture screenshots of chats, UPI receipts, and call logs.', icon: 'fa-camera' },
                { title: 'Formal Report', text: 'Visit cybercrime.gov.in and file an official complaint.', icon: 'fa-file-signature' }
              ].map((s, i) => (
                <div key={i} className={`p-6 glass-card rounded-[2rem] flex gap-5 border-l-4 border-l-rose-600 animate-in slide-in-from-right-4 transition-all ${sosActive ? 'opacity-100' : 'opacity-60 grayscale'}`} style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex-shrink-0 flex items-center justify-center text-rose-500 text-2xl shadow-inner"><i className={`fa-solid ${s.icon}`}></i></div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">{s.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
