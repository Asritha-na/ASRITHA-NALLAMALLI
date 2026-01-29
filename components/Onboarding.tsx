
import React, { useState, useEffect } from 'react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
  color: string;
  DemoComponent?: React.FC<{ onInteraction: (val: boolean) => void }>;
}

const ScamScannerDemo: React.FC<{ onInteraction: (val: boolean) => void }> = ({ onInteraction }) => {
  const [input, setInput] = useState('');
  const [isFlagged, setIsFlagged] = useState(false);
  
  const checkInput = (val: string) => {
    setInput(val);
    const flagged = val.toLowerCase().includes('win') || val.toLowerCase().includes('lucky') || val.toLowerCase().includes('http');
    setIsFlagged(flagged);
    // Meaningful length required to count as interaction
    if (val.trim().length > 15) onInteraction(true);
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-300">
      <input 
        className="w-full bg-black/40 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium" 
        placeholder="Try: Congrats! You won 1 Lakh cash prize..." 
        value={input} 
        onChange={(e) => checkInput(e.target.value)} 
      />
      {isFlagged && <div className="text-[10px] text-rose-400 font-bold flex items-center gap-1.5 animate-bounce"><i className="fa-solid fa-triangle-exclamation"></i> AI Analysis: Potential Scam detected!</div>}
    </div>
  );
};

const UPIDemo: React.FC<{ onInteraction: (val: boolean) => void }> = ({ onInteraction }) => {
  const [checked, setChecked] = useState(false);
  const [upi, setUpi] = useState('');
  
  const handleCheck = () => {
    if (upi.includes('@') && upi.length > 5) {
      setChecked(true);
      onInteraction(true);
    } else {
      alert('Enter a full UPI ID like name@bank');
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      <input 
        className="w-full bg-black/40 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500 font-medium" 
        placeholder="Enter risky UPI ID..." 
        value={upi}
        onChange={(e) => setUpi(e.target.value)}
      />
      <button 
        onClick={handleCheck} 
        className="w-full p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2"
      >
        <i className="fa-solid fa-shield-check"></i> Verify Payee
      </button>
      {checked && <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1.5"><i className="fa-solid fa-circle-info"></i> Security Risk: Known fake refund agent ID.</div>}
    </div>
  );
};

const ProfileDemo: React.FC<{ onInteraction: (val: boolean) => void }> = ({ onInteraction }) => {
  const [name, setName] = useState('');
  
  useEffect(() => {
    if (name.trim().length > 6) onInteraction(true);
  }, [name, onInteraction]);

  return (
    <div className="space-y-2 animate-in fade-in duration-300">
      <div className="relative">
        <input 
          className="w-full bg-black/40 border border-slate-700 rounded-xl p-3 pl-8 text-xs text-white outline-none focus:ring-1 focus:ring-purple-500 transition-all font-medium" 
          placeholder="Instagram handle..." 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        <i className="fa-solid fa-at absolute left-3 top-3.5 text-slate-600 text-[10px]"></i>
      </div>
      {name.trim().length > 6 && <div className="text-[10px] text-purple-400 font-bold animate-pulse flex items-center gap-1.5"><i className="fa-solid fa-robot"></i> AI checking for profile cloned traits...</div>}
    </div>
  );
};

const EmergencyDemo: React.FC<{ onInteraction: (val: boolean) => void }> = ({ onInteraction }) => {
  const [active, setActive] = useState(false);
  
  const handleSOS = () => {
    setActive(true);
    onInteraction(true);
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      <button 
        onClick={handleSOS} 
        className="w-full py-4 bg-rose-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-rose-900/30 hover:bg-rose-500 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <i className="fa-solid fa-burst animate-ping"></i> SOS: I AM SCAMMED
      </button>
      {active && <div className="text-[10px] text-rose-400 font-black uppercase text-center animate-pulse tracking-widest">Protocol Active! Checklist Locked.</div>}
    </div>
  );
};

const steps: OnboardingStep[] = [
  {
    title: "Welcome to CyberGuardian",
    description: "Your digital shield against online scams. We help you stay safe while using the internet and digital payments in India.",
    icon: "fa-shield-halved",
    color: "bg-blue-600",
    DemoComponent: () => (
      <div className="flex justify-center py-6">
        <div className="w-28 h-28 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          <i className="fa-solid fa-user-shield text-5xl text-blue-400"></i>
        </div>
      </div>
    )
  },
  {
    title: "Scam Scanner",
    description: "Instantly scan SMS or WhatsApp links. Try typing a realistic fake lottery or KYC update message to see it work.",
    icon: "fa-comment-slash",
    color: "bg-indigo-600",
    DemoComponent: ScamScannerDemo
  },
  {
    title: "UPI Security",
    description: "Never lose money to 'Cashback' scams again. Verify the recipient before you ever hit pay.",
    icon: "fa-indian-rupee-sign",
    color: "bg-emerald-600",
    DemoComponent: UPIDemo
  },
  {
    title: "Profile Guard",
    description: "Avoid cloned accounts of friends or celebrity impersonators. We verify handles for safety red flags.",
    icon: "fa-user-lock",
    color: "bg-purple-600",
    DemoComponent: ProfileDemo
  },
  {
    title: "Emergency Rescue",
    description: "Think you've been scammed? Tap SOS for an immediate rescue protocol to protect your remaining assets.",
    icon: "fa-circle-exclamation",
    color: "bg-rose-600",
    DemoComponent: EmergencyDemo
  }
];

interface OnboardingProps { onComplete: () => void; }

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [interacted, setInteracted] = useState(false);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setInteracted(false);
    } else { 
      onComplete(); 
    }
  };

  const step = steps[currentStep];
  const DemoComponent = step.DemoComponent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
      <div className="w-full max-w-sm glass-card rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 duration-500 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border-white/5">
        <div className={`${step.color} p-10 flex justify-center text-white text-6xl transition-colors duration-700 shadow-inner relative`}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/20"></div>
          <i className={`fa-solid ${step.icon} relative z-10 drop-shadow-2xl`}></i>
        </div>
        
        <div className="p-8 pt-10 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-100 leading-tight tracking-tight">{step.title}</h2>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">{step.description}</p>
          </div>
          
          <div className="bg-black/30 rounded-3xl p-6 border border-white/5 min-h-[130px] flex flex-col justify-center shadow-inner relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 blur-2xl rounded-full -mr-8 -mt-8"></div>
             {DemoComponent && <DemoComponent onInteraction={setInteracted} />}
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'w-1.5 bg-slate-800'}`} 
                />
              ))}
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={onComplete} 
                className="px-3 py-2 text-xs font-black text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-widest"
              >
                Skip
              </button>
              <button 
                onClick={nextStep} 
                className={`px-8 py-3 rounded-2xl font-black text-xs transition-all tracking-wider uppercase ${interacted || currentStep === 0 ? 'scale-105 opacity-100 shadow-xl' : 'opacity-30 pointer-events-none'} ${currentStep === steps.length - 1 ? 'bg-emerald-600 text-white shadow-emerald-900/30' : 'bg-white text-slate-950 hover:bg-slate-200'}`}
              >
                {currentStep === steps.length - 1 ? 'Safe Now' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
