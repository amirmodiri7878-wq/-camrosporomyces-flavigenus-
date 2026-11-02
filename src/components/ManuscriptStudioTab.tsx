import React, { useState } from 'react';
import { ProjectData } from '../types';
import { 
  Sparkles, 
  Copy, 
  Check, 
  FileText, 
  Eye, 
  Edit3, 
  RotateCw, 
  Lightbulb,
  BookOpen,
  Dna,
  Microscope,
  ImageIcon
} from 'lucide-react';

interface ManuscriptStudioTabProps {
  project: ProjectData;
  setProject: React.Dispatch<React.SetStateAction<ProjectData>>;
  language: 'fa' | 'en';
}

type SectionKey = 
  | 'title' 
  | 'abstract' 
  | 'introduction' 
  | 'materialsMethods' 
  | 'results' 
  | 'discussion' 
  | 'references'
  | 'acknowledgements';

export const ManuscriptStudioTab: React.FC<ManuscriptStudioTabProps> = ({
  project,
  setProject,
  language,
}) => {
  const [activeSection, setActiveSection] = useState<SectionKey>('abstract');
  const [previewMode, setPreviewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [aiDrafting, setAiDrafting] = useState(false);
  const [copied, setCopied] = useState(false);

  const sections: { key: SectionKey; labelEn: string; labelFa: string; guidanceFa: string; guidanceEn: string }[] = [
    {
      key: 'title',
      labelEn: 'Title & Metadata',
      labelFa: 'عنوان و اطلاعات نویسندگان',
      guidanceFa: 'عنوان باید صریح، شامل نام دقیق قارچ، میزبان (گردو)، علامت بیماری (Kernel Rot)، کشور یا منطقه، و عبارت "First Report" باشد.',
      guidanceEn: 'The title must be explicit, containing the exact pathogen name, host (walnut), disease symptom, region, and "First Report".',
    },
    {
      key: 'abstract',
      labelEn: 'Abstract & Keywords',
      labelFa: 'چکیده و واژگان کلیدی',
      guidanceFa: 'چکیده بیماری‌شناسی گیاهی باید در ۲۰۰ تا ۲۵۰ کلمه علائم، جداسازی، ابعاد کنیدی، ژن‌های LSU و tub2 با شماره GenBank و نتایج تبارشناسی را خلاصه کند.',
      guidanceEn: 'A phytopathology abstract must summarize symptoms, isolation, conidia dimensions, LSU & tub2 GenBank accessions, and phylogenetic clustering (200–250 words).',
    },
    {
      key: 'introduction',
      labelEn: 'Introduction',
      labelFa: 'مقدمه',
      guidanceFa: 'اهمیت اقتصادی گردو، خسارت پوسیدگی مغز در بازار، عدم گزارش قبلی این قارچ روی گردو، و هدف مطالعه در پاراگراف پایانی آورده شود.',
      guidanceEn: 'Economic value of walnut, financial loss from kernel rots, absence of prior records on walnut, and explicit study objectives in the final paragraph.',
    },
    {
      key: 'materialsMethods',
      labelEn: 'Materials & Methods',
      labelFa: 'مواد و روش‌ها',
      guidanceFa: 'پروتکل کامل ضدعفونی سطحی مغز گردو، پرایمرهای LR0R/LR5 برای LSU و Bt2a/Bt2b برای tub2، شرایط واکنش PCR و نرم‌افزارهای تبارشناسی (MAFFT، IQ-TREE/MrBayes) و میکرومتری قید شود.',
      guidanceEn: 'Include surface sterilization, primers LR0R/LR5 & Bt2a/Bt2b, PCR cycling conditions, phylogenetic software (MAFFT, IQ-TREE/MrBayes), and micrometry.',
    },
    {
      key: 'results',
      labelEn: 'Results',
      labelFa: 'نتایج',
      guidanceFa: 'توصیف دقیق ریخت‌شناسی (میانگین و دامنه طول و عرض کنیدی، رنگیزه زرد در آگار)، درصد شباهت بلاست (BLAST identity)، بوت‌استرپ درخت فیلوژنی، و توصیف تصاویر میکروسکوپی بارگذاری شده.',
      guidanceEn: 'Detailed morphology (mean & range of conidia, yellow pigment), BLAST identity %, phylogenetic bootstrap %, and descriptions of uploaded micrographs/trees.',
    },
    {
      key: 'discussion',
      labelEn: 'Discussion',
      labelFa: 'بحث و نتیجه‌گیری',
      guidanceFa: 'جایگاه تاکسونومیک سرده، قدرت تفکیک بالای بتا-توبولین در مقایسه با ITS، پیامد بیماری برای انبارداری گردو و اقدامات مدیریتی بهداشتی باغ.',
      guidanceEn: 'Taxonomic placement, superior resolving power of beta-tubulin over ITS in Camarosporomyces, post-harvest rot implications, and orchard management.',
    },
    {
      key: 'references',
      labelEn: 'Literature Cited',
      labelFa: 'منابع و مراجع علمی',
      guidanceFa: 'رفرانس‌دهی به مقالات پایه توصیف‌کننده گونه (مانند Crous et al.، مقالات پرایمرها و مقالات مرتبط با بیماری‌های گردو) مطابق فرمت مجله هدف.',
      guidanceEn: 'Standard citation formatting including ex-type descriptions (Crous et al.), primer references, and walnut pathology benchmarks.',
    },
    {
      key: 'acknowledgements',
      labelEn: 'Acknowledgements',
      labelFa: 'سپاسگزاری',
      guidanceFa: 'تشکر از آزمایشگاه گروه گیاه‌پزشکی، تامین‌کنندگان نمونه و خدمات توالی‌یابی.',
      guidanceEn: 'Funding sources, institutional facilities, sequencing services, and orchard collaborators.',
    },
  ];

  const currentSection = sections.find((s) => s.key === activeSection)!;

  const handleUpdateText = (value: string) => {
    setProject((prev) => ({
      ...prev,
      manuscript: {
        ...prev.manuscript,
        [activeSection]: value,
      },
    }));
  };

  // Live Context Data extracted from user inputs & images
  const buildUserContextPayload = () => {
    return {
      pathogen: project.pathogenName || 'Camarosporomyces flavigenus',
      host: project.hostLatinName || 'Juglans regia',
      disease: project.diseaseSymptom,
      molecularData: {
        primerLSU: project.primerLSU,
        primerTub2: project.primerTub2,
        lsuLength: project.fastaLSU.replace(/[\r\n\s>]/g, '').length,
        tub2Length: project.fastaTub2.replace(/[\r\n\s>]/g, '').length,
        genBankLSU: project.genBankLSU,
        genBankTub2: project.genBankTub2,
        isolates: project.isolates,
      },
      morphologicalData: {
        colony: project.colonyPDA,
        conidia: project.conidiaStats,
      },
      imageAnalyses: project.labImages
        .filter((img) => img.aiAnalysis)
        .map((img) => ({
          name: img.name,
          category: img.category,
          caption: img.caption,
          analysis: img.aiAnalysis,
        })),
    };
  };

  const handleAiDraftSection = async () => {
    setAiDrafting(true);
    try {
      const contextData = buildUserContextPayload();
      const response = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'draft_section',
          language,
          payload: {
            sectionName: currentSection.labelEn,
            articleType: project.manuscript.articleType,
            contextData,
          },
        }),
      });

      const data = await response.json();
      if (data.text) {
        handleUpdateText(data.text);
      } else if (data.data) {
        handleUpdateText(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiDrafting(false);
    }
  };

  const handleCopy = () => {
    const text = project.manuscript[activeSection] || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = (project.manuscript[activeSection] || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="space-y-6" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {/* Live Data Binding Strip */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-3 px-4 text-xs font-mono flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-teal-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            {language === 'fa' ? 'داده‌های متصل به استودیو:' : 'Linked Lab Data Sources:'}
          </span>
          <span className="text-slate-300">
            LSU: {project.fastaLSU ? `${project.fastaLSU.length > 50 ? 'توالی وارد شده' : 'دارای داده'}` : 'فاقد توالی'}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">
            tub2: {project.fastaTub2 ? 'توالی وارد شده' : 'فاقد توالی'}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">
            {language === 'fa' ? 'ابعاد ریخت‌شناسی:' : 'Morphology:'}{' '}
            {project.conidiaStats.lengthRange || 'در انتظار ورود'}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">
            {language === 'fa' ? 'تصاویر آزمایشگاهی:' : 'Images:'} {project.labImages.length}
          </span>
        </div>

        <span className="text-amber-300 text-[11px]">
          {language === 'fa' ? 'نگارش هوشمند بر مبنای داده‌های آزمایشگاهی شما' : 'AI drafting strictly grounded in your inputs'}
        </span>
      </div>

      {/* Top Section Nav Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            {sections.map((sec) => (
              <button
                key={sec.key}
                type="button"
                onClick={() => setActiveSection(sec.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeSection === sec.key
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {language === 'fa' ? sec.labelFa : sec.labelEn}
              </button>
            ))}
          </div>

          {/* View Mode Controls */}
          <div className="flex items-center gap-1 shrink-0 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setPreviewMode('editor')}
              className={`p-1.5 text-xs rounded-md transition-colors cursor-pointer ${
                previewMode === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Editor Only"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('split')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                previewMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Split View"
            >
              {language === 'fa' ? 'نمای دوگانه' : 'Split'}
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('preview')}
              className={`p-1.5 text-xs rounded-md transition-colors cursor-pointer ${
                previewMode === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Journal Preview"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Supervisor Section Advice Callout */}
      <div className="bg-teal-50/70 border border-teal-200/90 rounded-xl p-4 flex items-start gap-3">
        <Lightbulb className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <div className="flex-1 text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-teal-950 mr-1.5">
            {language === 'fa' ? 'راهنمای استاد راهنما برای این بخش:' : "Supervisor's Checklist for this section:"}
          </span>
          {language === 'fa' ? currentSection.guidanceFa : currentSection.guidanceEn}
        </div>
      </div>

      {/* Main Workspace Area (Split / Editor / Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Box */}
        {(previewMode === 'split' || previewMode === 'editor') && (
          <div
            className={`${
              previewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'
            } bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden`}
          >
            <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-slate-900">
                  {language === 'fa' ? currentSection.labelFa : currentSection.labelEn}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ({wordCount} {language === 'fa' ? 'کلمه' : 'words'})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAiDraftSection}
                  disabled={aiDrafting}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                  title="Generate or polish this section with AI Supervisor"
                >
                  {aiDrafting ? (
                    <>
                      <RotateCw className="w-3 h-3 animate-spin" />
                      <span>{language === 'fa' ? 'در حال نگارش...' : 'Drafting...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>{language === 'fa' ? 'نگارش با داده‌های آزمایشگاه' : 'Draft from Lab Data'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                  title="Copy text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-4">
              <textarea
                value={project.manuscript[activeSection] || ''}
                onChange={(e) => handleUpdateText(e.target.value)}
                rows={18}
                placeholder={
                  language === 'fa'
                    ? 'متن این بخش را بنویسید یا بر روی دکمه "نگارش با داده‌های آزمایشگاه" کلیک کنید تا متن علمی بر اساس توالی‌ها و ابعاد ریخت‌شناسی شما تدوین گردد...'
                    : 'Write or paste section text, or click "Draft from Lab Data" to formulate scientific text from your entered values...'
                }
                className="w-full text-xs text-slate-800 font-mono leading-relaxed p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 resize-y bg-slate-50/30"
              />
            </div>
          </div>
        )}

        {/* Live Journal Preview Box */}
        {(previewMode === 'split' || previewMode === 'preview') && (
          <div
            className={`${
              previewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'
            } bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden`}
          >
            <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-slate-900">
                  {language === 'fa' ? 'پیش‌نمایش فرمت استاندارد ژورنال' : 'Publication-Grade Preview'}
                </span>
                <span className="text-[11px] font-mono text-teal-800">
                  [Plant Disease / Crop Protection Style]
                </span>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[620px] text-slate-900 leading-relaxed text-sm font-sans space-y-4">
              {activeSection === 'title' && (
                <div className="space-y-3 pb-4 border-b border-slate-200">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 font-serif leading-snug">
                    {project.manuscript.title || (language === 'fa' ? '[عنوان مقاله وارد نشده است]' : '[Title not entered]')}
                  </h1>
                  <div className="text-xs font-medium text-slate-700">
                    {project.manuscript.authors || (language === 'fa' ? '[نام نویسندگان]' : '[Authors]')}
                  </div>
                  <div className="text-xs text-slate-500 italic">
                    {project.manuscript.affiliations || (language === 'fa' ? '[افیلیشن و دانشگاه]' : '[Affiliations]')}
                  </div>
                </div>
              )}

              {activeSection === 'abstract' && (
                <div className="space-y-4">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-500 font-mono">
                    ABSTRACT
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-serif text-justify whitespace-pre-line">
                    {project.manuscript.abstract || (language === 'fa' ? '[متن چکیده خالی است]' : '[Abstract empty]')}
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-900 font-mono text-[11px]">Keywords:</span>
                    {project.manuscript.keywords.map((kw, i) => (
                      <span key={i} className="text-slate-600 italic">
                        {kw}{i < project.manuscript.keywords.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeSection !== 'title' && activeSection !== 'abstract' && (
                <div className="space-y-3">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-500 font-mono">
                    {currentSection.labelEn.toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-800 leading-relaxed font-serif whitespace-pre-line text-justify">
                    {project.manuscript[activeSection] || (language === 'fa' ? '[این بخش هنوز متنی ندارد]' : '[Section empty]')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
