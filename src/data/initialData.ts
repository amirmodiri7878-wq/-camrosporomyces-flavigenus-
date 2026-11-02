import { ProjectData, RigorAuditItem } from '../types';

// Clean, blank default state - No hardcoded mock data!
export const emptyProjectData: ProjectData = {
  pathogenName: 'Camarosporomyces flavigenus',
  authority: '',
  hostLatinName: 'Juglans regia',
  hostCommonName: 'Persian Walnut',
  diseaseSymptom: 'Walnut Kernel Rot',
  region: '',
  country: 'Iran',
  year: new Date().getFullYear(),
  isolates: [],
  primerLSU: {
    forward: 'LR0R (5\'-ACCCGCTGAACTTAAGC-3\')',
    reverse: 'LR5 (5\'-TCCTGAGGGAAACTTCG-3\')',
    ampliconSize: '',
  },
  primerTub2: {
    forward: 'Bt2a (5\'-GGTAACCAAATCGGTGCTGCTTTC-3\')',
    reverse: 'Bt2b (5\'-ACCCTCAGTGTAGTGACCCTTGGC-3\')',
    ampliconSize: '',
  },
  fastaLSU: '',
  fastaTub2: '',
  genBankLSU: '',
  genBankTub2: '',
  colonyPDA: {
    colorSurface: '',
    colorReverse: '',
    texture: '',
    growthRate7d: 0,
    growthRate14d: 0,
    exudate: '',
  },
  conidiaStats: {
    lengthRange: '',
    lengthMean: 0,
    widthRange: '',
    widthMean: 0,
    ratioLW: 0,
    septaRange: '',
    wallTexture: '',
    pycnidiaDescription: '',
  },
  labImages: [],
  manuscript: {
    targetJournal: 'Plant Disease / Crop Protection',
    articleType: 'First Disease Report / Disease Note',
    title: '',
    shortRunningTitle: '',
    authors: '',
    affiliations: '',
    abstract: '',
    keywords: ['Camarosporomyces flavigenus', 'Juglans regia', 'Walnut kernel rot', 'LSU', 'Beta-tubulin', 'First report'],
    introduction: '',
    materialsMethods: '',
    results: '',
    discussion: '',
    references: '',
    acknowledgements: '',
  },
};

// Reference sample template available on user demand
export const sampleProjectData: ProjectData = {
  pathogenName: 'Camarosporomyces flavigenus',
  authority: 'Crous',
  hostLatinName: 'Juglans regia',
  hostCommonName: 'Persian Walnut',
  diseaseSymptom: 'Kernel Rot (Post-harvest / Pre-harvest nut rot)',
  region: 'Commercial Walnut Orchards',
  country: 'Iran',
  year: 2026,
  isolates: [
    {
      id: 'iso-1',
      code: 'CF-WAL01',
      host: 'Juglans regia cv. Chandler',
      tissue: 'Rotten walnut kernel',
      locality: 'Commercial walnut orchard',
      collectionDate: 'September 2025',
      genBankLSU: 'PP891204',
      genBankTub2: 'PP891310',
      cultureCollectionId: 'IRAN 45892C',
    },
  ],
  primerLSU: {
    forward: 'LR0R (5\'-ACCCGCTGAACTTAAGC-3\')',
    reverse: 'LR5 (5\'-TCCTGAGGGAAACTTCG-3\')',
    ampliconSize: '~850 bp',
  },
  primerTub2: {
    forward: 'Bt2a (5\'-GGTAACCAAATCGGTGCTGCTTTC-3\')',
    reverse: 'Bt2b (5\'-ACCCTCAGTGTAGTGACCCTTGGC-3\')',
    ampliconSize: '~430 bp',
  },
  fastaLSU: `>Camarosporomyces_flavigenus_CF-WAL01_LSU_28S
GATCGTACGTAGCATGCTTCGCTTGGTGCAGATCTTGGTGGTAGTCAAACCTGCCCGTCA
TTCCTGCGGAGGCATCGTGCTCTTCGGAGTGCTTTGGCAGTTGGCCTCGGTACTCTCCCG
GCCTCGCCCTTTGTACACACCGCCCGTCGCTCCTACCGATTGAATGGTCCGGTGAAGTGT
TCGGATCGCGGCGACGTGGGCGGTTCGCTGCCGGCGACGTCGCGAGAAGTCCACTGAACC
TTATCATTTAGAGGAAGGAGAAGTCGTAACAAGGTTTCCGTAGGTGAACCTGCGGAAGGA
TCATTACCGAGTGAGGGCCCTCGGGCCTGACCTCCAACCCTTTGTTTATCACCACCTTTG
TTGCTTCGGCGGGCCCGCCTCGTGCCGCCGGGGACACCCAGGCCTCGGCGCGCGGGAGCC`,
  fastaTub2: `>Camarosporomyces_flavigenus_CF-WAL01_Beta_tubulin_tub2
GGTAACCAAATCGGTGCTGCTTTCTGGTATGTCTTTCTTACGTCTCTTTTTCGTTTCTTC
TGTTTCTTGCTGACCATTGCTTTTAGGTGGACCCTCAATACTCGTCCCGTGAGCGTCTTC
AGGGCCGACAACTCCGGCAACTACATCTCCGACTCTGTCCGCGTCGGCTTCGAGATCGTC
GACGTCGTCCGCAAGGAGGCCGAGGGTTGCGACTGCCTCCAGGGCTTCCAGATCACCCAC`,
  genBankLSU: 'PP891204',
  genBankTub2: 'PP891310',
  colonyPDA: {
    colorSurface: 'Olivaceous green to dark greenish-grey with dense velvety aerial mycelium',
    colorReverse: 'Dark brownish-black with a distinct yellowish diffusible pigment in agar',
    texture: 'Velvety, floccose, regular margin',
    growthRate7d: 38.5,
    growthRate14d: 74.0,
    exudate: 'Yellowish pigment diffusing into the medium (characteristic of flavigenus)',
  },
  conidiaStats: {
    lengthRange: '13.5–19.0 µm',
    lengthMean: 16.2,
    widthRange: '6.5–9.5 µm',
    widthMean: 8.1,
    ratioLW: 2.0,
    septaRange: '1–3 transverse septa, occasionally 1 longitudinal septum (muriform)',
    wallTexture: 'Smooth to finely verruculose, pale brown to golden-brown',
    pycnidiaDescription: 'Dark brown, globose to subglobose, semi-immersed pycnidia with ostiole',
  },
  labImages: [],
  manuscript: {
    targetJournal: 'Plant Disease (APS)',
    articleType: 'First Disease Report / Disease Note',
    title: 'First Report of Camarosporomyces flavigenus Causing Kernel Rot of Persian Walnut (Juglans regia) in Iran',
    shortRunningTitle: 'First Report of Camarosporomyces flavigenus on Walnut',
    authors: 'Amir Modiri, et al.',
    affiliations: 'Department of Plant Pathology, Faculty of Agriculture',
    abstract: '',
    keywords: ['Camarosporomyces flavigenus', 'Juglans regia', 'Walnut kernel rot', 'First report'],
    introduction: '',
    materialsMethods: '',
    results: '',
    discussion: '',
    references: '',
    acknowledgements: '',
  },
};

