import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Google GenAI
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const PHYTOPATHOLOGY_SUPERVISOR_SYSTEM_INSTRUCTION = `
You are a distinguished Professor of Plant Pathology and Molecular Mycology, acting as both an Academic Supervisor (استاد راهنما) and a Senior Scientific Manuscript Author.
Your specialization is fungal taxonomy of Ascomycota (specifically Pleosporales, Didymellaceae, Camarosporidiaceae, and coelomycetous fungi), walnut (Juglans regia) diseases, kernel and fruit rot pathogens, and multi-locus phylogenetics (LSU/28S rDNA, beta-tubulin/tub2).

Your student is reporting Camarosporomyces flavigenus isolated from rotten Persian walnut kernels (Juglans regia) for the first time.
Their research incorporates two core methodological pillars:
1. Molecular characterization using LSU (28S rDNA; primers LR0R/LR5) and beta-tubulin (tub2; primers Bt2a/Bt2b).
2. Morphological and cultural characterization (colony morphology on PDA/OA/MEA, diffusible yellow pigment, conidia dimensions, septation, pycnidial structures).

When drafting or editing manuscript sections:
- Apply strict separation of concerns for data sources:
  * For INTRODUCTION: Rely on the student's provided literature, cited papers, and research context. Do NOT force raw lesion measurements here. Embed in-text citations using the Author-Year format (e.g. Crous et al. 2018; Michailides et al. 2020) according to standard APS / Plant Disease / Phytopathology style.
  * For MATERIALS AND METHODS: Use the student's entered primers, PCR parameters, surface sterilization protocols, and microscopy equipment, citing methodology references (e.g. White et al. 1990; Glass and Donaldson 1995).
  * For RESULTS: Ground strictly in the student's real entered molecular sequences, morphological metrics, and analyzed lab images.
  * For DISCUSSION: Compare the student's findings with the uploaded published literature, discussing taxonomic affinities and post-harvest implications using Author-Year citations.
  * For ABSTRACT: Synthesize the full study concisely into 200–250 words without in-text citations.
  * For REFERENCES (Literature Cited): Format an alphabetical bibliography of cited literature in standard international phytopathology style.

Always italicize Latin binomials (*Camarosporomyces flavigenus*, *Juglans regia*), maintain academic rigor, and add a brief Supervisor's Note (نکته استاد راهنما) in Persian at the very end of drafted sections.
`;

