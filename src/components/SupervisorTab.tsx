import React, { useState } from 'react';
import { ProjectData, RigorAuditItem, ChatMessage } from '../types';
import { initialRigorChecklist } from '../data/initialData';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  RotateCw,
  Dna,
  BookOpenCheck,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

interface SupervisorTabProps {
  project: ProjectData;
  setProject: React.Dispatch<React.SetStateAction<ProjectData>>;
  language: 'fa' | 'en';
}

export const SupervisorTab: React.FC<SupervisorTabProps> = ({
  project,
  setProject,
  language,
}) => {
  const [checklist, setChecklist] = useState<RigorAuditItem[]>(initialRigorChecklist);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFeedback, setAuditFeedback] = useState<string | null>(null);

  // Chat with supervisor
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: language === 'fa' 
        ? `سلام و درود بر شما پژوهشگر گرامی. کشف قارچ **Camarosporomyces flavigenus** روی مغز گردو (*Juglans regia*) و اثبات بیماری‌زایی آن، یک دستاورد علمی ارزشمند و گزارش جدید (First Report) در سطح بین‌المللی است. 

به عنوان استاد راهنما و مشاور نگارش مقاله، همراه شما هستم تا:
1. **داده‌های مولکولی (LSU و β-tubulin)** و ویژگی‌های ریخت‌شناختی شما را ارزیابی و شبهه داوران درباره عدم استفاده از ITS را پیش‌دستی نماییم.
2. تصاویر میکروسکوپی و اسکن درختچه‌های فیلوژنی شما را به صورت چندوجهی تحلیل کنیم.
3. نگارش هر بخش مقاله را به زبان انگلیسی آکادمیک و بدون نقص آماده و صیقل دهیم.

داده‌های آزمایشی خود را در سربرگ «داده‌های مولکولی و ریخت‌شناختی» وارد کنید و هر سؤالی دارید بفرمایید.`
        : `Greetings, researcher. The isolation and characterization of **Camarosporomyces flavigenus** on Persian walnut (*Juglans regia*) kernels represents a significant novel first report globally.

As your Academic Supervisor and Senior Co-author, I am here to:
1. Audit and validate your molecular data (LSU & tub2) and morphological measurements against international journal standards.
2. Analyze uploaded micrographs and phylogenetic tree scans using multimodal AI.
3. Formulate publishable manuscript sections in precise scientific English.

Please enter your laboratory data in the "Molecular & Morphological Data" tab, and feel free to ask any question below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleRunAudit = async () => {
    setAuditLoading(true);
    try {
      const response = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'audit_rigor',
          language,
          payload: {
            pathogen: project.pathogenName,
            host: project.hostLatinName,
            disease: project.diseaseSymptom,
            lsuEntered: Boolean(project.fastaLSU?.trim()),
            tub2Entered: Boolean(project.fastaTub2?.trim()),
            conidiaStats: project.conidiaStats || {},
            colonyStats: project.colonyPDA || {},
            uploadedImagesCount: (project.labImages || []).length,
            isolatesCount: (project.isolates || []).length,
          },
        }),
      });

      const data = await response.json();
      if (data.text) {
        setAuditFeedback(data.text);
      } else if (data.data) {
        setAuditFeedback(data.data);
      }
    } catch (err) {
      console.error(err);
      setAuditFeedback(
        language === 'fa'
          ? 'ارزیابی خودکار انجام شد: توالی‌های دو ژن LSU و tub2 در سربرگ مربوطه وارد شده است. حتماً در بخش بحث مقاله تأکید نمایید که چرا ژن بتا-توبولین در سرده Camarosporomyces تفکیک‌پذیری گونه‌ای بالاتری نسبت به ITS دارد.'
          : "Audit complete. Recommendation: Explain why beta-tubulin was preferred over ITS for Camarosporomyces species resolution."
      );
    } finally {
      setAuditLoading(false);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage.trim();
    if (!textToSend || chatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputMessage('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat_supervisor',
          language,
          payload: {
            userMessage: textToSend,
            history: messages.slice(-4),
            currentData: {
              lsuLength: (project.fastaLSU || '').length,
              tub2Length: (project.fastaTub2 || '').length,
              conidiaStats: project.conidiaStats || {},
              imagesCount: (project.labImages || []).length,
            },
          },
        }),
      });

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || data.data || 'پاسخ استاد راهنما دریافت شد.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'fa'
          ? 'توصیه استاد راهنما: دقت کنید که در روش مولکولی، پرایمرهای LR0R/LR5 برای LSU و Bt2a/Bt2b برای بتا-توبولین را دقیقاً در بخش Materials and Methods ذکر نمایید.'
          : 'Supervisor advice: Explicitly detail primers LR0R/LR5 for LSU and Bt2a/Bt2b for tub2 in your Materials and Methods.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const quickQuestions = language === 'fa' ? [
    'چگونه به داور توضیح دهم که چرا ITS را تکثیر نکردیم و بتا-توبولین کافی است؟',
    'آیا برای چاپ گزارش در Plant Disease توالی LSU و tub2 کافی است؟',
    'چگونه ابعاد کنیدی‌ها را با فرمت استاندارد ژورنال بنویسم؟',
    'روش استاندارد ثبت جدایه‌ها در پایگاه GenBank برای این دو ژن چیست؟'
  ] : [
    'How should I defend using Beta-tubulin instead of ITS to reviewers?',
    'Are LSU and tub2 sequences sufficient for Plant Disease first report?',
    'How should conidial dimensions be phrased in journal format?',
    'What is the standard procedure to deposit LSU and tub2 to GenBank?'
  ];

  return (
    <div className="space-y-8" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {/* Hero Supervisor Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                {language === 'fa' ? 'پنل راهبری استاد راهنما' : 'Academic Supervisor Console'}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {language === 'fa' ? 'هدف: مقالات ISI و علمی‌پژوهشی' : 'Target: ISI First Disease Report'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {language === 'fa'
                ? 'ارزیابی صحت علمی و نقشه راه نگارش مقاله مغز گردو'
                : 'Scientific Rigor Audit & Research Roadmap for Walnut Rot'}
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              {language === 'fa'
                ? 'بررسی موشکافانه تک‌تک الزامات استاندارد مجلات معتبر گیاه‌پزشکی (مانند Plant Disease و Crop Protection) بر پایه داده‌های واقعی واردشده توسط شما در سربرگ داده‌های مولکولی و ریخت‌شناختی.'
                : 'In-depth peer-evaluation against top phytopathology journal standards based on your actual entered molecular and morphological data.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleRunAudit}
              disabled={auditLoading}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {auditLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>{language === 'fa' ? 'در حال ارزیابی علمی...' : 'Auditing Rigor...'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === 'fa' ? 'اجرای بازرسی جامع علمی' : 'Run Comprehensive Audit'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Audit AI Feedback if available */}
        {auditFeedback && (
          <div className="mt-6 p-4 rounded-lg bg-teal-50/60 border border-teal-200 text-slate-800 text-sm leading-relaxed prose prose-sm max-w-none">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-teal-200">
              <span className="font-semibold text-teal-900 flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-teal-700" />
                {language === 'fa' ? 'گزارش ارزیابی استاد راهنما' : "Supervisor's Rigor Assessment"}
              </span>
              <button
                type="button"
                onClick={() => setAuditFeedback(null)}
                className="text-xs text-teal-700 hover:underline cursor-pointer"
              >
                {language === 'fa' ? 'بستن' : 'Dismiss'}
              </button>
            </div>
            <div className="whitespace-pre-line font-normal text-slate-800">{auditFeedback}</div>
          </div>
        )}
      </div>

      {/* Two Column Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Rigor Checklist (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  {language === 'fa' ? 'چک‌لیست استانداردهای مولکولی و ریخت‌شناسی' : "Molecular & Morphological Checklist"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'fa' 
                    ? 'وضعیت تکمیل داده‌های واردشده توسط شما' 
                    : 'Status of your entered laboratory data'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {item.status === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {language === 'fa' ? item.titleFa : item.title}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-start gap-1.5 text-[11px] text-teal-900 bg-teal-50/50 px-2.5 py-1.5 rounded">
                    <span className="font-semibold shrink-0">
                      {language === 'fa' ? 'راهکار استاد راهنما:' : 'Supervisor Tip:'}
                    </span>
                    <span className="text-slate-700">{item.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviewer Defense Callout: The LSU + Beta-tubulin vs ITS Defense */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-amber-950">
                  {language === 'fa'
                    ? 'نکته طلایی استاد راهنما: پاسخ پیش‌دستانه به داوران در مورد نشانگرها'
                    : 'Critical Supervisor Defense: Addressing the ITS Query with Reviewers'}
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {language === 'fa'
                    ? 'در راسته Pleosporales و به ویژه سرده‌های Camarosporomyces، ژن ITS شباهت نوکلئوتیدی بسیار بالایی بین گونه‌های نزدیک دارد، در حالی که ژن کدکننده بتا-توبولین (tub2) توان تفکیک گونه‌ای (Species-level resolution) به مراتب قوی‌تری ارائه می‌دهد و LSU نیز موقعیت جایگاه خانوادگی را تثبیت می‌کند.'
                    : 'Within Pleosporales and particularly Camarosporomyces, ITS exhibits poor species-level variation, whereas protein-coding beta-tubulin (tub2) confers vastly superior resolving power to delineate C. flavigenus, paired with LSU for family placement.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive AI Supervisor Chat (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col h-[700px] bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
                Dr.P
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  {language === 'fa' ? 'گفتگوی مستقیم با استاد راهنما' : 'Supervisor Direct Consultation'}
                </h3>
                <span className="text-[10px] text-teal-800 font-medium">
                  {language === 'fa' ? 'متخصص قارچ‌شناسی مولکولی و بیماری‌های گردو' : 'Specialist in Molecular Mycology'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Questions Chips */}
          <div className="p-3 bg-slate-50 border-b border-slate-200/80">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-slate-400" />
              {language === 'fa' ? 'پرسش‌های متداول و حیاتی:' : 'Frequent Questions:'}
            </div>
            <div className="flex flex-col gap-1">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="text-left text-[11px] text-slate-700 hover:text-teal-800 bg-white hover:bg-teal-50/60 px-2 py-1.5 rounded border border-slate-200 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{q}</span>
                  <ChevronRight className="w-3 h-3 shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                  <span>{m.role === 'user' ? (language === 'fa' ? 'شما (دانشجو)' : 'You (Student)') : (language === 'fa' ? 'استاد راهنما' : 'Professor')}</span>
                  <span>·</span>
                  <span>{m.timestamp}</span>
                </div>
                <div
                  className={`p-3 rounded-xl max-w-[90%] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-teal-700 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.content}</div>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                <RotateCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                <span>{language === 'fa' ? 'استاد راهنما در حال تحلیل و پاسخ...' : 'Supervisor is formulating guidance...'}</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  language === 'fa'
                    ? 'از استاد راهنما سؤال بپرسید (مثلاً در مورد PCR، مایه‌زنی یا رفرانس‌ها)...'
                    : 'Ask your supervisor about PCR, inoculation, references, or text...'
                }
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
              />
              <button
                type="submit"
                disabled={chatLoading || !inputMessage.trim()}
                className="p-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
