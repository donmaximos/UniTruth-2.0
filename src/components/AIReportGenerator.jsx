import { useState } from 'react';
import ReportLoadingUI from './ReportLoadingUI';

const initialStudentInput = JSON.stringify(
  {
    name: 'Μαρία Παπαδοπούλου',
    age: 17,
    grade: 'Γ\' Λυκείου',
    interests: ['τεχνολογία', 'μαθηματικά', 'δημιουργικότητα'],
    riasec_scores: {
      realistic: 4,
      investigative: 5,
      artistic: 3,
      social: 2,
      enterprising: 3,
      conventional: 2,
    },
    education_goals: 'Σπουδές σε εφαρμοσμένα μαθηματικά ή Τεχνολογία Πληροφορικής',
  },
  null,
  2,
);

export default function AIReportGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [studentInput, setStudentInput] = useState(initialStudentInput);

  async function fetchReport(studentData) {
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ student_data: studentData, market_data: {} }),
      });

      if (!response.ok) {
        console.error('Report generation failed:', response.status, response.statusText);
        return;
      }

      const json = await response.json();
      setReportData(json);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleGenerateReport() {
    try {
      const parsedStudentData = JSON.parse(studentInput);
      fetchReport(parsedStudentData);
    } catch (error) {
      console.error('Invalid student data JSON:', error);
    }
  }

  if (isLoading) {
    return <ReportLoadingUI />;
  }

  if (reportData) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 tracking-normal px-6 py-10">
        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="mb-8 space-y-3">
            <p className="text-sm uppercase tracking-[0.25em] text-orange-600">AI Blueprint</p>
            <h1 className="text-3xl font-semibold text-slate-900">Τελική Επαγγελματική Αναφορά</h1>
            <p className="text-slate-600">Παρουσίαση των ευρημάτων βάσει του προφίλ και των μοντέλων συμβατότητας.</p>
          </div>

          <section className="space-y-6">
            <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Ανάλυση Ψυχομετρικού Προφίλ</h2>
              <p className="mt-4 whitespace-pre-wrap text-slate-700">{reportData.psychometric_analysis}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {(reportData.top_matches ?? []).map((match, index) => (
                <div key={index} className="rounded-3xl border border-orange-100 bg-orange-50 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-orange-700">{match.title}</h3>
                  <p className="mt-3 text-slate-700">{match.reasoning}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Επόμενο Βήμα</h2>
              <p className="mt-4 text-slate-700">{reportData.actionable_next_step}</p>
            </div>
          </section>

          <button
            type="button"
            onClick={() => setReportData(null)}
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
          >
            Δημιουργία Νέου Blueprint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 tracking-normal px-6 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="mb-8 space-y-3">
          <p className="text-sm uppercase tracking-[0.25em] text-orange-600">Έναρξη Αναφοράς</p>
          <h1 className="text-3xl font-semibold text-slate-900">Δημιουργία Προσανατολισμού Μαθητή</h1>
          <p className="text-slate-600">Επικόλληση των βασικών στοιχείων του μαθητή και πάτημα του κουμπιού για αναλυτικό AI report.</p>
        </div>

        <textarea
          value={studentInput}
          onChange={(event) => setStudentInput(event.target.value)}
          className="min-h-[280px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Στείλε το προφίλ στον backend και λάβε το τελικό AI report.</p>
          <button
            type="button"
            onClick={handleGenerateReport}
            className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-700"
          >
            Δημιουργία Blueprint
          </button>
        </div>
      </div>
    </div>
  );
}
