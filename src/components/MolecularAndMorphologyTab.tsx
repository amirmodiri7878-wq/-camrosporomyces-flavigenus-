import React, { useState } from 'react';
import { ProjectData, SampleIsolate, LabImageUpload } from '../types';
import { 
  Dna, 
  Microscope, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Sparkles, 
  RotateCw, 
  Check, 
  Copy, 
  Plus, 
  Send,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Eye
} from 'lucide-react';

interface MolecularAndMorphologyTabProps {
  project: ProjectData;
  setProject: React.Dispatch<React.SetStateAction<ProjectData>>;
  language: 'fa' | 'en';
  onNavigateToManuscript: () => void;
}

export const MolecularAndMorphologyTab: React.FC<MolecularAndMorphologyTabProps> = ({
  project,
  setProject,
  language,
  onNavigateToManuscript,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'molecular' | 'morphology' | 'images'>('molecular');
  const [activeLocus, setActiveLocus] = useState<'LSU' | 'TUB2'>('LSU');
  const [copiedFasta, setCopiedFasta] = useState(false);
  const [analyzingImageId, setAnalyzingImageId] = useState<string | null>(null);

  // New isolate form state
  const [newIsolate, setNewIsolate] = useState<Partial<SampleIsolate>>({
    code: '',
    host: 'Juglans regia',
    tissue: 'Kernel',
    locality: '',
    genBankLSU: '',
    genBankTub2: '',
    cultureCollectionId: '',
  });
  const [showAddIsolate, setShowAddIsolate] = useState(false);

  // Sequence stats calculator
  const calculateSequenceStats = (fastaStr: string) => {
    const raw = fastaStr.replace(/^>.*$/m, '').replace(/[\r\n\s]/g, '').toUpperCase();
    const length = raw.length;
    const a = (raw.match(/A/g) || []).length;
    const t = (raw.match(/T/g) || []).length;
    const g = (raw.match(/G/g) || []).length;
    const c = (raw.match(/C/g) || []).length;
    const gc = length > 0 ? (((g + c) / length) * 100).toFixed(1) : '0.0';
    return { length, a, t, g, c, gc };
  };

  const lsuStats = calculateSequenceStats(project.fastaLSU);
  const tub2Stats = calculateSequenceStats(project.fastaTub2);

  const handleCopyFasta = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFasta(true);
    setTimeout(() => setCopiedFasta(false), 2000);
  };

  const handleAddIsolate = () => {
    if (!newIsolate.code) return;
    const iso: SampleIsolate = {
      id: Date.now().toString(),
      code: newIsolate.code || 'CF-WAL',
      host: newIsolate.host || 'Juglans regia',
      tissue: newIsolate.tissue || 'Kernel',
      locality: newIsolate.locality || '',
      collectionDate: new Date().toLocaleDateString(),
      genBankLSU: newIsolate.genBankLSU || '',
      genBankTub2: newIsolate.genBankTub2 || '',
      cultureCollectionId: newIsolate.cultureCollectionId || '',
    };
    setProject((prev) => ({
      ...prev,
      isolates: [...prev.isolates, iso],
    }));
    setNewIsolate({
      code: '',
      host: 'Juglans regia',
      tissue: 'Kernel',
      locality: '',
      genBankLSU: '',
      genBankTub2: '',
      cultureCollectionId: '',
    });
    setShowAddIsolate(false);
  };

  const handleDeleteIsolate = (id: string) => {
    setProject((prev) => ({
      ...prev,
      isolates: prev.isolates.filter((i) => i.id !== id),
    }));
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, category: LabImageUpload['category']) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newImg: LabImageUpload = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
          name: file.name,
          category,
          dataUrl,
          mimeType: file.type || 'image/jpeg',
          uploadedAt: new Date().toLocaleDateString(),
          caption: file.name.replace(/\.[^/.]+$/, ''),
        };

        setProject((prev) => ({
          ...prev,
          labImages: [newImg, ...prev.labImages],
        }));
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Multimodal AI Image Analysis
  const handleAnalyzeImage = async (img: LabImageUpload) => {
    setAnalyzingImageId(img.id);
    try {
      const response = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_image',
          language,
          payload: {
            base64Data: img.dataUrl,
            mimeType: img.mimeType,
            category: img.category,
            userNote: img.caption,
          },
        }),
      });

      const data = await response.json();
      const analysisText = data.text || data.data || 'تحلیل تصویر با موفقیت انجام شد.';

      setProject((prev) => ({
        ...prev,
        labImages: prev.labImages.map((item) =>
          item.id === img.id ? { ...item, aiAnalysis: analysisText } : item
        ),
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingImageId(null);
    }
  };

  const handleDeleteImage = (id: string) => {
    setProject((prev) => ({
      ...prev,
      labImages: prev.labImages.filter((img) => img.id !== id),
    }));
  };

  const handleSendToManuscript = (analysis: string) => {
    // Append to Results or Methods
    setProject((prev) => ({
      ...prev,
      manuscript: {
        ...prev.manuscript,
        results: prev.manuscript.results 
          ? `${prev.manuscript.results}\n\n${analysis}`
          : analysis,
      },
    }));
    onNavigateToManuscript();
  };

  return (
    <div className="space-y-6" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {/* Sub-navigation bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('molecular')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'molecular'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            <span>{language === 'fa' ? '۱. داده‌های مولکولی (LSU و tub2)' : '1. Molecular Sequences (LSU & tub2)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('morphology')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'morphology'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Microscope className="w-3.5 h-3.5" />
            <span>{language === 'fa' ? '۲. داده‌های ریخت‌شناختی و پرگنه' : '2. Morphological Characteristics'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('images')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'images'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>
              {language === 'fa' ? '۳. آپلود و تحلیل تصاویر و اسکن‌ها' : '3. Lab Images & Tree Scans Analyzer'}
            </span>
            {project.labImages.length > 0 && (
              <span className="px-1.5 py-0.2 bg-teal-900 text-white text-[10px] rounded-full font-mono">
                {project.labImages.length}
              </span>
            )}
          </button>
        </div>

        {/* Live sync badge */}
        <div className="flex items-center gap-1.5 text-xs text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100 font-mono">
          <span className="w-2 h-2 rounded-full bg-teal-600"></span>
          <span>{language === 'fa' ? 'همگام با استودیو نگارش مقاله' : 'Synced with Manuscript Studio'}</span>
        </div>
      </div>

      {/* 1. MOLECULAR DATA ENTRY */}
      {activeSubTab === 'molecular' && (
        <div className="space-y-6">
          {/* Locus Selection Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setActiveLocus('LSU')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                activeLocus === 'LSU'
                  ? 'bg-white border-teal-700 ring-1 ring-teal-700 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">28S Large Subunit rDNA (LSU)</span>
                  <span className="text-[10px] font-mono text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">
                    {lsuStats.length > 0 ? `${lsuStats.length} bp` : language === 'fa' ? 'خالی' : 'Empty'}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {project.genBankLSU || (language === 'fa' ? 'بدون شماره GenBank' : 'No GenBank ID')}
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div>
                  <span className="text-slate-400 font-mono text-[11px]">Forward Primer:</span>{' '}
                  <span className="font-mono text-slate-800">{project.primerLSU.forward}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-mono text-[11px]">Reverse Primer:</span>{' '}
                  <span className="font-mono text-slate-800">{project.primerLSU.reverse}</span>
                </div>
                <div className="pt-2 flex items-center gap-4 text-[11px] font-mono text-slate-500 border-t border-slate-100">
                  <span>GC: {lsuStats.gc}%</span>
                  <span>A:{lsuStats.a} T:{lsuStats.t} G:{lsuStats.g} C:{lsuStats.c}</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveLocus('TUB2')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                activeLocus === 'TUB2'
                  ? 'bg-white border-teal-700 ring-1 ring-teal-700 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Beta-tubulin (tub2)</span>
                  <span className="text-[10px] font-mono text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">
                    {tub2Stats.length > 0 ? `${tub2Stats.length} bp` : language === 'fa' ? 'خالی' : 'Empty'}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {project.genBankTub2 || (language === 'fa' ? 'بدون شماره GenBank' : 'No GenBank ID')}
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div>
                  <span className="text-slate-400 font-mono text-[11px]">Forward Primer:</span>{' '}
                  <span className="font-mono text-slate-800">{project.primerTub2.forward}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-mono text-[11px]">Reverse Primer:</span>{' '}
                  <span className="font-mono text-slate-800">{project.primerTub2.reverse}</span>
                </div>
                <div className="pt-2 flex items-center gap-4 text-[11px] font-mono text-slate-500 border-t border-slate-100">
                  <span>GC: {tub2Stats.gc}%</span>
                  <span>A:{tub2Stats.a} T:{tub2Stats.t} G:{tub2Stats.g} C:{tub2Stats.c}</span>
                </div>
              </div>
            </button>
          </div>

          {/* Active Locus Input Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Dna className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-slate-900">
                  {activeLocus === 'LSU' ? 'ورود توالی و پرایمرهای LSU (28S rDNA)' : 'ورود توالی و پرایمرهای بتا-توبولین (tub2)'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyFasta(activeLocus === 'LSU' ? project.fastaLSU : project.fastaTub2)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  {copiedFasta ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{language === 'fa' ? 'کپی' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Inputs: GenBank, Primers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  {language === 'fa' ? 'شماره دسترسی GenBank (اختیاری):' : 'GenBank Accession (e.g. PP891204):'}
                </label>
                <input
                  type="text"
                  value={activeLocus === 'LSU' ? project.genBankLSU : project.genBankTub2}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProject((prev) => ({
                      ...prev,
                      [activeLocus === 'LSU' ? 'genBankLSU' : 'genBankTub2']: val,
                    }));
                  }}
                  placeholder="e.g. PP891204"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  {language === 'fa' ? 'پرایمر رفت (Forward Primer):' : 'Forward Primer:'}
                </label>
                <input
                  type="text"
                  value={activeLocus === 'LSU' ? project.primerLSU.forward : project.primerTub2.forward}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProject((prev) => ({
                      ...prev,
                      [activeLocus === 'LSU' ? 'primerLSU' : 'primerTub2']: {
                        ...prev[activeLocus === 'LSU' ? 'primerLSU' : 'primerTub2'],
                        forward: val,
                      },
                    }));
                  }}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  {language === 'fa' ? 'پرایمر برگشت (Reverse Primer):' : 'Reverse Primer:'}
                </label>
                <input
                  type="text"
                  value={activeLocus === 'LSU' ? project.primerLSU.reverse : project.primerTub2.reverse}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProject((prev) => ({
                      ...prev,
                      [activeLocus === 'LSU' ? 'primerLSU' : 'primerTub2']: {
                        ...prev[activeLocus === 'LSU' ? 'primerLSU' : 'primerTub2'],
                        reverse: val,
                      },
                    }));
                  }}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Sequence Textarea */}
            <div>
              <label className="block text-slate-500 font-medium mb-1 text-xs">
                {language === 'fa'
                  ? `متن توالی خام یا فرمت FASTA برای ژن ${activeLocus === 'LSU' ? 'LSU' : 'بتا-توبولین'}:`
                  : `FASTA Sequence for ${activeLocus === 'LSU' ? 'LSU (28S)' : 'Beta-tubulin'}:`}
              </label>
              <textarea
                value={activeLocus === 'LSU' ? project.fastaLSU : project.fastaTub2}
                onChange={(e) => {
                  const val = e.target.value;
                  setProject((prev) => ({
                    ...prev,
                    [activeLocus === 'LSU' ? 'fastaLSU' : 'fastaTub2']: val,
                  }));
                }}
                rows={9}
                placeholder={
                  language === 'fa'
                    ? '>Isolate_Name_LSU\nGATCGTACGTAGCATGCTTCGCTTGGTGCAGATCTTGGTGGTAGTCAAACCTGCCCGTCA...'
                    : '>Isolate_CF_LSU\nGATCGTACGTAGCATGCTTCGCTTGGTGCAGATCTTGGTGGTAGTCAAACCTGCCCGTCA...'
                }
                className="w-full font-mono text-xs text-slate-800 p-3 bg-slate-900 text-teal-300 rounded-lg leading-relaxed focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Isolate Records Manager */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  {language === 'fa' ? 'جدول ثبت مشخصات جدایه‌های مغز گردو (Isolate Vouchers)' : 'Walnut Isolate Vouchers'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'fa' ? 'کد جدایه‌ها و اطلاعات نمونه‌برداری برای درج در جدول نتایج مقاله' : 'Isolate codes and sampling details for the paper'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddIsolate(!showAddIsolate)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'fa' ? 'افزودن جدایه جدید' : 'Add Isolate'}</span>
              </button>
            </div>

            {/* Add Isolate Form Modal/Drawer */}
            {showAddIsolate && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 text-xs">
                <div className="font-bold text-slate-900">{language === 'fa' ? 'مشخصات جدایه جدید:' : 'New Isolate Details:'}</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">کد جدایه (e.g. CF-WAL01):</label>
                    <input
                      type="text"
                      value={newIsolate.code}
                      onChange={(e) => setNewIsolate({ ...newIsolate, code: e.target.value })}
                      placeholder="CF-WAL01"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">رقم گردو (Host):</label>
                    <input
                      type="text"
                      value={newIsolate.host}
                      onChange={(e) => setNewIsolate({ ...newIsolate, host: e.target.value })}
                      placeholder="Juglans regia cv. Chandler"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">منطقه / باغ:</label>
                    <input
                      type="text"
                      value={newIsolate.locality}
                      onChange={(e) => setNewIsolate({ ...newIsolate, locality: e.target.value })}
                      placeholder="Walnut Orchard, Region"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddIsolate(false)}
                    className="px-3 py-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    onClick={handleAddIsolate}
                    className="px-3 py-1 rounded bg-teal-700 text-white hover:bg-teal-800 cursor-pointer"
                  >
                    ثبت جدایه
                  </button>
                </div>
              </div>
            )}

            {/* Isolates Table */}
            {project.isolates.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                {language === 'fa' 
                  ? 'هنوز جدایه‌ای ثبت نشده است. روی دکمه "افزودن جدایه جدید" کلیک نمایید.' 
                  : 'No isolates registered yet. Click "Add Isolate" to record your walnut isolates.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono text-[11px]">
                      <th className="py-2.5 px-3">Isolate Code</th>
                      <th className="py-2.5 px-3">Host Cultivar</th>
                      <th className="py-2.5 px-3">Locality</th>
                      <th className="py-2.5 px-3">GenBank LSU</th>
                      <th className="py-2.5 px-3">GenBank tub2</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {project.isolates.map((iso) => (
                      <tr key={iso.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-teal-800">{iso.code}</td>
                        <td className="py-2.5 px-3 text-slate-700 italic">{iso.host}</td>
                        <td className="py-2.5 px-3 text-slate-600">{iso.locality}</td>
                        <td className="py-2.5 px-3 text-slate-800 font-semibold">{iso.genBankLSU || '-'}</td>
                        <td className="py-2.5 px-3 text-slate-800 font-semibold">{iso.genBankTub2 || '-'}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteIsolate(iso.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. MORPHOLOGICAL DATA ENTRY */}
      {activeSubTab === 'morphology' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colony & Cultural Morphology */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  {language === 'fa' ? 'ویژگی‌های کلنی در محیط PDA / OA / MEA' : 'Colony Cultural Characteristics'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'fa' ? 'رنگ پرگنه، بافت و ترشح رنگیزه زرد اختصاصی' : 'Surface color, texture and yellow diffusible pigment'}
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">
                    {language === 'fa' ? 'رنگ و بافت سطح پرگنه (Surface Color & Texture):' : 'Surface Color & Texture:'}
                  </label>
                  <input
                    type="text"
                    value={project.colonyPDA.colorSurface}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProject((prev) => ({
                        ...prev,
                        colonyPDA: { ...prev.colonyPDA, colorSurface: val },
                      }));
                    }}
                    placeholder={language === 'fa' ? 'سبز زیتونی تا خاکستری تیره با میسلیوم مخملی متراکم...' : 'Olivaceous green to dark grey...'}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">
                    {language === 'fa' ? 'رنگ پشت پرگنه و رنگیزه زرد (Reverse & Diffusible Pigment):' : 'Reverse Color & Yellow Pigment:'}
                  </label>
                  <input
                    type="text"
                    value={project.colonyPDA.colorReverse}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProject((prev) => ({
                        ...prev,
                        colonyPDA: { ...prev.colonyPDA, colorReverse: val },
                      }));
                    }}
                    placeholder={language === 'fa' ? 'قهوه‌ای تیره مایل به سیاه همراه با ترشح رنگیزه زرد در آگار...' : 'Dark brownish-black with yellow pigment diffusing into agar...'}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-600 mb-1 font-mono text-[11px]">
                      {language === 'fa' ? 'قطر پرگنه در ۷ روز (mm):' : '7-Day Diameter (mm):'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={project.colonyPDA.growthRate7d || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setProject((prev) => ({
                          ...prev,
                          colonyPDA: { ...prev.colonyPDA, growthRate7d: val },
                        }));
                      }}
                      placeholder="e.g. 38.5"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-mono text-[11px]">
                      {language === 'fa' ? 'قطر پرگنه در ۱۴ روز (mm):' : '14-Day Diameter (mm):'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={project.colonyPDA.growthRate14d || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setProject((prev) => ({
                          ...prev,
                          colonyPDA: { ...prev.colonyPDA, growthRate14d: val },
                        }));
                      }}
                      placeholder="e.g. 74.0"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Conidia & Pycnidia Morphology */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  {language === 'fa' ? 'ابعاد میکروسکوپی کنیدی‌ها و پیکنیدها' : 'Conidia & Pycnidia Micrometry'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'fa' ? 'دامنه طول و عرض (میکرومتر)، تیغه‌بندی و دیواره' : 'Conidial length, width, septation and wall'}
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-mono text-[11px]">
                      {language === 'fa' ? 'دامنه طول کنیدی (µm):' : 'Length Range (µm):'}
                    </label>
                    <input
                      type="text"
                      value={project.conidiaStats.lengthRange}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProject((prev) => ({
                          ...prev,
                          conidiaStats: { ...prev.conidiaStats, lengthRange: val },
                        }));
                      }}
                      placeholder="e.g. 13.5–19.0 µm"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-mono text-[11px]">
                      {language === 'fa' ? 'میانگین طول (µm):' : 'Mean Length (µm):'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={project.conidiaStats.lengthMean || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setProject((prev) => ({
                          ...prev,
                          conidiaStats: { ...prev.conidiaStats, lengthMean: val },
                        }));
                      }}
                      placeholder="e.g. 16.2"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-mono text-[11px]">
                      {language === 'fa' ? 'دامنه عرض کنیدی (µm):' : 'Width Range (µm):'}
                    </label>
                    <input
                      type="text"
                      value={project.conidiaStats.widthRange}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProject((prev) => ({
                          ...prev,
                          conidiaStats: { ...prev.conidiaStats, widthRange: val },
                        }));
                      }}
                      placeholder="e.g. 6.5–9.5 µm"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-mono text-[11px]">
                      {language === 'fa' ? 'میانگین عرض (µm):' : 'Mean Width (µm):'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={project.conidiaStats.widthMean || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setProject((prev) => ({
                          ...prev,
                          conidiaStats: { ...prev.conidiaStats, widthMean: val },
                        }));
                      }}
                      placeholder="e.g. 8.1"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">
                    {language === 'fa' ? 'تیغه‌بندی کنیدی‌ها (Septation):' : 'Conidial Septation:'}
                  </label>
                  <input
                    type="text"
                    value={project.conidiaStats.septaRange}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProject((prev) => ({
                        ...prev,
                        conidiaStats: { ...prev.conidiaStats, septaRange: val },
                      }));
                    }}
                    placeholder={language === 'fa' ? '۱ تا ۳ تیغه عرضی، به ندرت یک تیغه طولی (موری‌فرم)...' : '1–3 transverse septa, rarely 1 longitudinal septum (muriform)...'}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">
                    {language === 'fa' ? 'توضیحات پیکنیدها و دیواره (Pycnidia):' : 'Pycnidia Description:'}
                  </label>
                  <input
                    type="text"
                    value={project.conidiaStats.pycnidiaDescription}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProject((prev) => ({
                        ...prev,
                        conidiaStats: { ...prev.conidiaStats, pycnidiaDescription: val },
                      }));
                    }}
                    placeholder={language === 'fa' ? 'پیکنیدهای کروی تیره، نیمه‌غوطه‌ور در بافت...' : 'Dark globose to subglobose semi-immersed pycnidia...'}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MULTIMODAL LAB IMAGES & TREE SCANS ANALYZER */}
      {activeSubTab === 'images' && (
        <div className="space-y-6">
          {/* Uploader Dropzone */}
          <div className="bg-white border-2 border-dashed border-teal-300/80 hover:border-teal-500 rounded-2xl p-6 text-center transition-colors bg-teal-50/20">
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'fa' ? 'بارگذاری تصویر میکروسکوپی یا اسکن درخت فیلوژنی' : 'Upload Lab Micrograph or Tree Scan'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'fa'
                    ? 'عکس‌های میکروسکوپ نوری از کنیدی‌ها، پیکنیدها، اسکن درخت تبارشناسی یا عکس پرگنه را بارگذاری کنید تا هوش مصنوعی بلافاصله آن را تحلیل و متنی علمی برای مقاله تولید کند.'
                    : 'Upload light micrographs of conidia, pycnidia, phylogenetic trees, or colony plates for multimodal AI mycological analysis.'}
                </p>
              </div>

              {/* Upload Action Buttons for Categories */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-lg cursor-pointer shadow-xs transition-colors">
                  <Microscope className="w-3.5 h-3.5" />
                  <span>{language === 'fa' ? 'عکس میکروسکوپی (Micrograph)' : 'Upload Micrograph'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'microscopy')}
                  />
                </label>

                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg cursor-pointer shadow-xs transition-colors">
                  <Dna className="w-3.5 h-3.5" />
                  <span>{language === 'fa' ? 'اسکن درخت فیلوژنی (Tree Scan)' : 'Upload Tree Scan'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'phylogeny_tree')}
                  />
                </label>

                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg cursor-pointer transition-colors border border-slate-300">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{language === 'fa' ? 'عکس پرگنه / جدول' : 'Colony Plate / Table'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'colony_plate')}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Uploaded Images List with AI Analysis */}
          {project.labImages.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-xl">
              {language === 'fa'
                ? 'هنوز تصویری بارگذاری نشده است. می‌توانید با بارگذاری عکس‌های آزمایشگاهی، متن تشریحی آماده برای درج در نتایج مقاله تحویل بگیرید.'
                : 'No lab images uploaded yet. Upload micrographs or phylogenetic trees to run automated multimodal scientific diagnostics.'}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-mono uppercase">
                  {language === 'fa' ? 'تصاویر بارگذاری‌شده و تحلیل‌های هوش مصنوعی' : 'Uploaded Lab Images & Multimodal Diagnostics'}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {project.labImages.length} {language === 'fa' ? 'تصویر' : 'images'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {project.labImages.map((img) => (
                  <div
                    key={img.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col md:flex-row items-start gap-5">
                      {/* Thumbnail with overlay badge */}
                      <div className="w-full md:w-56 h-48 bg-slate-900 rounded-lg overflow-hidden relative shrink-0 border border-slate-200">
                        <img
                          src={img.dataUrl}
                          alt={img.caption}
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                          {img.category === 'microscopy' ? 'Micrograph' : img.category === 'phylogeny_tree' ? 'Phylogeny Tree' : 'Colony/Lab'}
                        </div>
                      </div>

                      {/* Content & AI Analysis */}
                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div>
                            <input
                              type="text"
                              value={img.caption}
                              onChange={(e) => {
                                const val = e.target.value;
                                setProject((prev) => ({
                                  ...prev,
                                  labImages: prev.labImages.map((i) =>
                                    i.id === img.id ? { ...i, caption: val } : i
                                  ),
                                }));
                              }}
                              placeholder={language === 'fa' ? 'عنوان یا شرح تصویر (مثلاً کنیدی‌ها در بزرگنمایی ۱۰۰۰x)...' : 'Caption / notes...'}
                              className="text-xs font-bold text-slate-900 border-b border-dashed border-slate-300 focus:outline-none focus:border-teal-600 pb-0.5"
                            />
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {img.uploadedAt} · {img.name}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAnalyzeImage(img)}
                              disabled={analyzingImageId === img.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {analyzingImageId === img.id ? (
                                <>
                                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>{language === 'fa' ? 'در حال تحلیل تصویر...' : 'Analyzing...'}</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>{language === 'fa' ? 'تحلیل تصویر با هوش مصنوعی' : 'Analyze Image with AI'}</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteImage(img.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                              title="Delete Image"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Analysis Output Box */}
                        {img.aiAnalysis ? (
                          <div className="p-4 bg-teal-50/70 rounded-lg border border-teal-200/90 text-xs text-slate-800 space-y-2">
                            <div className="flex items-center justify-between pb-1.5 border-b border-teal-200">
                              <span className="font-bold text-teal-950 flex items-center gap-1.5">
                                <FileCheck className="w-4 h-4 text-teal-700" />
                                {language === 'fa' ? 'توصیف علمی و تخصصی استخراج‌شده از تصویر:' : 'AI Diagnostic Findings:'}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleSendToManuscript(img.aiAnalysis!)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-teal-100/70 text-teal-900 border border-teal-300 rounded text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>{language === 'fa' ? 'انتقال مستقیم به متن مقاله' : 'Send to Manuscript'}</span>
                              </button>
                            </div>
                            <div className="whitespace-pre-line leading-relaxed font-sans">{img.aiAnalysis}</div>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-500 italic">
                            {language === 'fa'
                              ? 'هنوز تحلیلی برای این تصویر ثبت نشده است. بر روی "تحلیل تصویر با هوش مصنوعی" کلیک نمایید تا ساختارهای ریخت‌شناسی یا شاخه‌های درخت فیلوژنی استخراج شوند.'
                              : 'Click "Analyze Image with AI" to extract conidial structures or phylogenetic tree clade relationships.'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
