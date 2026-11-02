export interface SampleIsolate {
  id: string;
  code: string;
  host: string;
  tissue: string;
  locality: string;
  collectionDate: string;
  genBankLSU: string;
  genBankTub2: string;
  cultureCollectionId: string;
}

export interface LabImageUpload {
  id: string;
  name: string;
  category: 'microscopy' | 'phylogeny_tree' | 'colony_plate' | 'table';
  dataUrl: string; // base64
  mimeType: string;
  uploadedAt: string;
  caption: string;
  aiAnalysis?: string;
  isAnalyzing?: boolean;
}

export interface ProjectData {
  pathogenName: string;
  authority: string;
  hostLatinName: string;
  hostCommonName: string;
  diseaseSymptom: string;
  region: string;
  country: string;
  year: number;
  isolates: SampleIsolate[];
  // Molecular Data
  primerLSU: { forward: string; reverse: string; ampliconSize: string };
  primerTub2: { forward: string; reverse: string; ampliconSize: string };
  fastaLSU: string;
  fastaTub2: string;
  genBankLSU: string;
  genBankTub2: string;
  // Morphological Data
  colonyPDA: {
    colorSurface: string;
    colorReverse: string;
    texture: string;
    growthRate7d: number; // mm
    growthRate14d: number; // mm
    exudate: string;
  };
  conidiaStats: {
    lengthRange: string;
    lengthMean: number;
    widthRange: string;
    widthMean: number;
    ratioLW: number;
    septaRange: string;
    wallTexture: string;
    pycnidiaDescription: string;
  };
  // Uploaded Lab Images and AI Analyses
  labImages: LabImageUpload[];
  // Manuscript Sections
  manuscript: {
    targetJournal: string;
    articleType: string;
    title: string;
    shortRunningTitle: string;
    authors: string;
    affiliations: string;
    abstract: string;
    keywords: string[];
    introduction: string;
    materialsMethods: string;
    results: string;
    discussion: string;
    references: string;
    acknowledgements: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface RigorAuditItem {
  id: string;
  title: string;
  titleFa: string;
  category: 'molecular' | 'morphology' | 'imaging' | 'standards';
  status: 'passed' | 'warning' | 'pending';
  description: string;
  recommendation: string;
}