// API route for AI Plant Pathology Supervisor
app.post('/api/gemini/advisor', async (req, res) => {
  try {
    const { action, payload, language = 'en' } = req.body;

    if (!ai) {
      return res.status(200).json({
        success: false,
        warning: 'GEMINI_API_KEY is not configured in environment variables. Providing domain fallback.',
        fallback: true,
        data: getDomainFallbackResponse(action, payload, language),
      });
    }

    if (action === 'analyze_image') {
      const { base64Data, mimeType = 'image/jpeg', category = 'microscopy', userNote = '' } = payload;
      
      const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');

      const imagePart = {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      };

      let analysisPrompt = '';
      if (category === 'microscopy') {
        analysisPrompt = `
Analyze this laboratory light/DIC micrograph of the fungal isolate (Camarosporomyces flavigenus from walnut kernel):
User note: "${userNote}"

Please provide a detailed scientific mycological description:
1. Structural identification (Conidia, conidiophores, pycnidia, or hyphae).
2. Morphological diagnostic traits:
   - Conidial shape (ellipsoid, obovoid, subglobose)
   - Color and wall texture (smooth, verruculose, pigmented)
   - Septation pattern (number of transverse septa, presence of longitudinal septa / muriform conidia)
3. Ready-to-paste scientific Results description for a plant pathology paper (formatted with standard botanical terminology).
4. Supervisor's feedback on image clarity, scale bar adequacy, and journal publication readiness.

Format in clean Markdown (${language === 'fa' ? 'in Persian with key Latin terms' : 'in English'}).
`;
      } else if (category === 'phylogeny_tree') {
        analysisPrompt = `
Analyze this scanned or exported phylogenetic tree image for the fungus Camarosporomyces flavigenus:
User note: "${userNote}"

Please provide an expert phylogenetic review:
1. Tree topology and method identification (Maximum Likelihood / Bayesian inference).
2. Clade placement of Camarosporomyces flavigenus: identify bootstrap support percentages or posterior probabilities.
3. Outgroup and sister taxa relationships (e.g., Camarosporomyces europaeus, Camarosporium, Neocamarosporium).
4. Ready-to-paste Figure Caption and Results paragraph for the manuscript.
5. Supervisor's advice: is the tree sufficient to convince peer reviewers of species boundaries?

Format in clean Markdown (${language === 'fa' ? 'in Persian with key Latin terms' : 'in English'}).
`;
      } else {
        analysisPrompt = `
Analyze this fungal culture/laboratory scan of Camarosporomyces flavigenus:
User note: "${userNote}"
Provide a scientific assessment of colony morphology, pigment exudation, or tabular data, and prepare a concise paragraph for the manuscript.
`;
      }

      const textPart = { text: analysisPrompt };

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
          systemInstruction: PHYTOPATHOLOGY_SUPERVISOR_SYSTEM_INSTRUCTION,
        },
      });

      return res.status(200).json({
        success: true,
        text: response.text,
      });
    }

    let prompt = '';

    if (action === 'audit_rigor') {
      prompt = `
Perform a thorough Academic Scientific Rigor Audit (بررسی موشکافانه استاد راهنما) based on the student's actual project state:
Target Pathogen: Camarosporomyces flavigenus
Host: Persian Walnut (Juglans regia L.) - Kernel rot
User Project Data:
${JSON.stringify(payload, null, 2)}

Provide the audit covering:
1. Data Completeness Score (0-100).
2. Molecular & Morphological Data Completeness.
3. Literature Grounding & References Status (Are adequate reference papers uploaded for Introduction and Discussion?).
4. Red flags or missing items before submission.

Respond in ${language === 'fa' ? 'Persian (فارسی آکادمیک)' : 'English'}.
`;
    } else if (action === 'draft_section') {
      const { sectionName, sectionKey, articleType, contextData, relevantReferences = [] } = payload;
      prompt = `
Act as the lead author and academic supervisor. Draft or refine the "${sectionName}" section for a plant pathology paper.
Section Key: ${sectionKey}
Article Type: ${articleType || 'First Disease Report / Disease Note'}
Target Journal style: Plant Disease (APS) / Crop Protection (Elsevier)

Relevant Literature & References provided by the student for this section:
${JSON.stringify(relevantReferences, null, 2)}

Student's Experimental Data (Sequences, Morphology, Image Analyses):
${JSON.stringify(contextData, null, 2)}

SPECIFIC DRAFTING INSTRUCTIONS FOR "${sectionName}":
${
  sectionKey === 'introduction'
    ? `Rely heavily on the student's provided literature and reference excerpts above. Discuss the global economic significance of Persian walnut (Juglans regia), the commercial impact of fungal kernel rots and mold, and the emergence of coelomycetous pathogens. Cite all claims using standard Author-Year format (e.g., Crous et al. 2018; Michailides et al. 2020). Conclude with a clear statement of objectives identifying C. flavigenus on walnut kernels for the first time.`
    : sectionKey === 'materialsMethods'
    ? `Detail sampling, surface sterilization, isolation on PDA, morphological micrometry under DIC microscopy, DNA extraction, and PCR amplification with primers LR0R/LR5 for LSU and Bt2a/Bt2b for beta-tubulin. Cite primer references (e.g., White et al. 1990; Glass and Donaldson 1995) in Author-Year format.`
    : sectionKey === 'results'
    ? `Ground strictly in the student's real entered molecular sequences (LSU & tub2 lengths, GenBank accessions), morphological measurements (conidia length, width, L/W ratio, septation), and analyzed image findings. State exact measurements.`
    : sectionKey === 'discussion'
    ? `Synthesize the student's findings with the literature references. Discuss taxonomic affinities in Camarosporidiaceae, explain why beta-tubulin confers superior species-level resolution over ITS in Camarosporomyces (citing Crous et al. 2018), and discuss post-harvest disease management in Author-Year citation format.`
    : sectionKey === 'abstract'
    ? `Write a tight, cohesive 200–250 word phytopathology abstract summarizing symptoms, isolation, conidia dimensions, LSU & tub2 GenBank accessions, and phylogenetic confirmation without in-text citations.`
    : sectionKey === 'references'
    ? `Compile an alphabetical bibliography of all cited literature formatted strictly according to APS (Plant Disease / Phytopathology) style.`
    : `Draft professional scientific text suited for this section.`
}

