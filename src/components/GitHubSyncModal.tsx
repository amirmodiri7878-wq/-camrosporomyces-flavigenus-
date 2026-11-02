import React, { useState } from 'react';
import { ProjectData } from '../types';
import { X, Github, Download, Upload, Check, Copy, ExternalLink, HardDrive } from 'lucide-react';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData;
  setProject: React.Dispatch<React.SetStateAction<ProjectData>>;
  language: 'fa' | 'en';
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  isOpen,
  onClose,
  project,
  setProject,
  language,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedData, setCopiedData] = useState(false);
  const repoUrl = 'https://github.com/amirmodiri7878-wq/-camrosporomyces-flavigenus-.git';

  if (!isOpen) return null;

  const handleExportJson = () => {
    const dataStr = JSON.stringify(project, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Camarosporomyces_flavigenus_ProjectData_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.pathogenName || json.manuscript) {
          setProject(json);
          alert(language === 'fa' ? 'اطلاعات پروژه با موفقیت بازیابی شد.' : 'Project data imported successfully.');
          onClose();
        }
      } catch (err) {
        alert(language === 'fa' ? 'فایل JSON نامعتبر است.' : 'Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleCopyDataJson = () => {
    navigator.clipboard.writeText(JSON.stringify(project, null, 2));
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-lg">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'fa' ? 'همگام‌سازی و پشتیبان‌گیری GitHub' : 'GitHub Sync & Project Backup'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'fa' ? 'ذخیره خودکار در مرورگر و مخزن گیت‌هاب' : 'Browser auto-save and GitHub repository sync'}
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

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs leading-relaxed">
          {/* Target Repository Info */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-semibold text-slate-700 block font-mono text-[11px] uppercase">
              {language === 'fa' ? 'مخزن هدف گیت‌هاب:' : 'Target GitHub Repository:'}
            </span>
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-300 font-mono text-[11px] text-slate-800 break-all">
              <span>{repoUrl}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(repoUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="ml-2 text-slate-500 hover:text-slate-800 shrink-0 cursor-pointer"
                title="Copy URL"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Browser Auto-Save Indicator */}
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
            <HardDrive className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950 block">
                {language === 'fa' ? 'ذخیره‌سازی خودکار در مرورگر (Active)' : 'Browser Auto-Save Active'}
              </span>
              <p className="text-emerald-900 mt-0.5 text-[11px]">
                {language === 'fa'
                  ? 'تمام توالی‌های واردشده، اندازه‌گیری‌های ریخت‌شناسی، تصاویر و متون مقاله در حافظه محلی مرورگر (Local Storage) ذخیره می‌شوند و با رفرش صفحه از بین نخواهند رفت.'
                  : 'All entered sequences, morphological measurements, lab images, and manuscript sections are automatically saved in local storage.'}
              </p>
            </div>
          </div>

          {/* Export & Import Backup Actions */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-700 block">
              {language === 'fa' ? 'دریافت نسخه پشتیبان (JSON Backup):' : 'Project Data Backup:'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'fa' ? 'دانلود فایل پشتیبان JSON' : 'Export JSON'}</span>
              </button>

              <label className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-medium transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>{language === 'fa' ? 'بازیابی از JSON' : 'Import JSON'}</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportJson}
                />
              </label>
            </div>
          </div>

          {/* Git Terminal Instructions */}
          <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1.5">
            <div className="text-teal-400 font-bold"># Push to your GitHub Repository:</div>
            <div className="text-slate-300">git remote set-url origin {repoUrl}</div>
            <div className="text-slate-300">git add .</div>
            <div className="text-slate-300">git commit -m "Update Camarosporomyces flavigenus research data"</div>
            <div className="text-slate-300">git push -u origin main</div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 px-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button
            type="button"
            onClick={handleCopyDataJson}
            className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1"
          >
            {copiedData ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{language === 'fa' ? 'کپی کل JSON پروژه' : 'Copy Project JSON'}</span>
          </button>

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
