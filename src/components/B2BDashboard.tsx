import React, { useState } from 'react';
import { ShieldCheck, Users, Target, CheckCircle2, ChevronRight, Activity, BookOpen } from 'lucide-react';
import B2BStudentDetail from './B2BStudentDetail';

const MOCK_AI_REPORT = `
### Ψυχομετρικό Προφίλ (RIASEC Analysis)
* **Κυρίαρχα Στοιχεία:** Investigative (85%) - Enterprising (75%)
* **Ρεαλιστική Εφαρμογή:** Ο συνδυασμός αυτών των δύο χαρακτηριστικών καταδεικνύει μια ισχυρή κλίση προς την επίλυση πολύπλοκων προβλημάτων με ταυτόχρονη διάθεση για ανάληψη πρωτοβουλιών και διαχείριση ομάδων. Ο μαθητής δεν αρκείται στην αναζήτηση της γνώσης (Investigative) αλλά επιδιώκει να την εφαρμόσει στρατηγικά στο επιχειρείν (Enterprising).

### Συμπεράσματα AI Διαλόγου
* **Τεχνολογικό Ενδιαφέρον, αλλά με Όρια:** Παρότι ο μαθητής έχει έφεση στην τεχνολογία, διατύπωσε ρητά πως δεν τον ενδιαφέρει να ασχολείται αποκλειστικά με καθαρό προγραμματισμό (hardcore coding).
* **Διαχείριση Ανθρώπων:** Εκδήλωσε ισχυρή επιθυμία να δουλέψει με ομάδες, να ηγηθεί projects και να βρίσκεται στο επίκεντρο της λήψης αποφάσεων (Project Management).
* **Ανησυχία για "Βαριά" Θεωρία:** Εξέφρασε έντονο προβληματισμό για τις ικανότητές του στα μαθήματα καθαρής Φυσικής και πολύπλοκων μαθηματικών αναλύσεων.

### Στοχευμένες Επιλογές & Αιτιολόγηση

* **Η Επιλογή:** Διοικητικής Επιστήμης και Τεχνολογίας (ΔΕΤ) - ΟΠΑ
* **Γιατί Ταιριάζει:** Αποτελεί τη χρυσή τομή μεταξύ τεχνολογίας (Investigative) και διοίκησης (Enterprising). Καλύπτει απόλυτα την επιθυμία του για Project Management και συντονισμό ομάδων, προσφέροντας παράλληλα γερές βάσεις σε τεχνολογικά εργαλεία, χωρίς να εστιάζει αποκλειστικά στον προγραμματισμό.
* **Αδυναμίες / Ρίσκα Προφίλ:** Ο μαθητής μπορεί να αντιμετωπίσει κάποιες δυσκολίες στα αυστηρά ποσοτικά μαθήματα (π.χ. Προχωρημένη Στατιστική ή Οικονομετρία) αν δεν προσαρμοστεί στις ακαδημαϊκές απαιτήσεις του ΟΠΑ. 

* **Η Επιλογή:** Πληροφορικής (ΟΠΑ)
* **Γιατί Ταιριάζει:** Παρέχει τις απαραίτητες τεχνολογικές βάσεις με σαφή οικονομικό/διοικητικό προσανατολισμό σε σχέση με αντίστοιχα τμήματα (π.χ. ΕΚΠΑ), κάτι που ταιριάζει στο Enterprising προφίλ του.
* **Αδυναμίες / Ρίσκα Προφίλ:** Υπάρχει το ρίσκο ο μαθητής να απογοητευτεί από τον αυξημένο όγκο μαθημάτων που απαιτούν κώδικα, ειδικά στα πρώτα δύο έτη σπουδών.

### Προτεινόμενο Επόμενο Βήμα
Κλείστε μια P2P συνεδρία με ενεργό φοιτητή του ΔΕΤ μέσω της υπηρεσίας μας. Είναι κρίσιμο ο μαθητής να έρθει σε άμεση επαφή με κάποιον που βιώνει την καθημερινότητα της σχολής, ώστε να ερευνήσει τη φύση των εργαστηρίων και να διαπιστώσει αν η αναλογία management-προγραμματισμού ανταποκρίνεται στις προσωπικές του προσδοκίες.
`.trim();

