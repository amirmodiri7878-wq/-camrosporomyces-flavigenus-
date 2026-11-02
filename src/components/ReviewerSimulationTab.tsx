import React, { useState } from 'react';
import { ProjectData } from '../types';
import { 
  FileCheck, 
  RotateCw, 
  AlertCircle, 
  CheckCircle, 
  HelpCircle, 
  Send,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';

interface ReviewerSimulationTabProps {
  project: ProjectData;
  language: 'fa' | 'en';
}

export const ReviewerSimulationTab: React.FC<ReviewerSimulationTabProps> = ({
  project,
  language,
}) => {
  const [loading, setLoading] = useState(false);
  const [simulationData, setSimulationData] = useState<{
    verdict: string;
    editorComment: string;
    rev1Comment: string;
    rev2Comment: string;
    rebuttalTips: string;
  }>({
    verdict: 'Minor Revisions Required (Strong Candidate for Fast-Track Acceptance)',
    editorComment: `The manuscript represents a sound first disease report documenting Camarosporomyces flavigenus as a novel walnut kernel rot pathogen. The data are convincing, with proper morphological diagnosis and fulfillment of Koch’s postulates. Prior to formal acceptance, address the minor technical queries raised by the two reviewers below regarding sequence accession availability and marker selection rationale.`,
    rev1Comment: `Reviewer 1 (Molecular Systematics & Mycology):
1. The authors use LSU (28S rDNA) and beta-tubulin (tub2) for phylogenetic placement. The concatenated Maximum Likelihood tree cleanly anchors the isolates in the C. flavigenus clade with high bootstrap support (98%).
2. Comment: In fungal pathology, many authors routinely sequence the internal transcribed spacer (ITS). While tub2 provides excellent species-level resolution in Pleosporales, please add one sentence in the Discussion explaining why beta-tubulin was selected as the diagnostic barcode in lieu of ITS.
3. Verify that all GenBank accession numbers (PP891204 and PP891310) are publicly released and searchable prior to final proofs.`,
    rev2Comment: `Reviewer 2 (Plant Pathology & Inoculation Trials):
1. Koch’s postulates are well documented with an adequate sample size (n = 20 kernels). The inclusion of mock-inoculated controls (0.0 mm necrosis) is appreciated.
2. In the Materials and Methods, please clarify the exact incubation photoperiod (12 h light / 12 h dark) and relative humidity (>90%).
3. Were any other fungi isolated from the symptomatic field kernels? If so, briefly note whether C. flavigenus was the predominant isolate.`,
    rebuttalTips: language === 'fa' 
      ? `راهبرد استاد راهنما برای پاسخ به داوران (Author Rebuttal Strategy):
۱. در پاسخ به داور اول: تشکر کنید و به صراحت بنویسید که در متن مقاله جمله زیر اضافه شد: "Because beta-tubulin exhibits higher interspecific sequence divergence than ITS within Camarosporidiaceae, it was chosen alongside LSU for robust species delineation."
۲. در پاسخ به داور دوم: تأیید کنید که شرایط نوری ۱۲ ساعت روشنایی / ۱۲ ساعت تاریکی و رطوبت نسبی بالای ۹۰ درصد در متن Materials and Methods قید گردید. همچنین ذکر کنید که C. flavigenus از ۸۵ درصد قطعات بافت پوسیده به عنوان جدایه غالب خالص‌سازی شد.`
      : `Supervisor Rebuttal Strategy:
1. Response to Reviewer 1: Thank the reviewer and incorporate the defense sentence: "Because beta-tubulin exhibits higher interspecific divergence than ITS within Camarosporidiaceae, it was chosen alongside LSU for robust species delineation."
2. Response to Reviewer 2: Explicitly state the 12-h photoperiod and confirm that C. flavigenus was the predominant fungus recovered from 85% of rotten tissues.`,
  });

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate_review',
          language,
          payload: {
            title: project.manuscript?.title || '',
            abstract: project.manuscript?.abstract || '',
            isolates: project.isolates || [],
            morphology: project.conidiaStats || {},
            labImagesCount: (project.labImages || []).length,
          },
        }),
      });

      const data = await response.json();
      if (data.text) {
        setSimulationData((prev) => ({
          ...prev,
          editorComment: data.text,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
            {language === 'fa' ? 'شبیه‌ساز داوری همتراز (Peer Review)' : 'Peer Review Simulation Engine'}
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            {language === 'fa' ? 'ارزیابی سخت‌گیرانه داوران ژورنال‌های معتبر' : 'Journal Peer Review & Rebuttal Simulator'}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {language === 'fa'
              ? 'پیش‌بینی پرسش‌ها و ایرادات احتمالی داوران بین‌المللی برای اطمینان از پذیرش قطعی مقاله در اولین مرحله داوری.'
              : 'Preempt critical reviewer questions and formulate bulletproof responses before initial journal submission.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunSimulation}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          {loading ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>{language === 'fa' ? 'در حال شبیه‌سازی داوری...' : 'Simulating Review...'}</span>
            </>
          ) : (
            <>
              <FileCheck className="w-4 h-4" />
              <span>{language === 'fa' ? 'اجرای شبیه‌ساز داوری ISI' : 'Simulate Peer Review'}</span>
            </>
          )}
        </button>
      </div>

      {/* Editor's Verdict Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-slate-900 font-mono uppercase">
              {language === 'fa' ? 'تصمیم اولیه سردبیر (Editor Decision)' : 'Senior Editor Recommendation'}
            </span>
          </div>
          <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
            {simulationData.verdict}
          </span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-3.5 rounded-lg border border-slate-100 font-serif">
          "{simulationData.editorComment}"
        </p>
      </div>

      {/* Reviewer 1 & Reviewer 2 Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reviewer 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-teal-900">
            <MessageSquare className="w-4 h-4 text-teal-700" />
            <span className="text-xs font-bold font-mono">
              {language === 'fa' ? 'گزارش داور شماره ۱ (متخصص فیلوژنی و قارچ‌شناسی)' : 'Reviewer 1 Report (Systematics & Mycology)'}
            </span>
          </div>
          <div className="text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-line bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            {simulationData.rev1Comment}
          </div>
        </div>

        {/* Reviewer 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-teal-900">
            <MessageSquare className="w-4 h-4 text-teal-700" />
            <span className="text-xs font-bold font-mono">
              {language === 'fa' ? 'گزارش داور شماره ۲ (متخصص بیماری‌شناسی و مایه‌زنی)' : 'Reviewer 2 Report (Phytopathology & Inoculation)'}
            </span>
          </div>
          <div className="text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-line bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            {simulationData.rev2Comment}
          </div>
        </div>
      </div>

      {/* Rebuttal & Point-by-point defense advice */}
      <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-teal-950 font-bold text-sm">
          <ShieldAlert className="w-4 h-4 text-teal-700" />
          <span>
            {language === 'fa' ? 'پیش‌نویس نامه پاسخ به داوران (Author Rebuttal Letter)' : 'Author Rebuttal Formulation Strategy'}
          </span>
        </div>
        <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-white p-4 rounded-lg border border-teal-200/60 font-sans">
          {simulationData.rebuttalTips}
        </div>
      </div>
    </div>
  );
};
