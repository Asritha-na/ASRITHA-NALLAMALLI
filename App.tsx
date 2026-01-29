
import React, { useState, useEffect } from 'react';
import { Page, AnalysisResult, SafetyLevel, HistoryEntry, SafetyTip, UserBadge, QuizQuestion } from './types';
import { analyzeContent, getDailySafetyTip, getCyberSecurityAdvice } from './geminiService';
import ResultDisplay from './components/ResultDisplay';
import Onboarding from './components/Onboarding';

const PREBUILT_TIPS: SafetyTip[] = [
  { id: 'tip-1', title: 'The Electricity Bill Trap', content: '"Power will be cut tonight" is a common scam tactic. Banks/utilities never rush you via SMS.', category: 'PHISHING' },
  { id: 'tip-2', title: 'Cashback Scams', content: 'You never need to enter your PIN to receive money. If someone asks you to, it is a scam.', category: 'UPI' },
  { id: 'tip-3', title: 'Profile Impersonation', content: 'Check if the account has common followers. Scammers create "clone" accounts of friends.', category: 'SOCIAL' },
  { id: 'tip-4', title: '2FA Protection', content: 'Enable Two-Factor Authentication on WhatsApp and Social Media to block hackers.', category: 'PASSWORD' },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: 'q1', question: 'Do you need to enter your PIN to receive money in your UPI account?', options: ['Yes', 'No', 'Only for large amounts'], correctIndex: 1, explanation: 'PIN is ONLY for sending money. Scammers use "receive" links to trick you.' },
  { id: 'q2', question: 'A message says your bank account is blocked and asks you to click a link. What should you do?', options: ['Click to unblock', 'Call the official bank number', 'Reply to the message'], correctIndex: 1, explanation: 'Never click links in SMS. Always check with official sources.' },
  { id: 'q3', question: 'What is the safest way to verify a suspicious job offer received on WhatsApp?', options: ['Pay the registration fee', 'Check the official website of the company', 'Give your Aadhaar details for verification'], correctIndex: 1, explanation: 'Real companies never ask for money on WhatsApp without prior formal contact.' }
];

const BADGES: UserBadge[] = [
  { id: 'b1', name: 'Scam Hunter', icon: 'fa-user-ninja', color: 'bg-indigo-500' },
  { id: 'b2', name: 'Cyber Pro', icon: 'fa-medal', color: 'bg-emerald-500' },
  { id: 'b3', name: 'Digital Guardian', icon: 'fa-crown', color: 'bg-amber-500' }
];