const MOCK_STUDENTS_B2B = [
 { id: 1, name: "Αλέξανδρος Ν.", match: "Διοικητικής Επιστήμης - ΟΠΑ", score: "98%", status: "Ready", grade: "Γ' Λυκείου" },
 { id: 2, name: "Ελένη Μ.", match: "Πληροφορική - ΑΠΘ", score: "92%", status: "Needs Advising", grade: "Β' Λυκείου" },
 { id: 3, name: "Γιώργος Κ.", match: "Οικονομικό - ΠΑΠΕΙ", score: "75%", status: "Ready", grade: "Γ' Λυκείου" },
 { id: 4, name: "Μαρία Σ.", match: "Ιατρική - ΕΚΠΑ", score: "96%", status: "Ready", grade: "Γ' Λυκείου" },
 { id: 5, name: "Νίκος Π.", match: "ΗΜΜΥ - ΕΜΠ", score: "88%", status: "Pending Test", grade: "Α' Λυκείου" },
 { id: 6, name: "Αντωνία Δ.", match: "Νομική - ΑΠΘ", score: "94%", status: "Ready", grade: "Γ' Λυκείου" },
 { id: 7, name: "Κωνσταντίνος Ρ.", match: "Χημικό - ΠΑΤΡΑΣ", score: "82%", status: "Ready", grade: "Γ' Λυκείου" },
 { id: 8, name: "Δήμητρα Τ.", match: "ΔΕΤ - ΟΠΑ", score: "91%", status: "Needs Advising", grade: "Β' Λυκείου" },
 { id: 9, name: "Σταύρος Β.", match: "Φυσικό - ΕΚΠΑ", score: "86%", status: "Ready", grade: "Γ' Λυκείου" },
 { id: 10, name: "Κατερίνα Γ.", match: "Αρχιτεκτόνων - ΕΜΠ", score: "95%", status: "Ready", grade: "Γ' Λυκείου" },
];

