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
Their experimental methodology is based strictly on two core approaches:
1. Molecular characterization using two genomic loci: LSU (28S rDNA; primers LR0R/LR5) and beta-tubulin (tub2; primers Bt2a/Bt2b).
2. Morphological and cultural characterization (colony morphology on PDA/OA/MEA, diffusible yellow pigment, conidia dimensions, septation, pycnidial structures).

When analyzing uploaded images (micrographs, phylogenetic trees, colony plates):
- Examine micrographs for conidial shape, muriform/transverse septation, pigmentation, and pycnidia.
- Examine phylogenetic tree scans for tree topology, bootstrap support values, placement within Camarosporidiaceae, and sister taxa.
- Provide clear scientific descriptions formatted for immediate integration into the manuscript Results and Methods sections.

When generating manuscript text:
- Strictly bind to the student's actual entered data (sequences, isolate codes, measurements, GenBank IDs, and analyzed images). Do NOT hallucinate fabricated numbers when the user has provided real values.
- Maintain academic precision, italicize scientific Latin binomials (*Camarosporomyces flavigenus*, *Juglans regia*), and provide actionable supervisor tips.
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
Perform a thorough Academic Scientific Rigor Audit (بررسی موشکافانه استاد راهنما) based strictly on the student's actual entered data:
Target Pathogen: Camarosporomyces flavigenus
Host: Persian Walnut (Juglans regia L.) - Kernel rot
User Provided Data:
${JSON.stringify(payload, null, 2)}

Provide the audit covering:
1. Data Completeness Score (0-100) based on what the student has entered vs what is still missing.
2. Molecular Data Evaluation (LSU & tub2 sequences, primers, GenBank accessions).
3. Morphological Data Evaluation (Conidial length/width, septa, colony characteristics, yellow pigment).
4. Uploaded Lab Images Evaluation (Micrographs & phylogenetic tree scans).
5. Specific missing items or next steps the student must complete before journal submission.

Respond in ${language === 'fa' ? 'Persian (فارسی آکادمیک)' : 'English'}.
`;
    } else if (action === 'draft_section') {
      const { sectionName, articleType, contextData } = payload;
      prompt = `
Act as the lead author and academic supervisor. Draft or refine the "${sectionName}" section for a high-impact plant pathology paper.
Article Type: ${articleType || 'First Disease Report / Disease Note'}
Target Journal style: Plant Disease (APS) / Crop Protection (Elsevier)

IMPORTANT: Use ONLY the student's actual experimental data and analyzed images provided below:
${JSON.stringify(contextData, null, 2)}

Drafting Requirements for "${sectionName}":
- Flawless, publishable scientific English.
- Use exact entered values: conidia measurements, isolate codes, primer sets, and GenBank numbers. If any value is not yet entered by the student, insert clear bracketed guidance [e.g., [Insert exact conidial length]].
- Italicize Latin binomials (*Camarosporomyces flavigenus*, *Juglans regia*).
- If uploaded image analyses are present in contextData, incorporate those visual observations seamlessly into the text.
- Include a short "Supervisor's Note" (نکته استاد راهنما) in Persian at the very end highlighting why this section was structured this way.
`;
    } else if (action === 'chat_supervisor') {
      const { userMessage, history = [], currentData } = payload;
      prompt = `
The student asks you a question regarding their research on Camarosporomyces flavigenus on walnut kernels:
Question: "${userMessage}"

The student's currently entered project data:
${JSON.stringify(currentData, null, 2)}

Recent Conversation Context:
${JSON.stringify(history.slice(-4), null, 2)}

Provide a direct, deeply knowledgeable, supportive, and scientifically rigorous answer.
Respond in ${language === 'fa' ? 'Persian' : 'English'}.
`;
    } else {
      prompt = `Provide expert plant pathology guidance on Camarosporomyces flavigenus on walnut kernels for: ${JSON.stringify(payload)}`;
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
۲. **ویژگی‌های تشخیصی:** رنگ قهوه‌ای کم‌رنگ، دیواره صاف تا کمی زگیل‌دار، انطباق کامل با مشخصات سرده *Camarosporomyces*.
۳. **متن پیشنهادی برای نتایج مقاله:**
"Microscopic observation of the fungal isolate revealed pale brown, muriform to transversely septate conidia with smooth to verruculose walls, characteristic of Camarosporomyces flavigenus."`;
  }

  if (action === 'audit_rigor') {
    return `### بررسی صحت علمی داده‌های وارد شده
- وضعیت داده‌های مولکولی: لطفاً توالی‌های دو ژن LSU و tub2 را در فرم وارد نمایید.
- وضعیت داده‌های ریخت‌شناختی: ابعاد کنیدی‌ها و مشخصات پرگنه را تکمیل کنید.
- تصاویر آزمایشگاهی: برای افزایش اعتبار مقاله، اسکن درخت تبارشناسی و عکس‌های میکروسکوپی را آپلود نمایید.`;
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
