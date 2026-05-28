import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Building, Calendar, ChevronRight, GraduationCap, Sparkles, UserCircle2, BrainCircuit, Link2, ArrowRightLeft, Info,
  Users, Wallet, PlayCircle, BarChart2, Lock, Search, MessageSquare, BookOpen, 
  Send, Star, CheckCircle2, Clock, Briefcase, Globe2, LayoutDashboard, LogOut, 
  MapPin, Stethoscope, TrendingUp, Award, Check, ShieldCheck, Package, CreditCard, X, SlidersHorizontal, Map as MapIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Legend } from 'recharts';

import B2BDashboard from './components/B2BDashboard';
import B2BStudentDetail from './components/B2BStudentDetail';
import FamilyLinkWidget from './components/FamilyLinkWidget';
import ParentFinancialDashboard from './components/ParentFinancialDashboard';
import universitiesDatabase from './data/universitiesDatabase.json';

export type UserRole = 'student' | 'parent' | 'b2b';
export type Tab = 'ai-test' | 'school-search' | 'mentors' | 'parent-dash' | 'b2b-admin' | 'link-child' | 'link-parent' | 'b2b-mentoring';

const MOCK_STUDENTS_B2B = [
  { id: 1, name: "Γιάννης Π.", match: "ΔΕΤ ΟΠΑ", score: "88%", status: "Ready", actualPoints: 18200 },
  { id: 2, name: "Ελένη Μ.", match: "Πληροφορική ΑΠΘ", score: "92%", status: "Needs Advising" },
  { id: 3, name: "Γιώργος Κ.", match: "Οικονομικό ΠΑΠΕΙ", score: "75%", status: "Ready", actualPoints: 14500 },
  { id: 4, name: "Μαρία Σ.", match: "Ιατρική ΕΚΠΑ", score: "96%", status: "Ready" }
];

