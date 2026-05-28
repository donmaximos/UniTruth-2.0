import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const loadingMessages = [
  'Ανάλυση Ψυχομετρικού Προφίλ RIASEC...',
  'Αναζήτηση μοτίβων συμβατότητας...',
  'Σάρωση δεδομένων αγοράς εργασίας (ΕΘΑΑΕ)...',
  'Διασταύρωση με το ιστορικό συνομιλίας...',
  'Σύνθεση τελικού Blueprint Προσανατολισμού...',
];

export default function ReportLoadingUI() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setProgress(95);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-orange-500 tracking-normal px-6 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-orange-600/20 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/40">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-orange-500/30 bg-slate-900">
            <Loader2 className="h-14 w-14 animate-spin text-orange-500" />
          </div>
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-orange-300">Αναμονή AI Blueprint</p>
            <h2 className="text-2xl font-semibold text-orange-100">Δημιουργούμε την εξατομικευμένη αναφορά σου</h2>
            <p className="text-base text-orange-200/80">{loadingMessages[activeIndex]}</p>
          </div>
          <div className="w-full rounded-full bg-slate-800/90 p-1">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 transition-all duration-[12000ms] ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex w-full justify-between text-xs text-orange-300/80">
            <span>0%</span>
            <span>95%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