const UPI_APPS = [
  { name: 'Google Pay', id: 'gpay', icon: 'fa-google' },
  { name: 'PhonePe', id: 'phonepe', icon: 'fa-mobile-screen' },
  { name: 'PayTM', id: 'paytm', icon: 'fa-wallet' },
  { name: 'Other / Any', id: 'any', icon: 'fa-indian-rupee-sign' }
];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [dailyTip, setDailyTip] = useState<{ title: string; content: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Persistence States
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [trustedItems, setTrustedItems] = useState<string[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [queryResponse, setQueryResponse] = useState('');
  const [sosActive, setSosActive] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Inputs
  const [scamInput, setScamInput] = useState('');
  const [upiDetails, setUpiDetails] = useState({ name: '', upiId: '', purpose: '', selectedApp: 'any' });
  const [profileInput, setProfileInput] = useState({ username: '', platform: 'Instagram' });

  useEffect(() => {
    getDailySafetyTip().then(setDailyTip);
    if (!localStorage.getItem('cyberguardian_onboarding_seen')) setShowOnboarding(true);
    setHistory(JSON.parse(localStorage.getItem('cyberguardian_history') || '[]'));
    setFavorites(JSON.parse(localStorage.getItem('cyberguardian_favorites') || '[]'));
    setTrustedItems(JSON.parse(localStorage.getItem('cyberguardian_trusted') || '[]'));
    setBadges(JSON.parse(localStorage.getItem('cyberguardian_badges') || '[]'));
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('cyberguardian_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  const handleAnalysis = async (type: 'message' | 'upi' | 'profile') => {
    setLoading(true);
    let content = type === 'message' ? scamInput : type === 'upi' ? `Payee: ${upiDetails.name}, ID: ${upiDetails.upiId}, Purpose: ${upiDetails.purpose}` : profileInput.username;
    const res = await analyzeContent(content, type);
    setResult(res);
    const newEntry: HistoryEntry = { id: Date.now().toString(), timestamp: Date.now(), type, input: content, result: res };
    const newHistory = [newEntry, ...history].slice(0, 30);
    setHistory(newHistory);
    localStorage.setItem('cyberguardian_history', JSON.stringify(newHistory));
    setLoading(false);
  };

  const markAsTrusted = (input: string) => {
    if (!trustedItems.includes(input)) {
      const newTrusted = [...trustedItems, input];
      setTrustedItems(newTrusted);
      localStorage.setItem('cyberguardian_trusted', JSON.stringify(newTrusted));
      alert('Added to your trusted list!');
    } else {
      alert('Item is already in your trusted list.');
    }
  };

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('cyberguardian_favorites', JSON.stringify(newFavs));
  };

  const handleProceedToUPI = () => {
    const { upiId, name, purpose } = upiDetails;
    // Standard UPI deep link
    const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&tn=${encodeURIComponent(purpose)}&cu=INR`;
    
    // Attempting to redirect (browser will prompt to open installed UPI app)
    window.location.href = upiLink;
  };

  const askQuery = async () => {
    setLoading(true);
    const res = await getCyberSecurityAdvice(userQuery);
    setQueryResponse(res);
    setLoading(false);
  };

  const completeQuizStep = (selectedIndex: number) => {
    if (selectedIndex === QUIZ_QUESTIONS[quizIndex].correctIndex) {
      if (quizIndex < QUIZ_QUESTIONS.length - 1) {
        setQuizIndex(quizIndex + 1);
      } else {
        setQuizCompleted(true);
        if (!badges.includes('b1')) {
          const newBadges = [...badges, 'b1'];
          setBadges(newBadges);
          localStorage.setItem('cyberguardian_badges', JSON.stringify(newBadges));
        }
      }
    } else {
      alert("Oops! That's not right. " + QUIZ_QUESTIONS[quizIndex].explanation);
    }
  };

  const renderHome = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">CyberGuardian</h1>
        <p className="text-slate-400 text-sm">Real-time protection for your digital life.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'scam-check', icon: 'fa-comment-slash', label: 'Scan Scam', color: 'bg-indigo-500' },
          { id: 'upi-check', icon: 'fa-indian-rupee-sign', label: 'UPI Shield', color: 'bg-emerald-500' },
          { id: 'profile-check', icon: 'fa-user-shield', label: 'Profiles', color: 'bg-purple-500' },
          { id: 'queries', icon: 'fa-lightbulb', label: 'Advice', color: 'bg-blue-500' },
          { id: 'history', icon: 'fa-clock-rotate-left', label: 'History', color: 'bg-slate-700' },
          { id: 'awareness', icon: 'fa-book-open-reader', label: 'Learn', color: 'bg-slate-700' },
        ].map((item) => (
          <button key={item.id} onClick={() => setCurrentPage(item.id as Page)} className="p-4 glass-card rounded-2xl flex flex-col items-center gap-2 hover:bg-white/5 transition-all">
            <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center text-lg shadow-lg shadow-black/20`}><i className={`fa-solid ${item.icon}`}></i></div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>

      <button onClick={() => setCurrentPage('emergency')} className="w-full p-6 bg-rose-600 rounded-2xl flex items-center justify-between danger-glow group transition-all">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse"><i className="fa-solid fa-circle-exclamation"></i></div>
          <div className="text-left"><h3 className="font-bold">I'VE BEEN SCAMMED</h3><p className="text-rose-100/70 text-[10px]">Step-by-step emergency protocol</p></div>
        </div>
        <i className="fa-solid fa-chevron-right group-hover:translate-x-1"></i>
      </button>

      {badges.length > 0 && (
        <div className="glass-card p-4 rounded-2xl">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">Achievements</h4>
          <div className="flex gap-3">
            {badges.map(bId => {
              const b = BADGES.find(x => x.id === bId);
              return b ? <div key={b.id} className={`${b.color} w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-lg animate-in zoom-in duration-300`} title={b.name}><i className={`fa-solid ${b.icon}`}></i></div> : null;
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4 animate-in slide-in-from-right-10 duration-500">
      <div className="flex items-center gap-4"><button onClick={() => setCurrentPage('home')} className="w-8 h-8 glass-card rounded-full flex items-center justify-center"><i className="fa-solid fa-arrow-left"></i></button><h2 className="text-xl font-bold">Past Analyses</h2></div>
      {history.length === 0 ? <p className="text-center p-12 text-slate-600">No checks yet. Scan something to see it here!</p> : (
        <div className="space-y-3">
          {history.map(h => (
            <div key={h.id} className="p-4 glass-card rounded-2xl border-l-4 border-l-indigo-500 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors" onClick={() => {setResult(h.result); setCurrentPage(h.type === 'message' ? 'scam-check' : h.type === 'upi' ? 'upi-check' : 'profile-check')}}>
              <div className="flex-1 overflow-hidden pr-4"><p className="font-bold text-sm capitalize text-slate-200">{h.type} Check</p><p className="text-[10px] text-slate-500 truncate">{h.input}</p></div>
              <span className={`text-[10px] font-bold whitespace-nowrap px-2 py-1 rounded bg-black/20 ${h.result.level === SafetyLevel.SAFE ? 'text-emerald-400' : h.result.level === SafetyLevel.SUSPICIOUS ? 'text-amber-400' : 'text-rose-400'}`}>{h.result.level}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAwareness = () => {
    const displayedTips = showOnlyFavorites ? PREBUILT_TIPS.filter(t => favorites.includes(t.id)) : PREBUILT_TIPS;

    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4"><button onClick={() => setCurrentPage('home')} className="w-8 h-8 glass-card rounded-full flex items-center justify-center"><i className="fa-solid fa-arrow-left"></i></button><h2 className="text-xl font-bold">Safety Center</h2></div>
          <button onClick={() => setShowOnlyFavorites(!showOnlyFavorites)} className={`px-3 py-1 text-[8px] font-extrabold uppercase rounded-full border transition-all ${showOnlyFavorites ? 'bg-rose-500 border-rose-500' : 'border-slate-700 text-slate-500'}`}>{showOnlyFavorites ? 'Favorites Only' : 'Show All'}</button>
        </div>

        {!quizCompleted ? (
          <div className="glass-card p-6 rounded-2xl bg-indigo-500/5 border-indigo-500/20">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-sm"><i className="fa-solid fa-brain text-indigo-400"></i> Safety Quiz ({quizIndex + 1}/{QUIZ_QUESTIONS.length})</h3>
            <p className="text-xs text-slate-100 mb-6 leading-relaxed">{QUIZ_QUESTIONS[quizIndex].question}</p>
            <div className="grid gap-2">
              {QUIZ_QUESTIONS[quizIndex].options.map((opt, i) => (
                <button key={i} onClick={() => completeQuizStep(i)} className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left text-xs border border-white/5 hover:border-white/20 transition-all font-medium">{opt}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 rounded-3xl text-center bg-emerald-500/10 border-emerald-500/20 animate-in zoom-in duration-500">
            <i className="fa-solid fa-medal text-5xl text-emerald-400 mb-4 drop-shadow-lg"></i>
            <h3 className="text-lg font-bold">You're a Scam Hunter!</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">You mastered the basics of digital safety. Share your knowledge with others!</p>
            <button onClick={() => {setQuizIndex(0); setQuizCompleted(false);}} className="mt-4 px-4 py-2 bg-emerald-600 rounded-lg text-[10px] font-bold">Retake Quiz</button>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">{showOnlyFavorites ? 'Your Saved Tips' : 'All Safety Tips'}</h3>
          {displayedTips.map(tip => (
            <div key={tip.id} className="p-5 glass-card rounded-2xl flex justify-between items-start group hover:bg-white/5 transition-colors">
              <div className="flex-1 pr-4"><h4 className="text-blue-400 font-bold text-xs mb-1">{tip.title}</h4><p className="text-[10px] text-slate-400 leading-relaxed">{tip.content}</p></div>
              <button onClick={() => toggleFavorite(tip.id)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${favorites.includes(tip.id) ? 'bg-rose-500/20 text-rose-500 scale-110 shadow-lg' : 'text-slate-700 hover:text-rose-400'}`} aria-label="Toggle Favorite"><i className={`${favorites.includes(tip.id) ? 'fa-solid' : 'fa-regular'} fa-heart`}></i></button>
            </div>
          ))}
          {displayedTips.length === 0 && <p className="text-center p-8 text-slate-600 text-xs italic">No favorite tips yet. Tap the heart icon to save one!</p>}
        </div>
      </div>
    );
  };

  const commonResultHandler = (action: string, input: string) => {
    if (action === 'emergency') setCurrentPage('emergency');
    if (action === 'trust') markAsTrusted(input);
  };

  return (
    <div className="min-h-screen gradient-bg p-4 flex justify-center overflow-x-hidden text-slate-100">
      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
      <main className="w-full max-w-sm">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setCurrentPage('home'); setResult(null)}}>
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30"><i className="fa-solid fa-shield-halved text-white text-base"></i></div>
            <span className="font-bold text-xl tracking-tight">CyberGuardian</span>
          </div>
          <button onClick={() => setCurrentPage('history')} className="w-9 h-9 glass-card rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-all"><i className="fa-solid fa-clock-rotate-left"></i></button>
        </header>

        {currentPage === 'home' && renderHome()}
        {currentPage === 'scam-check' && (
          <div className="space-y-4 animate-in slide-in-from-right-10 duration-500">
            <div className="flex items-center gap-4"><button onClick={() => {setCurrentPage('home'); setResult(null)}} className="w-8 h-8 glass-card rounded-full flex items-center justify-center"><i className="fa-solid fa-arrow-left"></i></button><h2 className="text-xl font-bold">Scam Scanner</h2></div>
            <div className="glass-card p-4 rounded-2xl space-y-4">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest px-1">Paste Message or Link</p>
              <textarea value={scamInput} onChange={(e) => setScamInput(e.target.value)} className="w-full h-32 bg-black/30 border border-slate-700 rounded-xl p-4 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="e.g. Your KYC will expire! Click to verify: bit.ly/..." />
              <button onClick={() => handleAnalysis('message')} disabled={loading || !scamInput} className="w-full py-4 bg-indigo-600 rounded-xl font-bold shadow-lg shadow-indigo-600/20">{loading ? 'Scanning...' : 'Scan Now'}</button>
            </div>
            {result && <ResultDisplay result={result} onAction={(a) => commonResultHandler(a, scamInput)} />}
          </div>
        )}
        {currentPage === 'upi-check' && (
          <div className="space-y-4 animate-in slide-in-from-right-10 duration-500">
            <div className="flex items-center gap-4"><button onClick={() => {setCurrentPage('home'); setResult(null)}} className="w-8 h-8 glass-card rounded-full flex items-center justify-center"><i className="fa-solid fa-arrow-left"></i></button><h2 className="text-xl font-bold">UPI Security</h2></div>
            <div className="glass-card p-5 rounded-2xl space-y-4 shadow-xl">
              <div className="space-y-3">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest px-1">Payment Details</p>
                <input value={upiDetails.name} onChange={(e) => setUpiDetails({...upiDetails, name: e.target.value})} className="w-full bg-black/30 border border-slate-700 rounded-xl p-4 text-sm" placeholder="Payee Name" />
                <input value={upiDetails.upiId} onChange={(e) => setUpiDetails({...upiDetails, upiId: e.target.value})} className="w-full bg-black/30 border border-slate-700 rounded-xl p-4 text-sm" placeholder="Recipient UPI ID (e.g. name@bank)" />
                <input value={upiDetails.purpose} onChange={(e) => setUpiDetails({...upiDetails, purpose: e.target.value})} className="w-full bg-black/30 border border-slate-700 rounded-xl p-4 text-sm" placeholder="Purpose (e.g. Refund, Bill)" />
                
                <div className="space-y-2 mt-4">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest px-1">Choose UPI App</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {UPI_APPS.map(app => (
                      <button 
                        key={app.id}
                        onClick={() => setUpiDetails({...upiDetails, selectedApp: app.id})}
                        className={`flex-shrink-0 px-3 py-2 rounded-xl flex items-center gap-2 border transition-all ${upiDetails.selectedApp === app.id ? 'bg-blue-600 border-blue-500 shadow-lg' : 'bg-black/20 border-white/5 text-slate-400'}`}
                      >
                        <i className={`fa-solid ${app.icon} text-xs`}></i>
                        <span className="text-[10px] font-bold">{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => handleAnalysis('upi')} disabled={loading || !upiDetails.upiId} className="w-full py-4 bg-emerald-600 rounded-xl font-bold shadow-lg shadow-emerald-600/20">{loading ? 'Analyzing...' : 'Analyze Risk Before Paying'}</button>
            </div>
            
            {result && (
              <div className="space-y-4 pb-8">
                <ResultDisplay result={result} onAction={(a) => commonResultHandler(a, upiDetails.upiId)} />
                {result.level !== SafetyLevel.DANGEROUS && (
                  <button 
                    onClick={handleProceedToUPI}
                    className="w-full py-4 bg-white text-slate-950 rounded-xl font-extrabold text-sm shadow-2xl flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-700"
                  >
                    <i className="fa-solid fa-paper-plane"></i> 
                    Proceed to {UPI_APPS.find(a => a.id === upiDetails.selectedApp)?.name || 'UPI App'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {currentPage === 'profile-check' && (
          <div className="space-y-4 animate-in slide-in-from-right-10 duration-500">
            <div className="flex items-center gap-4"><button onClick={() => {setCurrentPage('home'); setResult(null)}} className="w-8 h-8 glass-card rounded-full flex items-center justify-center"><i className="fa-solid fa-arrow-left"></i></button><h2 className="text-xl font-bold">Profile Guard</h2></div>
            <div className="glass-card p-5 rounded-2xl space-y-3 shadow-xl">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest px-1">Check Impersonation</p>
              <input value={profileInput.username} onChange={(e) => setProfileInput({...profileInput, username: e.target.value})} className="w-full bg-black/30 border border-slate-700 rounded-xl p-4 text-sm" placeholder="Username (e.g. official_pay)" />
              <button onClick={() => handleAnalysis('profile')} disabled={loading || !profileInput.username} className="w-full py-4 bg-purple-600 rounded-xl font-bold shadow-lg shadow-purple-600/20">Check Authenticity</button>
            </div>
            {result && <ResultDisplay result={result} onAction={(a) => commonResultHandler(a, profileInput.username)} />}
          </div>
        )}
        {currentPage === 'history' && renderHistory()}
        {currentPage === 'queries' && (
          <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
            <div className="flex items-center gap-4"><button onClick={() => setCurrentPage('home')} className="w-8 h-8 glass-card rounded-full flex items-center justify-center"><i className="fa-solid fa-arrow-left"></i></button><h2 className="text-xl font-bold">AI Assistant</h2></div>
            <div className="glass-card p-5 rounded-2xl space-y-4 shadow-xl">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest px-1">Ask our security expert</p>
              <textarea className="w-full bg-black/30 border border-slate-700 rounded-xl p-4 text-xs h-24 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Ask about safety steps, common scams, or what to do next..." value={userQuery} onChange={(e) => setUserQuery(e.target.value)} />
              <button onClick={askQuery} disabled={loading || !userQuery} className="w-full py-3 bg-blue-600 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20">{loading ? 'Thinking...' : 'Get Advice'}</button>
            </div>
            {queryResponse && <div className="p-5 glass-card rounded-2xl bg-blue-500/5 border-blue-500/20 text-xs text-slate-300 italic animate-in fade-in duration-500 leading-relaxed">"{queryResponse}"</div>}
          </div>
        )}
        {currentPage === 'awareness' && renderAwareness()}
        {currentPage === 'emergency' && (
          <div className="space-y-6 animate-in slide-in-from-top-10 duration-500">
            <div className="flex items-center gap-4"><button onClick={() => setCurrentPage('home')} className="w-8 h-8 glass-card rounded-full flex items-center justify-center"><i className="fa-solid fa-arrow-left"></i></button><h2 className="text-xl font-bold text-rose-500">Emergency Protocol</h2></div>
            {sosActive ? (
              <div className="p-8 glass-card rounded-3xl text-center border-rose-500/50 bg-rose-500/10 animate-in zoom-in duration-500 shadow-2xl">
                <i className="fa-solid fa-user-shield text-6xl text-rose-500 mb-4 animate-pulse"></i>
                <h2 className="text-2xl font-bold">SOS ACTIVE</h2>
                <p className="text-xs text-slate-300 mt-2">Personal protocol initiated. Call your bank immediately.</p>
              </div>
            ) : (
              <button onClick={() => setSosActive(true)} className="w-full py-8 bg-rose-600 text-white rounded-3xl font-extrabold text-2xl shadow-2xl shadow-rose-600/40 active:scale-95 transition-all">ACTIVATE SOS</button>
            )}
            <div className="space-y-4">
              {[
                { title: 'Freeze Bank Account', text: 'Call your bank or use the mobile app instantly to block all transactions.', icon: 'fa-bank' },
                { title: 'National Helpline 1930', text: 'Official national cyber fraud reporting number available 24/7.', icon: 'fa-phone-volume' },
                { title: 'Save Evidence', text: 'Take screenshots of messages, receipts, and call logs.', icon: 'fa-camera' }
              ].map((s, i) => (
                <div key={i} className="p-5 glass-card rounded-2xl flex gap-4 border-l-4 border-l-rose-600 shadow-lg">
                  <div className="w-12 h-12 bg-rose-500/10 rounded-full flex-shrink-0 flex items-center justify-center text-rose-500 text-xl"><i className={`fa-solid ${s.icon}`}></i></div>
                  <div><h4 className="font-bold text-sm text-slate-200">{s.title}</h4><p className="text-[10px] text-slate-500 leading-relaxed mt-1">{s.text}</p></div>
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
