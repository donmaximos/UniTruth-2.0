import React, { useState } from 'react';
import { ArrowLeft, Target, TrendingDown, Clock, FileDown, PlusCircle, Sparkles, ChevronRight, AlertTriangle, ChevronDown } from 'lucide-react';

interface B2BStudentDetailProps {
 student: any;
 fullAiReport: string;
 onBack: () => void;
}

const AccordionItem = ({ title, children }: { key?: React.Key, title: string; children: React.ReactNode }) => {
 const [isOpen, setIsOpen] = useState(false);
 return (
 <div className="border border-slate-200 rounded-xl mb-4 bg-white overflow-hidden shadow-sm">
 <button 
 onClick={() => setIsOpen(!isOpen)} 
 className="w-full flex justify-between items-center p-4 text-left focus:outline-none min-h-[44px]"
 >
 <span className="font-extrabold text-[#1e293b] text-base md:text-lg">{title}</span>
 <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
 </button>
 {isOpen && (
 <div className="p-4 border-t border-slate-100 bg-slate-50 text-slate-700 text-sm md:text-base leading-relaxed">
 {children}
 </div>
 )}
 </div>
 );
};

export default function B2BStudentDetail({ student, fullAiReport, onBack }: B2BStudentDetailProps) {
 const [activeTab, setActiveTab] = useState<'overview' | 'report'>('overview');

 // Parse markdown into sections
 const reportSections = fullAiReport.split('\n\n### ').map(section => {
 if (section.startsWith('### ')) {
 section = section.replace('### ', '');
 }
 const lines = section.split('\n');
 const title = lines[0];
 const content = lines.slice(1).join('\n');
 return { title, content };
 });

 return (
 <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
 {/* Header */}
 <div className="p-4 md:p-6 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
 <div className="flex items-center">
 <button 
 onClick={onBack}
 className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-3 hover:border-orange-500 hover:text-orange-600 transition-colors min-h-[44px]"
 >
 <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-orange-600 transition-colors" />
 </button>
 <div>
 <h2 className="text-xl md:text-2xl font-extrabold text-[#1e293b]">{student.name}</h2>
 <p className="text-xs md:text-sm font-bold text-gray-500">{student.grade} | <span className={`${student.status === 'Ready' ? 'text-emerald-600' : 'text-amber-600'}`}>{student.status}</span></p>
 </div>
 </div>
 </div>

 {/* Tabs Navigation */}
 <div className="px-4 md:px-6 pt-2 border-b border-gray-100 bg-white flex space-x-6 overflow-x-auto no-scrollbar">
 <button 
 onClick={() => setActiveTab('overview')}
 className={`pb-3 pt-3 text-sm font-bold transition-all whitespace-nowrap min-h-[44px] ${
 activeTab === 'overview' 
 ? 'text-slate-900 border-b-2 border-orange-500' 
 : 'text-slate-500 hover:text-slate-700'
 }`}
 >
 Σύνοψη & KPIs
 </button>
 <button 
 onClick={() => setActiveTab('report')}
 className={`pb-3 pt-3 text-sm font-bold transition-all whitespace-nowrap min-h-[44px] ${
 activeTab === 'report' 
 ? 'text-slate-900 border-b-2 border-orange-500' 
 : 'text-slate-500 hover:text-slate-700'
 }`}
 >
 Αναλυτικό AI Report
 </button>
 </div>

 {/* Content Area */}
 <div className="p-4 md:p-8 bg-white min-h-[500px]">
 {activeTab === 'overview' && (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 animate-in slide-in-from-left-4 duration-300">
 {/* Zone 1: Triage */}
 <div className="bg-slate-50 p-5 md:p-6 rounded-2xl border border-slate-100 flex flex-col h-full">
 <div className="flex items-center mb-3">
 <Target className="w-6 h-6 text-orange-500 mr-2" />
 <h3 className="text-base md:text-lg font-extrabold text-[#1e293b]">Triage (Αξιολόγηση)</h3>
 </div>
 <p className="text-sm font-medium text-gray-600 leading-relaxed mb-4 flex-1">
 Ο μαθητής έχει σαφή προτίμηση στην τεχνολογία και την ανάλυση δεδομένων. 
 Κορυφαία Συμβατότητα: <span className="font-bold text-[#1e293b]">{student.match}</span> ({student.score}).
 </p>
 <div className="bg-white p-3 rounded-xl border border-slate-200">
 <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mb-1">Προτεινόμενο Πακέτο</p>
 <p className="font-extrabold text-emerald-600 text-sm md:text-base">Crossroads Bundle</p>
 </div>
 </div>

 {/* Zone 2: AI Filtering Logic */}
 <div className="bg-blue-50/50 p-5 md:p-6 rounded-2xl border border-blue-100 flex flex-col h-full">
 <div className="flex items-center mb-3">
 <Target className="w-6 h-6 text-blue-500 mr-2" />
 <h3 className="text-base md:text-lg font-extrabold text-[#1e293b]">AI Report Logic</h3>
 </div>
 
 {student.actualPoints ? (
 <>
 <p className="text-sm font-medium text-gray-600 leading-relaxed mb-4">
 Ο μαθητής έχει καταχωρήσει πραγματικά μόρια. Το σύστημα φιλτράρει αυστηρά και προβάλλει μόνο σχολές που είναι εφικτές.
 </p>
 <div className="mt-auto mb-4 bg-white p-3 rounded-xl border border-blue-200">
 <p className="text-[10px] md:text-xs font-bold text-blue-500 uppercase mb-1">Μόρια Εξετάσεων</p>
 <p className="font-extrabold text-slate-700 text-lg md:text-xl">{student.actualPoints}</p>
 </div>
 </>
 ) : (
 <>
 <p className="text-sm font-medium text-gray-600 leading-relaxed mb-4">
 Ο μαθητής δεν έχει καταχωρήσει μόρια. Ανάλυση 100% βασισμένη στο ψυχομετρικό προφίλ RIASEC για την εξερεύνηση των φυσικών του κλίσεων.
 </p>
 <div className="mt-auto mb-4 bg-white p-3 rounded-xl border border-blue-200">
 <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mb-1">Κατάσταση</p>
 <p className="font-extrabold text-slate-700 text-sm md:text-base">Ελεύθερη Εξερεύνηση (Pre-Exam)</p>
 </div>
 </>
 )}
 </div>

 {/* Zone 3: Monetization Action */}
 <div className="bg-[#1e293b] p-5 md:p-6 rounded-2xl shadow-lg flex flex-col h-full">
 <div className="flex items-center mb-3">
 <Sparkles className="w-6 h-6 text-orange-500 mr-2" />
 <h3 className="text-base md:text-lg font-extrabold text-white">Εμπορική Πρόταση</h3>
 </div>
 <p className="text-sm font-medium text-slate-300 leading-relaxed flex-1 mb-6">
 Προτείνετε P2P Συνεδρία με φοιτητή του {student.match} για επίλυση αποριών περί εργαστηρίων.
 </p>
 <button className="w-full min-h-[44px] bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform focus:scale-95 flex items-center justify-center mt-auto">
 <PlusCircle className="w-5 h-5 mr-2" />
 Πρόταση P2P Mentoring στον Γονέα
 </button>
 </div>
 </div>
 )}

 {activeTab === 'report' && (
 <div className="animate-in slide-in-from-right-4 duration-300">
 <div className="flex justify-end mb-4 md:mb-6">
 <button className="flex items-center justify-center w-full md:w-auto min-h-[44px] px-4 py-2 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors">
 <FileDown className="w-4 h-4 mr-2" />
 Εξαγωγή σε PDF
 </button>
 </div>
 
 <div className="space-y-2">
 {reportSections.map((section, index) => (
 <AccordionItem key={index} title={section.title}>
 <div className="space-y-4">
 {section.content.split('\n\n').map((paragraph, i) => {
 if (paragraph.startsWith('* **')) {
 return (
 <div key={i} className="space-y-2 bg-white p-3 md:p-4 rounded-lg border border-slate-200 shadow-sm">
 {paragraph.split('\n').filter(l => l.trim()).map((line, j) => {
 const match = line.match(/^\*\s\*\*(.*?)\*\*(.*)$/);
 if (match) {
 return <p key={j} className="text-slate-700 text-xs md:text-sm leading-relaxed"><strong className="text-slate-900 font-bold">{match[1]}</strong>{match[2]}</p>
 }
 return <p key={j} className="text-slate-700 text-xs md:text-sm leading-relaxed">{line}</p>
 })}
 </div>
 );
 }
 return (
 <p key={i} className="text-slate-700 text-xs md:text-sm leading-relaxed font-medium">
 {paragraph.split('\n').filter(l => l.trim()).map((line, j) => {
 const parts = line.split(/(\*\*.*?\*\*)/g);
 return (
 <span key={j}>
 {parts.map((part, k) => {
 if (part.startsWith('**') && part.endsWith('**')) {
 return <strong key={k} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
 }
 return part;
 })}
 <br/>
 </span>
 )
 })}
 </p>
 );
 })}
 </div>
 </AccordionItem>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