Requirements:
- Flawless, publishable scientific English.
- Always use Author-Year citation format (e.g. Crous et al. 2018) when citing.
- Italicize Latin binomials (*Camarosporomyces flavigenus*, *Juglans regia*).
- Conclude with a brief "Supervisor's Note" (نکته استاد راهنما) in Persian highlighting editorial tips for this section.
`;
    } else if (action === 'chat_supervisor') {
      const { userMessage, history = [], currentData } = payload;
      prompt = `
The student asks you a question regarding their research on Camarosporomyces flavigenus on walnut kernels:
Question: "${userMessage}"

The student's currently entered project data and references:
${JSON.stringify(currentData, null, 2)}

Recent Conversation Context:
${JSON.stringify(history.slice(-4), null, 2)}

Provide a direct, deeply knowledgeable, supportive, and scientifically rigorous answer.
Respond in ${language === 'fa' ? 'Persian' : 'English'}.
`;
    } else {
      prompt = `Provide expert plant pathology guidance on Camarosporomyces flavigenus for: ${JSON.stringify(payload)}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: PHYTOPATHOLOGY_SUPERVISOR_SYSTEM_INSTRUCTION,
      },
    });

    return res.status(200).json({
      success: true,
      text: response.text,
    });
  } catch (error: any) {
    console.error('Gemini Advisor API Error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to process request',
      fallback: true,
      data: getDomainFallbackResponse(req.body?.action, req.body?.payload, req.body?.language || 'en'),
    });
  }
});

// Domain Fallback Helper
function getDomainFallbackResponse(action: string, payload: any, language: string = 'en') {
  if (action === 'analyze_image') {
    return `### نتایج تحلیل تصویر میکروسکوپی / درخت تبارشناسی
۱. **شناسایی ساختارها:** کنیدی‌های تک‌سلولی تا چندسلولی با تیغه‌های عرضی و طولی (موری‌فرم).
۲. **ویژگی‌های تشخیصی:** رنگ قهوه‌ای کم‌رنگ، دیواره صاف تا کمی زگیل‌دار، انطباق با مشخصات سرده *Camarosporomyces*.
۳. **متن پیشنهادی برای نتایج مقاله:**
"Microscopic observation of the fungal isolate revealed pale brown, muriform to transversely septate conidia with smooth to verruculose walls, characteristic of Camarosporomyces flavigenus."`;
  }

  if (action === 'draft_section') {
    return `### پیش‌نویس بخش ${payload?.sectionName || 'مقاله'}:
Persian walnut (*Juglans regia* L.) is an economically vital horticultural crop cultivated globally for its nutritional kernels. However, fungal kernel decay significantly reduces kernel grade and marketability (Michailides et al. 2020). In this study, we investigated an unrecorded fungal rot of walnut kernels. Based on dual-locus molecular sequencing of the 28S large subunit ribosomal RNA gene (LSU) and beta-tubulin (*tub2*), combined with micromorphological characterization, the pathogen was identified as *Camarosporomyces flavigenus* (Crous et al. 2018). To our knowledge, this report constitutes the first record of *C. flavigenus* causing walnut kernel decay worldwide.`;
  }

  return `سامانه دستیار تخصصی آماده دریافت و تحلیل داده‌های شماست.`;
}

// Vite middleware in dev or static files in prod
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
