import { useEffect, useState } from 'react';

const steps = [
  { target: '[data-tour="sidebar"]', title: 'Welcome!', text: 'This is your command center.' },
  { target: '[data-tour="settings"]', title: 'Add your AI keys', text: 'First, click here to add your Gemini or OpenRouter API keys. We use a Bring Your Own Key model.' },
  { target: '[data-tour="integrations"]', title: 'Connect your accounts', text: 'Next, connect your Gmail, Slack, or Google Sheets accounts here.' },
  { target: '[data-tour="builder"]', title: 'Build your automation', text: 'Finally, go here to describe your automation in plain English and watch it come to life.' }
];

export default function OnboardingTour() {
  const [step, setStep] = useState(-1);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('agentflow_onboarding_complete')) {
      setStep(0);
    }
  }, []);

  useEffect(() => {
    if (step < 0) return undefined;
    const updatePosition = () => {
      const element = document.querySelector(steps[step].target);
      if (!element) return;
      const rect = element.getBoundingClientRect();
      setPosition({ top: Math.min(rect.bottom + 12, window.innerHeight - 190), left: Math.max(16, Math.min(rect.left, window.innerWidth - 360)) });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [step]);

  const finish = () => {
    localStorage.setItem('agentflow_onboarding_complete', '1');
    setStep(-1);
  };

  if (step < 0 || !position) return null;
  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/30">
      <div className="absolute max-w-sm rounded-lg border border-teal-200 bg-white p-5 shadow-2xl" style={position}>
        <p className="text-sm font-bold text-teal-800">{current.title}</p>
        <p className="mt-2 text-sm text-slate-700">{current.text}</p>
        <div className="mt-5 flex items-center justify-between gap-2">
          <button type="button" onClick={finish} className="text-xs font-semibold text-slate-500 hover:text-slate-900">Skip Tour</button>
          <div className="flex gap-2">
            {step > 0 && <button type="button" onClick={() => setStep((value) => value - 1)} className="rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">Back</button>}
            <button type="button" onClick={() => (step === steps.length - 1 ? finish() : setStep((value) => value + 1))} className="rounded bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white">
              {step === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