export default function B2BDashboard() {
 const [selectedStudent, setSelectedStudent] = useState<any>(null);
 const totalStudents = MOCK_STUDENTS_B2B.length;
 // Let's pretend calculating top targeted school
 const topTargetedSchool = "ΔΕΤ - ΟΠΑ (AUEB)";

 if (selectedStudent) {
 return <B2BStudentDetail student={selectedStudent} fullAiReport={MOCK_AI_REPORT} onBack={() => setSelectedStudent(null)} />;
 }

 return (

 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between">
 <div>
 <h2 className="text-3xl font-extrabold text-[#1e293b] flex items-center">
 <ShieldCheck className="w-8 h-8 mr-3 text-orange-600"/> 
 <div>
 Admin: Φροντιστήριο "Άνοδος"
 <span className="block text-sm font-medium text-gray-500 mt-1">B2B Dashboard Επισκόπησης</span>
 </div>
 </h2>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
 <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center">
 <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mr-4">
 <Users className="w-7 h-7 text-orange-600" />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-500 uppercase mb-1">Σύνολο Ενεργών</p>
 <h3 className="text-3xl font-extrabold text-[#1e293b]">{totalStudents}</h3>
 </div>
 </div>
 <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center">
 <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mr-4">
 <Target className="w-7 h-7 text-orange-600" />
 </div>
 <div>
 <p className="text-sm font-bold text-gray-500 uppercase mb-1">Top Σχολή Επιλογής</p>
 <h3 className="text-xl font-extrabold text-[#1e293b]">{topTargetedSchool}</h3>
 </div>
 </div>
 <div className="bg-[#1e293b] rounded-3xl p-6 shadow-xl flex flex-col justify-center relative overflow-hidden group hover:bg-slate-800 transition-colors cursor-pointer">
 <div className="relative z-10 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold text-slate-400 uppercase mb-1">Wholesale Mentoring</p>
 <h3 className="text-xl font-extrabold text-white">Αγορά Συνεδριών</h3>
 </div>
 <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
 <ChevronRight className="w-5 h-5 text-white" />
 </div>
 </div>
 <div className="absolute top-0 right-0 w-32 h-32 bg-slate-700 opacity-20 rounded-full blur-2xl -mr-10 -mt-10"></div>
 </div>
 </div>

 <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
 <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
 <h3 className="text-lg md:text-xl font-extrabold text-[#1e293b] flex items-center">
 <BookOpen className="w-5 h-5 md:w-6 md:h-6 mr-2 text-slate-400" /> 
 Λίστα Μαθητών
 </h3>
 </div>
 
 {/* Mobile view: Stacked Cards */}
 <div className="block md:hidden divide-y divide-gray-100">
 {MOCK_STUDENTS_B2B.map(student => (
 <div key={student.id} className="p-5 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedStudent(student)}>
 <div className="flex justify-between items-start mb-2">
 <div>
 <h4 className="font-extrabold text-[#1e293b] text-base">{student.name}</h4>
 <p className="text-xs font-bold text-gray-500 mt-0.5">{student.grade}</p>
 </div>
 <div>
 {student.status === 'Ready' && <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1" /> Ολοκληρώθηκε</span>}
 {student.status === 'Needs Advising' && <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700"><Activity className="w-3 h-3 mr-1" /> Συμβουλευτική</span>}
 {student.status === 'Pending Test' && <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">Εκκρεμεί</span>}
 </div>
 </div>
 <div className="flex items-center justify-between mt-3">
 <div>
 <span className="font-bold text-[#1e293b] text-sm">{student.match}</span>
 <span className="ml-2 text-xs font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">{student.score}</span>
 </div>
 <ChevronRight className="w-4 h-4 text-orange-500" />
 </div>
 </div>
 ))}
 </div>

 {/* Desktop view: Table */}
 <div className="hidden md:block overflow-x-auto">
 <table className="w-full text-left">
 <thead className="bg-white border-b border-gray-100 text-xs uppercase font-extrabold text-gray-400 ">
 <tr>
 <th className="px-6 py-4">Μαθητής</th>
 <th className="px-6 py-4">Τάξη</th>
 <th className="px-6 py-4">AI Κορυφαία Συμβατότητα</th>
 <th className="px-6 py-4">Κατάσταση</th>
 <th className="px-6 py-4 text-right">Ενέργεια</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {MOCK_STUDENTS_B2B.map(student => (
 <tr key={student.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setSelectedStudent(student)}>
 <td className="px-6 py-4">
 <div className="font-extrabold text-[#1e293b]">{student.name}</div>
 </td>
 <td className="px-6 py-4">
 <span className="font-semibold text-gray-500 text-sm">{student.grade}</span>
 </td>
 <td className="px-6 py-4">
 <span className="font-bold text-[#1e293b]">{student.match}</span>
 <span className="ml-2 text-xs font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">{student.score}</span>
 </td>
 <td className="px-6 py-4">
 {student.status === 'Ready' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1" /> Ολοκληρώθηκε</span>}
 {student.status === 'Needs Advising' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700"><Activity className="w-3 h-3 mr-1" /> Χρειάζεται Συμβουλευτική</span>}
 {student.status === 'Pending Test' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">Εκκρεμεί</span>}
 </td>
 <td className="px-6 py-4 text-right">
 <span className="text-sm font-bold text-orange-600 group-hover:text-orange-700 transition-colors flex items-center justify-end">
 View Report <ChevronRight className="w-4 h-4 ml-1" />
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}
