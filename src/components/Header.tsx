import React from 'react';
import { Microscope, FileDown, Languages, Github, Sparkles, Trash2, FolderPlus } from 'lucide-react';

interface HeaderProps {
  activeTab: 'advisor' | 'manuscript' | 'lab' | 'reviewer';
  setActiveTab: (tab: 'advisor' | 'manuscript' | 'lab' | 'reviewer') => void;
  language: 'fa' | 'en';
  setLanguage: (lang: 'fa' | 'en') => void;
  onOpenExport: () => void;
  onOpenGitHubSync: () => void;
  onLoadSample: () => void;
  onClearToEmpty: () => void;
  hasData: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  onOpenExport,
  onOpenGitHubSync,
  onLoadSample,
  onClearToEmpty,
  hasData,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-xs">
            <Microscope className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              PhytoReport AI
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-800 font-semibold -mt-0.5">
              Plant Pathology Advisor
            </span>
          </div>
        </div>

        {/* Zone 2: 4 Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('advisor')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'advisor'
                ? 'text-teal-700 font-semibold border-b-2 border-teal-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'fa' ? 'استاد راهنما و ارزیابی' : 'Supervisor & Audit'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manuscript')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'manuscript'
                ? 'text-teal-700 font-semibold border-b-2 border-teal-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'fa' ? 'استودیو نگارش مقاله' : 'Manuscript Studio'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lab')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'lab'
                ? 'text-teal-700 font-semibold border-b-2 border-teal-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'fa' ? 'داده‌های مولکولی و ریخت‌شناختی' : 'Molecular & Morphological Data'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviewer')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'reviewer'
                ? 'text-teal-700 font-semibold border-b-2 border-teal-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'fa' ? 'شبیه‌ساز داوری ISI' : 'Reviewer Simulation'}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Utility */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* GitHub Sync Button */}
          <button
            type="button"
            onClick={onOpenGitHubSync}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            title="GitHub Repository Sync"
          >
            <Github className="w-3.5 h-3.5 text-slate-800" />
            <span className="hidden sm:inline">GitHub</span>
          </button>

          {/* Sample template vs Clear */}
          {!hasData ? (
            <button
              type="button"
              onClick={onLoadSample}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
              title="بارگذاری نمونه آزمایشی جهت مشاهده ساختار"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'fa' ? 'بارگذاری نمونه آزمایشی' : 'Load Sample'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClearToEmpty}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
              title="پاکسازی کامل فرم‌ها و شروع پروژه خام"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>{language === 'fa' ? 'پاکسازی فرم‌ها' : 'Clear Data'}</span>
            </button>
          )}

          {/* Language Switch */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            title="Toggle Persian / English language"
          >
            <Languages className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'fa' ? 'English' : 'فارسی'}</span>
          </button>

          {/* Export Primary Action */}
          <button
            type="button"
            onClick={onOpenExport}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-md shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{language === 'fa' ? 'خروجی مقاله' : 'Export Manuscript'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
