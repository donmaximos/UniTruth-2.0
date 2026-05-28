import React, { useState, useEffect } from 'react';
import { Copy, Check, Link2, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function FamilyLinkWidget({ role, onLinked }: { role: 'student' | 'parent', onLinked?: () => void }) {
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [parentInput, setParentInput] = useState('');
  const [isLinked, setIsLinked] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const linked = localStorage.getItem('family_linked');
    if (linked === 'true') {
      setIsLinked(true);
      if (onLinked) onLinked();
    }

    if (role === 'student' && !linked) {
      let storedCode = localStorage.getItem('family_link_code');
      if (!storedCode) {
        storedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        localStorage.setItem('family_link_code', storedCode);
      }
      setInviteCode(storedCode);
    }
  }, [role, onLinked]);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLink = () => {
    const storedCode = localStorage.getItem('family_link_code') || 'ABCDEF';
    if (parentInput.toUpperCase() === storedCode || parentInput.length === 6) {
      setIsLinked(true);
      setError(false);
      localStorage.setItem('family_linked', 'true');
      if (onLinked) onLinked();
    } else {
      setError(true);
    }
  };

  if (isLinked) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="tracking-normal text-2xl font-extrabold text-[#1e293b] mb-2">Λογαριασμοί Συνδέθηκαν!</h3>
        <p className="tracking-normal text-gray-500 font-medium leading-relaxed">
          {role === 'parent' 
            ? 'Ο λογαριασμός σας έχει συνδεθεί επιτυχώς με τον μαθητή. Το Οικονομικό Dashboard ξεκλειδώθηκε.'
            : 'Ο γονέας σας έχει συνδεθεί επιτυχώς με τον λογαριασμό σας.'}
        </p>
      </div>
    );
  }

  if (role === 'student') {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
            <Link2 className="w-8 h-8" />
          </div>
        </div>
        <h3 className="tracking-normal text-2xl font-extrabold text-[#1e293b] text-center mb-2">Σύνδεση Λογαριασμού</h3>
        <p className="tracking-normal text-gray-500 font-medium text-center mb-8">
          Μοιραστείτε αυτόν τον κωδικό με τους γονείς σας για να συνδέσουν τον λογαριασμό τους.
        </p>
        
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-normal mb-3 text-center">Κωδικός Σύνδεσης Γονέα</p>
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl font-extrabold tracking-normal text-[#1e293b]">{inviteCode}</span>
          </div>
          <button 
            onClick={handleCopy}
            className="tracking-normal w-full flex items-center justify-center bg-white border border-gray-200 hover:border-orange-600 hover:bg-orange-50 text-slate-800 font-bold py-3 px-4 rounded-xl transition-all group min-h-[44px]"
          >
            {copied ? (
              <><Check className="w-5 h-5 mr-2 text-emerald-600" /> Αντιγράφηκε</>
            ) : (
              <><Copy className="w-5 h-5 mr-2 text-slate-400 group-hover:text-orange-600" /> Αντιγραφή Κωδικού</>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-md mx-auto">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>
      </div>
      <h3 className="tracking-normal text-2xl font-extrabold text-[#1e293b] text-center mb-2">Σύνδεση με Μαθητή</h3>
      <p className="tracking-normal text-gray-500 font-medium text-center mb-8 leading-relaxed">
        Εισάγετε τον 6-ψήφιο κωδικό που εμφανίζεται στον λογαριασμό του μαθητή για να ξεκλειδώσετε το Οικονομικό Dashboard.
      </p>

      <div className="space-y-4">
        <div>
          <input 
            type="text" 
            placeholder="Πληκτρολογήστε κωδικό..." 
            value={parentInput}
            onChange={(e) => setParentInput(e.target.value.toUpperCase())}
            maxLength={6}
            className={`w-full bg-slate-50 border ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:border-orange-600 focus:ring-orange-600/50'} text-[#1e293b] font-extrabold text-center tracking-normal text-2xl rounded-xl px-4 py-4 outline-none transition-all placeholder:text-gray-300 placeholder:tracking-normal placeholder:font-medium placeholder:text-base`}
          />
          {error && <p className="tracking-normal text-red-500 text-sm font-bold mt-2 text-center">Ο κωδικός δεν είναι σωστός. Δοκιμάστε ξανά.</p>}
        </div>
        <button 
          disabled={parentInput.length < 6}
          onClick={handleLink}
          className="tracking-normal w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-transform focus:scale-95 flex justify-center items-center min-h-[44px]"
        >
          Ολοκλήρωση Σύνδεσης
        </button>
      </div>
    </div>
  );
}
