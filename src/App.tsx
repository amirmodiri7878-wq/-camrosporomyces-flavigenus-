/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { emptyProjectData, sampleProjectData } from './data/initialData';
import { ProjectData } from './types';
import { Header } from './components/Header';
import { TelemetryBar } from './components/TelemetryBar';
import { SupervisorTab } from './components/SupervisorTab';
import { ManuscriptStudioTab } from './components/ManuscriptStudioTab';
import { MolecularAndMorphologyTab } from './components/MolecularAndMorphologyTab';
import { ReviewerSimulationTab } from './components/ReviewerSimulationTab';
import { ExportModal } from './components/ExportModal';
import { GitHubSyncModal } from './components/GitHubSyncModal';

const STORAGE_KEY = 'phyto_report_project_v2';

export default function App() {
  const [project, setProject] = useState<ProjectData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load from localStorage', e);
    }
    // Default to clean blank slate with zero mock data
    return emptyProjectData;
  });

  const [activeTab, setActiveTab] = useState<'advisor' | 'manuscript' | 'lab' | 'reviewer'>('lab');
  const [language, setLanguage] = useState<'fa' | 'en'>('fa');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isGitHubSyncOpen, setIsGitHubSyncOpen] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [project]);

  const handleLoadSample = () => {
    if (window.confirm(language === 'fa' ? 'آیا مایلید داده‌های نمونه آزمایشی جهت مشاهده نحوه قالب‌بندی بارگذاری شوند؟' : 'Load sample reference template data?')) {
      setProject(sampleProjectData);
    }
  };

  const handleClearToEmpty = () => {
    if (window.confirm(language === 'fa' ? 'آیا مایلید تمام فرم‌ها پاکسازی شده و یک پروژه خام آغاز شود؟' : 'Clear all data and start a blank project?')) {
      setProject(emptyProjectData);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const hasData = project.fastaLSU.length > 0 || project.conidiaStats.lengthRange.length > 0 || project.labImages.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Bar Contract (Wordmark, Nav Links, Primary Action) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenGitHubSync={() => setIsGitHubSyncOpen(true)}
        onLoadSample={handleLoadSample}
        onClearToEmpty={handleClearToEmpty}
        hasData={hasData}
      />

      {/* Scientific Telemetry & Research Metadata Strip */}
      <TelemetryBar project={project} language={language} />

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'advisor' && (
          <SupervisorTab
            project={project}
            setProject={setProject}
            language={language}
          />
        )}

        {activeTab === 'manuscript' && (
          <ManuscriptStudioTab
            project={project}
            setProject={setProject}
            language={language}
          />
        )}

        {activeTab === 'lab' && (
          <MolecularAndMorphologyTab
            project={project}
            setProject={setProject}
            language={language}
            onNavigateToManuscript={() => setActiveTab('manuscript')}
          />
        )}

        {activeTab === 'reviewer' && (
          <ReviewerSimulationTab
            project={project}
            language={language}
          />
        )}
      </main>

      {/* Clean Scientific Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">PhytoReport AI</span>
            <span>·</span>
            <span className="italic">{project.pathogenName || 'Camarosporomyces flavigenus'}</span> on <span className="italic">{project.hostLatinName || 'Juglans regia'}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span>Markers: LSU + β-tubulin</span>
            <span>·</span>
            <span>Molecular & Morphological Analysis Workbench</span>
          </div>
        </div>
      </footer>

      {/* Export Manuscript Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
        language={language}
      />

      {/* GitHub Sync Modal */}
      <GitHubSyncModal
        isOpen={isGitHubSyncOpen}
        onClose={() => setIsGitHubSyncOpen(false)}
        project={project}
        setProject={setProject}
        language={language}
      />
    </div>
  );
}
