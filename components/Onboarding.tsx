
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
    if (val.length > 10) onInteraction(true);
  };

  return (
    <div className="space-y-2">
      <input 
        className="w-full bg-black/40 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500" 
        placeholder="Try: Click here to win 1 Lakh!" 
        value={input} 
        onChange={(e) => checkInput(e.target.value)} 
      />
      {isFlagged && <div className="text-[10px] text-rose-400 animate-bounce">⚠️ Potential scam detected!</div>}
    </div>
  );
};

const UPIDemo: React.FC<{ onInteraction: (val: boolean) => void }> = ({ onInteraction }) => {
  const [checked, setChecked] = useState(false);
  const [upi, setUpi] = useState('');
  
  const handleCheck = () => {
    if (upi.includes('@')) {
      setChecked(true);
      onInteraction(true);
    } else {
      alert('Enter a valid UPI ID (e.g. name@okaxis)');
    }
  };

  return (
    <div className="space-y-2">
      <input 
        className="w-full bg-black/40 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none mb-1" 
        placeholder="Enter risky UPI ID..." 
        value={upi}
        onChange={(e) => setUpi(e.target.value)}
      />
      <button 
        onClick={handleCheck} 
        className="w-full p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-all"
      >
        Verify Recipient
      </button>
      {checked && <div className="text-[10px] text-amber-400">⚠️ Warning: High frequency transactions detected.</div>}
    </div>
  );
};

const ProfileDemo: React.FC<{ onInteraction: (val: boolean) => void }> = ({ onInteraction }) => {
  const [name, setName] = useState('');
  
  useEffect(() => {
    if (name.length > 5) onInteraction(true);
  }, [name, onInteraction]);

  return (
    <div className="space-y-2">
      <input 
        className="w-full bg-black/40 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none focus:ring-1 focus:ring-purple-500" 
        placeholder="Social username..." 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
      />
      {name.length > 5 && <div className="text-[10px] text-purple-400 animate-pulse">Checking for blue-tick impersonation...</div>}
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
    <div className="space-y-2">
      <button 
        onClick={handleSOS} 
        className="w-full p-3 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/20 hover:bg-rose-500 active:scale-95 transition-all"
      >
        SOS: HELP ME
      </button>
      {active && <div className="text-[10px] text-rose-400 font-bold uppercase animate-pulse">Protocol Active! Steps generated.</div>}
    </div>
  );
};

const steps: OnboardingStep[] = [
  {
    title: "Welcome to CyberGuardian",
    description: "Your digital shield against online scams. We help you stay safe while using the internet and digital payments.",
    icon: "fa-shield-halved",
    color: "bg-blue-600",
    DemoComponent: () => (
      <div className="flex justify-center py-4">
        <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
          <i className="fa-solid fa-user-shield text-4xl text-blue-400"></i>
        </div>
      </div>
    )
  },
  {
    title: "Scam Scanner",
    description: "Scan suspicious SMS or links instantly. Try typing a realistic scam message to see it work.",
    icon: "fa-comment-slash",
    color: "bg-indigo-600",
    DemoComponent: ScamScannerDemo
  },
  {
    title: "UPI Security",
    description: "Never lose money to cashback scams again. Verify the recipient before you hit pay.",
    icon: "fa-indian-rupee-sign",
    color: "bg-emerald-600",
    DemoComponent: UPIDemo
  },
  {
    title: "Profile Guard",
    description: "Avoid fake profiles and impersonators. We verify identities for you.",
    icon: "fa-user-lock",
    color: "bg-purple-600",
    DemoComponent: ProfileDemo
  },
  {
    title: "Emergency Protocol",
    description: "Already scammed? Click SOS for an immediate checklist to protect your assets.",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-sm glass-card rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className={`${step.color} p-8 flex justify-center text-white text-5xl transition-colors duration-500 shadow-inner`}>
          <i className={`fa-solid ${step.icon}`}></i>
        </div>
        
        <div className="p-8 space-y-4">
          <h2 className="text-2xl font-bold text-slate-100 leading-tight">{step.title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
          
          <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 min-h-[100px] flex flex-col justify-center shadow-inner">
             {DemoComponent && <DemoComponent onInteraction={setInteracted} />}
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-blue-500' : 'w-1.5 bg-slate-700'}`} 
                />
              ))}
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={onComplete} 
                className="text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors"
              >
                Skip
              </button>
              <button 
                onClick={nextStep} 
                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${interacted || currentStep === 0 ? 'scale-105 opacity-100 shadow-lg' : 'opacity-40'} ${currentStep === steps.length - 1 ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-white text-slate-950 hover:bg-slate-200'}`}
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
