import React from 'react';
import { ProjectData } from '../types';

interface TelemetryBarProps {
  project: ProjectData;
  language: 'fa' | 'en';
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({ project, language }) => {
  const hasLSU = project.fastaLSU.trim().length > 0;
  const hasTub2 = project.fastaTub2.trim().length > 0;
  const hasMorph = project.conidiaStats.lengthRange.trim().length > 0 || project.conidiaStats.lengthMean > 0;
  const imageCount = project.labImages.length;

  // Calculate live completeness score
  let score = 20; // baseline project registered
  if (hasLSU) score += 20;
  if (hasTub2) score += 25;
  if (hasMorph) score += 20;
  if (imageCount > 0) score += 15;

  return (
    <div className="bg-slate-900 text-slate-300 border-b border-slate-800 text-xs py-2 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-1.5 gap-x-4">
        {/* Research Context */}
        <div className="flex flex-wrap items-center gap-x-2 text-[11px] sm:text-xs">
          <span className="text-slate-400 font-mono uppercase tracking-wider text-[10px]">
            {language === 'fa' ? 'عامل قارچی:' : 'Target Taxon:'}
          </span>
          <span className="font-semibold text-white italic">
            {project.pathogenName || 'Camarosporomyces flavigenus'}
          </span>
          <span className="text-slate-600">·</span>

          <span className="text-slate-400 font-mono uppercase tracking-wider text-[10px]">
            {language === 'fa' ? 'میزبان:' : 'Host:'}
          </span>
          <span className="font-medium text-slate-200 italic">
            {project.hostLatinName || 'Juglans regia'}
          </span>
          <span className="text-slate-600">·</span>

          <span className="text-slate-400 font-mono uppercase tracking-wider text-[10px]">
            {language === 'fa' ? 'نشانگرها:' : 'Markers:'}
          </span>
          <span className="font-mono text-teal-400 font-medium">
            LSU {hasLSU ? '✓' : '...'} · tub2 {hasTub2 ? '✓' : '...'}
          </span>
        </div>

        {/* Live Lab Status */}
        <div className="flex items-center gap-3 text-[11px] sm:text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[10px] uppercase">
              {language === 'fa' ? 'تکمیل داده‌ها:' : 'Data Rigor:'}
            </span>
            <span className={`font-bold tabular-nums ${score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {score}%
            </span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[10px] uppercase">
              {language === 'fa' ? 'تصاویر آزمایشگاه:' : 'Lab Images:'}
            </span>
            <span className="text-slate-200 font-medium">{imageCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
