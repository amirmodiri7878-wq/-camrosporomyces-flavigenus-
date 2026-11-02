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
  BookmarkPlus,
  Send
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
  const [activeSection, setActiveSection] = useState<SectionKey>('introduction');
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
      guidanceFa: 'مقدمه بر اساس مقالات و مراجع بارگذاری‌شده در کتابخانه اسناد نگاشته می‌شود. اهمیت اقتصادی گردو، پوسیدگی مغز و جایگاه سرده Camarosporomyces با ارجاع Author-Year قید گردد.',
      guidanceEn: 'Introduction is drafted strictly from literature and uploaded references. Discuss walnut economic losses and Camarosporomyces with Author-Year citations.',
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
      guidanceFa: 'نتایج کاملاً بر اساس داده‌های تجربی شما تدوین می‌شود: ابعاد کنیدی‌ها، رنگیزه زرد در آگار، درصد شباهت بلاست، بوت‌استرپ درخت فیلوژنی، و توصیف تصاویر میکروسکوپی.',
      guidanceEn: 'Results are strictly generated from your experimental data: conidia measurements, yellow pigment, BLAST identity %, tree bootstrap, and analyzed micrographs.',
    },
    {
      key: 'discussion',
      labelEn: 'Discussion',
      labelFa: 'بحث و مقایسه با پیشینه',
      guidanceFa: 'تلفیق یافته‌های آزمایشگاهی شما با مقالات پیشین: اثبات جایگاه تاکسونومیک، مزیت بتا-توبولین نسبت به ITS در تفکیک گونه‌ای (Crous et al. 2018) و پیامدهای بهداشتی در باغات.',
      guidanceEn: 'Synthesize your lab findings with cited literature: taxonomic placement, superior resolving power of beta-tubulin over ITS (Crous et al. 2018), and orchard management.',
    },
    {
      key: 'references',
      labelEn: 'Literature Cited',
      labelFa: 'منابع و مراجع علمی',
      guidanceFa: 'فهرست الفبایی تمام مراجع استناد شده در متن مقاله مطابق با استاندارد استناددهی انجمن بیماری‌شناسی آمریکا (APS / Plant Disease).',
      guidanceEn: 'Alphabetical bibliography of all cited papers matching in-text citations according to APS / Plant Disease journal standards.',
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

  // Filter references relevant to the active section
  const sectionRefs = project.researchReferences.filter((ref) =>
    ref.targetSections.includes(activeSection as any)
  );

  const handleUpdateText = (value: string) => {
    setProject((prev) => ({
      ...prev,
      manuscript: {
        ...prev.manuscript,
        [activeSection]: value,
      },
    }));
  };

  // Build Context Payload with Section-specific routing
  const buildSectionPayload = () => {
    return {
      sectionName: currentSection.labelEn,
      sectionKey: activeSection,
      articleType: project.manuscript.articleType,
      relevantReferences: sectionRefs.map((r) => ({
        authors: r.authors,
        year: r.year,
        title: r.title,
        journal: r.journalOrSource,
        doiOrUrl: r.doiOrUrl,
        notesOrExcerpts: r.notesOrExcerpts,
      })),
      allReferences: project.researchReferences.map((r) => `${r.authors} (${r.year}). ${r.title}. ${r.journalOrSource}. ${r.doiOrUrl}`),
      contextData: {
        pathogen: project.pathogenName || 'Camarosporomyces flavigenus',
        host: project.hostLatinName || 'Juglans regia',
        disease: project.diseaseSymptom,
        lsuLength: project.fastaLSU.replace(/[\r\n\s>]/g, '').length,
        tub2Length: project.fastaTub2.replace(/[\r\n\s>]/g, '').length,
        genBankLSU: project.genBankLSU,
        genBankTub2: project.genBankTub2,
        primers: { lsu: project.primerLSU, tub2: project.primerTub2 },
        conidia: project.conidiaStats,
        colony: project.colonyPDA,
        isolates: project.isolates,
        imageAnalyses: project.labImages
          .filter((img) => img.aiAnalysis)
          .map((img) => `${img.caption}: ${img.aiAnalysis}`),
      },
    };
  };

  const handleAiDraftSection = async () => {
    setAiDrafting(true);
    try {
      const payload = buildSectionPayload();
      const response = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'draft_section',
          language,
          payload,
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

  // Dynamic button labels based on section
  const getDraftingButtonConfig = () => {
    switch (activeSection) {
      case 'introduction':
        return {
          label: language === 'fa' ? 'نگارش با مراجع بارگذاری‌شده' : 'Draft from Literature & Citations',
          icon: <BookOpen className="w-3.5 h-3.5" />,
          hint: language === 'fa' ? 'استفاده از مراجع کتابخانه با فرمت Author-Year' : 'Uses uploaded references with Author-Year citations',
        };
      case 'materialsMethods':
        return {
          label: language === 'fa' ? 'نگارش با پروتکل‌ها و پرایمرها' : 'Draft Methods from Protocols',
          icon: <Dna className="w-3.5 h-3.5" />,
          hint: language === 'fa' ? 'استفاده از پرایمرهای LR0R/LR5 و Bt2a/Bt2b' : 'Uses entered primers and laboratory parameters',
        };
      case 'results':
        return {
          label: language === 'fa' ? 'نگارش با داده‌ها و تصاویر' : 'Draft Results from Lab Data & Images',
          icon: <Microscope className="w-3.5 h-3.5" />,
          hint: language === 'fa' ? 'استفاده دقیق از توالی‌ها، ابعاد کنیدی‌ها و تصاویر' : 'Uses entered sequences, conidial measurements, and analyzed micrographs',
        };
      case 'discussion':
        return {
          label: language === 'fa' ? 'نگارش بحث و مقایسه با پیشینه' : 'Draft Discussion from Findings & Literature',
          icon: <Sparkles className="w-3.5 h-3.5" />,
          hint: language === 'fa' ? 'تلفیق نتایج تجربی با مقالات استنادشده' : 'Compares your findings against published literature',
        };
      case 'abstract':
        return {
          label: language === 'fa' ? 'نگارش چکیده جامع ساختاریافته' : 'Draft Cohesive Abstract',
          icon: <FileText className="w-3.5 h-3.5" />,
          hint: language === 'fa' ? 'خلاصه‌سازی ۲۰۰ تا ۲۵۰ کلمه‌ای کل پژوهش' : 'Tight synthesis without citations',
        };
      case 'references':
        return {
          label: language === 'fa' ? 'تدوین فهرست منابع (Author-Year)' : 'Compile References List',
          icon: <BookmarkPlus className="w-3.5 h-3.5" />,
          hint: language === 'fa' ? 'فهرست الفبایی مطابق استاندارد APS' : 'Alphabetical list according to APS journal guidelines',
        };
      default:
        return {
          label: language === 'fa' ? 'پیش‌نویس با هوش مصنوعی' : 'Draft with AI',
          icon: <Sparkles className="w-3.5 h-3.5" />,
          hint: '',
        };
    }
  };

  const btnConfig = getDraftingButtonConfig();

  return (
    <div className="space-y-6" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {/* Live Data & References Binding Strip */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-3 px-4 text-xs font-mono flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-teal-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            {language === 'fa' ? 'منبع تغذیه نگارش:' : 'Active Drafting Grounding:'}
          </span>

          {(activeSection === 'introduction' || activeSection === 'discussion') && (
            <span className="text-amber-300 font-medium">
              {language === 'fa' ? 'کتابخانه مقالات:' : 'Literature:'} {sectionRefs.length}{' '}
              {language === 'fa' ? 'منبع مرتبط متصل است (فرمت Author-Year)' : 'assigned references (Author-Year)'}
            </span>
          )}

          {activeSection === 'results' && (
            <span className="text-teal-300 font-medium">
              {language === 'fa' ? 'داده‌های تجربی:' : 'Lab Measurements:'} LSU:{' '}
              {project.fastaLSU ? 'توالی وارد شده' : 'خالی'} · tub2:{' '}
              {project.fastaTub2 ? 'توالی وارد شده' : 'خالی'} · ابعاد:{' '}
              {project.conidiaStats.lengthRange || 'خالی'} · تصاویر: {project.labImages.length}
            </span>
          )}

          {activeSection === 'materialsMethods' && (
            <span className="text-slate-300">
              پرایمرها: {project.primerLSU.forward.slice(0, 4)} / {project.primerTub2.forward.slice(0, 4)} · مراجع روش‌ها:{' '}
              {sectionRefs.length} منبع
            </span>
          )}

          {activeSection === 'abstract' && (
            <span className="text-slate-300">
              {language === 'fa' ? 'سنتز جامع کل مقاله (بدون رفرنس‌دهی درون‌متنی)' : 'Full Study Synthesis (No in-text citations)'}
            </span>
          )}

          {activeSection === 'references' && (
            <span className="text-teal-300">
              {project.researchReferences.length} {language === 'fa' ? 'منبع در کتابخانه آماده قالب‌بندی الفبایی' : 'citations ready for bibliography'}
            </span>
          )}
        </div>

        <span className="text-slate-400 text-[11px]">
          {activeSection === 'introduction' || activeSection === 'discussion'
            ? 'Citations: Author-Year (e.g. Crous et al. 2018)'
            : 'Section-specific AI reasoning'}
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
                {/* Purpose-Built Section Drafting Button */}
                <button
                  type="button"
                  onClick={handleAiDraftSection}
                  disabled={aiDrafting}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                  title={btnConfig.hint}
                >
                  {aiDrafting ? (
                    <>
                      <RotateCw className="w-3 h-3 animate-spin" />
                      <span>{language === 'fa' ? 'در حال نگارش...' : 'Drafting...'}</span>
                    </>
                  ) : (
                    <>
                      {btnConfig.icon}
                      <span>{btnConfig.label}</span>
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
                    ? `متن ${currentSection.labelFa} را بنویسید یا بر روی دکمه "${btnConfig.label}" کلیک نمایید...`
                    : `Write or paste ${currentSection.labelEn}, or click "${btnConfig.label}"...`
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