function ViewLanding({ onComplete }: { onComplete: (role: UserRole) => void }) {
  const [activePersona, setActivePersona] = useState<UserRole | null>(null);
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState({
    grade: '',
    direction: '',
    scientificField: '',
    city: '',
    childCode: '',
    bizEmail: '',
    bizName: '',
    studentsCount: ''
  });

  const updateForm = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));
  const parentCode = "UN9K2A";

  const getHeroContent = () => {
    return { title: "Ο απόλυτος οδηγός επιλογής σχολής", desc: "Σταμάτα να μαντεύεις το μέλλον σου, ρωτά αυτούς που το ζουν ήδη." };
  };

  const hero = getHeroContent();

  return (
 <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
 <nav className="p-6 md:px-12 flex justify-between items-center border-b border-gray-100 bg-white">
 <div className="text-2xl font-extrabold text-[#1e293b] flex items-center cursor-pointer" onClick={() => {setActivePersona(null); setStep(0);}}>
 <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center mr-3 font-black text-white text-xl">U</div>
 UniTruth
 </div>
 {!activePersona && (
 <button onClick={() => { setActivePersona('student'); setStep(1); }} className="text-[#1e293b] font-bold hover:text-orange-600 transition-colors">
 Σύνδεση / Εγγραφή
 </button>
 )}
 </nav>

 <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-24 max-w-5xl mx-auto w-full">
 <div className="text-center max-w-3xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <h1 className="text-5xl md:text-6xl font-extrabold text-[#0f172a] mb-6 leading-tight">
 {hero.title}
 </h1>
 <p className={!activePersona ? "text-orange-500 font-medium text-lg leading-relaxed" : "text-xl text-gray-500 font-medium leading-relaxed"}>
 {hero.desc}
 </p>
 </div>

 {!activePersona && (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
 <button onClick={() => { setActivePersona('student'); setStep(0); }} className="bg-white p-8 rounded-3xl shadow-sm border-2 border-transparent hover:border-orange-500 hover:shadow-lg transition-all group flex flex-col items-center text-center">
 <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
 <GraduationCap className="w-8 h-8 text-orange-600" />
 </div>
 <h3 className="text-2xl font-extrabold text-[#0f172a] mb-2">Μαθητής</h3>
 <p className="text-gray-500 font-medium">Ανακάλυψε τη σχολή που σου ταιριάζει.</p>
 </button>

 <button onClick={() => { setActivePersona('parent'); setStep(0); }} className="bg-white p-8 rounded-3xl shadow-sm border-2 border-transparent hover:border-orange-600 hover:shadow-lg transition-all group flex flex-col items-center text-center">
 <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
 <Wallet className="w-8 h-8 text-orange-600" />
 </div>
 <h3 className="text-2xl font-extrabold text-[#0f172a] mb-2">Γονέας</h3>
 <p className="text-gray-500 font-medium">Υπολόγισε το συνολικό κόστος σπουδών.</p>
 </button>

 <button onClick={() => { setActivePersona('b2b'); setStep(0); }} className="bg-white p-8 rounded-3xl shadow-sm border-2 border-transparent hover:border-orange-600 hover:shadow-lg transition-all group flex flex-col items-center text-center">
 <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
 <Building className="w-8 h-8 text-orange-600" />
 </div>
 <h3 className="text-2xl font-extrabold text-[#0f172a] mb-2">Φροντιστήριο</h3>
 <p className="text-gray-500 font-medium">Δεδομένα για αποτελεσματικό School Counseling.</p>
 </button>
 </div>
 )}

 {/* ONBOARDING FORMS */}
 {activePersona && (
 <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
 {/* Phase 2: Value Reveal */}
 {step === 0 && (
 <div className="space-y-6 animate-in slide-in-from-right-4">
 {activePersona === 'student' && (
 <>
 <div className="text-center mb-8">
 <h2 className="text-3xl font-extrabold text-[#0f172a] leading-tight">Βρες τη σχολή που σου ταιριάζει πραγματικά.</h2>
 </div>
 <div className="space-y-4">
 <div className="flex items-start">
 <div className="bg-orange-100 p-2 rounded-lg mr-4 mt-1"><BrainCircuit className="w-6 h-6 text-orange-600" /></div>
 <div><p className="font-bold text-[#0f172a]">AI Προσανατολισμός</p><p className="text-sm text-gray-600 leading-relaxed mt-1">Συνομίλησε με το AI και ανακάλυψε κλίσεις βάσει του RIASEC.</p></div>
 </div>
 <div className="flex items-start">
 <div className="bg-orange-100 p-2 rounded-lg mr-4 mt-1"><BarChart2 className="w-6 h-6 text-orange-600" /></div>
 <div><p className="font-bold text-[#0f172a]">Σκληρά Δεδομένα</p><p className="text-sm text-gray-600 leading-relaxed mt-1">Δες ποσοστά απορρόφησης στην αγορά εργασίας και ρυθμούς αποφοίτησης (δεδομένα ΕΘΑΑΕ).</p></div>
 </div>
 <div className="flex items-start">
 <div className="bg-orange-100 p-2 rounded-lg mr-4 mt-1"><Users className="w-6 h-6 text-orange-600" /></div>
 <div><p className="font-bold text-[#0f172a]">Μίλα με Φοιτητές</p><p className="text-sm text-gray-600 leading-relaxed mt-1">Κλείσε on-demand βιντεοκλήσεις με φοιτητές των σχολών που σε ενδιαφέρουν.</p></div>
 </div>
 </div>
 <button onClick={() => setStep(1)} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center group mt-8 transition-colors">
 Δημιουργία Λογαριασμού <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1" />
 </button>
 <div className="text-center mt-4">
 <button onClick={() => { setStep(1); }} className="text-sm font-bold text-gray-500 hover:text-[#1e293b]">Έχω ήδη λογαριασμό (Σύνδεση)</button>
 </div>
 </>
 )}
 {activePersona === 'parent' && (
 <>
 <div className="text-center mb-8">
 <h2 className="text-3xl font-extrabold text-[#0f172a] leading-tight">Προστατεύστε την επένδυση των σπουδών.</h2>
 </div>
 <div className="space-y-4">
 <div className="flex items-start">
 <div className="bg-orange-100 p-2 rounded-lg mr-4 mt-1"><Wallet className="w-6 h-6 text-orange-600" /></div>
 <div><p className="font-bold text-[#0f172a]">TCD Calculator</p><p className="text-sm text-gray-600 leading-relaxed mt-1">Υπολογίστε το Συνολικό Κόστος Σπουδών σε βάθος 4ετίας.</p></div>
 </div>
 <div className="flex items-start">
 <div className="bg-orange-100 p-2 rounded-lg mr-4 mt-1"><MapIcon className="w-6 h-6 text-orange-600" /></div>
 <div><p className="font-bold text-[#0f172a]">Δεδομένα Ενοικίων</p><p className="text-sm text-gray-600 leading-relaxed mt-1">Συγκρίνετε ζωντανά το κόστος διαβίωσης και τα ενοίκια μεταξύ διαφορετικών φοιτητικών πόλεων.</p></div>
 </div>
 <div className="flex items-start">
 <div className="bg-orange-100 p-2 rounded-lg mr-4 mt-1"><ShieldCheck className="w-6 h-6 text-orange-600" /></div>
 <div><p className="font-bold text-[#0f172a]">Διαχείριση Ρίσκου</p><p className="text-sm text-gray-600 leading-relaxed mt-1">Βεβαιωθείτε ότι η επιλογή της σχολής έχει πραγματικό αντίκρισμα στην αγορά εργασίας.</p></div>
 </div>
 </div>
 <button onClick={() => setStep(1)} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center group mt-8 transition-colors">
 Σύνδεση ή Εγγραφή <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1" />
 </button>
 </>
 )}
 {activePersona === 'b2b' && (
 <>
 <div className="text-center mb-8">
 <h2 className="text-3xl font-extrabold text-[#0f172a] leading-tight">Αναβαθμίστε τη Συμβουλευτική σας.</h2>
 </div>
 <div className="space-y-4">
 <div className="flex items-start">
 <div className="bg-orange-100 p-2 rounded-lg mr-4 mt-1"><LayoutDashboard className="w-6 h-6 text-orange-600" /></div>
 <div><p className="font-bold text-[#0f172a]">Πίνακας Διαχείρισης Φροντιστηρίου</p><p className="text-sm text-gray-600 leading-relaxed mt-1">Διαχειριστείτε όλα τα αποτελέσματα επαγγελματικού προσανατολισμού των μαθητών σας σε ένα μέρος.</p></div>
 </div>
 <div className="flex items-start">
 <div className="bg-orange-100 p-2 rounded-lg mr-4 mt-1"><Clock className="w-6 h-6 text-orange-600" /></div>
 <div><p className="font-bold text-[#0f172a]">Εξοικονόμηση Χρόνου</p><p className="text-sm text-gray-600 leading-relaxed mt-1">Αντικαταστήστε τις πολύωρες συζητήσεις για το μηχανογραφικό με AI data-driven αναφορές.</p></div>
 </div>
 <div className="flex items-start">
 <div className="bg-orange-100 p-2 rounded-lg mr-4 mt-1"><Package className="w-6 h-6 text-orange-600" /></div>
 <div><p className="font-bold text-[#0f172a]">B2B2C Upsell</p><p className="text-sm text-gray-600 leading-relaxed mt-1">Αγοράστε συνεδρίες φοιτητών (Mentors) σε τιμές χονδρικής και ενσωματώστε τες στα πακέτα διδάκτρων σας.</p></div>
 </div>
 </div>
 <button onClick={() => setStep(1)} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center group mt-8 transition-colors">
 Σύνδεση ή Εγγραφή <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1" />
 </button>
 </>
 )}
 <button onClick={() => {setActivePersona(null); setStep(0);}} className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 mt-4">Επιστροφή</button>
 </div>
 )}

 {/* Student Flow */}
 {activePersona === 'student' && step > 0 && (
 <div className="space-y-6">
 <div className="flex items-center justify-between mb-8">
 <h2 className="text-2xl font-extrabold text-[#1e293b]">Εγγραφή Μαθητή</h2>
 <span className="text-xs font-bold text-gray-400 uppercase ">ΒΗΜΑ {step}/5</span>
 </div>

 {step === 1 && (
 <div className="space-y-4 animate-in slide-in-from-right-4">
 <button onClick={() => setStep(2)} className="w-full bg-[#1e293b] hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center">
 Συνέχεια με Email
 </button>
 <button onClick={() => setStep(2)} className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-slate-800 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center">
 Συνέχεια με Google
 </button>
 <div className="text-center pt-2">
 <button onClick={() => onComplete('student')} className="text-sm font-bold text-gray-500 hover:text-orange-600">Έχω ήδη λογαριασμό (Σύνδεση)</button>
 </div>
 </div>
 )}

 {step === 2 && (
 <div className="space-y-4 animate-in slide-in-from-right-4">
 <label className="text-sm font-bold text-gray-500 uppercase block">Σε ποια τάξη πας;</label>
 <select value={formData.grade} onChange={e => updateForm('grade', e.target.value)} className="w-full bg-slate-50 border border-gray-200 text-[#1e293b] font-bold rounded-xl px-4 py-3 outline-none focus:border-orange-600">
 <option value="">Επίλεξε Τάξη</option>
 <option value="b">Β' Λυκείου</option>
 <option value="c">Γ' Λυκείου</option>
 </select>
 <button disabled={!formData.grade} onClick={() => setStep(3)} className="w-full bg-orange-600 text-white font-bold py-3.5 rounded-xl disabled:bg-gray-200 mt-4">Συνέχεια</button>
 </div>
 )}

 {step === 3 && formData.grade === 'b' && (
 <div className="space-y-4 animate-in slide-in-from-right-4">
 <label className="text-sm font-bold text-gray-500 uppercase block">Κατεύθυνση (Προσανατολισμός)</label>
 <select value={formData.direction} onChange={e => updateForm('direction', e.target.value)} className="w-full bg-slate-50 border border-gray-200 text-[#1e293b] font-bold rounded-xl px-4 py-3 outline-none focus:border-orange-600">
 <option value="">Επίλεξε Κατεύθυνση</option>
 <option value="humanities">Ανθρωπιστικών Σπουδών</option>
 <option value="sciences">Θετικών Σπουδών</option>
 </select>
 <button disabled={!formData.direction} onClick={() => setStep(4)} className="w-full bg-orange-600 text-white font-bold py-3.5 rounded-xl disabled:bg-gray-200 mt-4">Συνέχεια</button>
 </div>
 )}

 {step === 3 && formData.grade === 'c' && (
 <div className="space-y-4 animate-in slide-in-from-right-4">
 <label className="text-sm font-bold text-gray-500 uppercase block">Επιστημονικό Πεδίο</label>
 <select value={formData.scientificField} onChange={e => updateForm('scientificField', e.target.value)} className="w-full bg-slate-50 border border-gray-200 text-[#1e293b] font-bold rounded-xl px-4 py-3 outline-none focus:border-orange-600">
 <option value="">Επίλεξε Πεδίο</option>
 <option value="1">1ο - Ανθρωπιστικές</option>
 <option value="2">2ο - Θετικές (Μηχανικοί)</option>
 <option value="3">3ο - Επιστήμες Υγείας</option>
 <option value="4">4ο - Οικονομία & Πληροφορική</option>
 </select>
 <button disabled={!formData.scientificField} onClick={() => setStep(4)} className="w-full bg-orange-600 text-white font-bold py-3.5 rounded-xl disabled:bg-gray-200 mt-4">Συνέχεια</button>
 </div>
 )}

 {step === 4 && (
 <div className="space-y-4 animate-in slide-in-from-right-4">
 <label className="text-sm font-bold text-gray-500 uppercase block">Πόλη Κατοικίας</label>
 <input list="greek-cities" type="text" placeholder="π.χ. Αθήνα, Θεσσαλονίκη" value={formData.city} onChange={e => updateForm('city', e.target.value)} className="w-full bg-slate-50 border border-gray-200 text-[#1e293b] font-bold rounded-xl px-4 py-3 outline-none focus:border-orange-600" />
 <datalist id="greek-cities">
 <option value="Αθήνα" />
 <option value="Θεσσαλονίκη" />
 <option value="Πάτρα" />
 <option value="Ιωάννινα" />
 <option value="Ηράκλειο" />
 <option value="Βόλος" />
 </datalist>
 <button disabled={!formData.city} onClick={() => setStep(5)} className="w-full bg-orange-600 text-white font-bold py-3.5 rounded-xl disabled:bg-gray-200 mt-4">Ολοκλήρωση Προφίλ</button>
 </div>
 )}

 {step === 5 && (
 <div className="space-y-6 text-center animate-in slide-in-from-right-4">
 <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto">
 <CheckCircle2 className="w-8 h-8" />
 </div>
 <h3 className="text-2xl font-extrabold text-[#1e293b]">Το προφίλ σου είναι έτοιμο!</h3>
 <p className="text-gray-500 font-medium">Μοιραστείτε αυτόν τον κωδικό με τον γονέα σας (Προαιρετικό - μπορείτε να το κάνετε αργότερα).</p>
 <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
 <p className="text-sm font-bold text-slate-400 uppercase mb-1">Parent Link Code</p>
 <p className="text-3xl font-extrabold text-[#1e293b]">{parentCode}</p>
 </div>
 <button onClick={() => onComplete('student')} className="w-full bg-[#1e293b] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center group mt-4">
 Μετάβαση στην Εφαρμογή <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1" />
 </button>
 </div>
 )}

 {step > 1 && step < 5 && (
 <button onClick={() => setStep(step - 1)} className="text-sm font-bold text-gray-400 hover:text-gray-600 mt-4 text-center w-full">Πίσω</button>
 )}
 </div>
 )}

 {/* Parent Flow */}
 {activePersona === 'parent' && step > 0 && (
 <div className="space-y-6">
 <div className="flex items-center justify-between mb-8">
 <h2 className="text-2xl font-extrabold text-[#1e293b]">Εγγραφή Γονέα</h2>
 <span className="text-xs font-bold text-gray-400 uppercase ">ΒΗΜΑ {step}/4</span>
 </div>

 {step === 1 && (
 <div className="space-y-4 animate-in slide-in-from-right-4">
 <button onClick={() => setStep(2)} className="w-full bg-[#1e293b] hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center">
 Συνέχεια με Email
 </button>
 <button onClick={() => setStep(2)} className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-slate-800 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center">
 Συνέχεια με Google
 </button>
 <div className="text-center pt-2">
 <button onClick={() => onComplete('parent')} className="text-sm font-bold text-gray-500 hover:text-orange-600">Έχω ήδη λογαριασμό (Σύνδεση)</button>
 </div>
 </div>
 )}

 {step === 2 && (
 <div className="space-y-4 animate-in slide-in-from-right-4 text-center">
 <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
 <Wallet className="w-8 h-8" />
 </div>
 <h3 className="text-2xl font-extrabold text-[#1e293b] mb-4">TCD Calculator</h3>
 <p className="text-gray-500 font-medium text-left leading-relaxed mb-6">
 Ο υπολογισμός TCD βασίζεται στο μέσο κόστος διαβίωσης και ενοικίων κάθε επιλογής. Σε επόμενο στάδιο θα συλλέξουμε κάποια στοιχεία για να προσαρμόσουμε τα αποτελέσματα.
 </p>
 <button onClick={() => setStep(3)} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl disabled:bg-gray-200 mt-4">Πάμε!</button>
 </div>
 )}

 {step === 3 && (
 <div className="space-y-4 animate-in slide-in-from-right-4">
 <label className="text-sm font-bold text-gray-500 uppercase block">Πόλη Κατοικίας</label>
 <input list="greek-cities" type="text" placeholder="π.χ. Πάτρα, Αθήνα" value={formData.city} onChange={e => updateForm('city', e.target.value)} className="w-full bg-slate-50 border border-gray-200 text-[#1e293b] font-bold rounded-xl px-4 py-3 outline-none focus:border-orange-600" />
 <button disabled={!formData.city} onClick={() => setStep(4)} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl disabled:bg-gray-200 mt-4">Συνέχεια</button>
 </div>
 )}

 {step === 4 && (
 <div className="space-y-4 animate-in slide-in-from-right-4">
 <label className="text-sm font-bold text-gray-500 uppercase block">Σύνδεση με το Παιδί (Parent Link Code)</label>
 <p className="text-xs text-slate-500 mb-2">Εισάγετε τον 6ψήφιο κωδικό που εμφανίστηκε στον λογαριασμό του μαθητή (Προαιρετικό - μπορείτε να το κάνετε αργότερα).</p>
 <input type="text" placeholder="π.χ. UN9K2A" value={formData.childCode} onChange={e => updateForm('childCode', e.target.value.toUpperCase())} maxLength={6} className="w-full bg-slate-50 border border-gray-200 text-[#1e293b] font-bold text-center rounded-xl px-4 py-4 outline-none focus:border-orange-600 uppercase" />
 <button onClick={() => onComplete('parent')} className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl disabled:bg-gray-200 mt-4 shadow-lg group flex justify-center items-center">
 Ολοκλήρωση <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1" />
 </button>
 </div>
 )}

 {step > 1 && (
 <button onClick={() => setStep(step - 1)} className="text-sm font-bold text-gray-400 hover:text-gray-600 mt-4 text-center w-full">Πίσω</button>
 )}
 </div>
 )}

 {/* B2B Flow */}
 {activePersona === 'b2b' && step > 0 && (
 <div className="space-y-6">
 <div className="flex items-center justify-between mb-8">
 <h2 className="text-2xl font-extrabold text-[#1e293b]">B2B Partner</h2>
 <span className="text-xs font-bold text-gray-400 uppercase ">ΒΗΜΑ {step}/3</span>
 </div>

 {step === 1 && (
 <div className="space-y-4 animate-in slide-in-from-right-4">
 <label className="text-sm font-bold text-gray-500 uppercase block">Εταιρικό Email</label>
 <input type="email" placeholder="hello@phrontisterio.gr" value={formData.bizEmail} onChange={e => updateForm('bizEmail', e.target.value)} className="w-full bg-slate-50 border border-gray-200 text-[#1e293b] font-bold rounded-xl px-4 py-3 outline-none focus:border-orange-600" />
 <button disabled={!formData.bizEmail.includes('@')} onClick={() => setStep(2)} className="w-full bg-orange-600 text-white font-bold py-3.5 rounded-xl disabled:bg-gray-200 mt-4 shadow-md">
 Συνέχεια
 </button>
 <div className="text-center pt-2">
 <button onClick={() => onComplete('b2b')} className="text-sm font-bold text-gray-500 hover:text-orange-600">Έχω ήδη λογαριασμό (Σύνδεση)</button>
 </div>
 </div>
 )}

 {step === 2 && (
 <div className="space-y-4 animate-in slide-in-from-right-4">
 <label className="text-sm font-bold text-gray-500 uppercase block mt-4">Όνομα Φροντιστηρίου</label>
 <input type="text" placeholder="Φροντιστήριο Διάκριση" value={formData.bizName} onChange={e => updateForm('bizName', e.target.value)} className="w-full bg-slate-50 border border-gray-200 text-[#1e293b] font-bold rounded-xl px-4 py-3 outline-none focus:border-orange-600" />
 
 <label className="text-sm font-bold text-gray-500 uppercase block mt-4">Πόλη</label>
 <input list="greek-cities" type="text" placeholder="Αθήνα" value={formData.city} onChange={e => updateForm('city', e.target.value)} className="w-full bg-slate-50 border border-gray-200 text-[#1e293b] font-bold rounded-xl px-4 py-3 outline-none focus:border-orange-600" />

 <button disabled={!formData.bizName || !formData.city} onClick={() => setStep(3)} className="w-full bg-orange-600 text-white font-bold py-3.5 rounded-xl disabled:bg-gray-200 mt-4 shadow-md">
 Συνέχεια
 </button>
 </div>
 )}

 {step === 3 && (
 <div className="space-y-4 animate-in slide-in-from-right-4">
 <label className="text-sm font-bold text-gray-500 uppercase block">Εκτιμώμενος αριθμός μαθητών Γ' Λυκείου</label>
 <select value={formData.studentsCount} onChange={e => updateForm('studentsCount', e.target.value)} className="w-full bg-slate-50 border border-gray-200 text-[#1e293b] font-bold rounded-xl px-4 py-3 outline-none focus:border-orange-600">
 <option value="">Επιλογή</option>
 <option value="1-50">1 - 50 μαθητές</option>
 <option value="51-150">51 - 150 μαθητές</option>
 <option value="150+">150+ μαθητές</option>
 </select>
 <button disabled={!formData.studentsCount} onClick={() => onComplete('b2b')} className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl disabled:bg-gray-200 mt-4 shadow-lg group flex justify-center items-center">
 Δημιουργία Λογαριασμού <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1" />
 </button>
 </div>
 )}
 
 {step > 1 && (
 <button onClick={() => setStep(step - 1)} className="text-sm font-bold text-gray-400 hover:text-gray-600 mt-4 text-center w-full">Πίσω</button>
 )}
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 );
}

export default function App() {
 const [userRole, setUserRole] = useState<UserRole | null>(null);
 const [activeTab, setActiveTab] = useState<Tab>('ai-test');

 if (!userRole) {
 return <ViewLanding onComplete={(role) => {
 setUserRole(role);
 if (role === 'student') setActiveTab('ai-test');
 if (role === 'parent') setActiveTab('parent-dash');
 if (role === 'b2b') setActiveTab('b2b-admin');
 }} />;
 }

 return (
 <DashboardLayout role={userRole} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setUserRole(null)} />
 );
}

function DashboardLayout({ role, activeTab, setActiveTab, onLogout }: { role: UserRole, activeTab: Tab, setActiveTab: (tab: Tab) => void, onLogout: () => void }) {
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 
 let sidebarItems = [];
 if (role === 'student') {
 sidebarItems = [
 { id: 'ai-test', icon: <BrainCircuit className="w-5 h-5 flex-shrink-0" />, label: 'AI Προσανατολισμός', section: 'Μαθητης' },
 { id: 'school-search', icon: <Search className="w-5 h-5 flex-shrink-0" />, label: 'Αναζήτηση Σχολών', section: 'Μαθητης' },
 { id: 'mentors', icon: <Users className="w-5 h-5 flex-shrink-0" />, label: 'Mentors', section: 'Εξτρα' },
 { id: 'link-parent', icon: <Link2 className="w-5 h-5 flex-shrink-0" />, label: 'Σύνδεση Γονέα', section: 'Ρυθμισεις' },
 ];
 } else if (role === 'parent') {
 sidebarItems = [
 { id: 'parent-dash', icon: <Wallet className="w-5 h-5 flex-shrink-0" />, label: 'TCD & Ενοίκια', section: 'Γονεας' },
 { id: 'link-child', icon: <CreditCard className="w-5 h-5 flex-shrink-0" />, label: 'Σύνδεση Λογαριασμού', section: 'Ρυθμισεις' },
 ];
 } else if (role === 'b2b') {
 sidebarItems = [
 { id: 'b2b-admin', icon: <Building className="w-5 h-5 flex-shrink-0" />, label: 'Μαθητές', section: 'B2B Admin' },
 { id: 'b2b-mentoring', icon: <Users className="w-5 h-5 flex-shrink-0" />, label: 'Mentoring', section: 'B2B Services' },
 ];
 }

 const sections = Array.from(new Set(sidebarItems.map(i => i.section)));

 return (
 <div className="flex h-screen bg-[#F9FAFB] font-sans text-slate-900 overflow-hidden relative">
 {/* Mobile Top Header (B2B OR globally for hamburger logo) */}
 <div className="md:hidden w-full bg-white border-b border-gray-200 p-4 flex items-center justify-between z-40 fixed top-0 left-0 right-0 h-16">
 <h1 className="text-xl font-extrabold text-[#1e293b] flex items-center">
 <div className="w-7 h-7 rounded-md bg-orange-600 flex items-center justify-center mr-2 font-black text-white text-lg">U</div>
 UniTruth
 </h1>
 {role === 'b2b' && (
 <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2 text-slate-600 focus:outline-none min-h-[44px]">
 {isMobileMenuOpen ? <X className="w-6 h-6" /> : <SlidersHorizontal className="w-6 h-6" />}
 </button>
 )}
 </div>

 {/* Mobile Collapsible Drawer for B2B */}
 {role === 'b2b' && (
 <div className={`md:hidden fixed inset-0 z-30 transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-y-16' : '-translate-y-full'}`}>
 <div className="bg-[#1e293b] h-full shadow-2xl flex flex-col pt-4">
 <nav className="flex-1 px-4 space-y-2 overflow-y-auto w-full max-w-sm ml-auto mr-auto">
 {sidebarItems.map(item => (
 <button
 key={item.id}
 onClick={() => { setActiveTab(item.id as Tab); setIsMobileMenuOpen(false); }}
 className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 text-left min-h-[44px] ${
 activeTab === item.id 
 ? 'bg-white/10 text-white font-bold' 
 : 'text-slate-400 font-medium'
 }`}
 >
 <div className={`mr-4 ${activeTab === item.id ? 'text-orange-500' : ''}`}>
 {item.icon}
 </div>
 <span className="text-base">{item.label}</span>
 </button>
 ))}
 <div className="pt-4 mt-4 border-t border-slate-700">
 <button onClick={onLogout} className="w-full flex items-center p-4 rounded-xl text-slate-400 font-medium min-h-[44px]">
 <ArrowRightLeft className="w-5 h-5 mr-4" />
 <span className="text-base">Αλλαγή Ρόλου</span>
 </button>
 </div>
 </nav>
 </div>
 </div>
 )}

 {/* Desktop Sidebar - Professional Dark Blue (#1e293b) */}
 <div className="hidden md:flex w-64 bg-[#1e293b] flex-col h-full shadow-xl z-20 flex-shrink-0">
 <div className="p-6 md:p-8 flex justify-between items-center group">
 <h1 className="text-2xl font-extrabold text-white flex items-center cursor-pointer">
 <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center mr-3 font-black text-white text-xl">U</div>
 UniTruth
 </h1>
 </div>
 
 <nav className="flex-1 px-4 mt-2 space-y-1 overflow-y-auto">
 {sections.map(section => (
 <div key={section}>
 <h2 className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 mt-8 mb-2 px-3">{section}</h2>
 {sidebarItems.filter(item => item.section === section).map(item => (
 <SidebarItem 
 key={item.id}
 icon={item.icon} 
 label={item.label} 
 isActive={activeTab === item.id}
 onClick={() => setActiveTab(item.id as Tab)}
 />
 ))}
 </div>
 ))}
 </nav>
 
 <div className="p-4 border-t border-slate-700">
 <button onClick={onLogout} className="w-full flex items-center p-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white font-medium transition-all min-h-[44px]">
 <ArrowRightLeft className="w-5 h-5 mr-3" />
 <span className="text-[14px]">Αλλαγή Ρόλου</span>
 </button>
 </div>
 </div>

 {/* Main Content */}
 <main className="flex-1 h-full overflow-y-auto w-full relative pt-16 md:pt-0 pb-20 md:pb-0">
 <div className="max-w-6xl mx-auto p-4 md:p-10 min-h-full">
 {activeTab === 'ai-test' && <ViewAITest />}
 {activeTab === 'school-search' && <ViewStudentDash />}
 {activeTab === 'parent-dash' && <ViewParentDash />}
 {activeTab === 'mentors' && <ViewMentors />}
 {activeTab === 'b2b-admin' && <B2BDashboard />}
 {activeTab === 'link-child' && (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
 <FamilyLinkWidget role="parent" onLinked={() => setActiveTab('parent-dash')} />
 </div>
 )}
 {activeTab === 'link-parent' && (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
 <FamilyLinkWidget role="student" />
 </div>
 )}
 {activeTab === 'b2b-mentoring' && (
 <div className="flex flex-col items-center justify-center h-96 text-center animate-in fade-in zoom-in-95">
 <Building className="w-16 h-16 md:w-20 md:h-20 text-[#1e293b] mb-6" />
 <h2 className="text-2xl md:text-3xl font-extrabold text-[#1e293b] mb-4">Wholesale Mentoring</h2>
 <p className="text-gray-500 max-w-md">Διαχείριση πακέτων συνδρίας για πολλούς μαθητές.</p>
 </div>
 )}
 </div>
 </main>

 {/* Mobile Bottom Navigation (Students/Parents) */}
 {(role === 'student' || role === 'parent') && (
 <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40">
 <div className="flex justify-around items-center h-16 px-2">
 {sidebarItems.map(item => (
 <button
 key={item.id}
 onClick={() => setActiveTab(item.id as Tab)}
 className={`flex flex-col items-center justify-center w-full h-full space-y-1 min-h-[44px] ${
 activeTab === item.id ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
 }`}
 >
 <div className={`p-1 rounded-full ${activeTab === item.id ? 'bg-orange-50' : 'bg-transparent'}`}>
 {item.icon}
 </div>
 <span className="text-[10px] font-bold">{item.label}</span>
 </button>
 ))}
 </div>
 </div>
 )}
 </div>
 );
}

function SidebarItem({ icon, label, isActive, onClick }: { key?: React.Key, icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
 return (
 <button
 onClick={onClick}
 className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 text-left relative overflow-hidden ${
 isActive 
 ? 'bg-white/10 text-white font-bold shadow-sm' 
 : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium'
 }`}
 >
 {isActive && (
 <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500"></div>
 )}
 <div className={`mr-3 ${isActive ? 'text-orange-500' : ''}`}>
 {icon}
 </div>
 <span className="text-[14px] leading-tight">{label}</span>
 </button>
 );
}

// ==========================================
// VIEW 1: AI Test & Chat
// ==========================================
const RIASEC_MAP: Record<string, string> = {
 'R': 'Πρακτικός (Realistic)',
 'I': 'Ερευνητικός (Investigative)',
 'A': 'Καλλιτεχνικός (Artistic)',
 'S': 'Κοινωνικός (Social)',
 'E': 'Επιχειρηματικός (Enterprising)',
 'C': 'Οργανωτικός (Conventional)'
};

const RIASEC_QUESTIONS = [
 { cat: 'R', text: "Μου αρέσει να υλοποιώ ιδέες στην πράξη, να γράφω κώδικα ή να χειρίζομαι συστήματα." },
 { cat: 'I', text: "Προτιμώ να αναλύω περίπλοκα προβλήματα, να διαβάζω δεδομένα και να ανακαλύπτω πώς λειτουργούν τα πράγματα." },
 { cat: 'A', text: "Εκφράζομαι καλύτερα μέσα από τη δημιουργία, το design ή την παραγωγή πρωτότυπου περιεχομένου." },
 { cat: 'S', text: "Επιδιώκω να βοηθάω, να εκπαιδεύω ή να συνεργάζομαι θερμά με άλλους ανθρώπους." },
 { cat: 'E', text: "Αναλαμβάνω εύκολα τον ρόλο του ηγέτη σε μια ομάδα και μου αρέσει να παίρνω στρατηγικές αποφάσεις." },
 { cat: 'C', text: "Δουλεύω καλύτερα με τάξη, σαφή δομή, λίστες και κανόνες οργάνωσης δεδομένων." },
];

function ViewAITest() {
 const [step, setStep] = useState<'intro' | 'test' | 'calculating' | 'chat'>('intro');
 const [qIndex, setQIndex] = useState(0);
 const [scores, setScores] = useState<Record<string, number>>({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });
 const [topTraits, setTopTraits] = useState<string[]>([]);
 const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
 const [chatInput, setChatInput] = useState('');
 const [userPoints, setUserPoints] = useState('');

 const handleAnswer = (val: number) => {
 const cat = RIASEC_QUESTIONS[qIndex].cat;
 const newScores = { ...scores, [cat]: scores[cat] + val };
 setScores(newScores);

 if (qIndex < RIASEC_QUESTIONS.length - 1) {
 setQIndex(prev => prev + 1);
 } else {
 setStep('calculating');
 // trigger calculation
 setTimeout(() => {
 const sorted = Object.entries(newScores).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 3);
 const top = sorted.map(s => RIASEC_MAP[s[0] as keyof typeof RIASEC_MAP] || RIASEC_MAP[s[0]]);
 setTopTraits(top);

 const topString = top.join(', ');
 console.log(`[Mock System Prompt] Top traits: [${topString}]. User points constraint: ${userPoints || 'None'}`);

 setChatMessages([
 { role: 'ai', text: `Γεια! Είδα μόλις τα αποτελέσματά σου. Έχεις έντονα τα στοιχεία: ${topString}. Φαίνεται πως σου ταιριάζουν σχολές σε Διοίκηση/Τεχνολογία. Πώς φαντάζεσαι το ιδανικό περιβάλλον εργασίας σου στο μέλλον;` }
 ]);
 setStep('chat');
 }, 2500);
 }
 };

 const startDirectChat = () => {
 console.log(`[Mock System Prompt] Direct chat started. Psychometric data skipped. User points constraint: ${userPoints || 'None'}`);
 setChatMessages([
 { role: 'ai', text: `Γεια! Είμαι εδώ για να συζητήσουμε όποιον προβληματισμό έχεις σχετικά με την επιλογή σχολής. Τι σε απασχολεί περισσότερο αυτή τη στιγμή;` }
 ]);
 setStep('chat');
 };

 const handleSendMessage = () => {
 if (!chatInput.trim()) return;
 setChatMessages(prev => [...prev, { role: 'user', text: chatInput }]);
 setChatInput('');
 
 // Mock AI reply
 setTimeout(() => {
 const pointConstraintText = userPoints ? ` Με όριο τα ${userPoints} μόρια,` : '';
 setChatMessages(prev => [...prev, { role: 'ai', text: `Ακούγεται πολύ ενδιαφέρον!${pointConstraintText} θα σου πρότεινα να κοιτάξεις το ΔΕΤ ή συναφή τμήματα. Θέλεις να δούμε τα στατιστικά εισαγωγής τους;` }]);
 }, 1000);
 };

 const handleRestart = () => {
 setScores({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });
 setQIndex(0);
 setTopTraits([]);
 setChatMessages([]);
 setUserPoints('');
 setStep('intro');
 };

 if (step === 'intro') {
 return (
 <div className="flex flex-col items-center pt-20 animate-in fade-in duration-500">
 <div className="bg-orange-50 p-6 rounded-3xl mb-8 shadow-sm border border-orange-100 flex items-center justify-center">
 <Sparkles className="w-16 h-16 text-orange-600" />
 </div>
 <h2 className="text-4xl md:text-5xl font-extrabold text-[#1e293b] mb-6 text-center">Ανακάλυψε την Πραγματική σου Κλίση</h2>
 <p className="text-lg text-gray-600 mb-10 font-medium text-center max-w-2xl">Το AI αναλύει την προσωπικότητά σου είτε μέσω 6 γρήγορων ερωτήσεων, είτε μέσα από ελεύθερη συζήτηση.</p>
 
 <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4">
 <button onClick={() => setStep('test')} className="group flex items-center justify-center space-x-3 bg-white border border-gray-200 text-slate-800 hover:border-orange-600 hover:text-orange-600 px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-sm">
 <span>Έναρξη Τεστ Προσανατολισμού</span>
 </button>
 
 <button onClick={startDirectChat} className="group flex items-center justify-center space-x-3 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-xl hover:-translate-y-1 min-h-[44px]">
 <BrainCircuit className="w-5 h-5 mr-1" />
 <span>Απευθείας Συζήτηση με AI</span>
 </button>
 </div>
 </div>
 );
 }

 if (step === 'test') {
 const progress = ((qIndex) / RIASEC_QUESTIONS.length) * 100;
 
 return (
 <div className="flex flex-col items-center pt-10 animate-in slide-in-from-bottom-8 duration-500">
 <div className="w-full max-w-3xl">
 <div className="flex items-center justify-between mb-4">
 <span className="text-sm font-bold text-gray-400 uppercase ">ΕΡΩΤΗΣΗ {qIndex + 1} ΑΠΟ {RIASEC_QUESTIONS.length}</span>
 <span className="text-sm font-bold text-orange-600">{Math.round(progress)}%</span>
 </div>
 <div className="w-full bg-slate-100 rounded-full h-2 mb-12 shadow-inner overflow-hidden">
 <div className="bg-orange-600 h-full transition-all duration-500 ease-out rounded-full" style={{ width: `${progress}%` }}></div>
 </div>

 <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
 <h3 className="text-3xl md:text-4xl font-extrabold text-[#1e293b] mb-12 leading-tight">
 "{RIASEC_QUESTIONS[qIndex].text}"
 </h3>
 
 <div className="w-full flex justify-between items-center px-4 md:px-12">
 <span className="text-sm font-bold text-gray-400 uppercase">Διαφωνώ</span>
 <div className="flex space-x-3 md:space-x-6">
 {[1, 2, 3, 4, 5].map((val) => (
 <button 
 key={val} 
 onClick={() => handleAnswer(val)}
 className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center font-extrabold text-xl md:text-2xl transition-all transform hover:scale-110 active:scale-95 ${
 val <= 2 ? 'border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-400' :
 val === 3 ? 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-400' :
 'border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-400'
 }`}
 >
 {val}
 </button>
 ))}
 </div>
 <span className="text-sm font-bold text-gray-400 uppercase">Συμφωνώ</span>
 </div>
 </div>
 </div>
 </div>
 );
 }

 if (step === 'calculating') {
 return (
 <div className="flex flex-col items-center pt-32 animate-in fade-in duration-500">
 <div className="relative mb-8">
 <div className="absolute inset-0 bg-orange-600/20 rounded-full blur-xl animate-pulse"></div>
 <div className="bg-white p-6 rounded-full shadow-lg border border-gray-100 relative">
 <BrainCircuit className="w-16 h-16 text-orange-600 animate-pulse" />
 </div>
 </div>
 <h3 className="text-3xl font-extrabold text-[#1e293b] mb-4">Ανάλυση προφίλ...</h3>
 <p className="text-gray-500 font-medium">Υπολογισμός κορυφαίων χαρακτηριστικών RIASEC</p>
 </div>
 );
 }

 return (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-5rem)] flex flex-col">
 <div className="mb-8 flex justify-between items-end">
 <div>
 <h2 className="text-3xl font-extrabold text-[#1e293b] ">AI Προσανατολισμός & Chat</h2>
 <p className="text-gray-600 mt-2 font-medium text-lg">Εξερεύνησε τις ακαδημαϊκές σου επιλογές μέσω διαλόγου.</p>
 </div>
 <button onClick={handleRestart} className="text-sm font-bold text-gray-400 hover:text-[#1e293b] underline min-h-[44px]">Επανεκκίνηση Τεστ</button>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
 {/* Match Results or Preferences */}
 <div className="lg:col-span-1 flex flex-col">
 <h3 className="text-xl font-bold text-[#1e293b] mb-4 flex items-center">
 <Sparkles className="w-5 h-5 text-orange-600 mr-2" /> Preferences & Profile
 </h3>
 <div className="space-y-4">
 
 {topTraits.length > 0 && (
 <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-orange-600/70 relative overflow-hidden">
 <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-bl-lg">Κορυφαια Χαρακτηριστικα</div>
 <h4 className="font-extrabold text-[#1e293b] text-xl mb-4">Προφίλ RIASEC</h4>
 <ul className="space-y-3">
 {topTraits.map((trait, idx) => (
 <li key={idx} className="flex items-center text-sm font-bold text-gray-700 bg-orange-50/50 p-2.5 rounded-xl border border-orange-100">
 <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center mr-3 text-xs">{idx + 1}</span>
 {trait}
 </li>
 ))}
 </ul>
 </div>
 )}

 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
 <h4 className="font-extrabold text-[#1e293b] text-lg mb-3">Τα Μόριά μου (Προαιρετικό)</h4>
 <p className="text-sm font-medium text-gray-500 mb-4 leading-relaxed">Βοήθησε το AI να σου προτείνει μόνο εφικτές σχολές για το πεδίο σου.</p>
 <input 
 type="number" 
 placeholder="π.χ. 14500"
 value={userPoints}
 onChange={(e) => setUserPoints(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 text-[#1e293b] font-bold rounded-xl px-4 py-3 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20"
 />
 </div>
 
 <div className="bg-slate-900 p-6 rounded-2xl shadow-sm text-white">
 <h4 className="font-extrabold text-lg mb-2 flex items-center">
 <Info className="w-5 h-5 mr-2 text-indigo-400" /> AI Suggestions
 </h4>
 <p className="text-sm text-slate-300 font-medium leading-relaxed">
 Το AI Mentoring σύστημά μας προσδιορίζει σχολές που συνδυάζουν τις δεξιότητές σου και τα μόριά σου. Συνέχισε το chat!
 </p>
 </div>
 </div>
 </div>

 {/* Chatbox */}
 <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
 <div className="bg-[#1e293b] p-4 flex items-center justify-between">
 <div className="flex items-center">
 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-3">
 <BrainCircuit className="w-6 h-6 text-orange-600" />
 </div>
 <div>
 <h3 className="text-white font-bold text-lg leading-tight">UniTruth AI Mentor</h3>
 <p className="text-orange-600 text-xs font-semibold">Online & Ready</p>
 </div>
 </div>
 </div>
 
 <div className="flex-1 p-6 overflow-y-auto bg-slate-50 flex flex-col space-y-6">
 {chatMessages.map((msg, idx) => (
 <div key={idx} className={`flex ${msg.role === 'ai' ? 'items-start max-w-[85%]' : 'items-end justify-end w-full'}`}>
 {msg.role === 'ai' && (
 <div className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center mr-3 mt-1 flex-shrink-0">
 <BrainCircuit className="w-4 h-4 text-white" />
 </div>
 )}
 <div className={`p-4 rounded-2xl shadow-sm font-medium leading-relaxed max-w-[85%] ${
 msg.role === 'ai' 
 ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm' 
 : 'bg-orange-600 text-white rounded-tr-sm'
 }`}>
 {msg.text}
 </div>
 </div>
 ))}
 </div>

 <div className="p-4 bg-white border-t border-gray-100">
 <div className="relative flex items-center">
 <input 
 type="text" 
 value={chatInput}
 onChange={e => setChatInput(e.target.value)}
 onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
 placeholder="Γράψε την απάντησή σου..." 
 className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-4 outline-none focus:ring-2 focus:ring-orange-600/50"
 />
 <button 
 onClick={handleSendMessage}
 disabled={!chatInput.trim()}
 className="absolute right-2 text-white bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed p-2.5 rounded-lg transition-colors min-h-[44px]"
 aria-label="Send message"
 >
 <Send className="w-5 h-5" />
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}


const MOCK_SCHOOLS = [
  {
    id: "s1",
    name: "Διοικητικής Επιστήμης & Τεχνολογίας (ΔΕΤ) ΟΠΑ",
    avgGraduationTime: "4.2",
    employmentRate: 92,
    curriculumNature: { theoretical: 40, practical: 60 },
    stats: {
      duration: "4 Έτη",
      gradRate: "75% (v+2)",
      employment: "92%"
    },
    admissionBases: [
      { year: 2021, points: 17800 },
      { year: 2022, points: 18050 },
      { year: 2023, points: 17950 },
      { year: 2024, points: 18175 },
    ]
  },
  {
    id: "s2",
    name: "Ηλεκτρολόγων Μηχανικών & Μηχανικών Υπολογιστών (ΗΜΜΥ) ΕΜΠ",
    avgGraduationTime: "5.8",
    employmentRate: 95,
    curriculumNature: { theoretical: 60, practical: 40 },
    stats: {
      duration: "5 Έτη",
      gradRate: "58% (v+2)",
      employment: "95%"
    },
    admissionBases: [
      { year: 2021, points: 18400 },
      { year: 2022, points: 18700 },
      { year: 2023, points: 18600 },
      { year: 2024, points: 18820 },
    ]
  },
  {
    id: "s3",
    name: "Οργάνωσης και Διοίκησης Επιχειρήσεων (ΟΔΕ) ΟΠΑ",
    avgGraduationTime: "4.5",
    employmentRate: 78,
    curriculumNature: { theoretical: 70, practical: 30 },
    stats: {
      duration: "4 Έτη",
      gradRate: "82% (v+2)",
      employment: "78%"
    },
    admissionBases: [
      { year: 2021, points: 15400 },
      { year: 2022, points: 15900 },
      { year: 2023, points: 16100 },
      { year: 2024, points: 16500 },
    ]
  }
];

// ==========================================
// VIEW 2: Student Dashboard (Academic Data)
// ==========================================

function KPIBox({ school, isComparing, opponent }: any) {
 const getWinnerColor = (valA: number, valB: number | undefined, isLowerBetter = false) => {
 if (!isComparing || valB === undefined) return "text-[#1e293b]";
 if (valA === valB) return "text-[#1e293b]";
 const aWins = isLowerBetter ? valA < valB : valA > valB;
 return aWins ? "text-orange-600" : "text-slate-400";
 };

 return (
 <div className={`grid grid-cols-1 ${isComparing ? 'gap-4' : 'md:grid-cols-3 gap-6'}`}>
 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
 <div className="flex justify-between items-start mb-4">
 <h3 className="font-bold text-gray-500 text-sm uppercase">Μέσος Χρόνος Αποφοίτησης</h3>
 <GraduationCap className="w-5 h-5 text-orange-600" />
 </div>
 <div className="flex items-baseline">
 <h4 className={`text-4xl font-extrabold mb-1 ${getWinnerColor(parseFloat(school.avgGraduationTime), opponent ? parseFloat(opponent.avgGraduationTime) : undefined, true)}`}>
 {school.avgGraduationTime}
 </h4>
 <span className="text-sm font-bold text-gray-400 ml-2">έτη</span>
 </div>
 </div>
 
 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
 <div className="flex justify-between items-start mb-4">
 <h3 className="font-bold text-gray-500 text-sm uppercase">Απορρόφηση (6 Μήνες)</h3>
 <TrendingUp className="w-5 h-5 text-orange-600" />
 </div>
 <div className="flex items-baseline">
 <h4 className={`text-4xl font-extrabold mb-1 ${getWinnerColor(school.employmentRate, opponent?.employmentRate)}`}>
 {school.employmentRate}%
 </h4>
 </div>
 </div>

 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
 <div className="flex justify-between items-start mb-4">
 <h3 className="font-bold text-gray-500 text-sm uppercase">Φύση Σπουδών</h3>
 <BookOpen className="w-5 h-5 text-orange-500" />
 </div>
 <div className="mb-2 flex justify-between font-extrabold text-[#1e293b]">
 <span>Θεωρία: {school.curriculumNature.theoretical}%</span>
 <span>Πράξη: {school.curriculumNature.practical}%</span>
 </div>
 <div className="w-full bg-orange-50 rounded-full h-3 flex overflow-hidden">
 <div className="bg-amber-400 h-full" style={{width: `${school.curriculumNature.theoretical}%`}}></div>
 <div className="bg-indigo-400 h-full" style={{width: `${school.curriculumNature.practical}%`}}></div>
 </div>
 </div>
 </div>
 );
}

function ViewStudentDash() {
 const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
 const [pointsFilter, setPointsFilter] = useState<string>('');

 if (selectedSchoolId) {
 const school = MOCK_SCHOOLS.find(s => s.id === selectedSchoolId) || MOCK_SCHOOLS[0];
 const chartData = school.admissionBases.map((point) => ({
 year: point.year,
 [school.name]: point.points
 }));

 return (
 <div className="animate-in fade-in slide-in-from-right-4 duration-500">
 <button 
 onClick={() => setSelectedSchoolId(null)} 
 className="mb-6 flex items-center text-sm font-bold text-gray-500 hover:text-orange-600 transition-colors cursor-pointer"
 >
 <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Επιστροφή στην αναζήτηση
 </button>

 <div className="mb-8">
 <h3 className="text-2xl font-extrabold text-[#1e293b] mb-6 pl-2">{school.name}</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="col-span-1 md:col-span-3">
 <KPIBox school={school} isComparing={false} />
 </div>
 </div>
 </div>

 {/* Line Chart Component */}
 <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
 <h3 className="text-lg font-bold text-[#1e293b] mb-6 flex items-center">
 <BarChart2 className="w-5 h-5 mr-2 text-orange-600"/> Ιστορικό Βάσεων Εισαγωγής
 </h3>
 <div className="overflow-x-auto no-scrollbar">
 <div className="h-80 min-w-[600px]">
 <ResponsiveContainer width="100%" height="100%">
 <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
 <CartesianGrid stroke="#f1f5f9" strokeDasharray="5 5" vertical={false} />
 <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
 <YAxis domain={['dataMin - 1000', 'dataMax + 1000']} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
 <RechartsTooltip cursor={{stroke: '#e2e8f0', strokeWidth: 2}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
 <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 'bold'}} />
 <Line type="monotone" dataKey={school.name} stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
 </LineChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 </div>
 );
 }

 const filteredSchools = MOCK_SCHOOLS.filter(s => {
 if (!pointsFilter) return true;
 const latestBase = s.admissionBases[s.admissionBases.length - 1].points;
 return latestBase <= parseInt(pointsFilter);
 }).sort((a, b) => {
 const baseA = a.admissionBases[a.admissionBases.length - 1].points;
 const baseB = b.admissionBases[b.admissionBases.length - 1].points;
 return baseB - baseA;
 });

 return (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="mb-10">
 <h2 className="text-3xl font-extrabold text-[#1e293b] ">Αναζήτηση Σχολών</h2>
 <p className="text-gray-600 mt-2 font-medium text-lg">Εξερεύνησε τα δεδομένα των τμημάτων και βρες τη σχολή σου.</p>
 </div>

 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex items-end gap-4 max-w-sm">
 <div className="flex-1">
 <label className="text-sm font-bold text-gray-500 uppercase block mb-2">Φίλτρο Μορίων (π.χ. 15000)</label>
 <input 
 type="number" 
 placeholder="Μέγιστα Μόρια..."
 value={pointsFilter}
 onChange={(e) => setPointsFilter(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 text-[#1e293b] font-bold rounded-xl px-4 py-3 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filteredSchools.map(school => {
 const latestBase = school.admissionBases[school.admissionBases.length - 1].points;
 return (
 <div 
 key={school.id}
 onClick={() => setSelectedSchoolId(school.id)}
 className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer group flex flex-col"
 >
 <h3 className="font-extrabold text-lg text-[#1e293b] mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">{school.name}</h3>
 <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
 <span className="text-sm font-bold text-gray-500">Βάση:</span>
 <span className="text-lg font-extrabold text-[#1e293b]">{latestBase}</span>
 </div>
 </div>
 )
 })}
 {filteredSchools.length === 0 && (
 <div className="col-span-full py-12 text-center text-gray-500 font-medium bg-slate-50 rounded-2xl border-2 border-dashed border-gray-200">
 Δεν βρέθηκαν σχολές με βάση κάτω από {pointsFilter} μόρια.
 </div>
 )}
 </div>
 </div>
 );
}


// ==========================================
// VIEW 3: Parent Dashboard (Financial Risk)
// ==========================================
function ViewParentDash() {
 return <ParentFinancialDashboard />;
}


// ==========================================
// VIEW 4: Mentors Marketplace
// ==========================================
function ViewMentors() {
 const [bookingModal, setBookingModal] = useState<number | null>(null);
 const [selectedSchool, setSelectedSchool] = useState<string>('');

 const mentors = [
 { id: 1, name: "Γιώργος Π.", year: "4ο έτος", university: "ΔΕΤ ΟΠΑ", rating: "4.9", bio: "Tech Consulting & Software, πρώην intern." },
 { id: 5, name: "Δημήτρης Φ.", year: "3ο έτος", university: "ΔΕΤ ΟΠΑ", rating: "4.8", bio: "Πρακτική σε Big4, Business Analytics, αρθρογράφος." },
 { id: 2, name: "Μαρία Κ.", year: "3ο έτος", university: "Πληροφορική ΕΚΠΑ", rating: "4.8", bio: "ACM Student Chapter. AI AI enthusiast." },
 { id: 3, name: "Κώστας Μ.", year: "Απόφοιτος", university: "Χημικών ΕΜΠ", rating: "5.0", bio: "Βιομηχανία vs Έρευνα. Η αλήθεια." },
 { id: 4, name: "Ελένη Ν.", year: "2ο έτος", university: "ΟΔΕ ΠΑΠΕΙ", rating: "4.7", bio: "Marketing vs HR κατευθύνσεις." }
 ];

 const filteredMentors = mentors.filter(m => m.university === selectedSchool);

 return (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
 <div className="mb-10">
 <h2 className="text-3xl font-extrabold text-[#1e293b] ">Διαθέσιμοι Μέντορες</h2>
 <p className="text-gray-600 mt-2 font-medium text-lg">Επίλεξε τη σχολή που σε ενδιαφέρει και συνομίλησε με ενεργούς φοιτητές της.</p>
 </div>

 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 max-w-xl">
 <label className="text-sm font-bold text-gray-500 uppercase block mb-3">Επίλεξε Σχολή Ενδιαφέροντος</label>
 <select 
 value={selectedSchool}
 onChange={e => setSelectedSchool(e.target.value)}
 className="w-full bg-slate-50 border border-gray-200 text-[#1e293b] font-bold rounded-xl px-4 py-3 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 transition-all cursor-pointer"
 >
 <option value="">-- Επίλεξε Σχολή --</option>
 <option value="ΔΕΤ ΟΠΑ">Διοικητικής Επιστήμης και Τεχνολογίας (ΟΠΑ)</option>
 <option value="Πληροφορική ΕΚΠΑ">Πληροφορική και Τηλεπικοινωνιών (ΕΚΠΑ)</option>
 <option value="Χημικών ΕΜΠ">Χημικών Μηχανικών (ΕΜΠ)</option>
 <option value="ΟΔΕ ΠΑΠΕΙ">Οργάνωσης και Διοίκησης Επιχειρήσεων (ΠΑΠΕΙ)</option>
 </select>
 </div>

 {!selectedSchool ? (
 <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-slate-50">
 <Users className="w-16 h-16 text-gray-300 mb-4" />
 <p className="text-xl font-bold text-gray-400">Επίλεξε μια σχολή για να δεις τους διαθέσιμους μέντορες</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
 {filteredMentors.length > 0 ? filteredMentors.map((m) => (
 <div key={m.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition-all group overflow-hidden">
 <div className="p-6 md:p-8 flex flex-col items-center text-center flex-1">
 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-extrabold text-slate-500 mb-4 border-4 border-white shadow-sm ring-1 ring-gray-100">
 {m.name.split(' ').map(p => p[0]).join('')}
 </div>
 <h4 className="font-extrabold text-[#1e293b] text-xl leading-tight">{m.name}</h4>
 <p className="text-xs font-bold text-gray-500 mt-1 uppercase ">{m.year}</p>
 <p className="text-sm font-semibold text-orange-600 mt-1">{m.university}</p>
 
 <div className="flex items-center justify-center mt-4 bg-orange-50 px-3 py-1.5 rounded-lg border border-amber-100 w-max mx-auto mb-4">
 <Star className="w-4 h-4 text-orange-500 mr-1.5 fill-current" />
 <span className="text-sm font-extrabold text-orange-700">{m.rating}/5</span>
 </div>
 <p className="text-sm text-gray-600 italic leading-snug">"{m.bio}"</p>
 </div>

 <div className="p-4 pt-0">
 <button onClick={() => setBookingModal(m.id)} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2">
 <Calendar className="w-5 h-5 opacity-90" />
 <span>Κράτηση 30' (25€)</span>
 </button>
 </div>
 </div>
 )) : (
 <div className="col-span-full text-center py-12 text-gray-500 font-medium">Δεν βρέθηκαν μέντορες για αυτή τη σχολή.</div>
 )}
 </div>
 )}

 {/* Booking Modal Mock */}
 {bookingModal && (
 <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
 <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95">
 <button onClick={() => setBookingModal(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800"><X className="w-6 h-6"/></button>
 <h3 className="text-2xl font-extrabold text-[#1e293b] mb-6">Επιλογή Ώρας</h3>
 <div className="space-y-3 mb-8">
 <button className="w-full bg-slate-50 border border-slate-200 hover:border-orange-600 text-slate-700 font-bold py-4 rounded-xl flex justify-between px-6 transition-colors min-h-[44px]">
 <span className="flex items-center"><Clock className="w-5 h-5 mr-3 text-gray-400"/> Αύριο, 17:00</span>
 <span className="text-slate-400">Διαθέσιμο</span>
 </button>
 <button className="w-full bg-slate-50 border border-slate-200 hover:border-orange-600 text-slate-700 font-bold py-4 rounded-xl flex justify-between px-6 transition-colors min-h-[44px]">
 <span className="flex items-center"><Clock className="w-5 h-5 mr-3 text-gray-400"/> Αύριο, 18:30</span>
 <span className="text-slate-400">Διαθέσιμο</span>
 </button>
 <button className="w-full bg-slate-50 border border-slate-200 hover:border-orange-600 text-slate-700 font-bold py-4 rounded-xl flex justify-between px-6 transition-colors min-h-[44px]">
 <span className="flex items-center"><Clock className="w-5 h-5 mr-3 text-gray-400"/> Πέμπτη, 10:00</span>
 <span className="text-slate-400">Διαθέσιμο</span>
 </button>
 </div>
 <button onClick={() => {alert('Booking initiated (Mock)'); setBookingModal(null)}} className="w-full bg-[#1e293b] text-white font-bold py-4 rounded-xl shadow-lg">Προχώρησε σε πληρωμή (25€)</button>
 </div>
 </div>
 )}
 </div>
 );
}


// ==========================================
// VIEW 5: Pricing (B2C)
// ==========================================
function ViewPricing({ onUnlock }: { onUnlock: () => void }) {
 return (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="mb-12 text-center">
 <h2 className="text-3xl md:text-4xl font-extrabold text-[#1e293b] ">Πακέτα & Τιμολόγηση Mentoring</h2>
 <p className="text-gray-600 mt-3 font-medium text-lg max-w-2xl mx-auto">Επένδυσε στο μέλλον σου και μείωσε το ρίσκο της λάθος επιλογής.</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
 <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col">
 <h3 className="text-xl font-extrabold text-[#1e293b] mb-2">The Deep Dive</h3>
 <div className="flex items-baseline mb-6"><span className="text-4xl font-extrabold text-[#1e293b]">25€</span></div>
 <p className="text-gray-500 font-medium mb-8 text-sm">Γρήγορες και στοχευμένες ερωτήσεις.</p>
 <ul className="space-y-4 mb-8 flex-1">
 <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-orange-600 mr-3 flex-shrink-0" /><span className="text-sm font-bold text-gray-700">1 Συνεδρία 30 λεπτών</span></li>
 </ul>
 <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-4 rounded-xl transition-colors min-h-[44px]">Επιλογή</button>
 </div>

 <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-orange-600 flex flex-col relative transform md:-translate-y-4">
 <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-extrabold uppercase shadow-md">Δημοφιλές</div>
 <h3 className="text-xl font-extrabold text-[#1e293b] mb-2 mt-2">Crossroads Bundle</h3>
 <div className="flex items-baseline mb-6"><span className="text-4xl font-extrabold text-[#1e293b]">49€</span></div>
 <p className="text-gray-500 font-medium mb-8 text-sm">Για εις βάθος σύγκριση τμημάτων.</p>
 <ul className="space-y-4 mb-8 flex-1">
 <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-orange-600 mr-3 flex-shrink-0" /><span className="text-sm font-bold text-gray-700">3 Συνεδρίες 30 λεπτών</span></li>
 <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-orange-600 mr-3 flex-shrink-0" /><span className="text-sm font-bold text-gray-700">Αφιερωμένοι Μέντορες</span></li>
 </ul>
 <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition-colors shadow-md min-h-[44px]">Αγορά Bundle</button>
 </div>

 <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#1e293b] flex flex-col bg-slate-50">
 <h3 className="text-xl font-extrabold text-[#1e293b] mb-2">Master Pass</h3>
 <div className="flex items-baseline mb-6"><span className="text-4xl font-extrabold text-[#1e293b]">89€</span></div>
 <p className="text-gray-500 font-medium mb-8 text-sm">Η απόλυτη εμπειρία & πλήρη δεδομένα.</p>
 <ul className="space-y-4 mb-8 flex-1">
 <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-[#1e293b] mr-3 flex-shrink-0" /><span className="text-sm font-bold text-gray-700">3 Συνεδρίες με mentors</span></li>
 <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-[#1e293b] mr-3 flex-shrink-0" /><span className="text-sm font-extrabold text-[#1e293b]">Unlock: Parent Dashboard</span></li>
 <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-[#1e293b] mr-3 flex-shrink-0" /><span className="text-sm font-bold text-gray-700">Webinar Πρόσβαση</span></li>
 </ul>
 <button onClick={onUnlock} className="w-full bg-[#1e293b] hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-colors shadow-md flex items-center justify-center min-h-[44px]">
 <CreditCard className="w-5 h-5 mr-2"/> Unlock Now
 </button>
 </div>
 </div>
 </div>
 );
}


// ==========================================
// VIEW 6: B2B Admin (Phrontisteria)
// ==========================================
function ViewB2BAdmin() {
 return (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between">
 <div>
 <h2 className="text-3xl font-extrabold text-[#1e293b] flex items-center">
 <ShieldCheck className="w-8 h-8 mr-3 text-orange-600"/> Admin: Φροντιστήριο "Άνοδος"
 </h2>
 <p className="text-gray-600 mt-2 font-medium text-lg">Επισκόπηση μαθητών & αγορά Wholesale P2P Sessions.</p>
 </div>
 <div className="mt-6 md:mt-0 bg-white border border-gray-200 px-6 py-3 rounded-2xl shadow-sm text-center">
 <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Υπόλοιπο Συνεδριών</p>
 <p className="text-2xl font-extrabold text-orange-600">12 <span className="text-base text-gray-500">Call credits</span></p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-2">
 <h3 className="text-xl font-bold text-[#1e293b] mb-4">Αποτελέσματα AI Μαθητών</h3>
 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
 <table className="w-full text-left">
 <thead className="bg-slate-50 border-b border-gray-100 text-xs uppercase font-extrabold text-gray-500 ">
 <tr>
 <th className="px-6 py-4">Μαθητης</th>
 <th className="px-6 py-4">AI Κορυφαία Συμβατότητα</th>
 <th className="px-6 py-4">Συμβατότητα %</th>
 <th className="px-6 py-4">Κατασταση</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {MOCK_STUDENTS_B2B.map(student => (
 <tr key={student.id} className="hover:bg-slate-50 transition-colors">
 <td className="px-6 py-4 font-bold text-[#1e293b]">{student.name}</td>
 <td className="px-6 py-4 font-semibold text-gray-600">{student.match}</td>
 <td className="px-6 py-4 font-extrabold text-orange-600">{student.score}</td>
 <td className="px-6 py-4">
 <span className={`px-3 py-1 rounded-full text-xs font-bold ${student.status === 'Ready' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
 {student.status}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 <div className="lg:col-span-1">
 <h3 className="text-xl font-bold text-[#1e293b] mb-4">Wholesale P2P Αγορά</h3>
 <div className="bg-gradient-to-br from-[#1e293b] to-slate-800 p-8 rounded-3xl shadow-xl text-white">
 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/20">
 <Users className="w-6 h-6 text-orange-600" />
 </div>
 <h4 className="text-2xl font-extrabold mb-2">B2B Bundle / 10x</h4>
 <p className="text-indigo-200 font-medium mb-8 text-sm">Αγοράστε 10 συνεδρίες (30') χονδρικής για να τις παρέχετε VIP στους μαθητές σας.</p>
 
 <div className="flex items-end mb-8 space-x-3">
 <span className="text-4xl font-extrabold">180€</span>
 <span className="text-slate-400 font-bold line-through mb-1">250€</span>
 </div>
 <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform focus:scale-95 flex justify-center items-center min-h-[44px]">
 <CreditCard className="w-5 h-5 mr-2" /> Αγορά Πακέτου
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}




