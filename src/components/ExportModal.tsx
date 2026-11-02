import React, { useState } from 'react';
import { ProjectData } from '../types';
import { X, FileText, Download, Copy, Check, Printer } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData;
  language: 'fa' | 'en';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  language,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateFullManuscriptText = () => {
    const ms = project.manuscript || ({} as any);
    const kw = Array.isArray(ms.keywords) ? ms.keywords.join(', ') : '';
    return `${(ms.title || '').toUpperCase()}

Authors: ${ms.authors || ''}
Affiliations: ${ms.affiliations || ''}

ABSTRACT
${ms.abstract || ''}

Keywords: ${kw}

INTRODUCTION
${ms.introduction || ''}

MATERIALS AND METHODS
${ms.materialsMethods || ''}

RESULTS
${ms.results || ''}

DISCUSSION
${ms.discussion || ''}

LITERATURE CITED
${ms.references || ''}

ACKNOWLEDGEMENTS
${ms.acknowledgements || ''}
`;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateFullManuscriptText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDoc = () => {
    const ms = project.manuscript || ({} as any);
    const kw = Array.isArray(ms.keywords) ? ms.keywords.join(', ') : '';
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${ms.title || 'Manuscript'}</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 2.0; }
        h1 { font-size: 16pt; font-weight: bold; text-align: center; }
        h2 { font-size: 14pt; font-weight: bold; margin-top: 18pt; }
        p { text-align: justify; text-indent: 0.5in; margin-bottom: 0; }
        .meta { text-align: center; font-style: italic; margin-bottom: 24pt; }
      </style>
      </head>
      <body>
        <h1>${ms.title || ''}</h1>
        <div class="meta">
          <p style="text-indent: 0;"><b>${ms.authors || ''}</b></p>
          <p style="text-indent: 0;">${ms.affiliations || ''}</p>
        </div>
        <h2>ABSTRACT</h2>
        <p>${ms.abstract || ''}</p>
        <p style="text-indent: 0; margin-top: 10pt;"><b>Keywords:</b> <i>${kw}</i></p>
        <h2>INTRODUCTION</h2>
        <p>${ms.introduction || ''}</p>
        <h2>MATERIALS AND METHODS</h2>
        <p>${(ms.materialsMethods || '').replace(/\n\n/g, '</p><p>')}</p>
        <h2>RESULTS</h2>
        <p>${(ms.results || '').replace(/\n\n/g, '</p><p>')}</p>
        <h2>DISCUSSION</h2>
        <p>${(ms.discussion || '').replace(/\n\n/g, '</p><p>')}</p>
        <h2>LITERATURE CITED</h2>
        <p style="text-indent: 0;">${(ms.references || '').replace(/\n/g, '<br>')}</p>
        <h2>ACKNOWLEDGEMENTS</h2>
        <p>${ms.acknowledgements || ''}</p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Camarosporomyces_flavigenus_Walnut_Manuscript.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    const text = generateFullManuscriptText();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Camarosporomyces_flavigenus_Walnut_Manuscript.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'fa' ? 'دریافت خروجی مقاله علمی' : 'Export Scientific Manuscript'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'fa' ? 'آماده برای ارسال به مجلات و داوری' : 'Formatted for peer-review journal submission'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDownloadDoc}
              className="p-4 rounded-xl border border-slate-200 hover:border-teal-600 hover:bg-teal-50/40 text-left transition-all flex items-start gap-3 cursor-pointer group"
            >
              <FileText className="w-6 h-6 text-teal-700 shrink-0 mt-0.5 group-hover:scale-105 transition-transform" />
              <div>
                <div className="text-xs font-bold text-slate-900">Microsoft Word (.doc)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Double-spaced, Times New Roman, journal-ready formatting.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="p-4 rounded-xl border border-slate-200 hover:border-teal-600 hover:bg-teal-50/40 text-left transition-all flex items-start gap-3 cursor-pointer group"
            >
              <FileText className="w-6 h-6 text-slate-700 shrink-0 mt-0.5 group-hover:scale-105 transition-transform" />
              <div>
                <div className="text-xs font-bold text-slate-900">Plain Markdown (.md)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Universal text format with clean headers and tags.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="p-4 rounded-xl border border-slate-200 hover:border-teal-600 hover:bg-teal-50/40 text-left transition-all flex items-start gap-3 cursor-pointer group"
            >
              {copied ? (
                <Check className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <Copy className="w-6 h-6 text-slate-700 shrink-0 mt-0.5 group-hover:scale-105 transition-transform" />
              )}
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {copied ? (language === 'fa' ? 'کپی شد!' : 'Copied!') : (language === 'fa' ? 'کپی کل متن مقاله' : 'Copy All Text')}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Instant clipboard copy for fast pasting into editorial systems.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-4 rounded-xl border border-slate-200 hover:border-teal-600 hover:bg-teal-50/40 text-left transition-all flex items-start gap-3 cursor-pointer group"
            >
              <Printer className="w-6 h-6 text-slate-700 shrink-0 mt-0.5 group-hover:scale-105 transition-transform" />
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {language === 'fa' ? 'چاپ یا خروجی PDF' : 'Print / Save as PDF'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Clean printable document without UI controls.
                </div>
              </div>
            </button>
          </div>

          {/* Quick Preview Box */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Preview Snippet:
            </span>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 max-h-36 overflow-y-auto leading-relaxed">
              <div className="font-bold text-slate-900 mb-1">{project.manuscript.title}</div>
              <div className="text-slate-500 text-[11px] mb-2">{project.manuscript.authors}</div>
              <div className="text-slate-600 line-clamp-3">{project.manuscript.abstract}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 px-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
          >
            {language === 'fa' ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