export const initialRigorChecklist: RigorAuditItem[] = [
  {
    id: 'mol-1',
    title: 'Dual Molecular Barcoding (LSU + Beta-Tubulin)',
    titleFa: 'توالی‌یابی دو جایگاه ژنی LSU و بتا-توبولین',
    category: 'molecular',
    status: 'pending',
    description: 'Enter your LSU (~850bp) and tub2 (~430bp) FASTA sequences and primer sets.',
    recommendation: 'Ensure primer names (LR0R/LR5 & Bt2a/Bt2b) and GenBank accessions are filled.',
  },
  {
    id: 'mol-2',
    title: 'Universal Barcode (ITS) Preemptive Defense',
    titleFa: 'دفاعیه پیش‌دستانه در برابر درخواست داور برای ژن ITS',
    category: 'molecular',
    status: 'passed',
    description: 'Prepares rationale for why tub2 was selected over ITS for species resolution in Camarosporomyces.',
    recommendation: 'Integrated directly into Materials & Methods and Discussion.',
  },
  {
    id: 'morph-1',
    title: 'Conidial Measurements (Length, Width, L/W Ratio)',
    titleFa: 'اندازه‌گیری ابعاد کنیدی‌ها (طول، عرض و نسبت L/W)',
    category: 'morphology',
    status: 'pending',
    description: 'Record conidia length range, width range, and calculate average values.',
    recommendation: 'Measure at least 30 to 50 conidia under DIC light microscope.',
  },
  {
    id: 'morph-2',
    title: 'Colony & Diffusible Yellow Pigment Diagnosis',
    titleFa: 'بررسی ویژگی‌های پرگنه و ترشح رنگیزه زرد در آگار',
    category: 'morphology',
    status: 'pending',
    description: 'Document colony color, growth diameter, and yellow pigment confirming flavigenus.',
    recommendation: 'Upload colony photos to the Multimodal Lab Image Inspector.',
  },
  {
    id: 'img-1',
    title: 'Micrograph & Phylogenetic Tree Image Scans',
    titleFa: 'آپلود و تحلیل تصاویر میکروسکوپی و درخت تبارشناسی',
    category: 'imaging',
    status: 'pending',
    description: 'Upload your lab micrographs or tree scans for automated AI analysis and manuscript integration.',
    recommendation: 'Use the Multimodal Lab Images tab to upload and extract descriptions.',
  },
];
