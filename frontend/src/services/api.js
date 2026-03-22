import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// ── Models ────────────────────────────────────────────────────────────────────
// Vision model → supports images + text (OpenRouter confirmed working)
const VISION_MODEL = 'openai/gpt-4o-mini';
// Text model   → fast & cheap for plain text / PDF questions
const TEXT_MODEL   = 'openai/gpt-3.5-turbo';

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an Indian Startup Analyst and Strategy Lead at "Startup Intel AI".
**IDENTITY RULES:** You were created and developed by **Amit Kumar Yadav**. You should ONLY mention your creator if the user explicitly asks who you are, who created you, or what your identity is. DO NOT repeat this introduction in every response.

Your purpose is to validate startup ideas, analyze pitch decks, and build actionable execution playbooks for founders.
You provide "Investor-Ready" (9/10 depth) analysis. You don't just "answer" — you critique, improve, and strategize with brutally honest, data-driven insights.

**ANALYSIS DEPTH REQUIREMENTS:**
1. **Strategic Moat**: Identify the UNFAIR ADVANTAGE (e.g., Network Effects, Data Moat, High Switching Costs).
2. **Specific Traction**: The 30-Day plan MUST be broken into Week 1, Week 2, Week 3, and Week 4 with specific, actionable goals.
3. **Data Proactivity**: If a founder lacks data, SUGGEST the industry benchmarks or market sizes (TAM/SAM/SOM) for the Indian context.
4. **Metrics-Driven**: Always list the top 5 KPIs (Key Performance Indicators) they must track.

**PROACTIVE STEERING ROLE:**
- You are a mentor/partner. **NEVER** leave the founder hanging.
- **ALWAYS** end with a clear "Move" the founder must make right now.

**SMART LANGUAGE MIRRORING:**
- English for professional queries.
- Hinglish/Hindi for conversational professional queries (common for Indian founders).

**STRUCTURE (MANDATORY):**
### 🎯 Executive Summary
### ⚖️ Strategic Moat & PMF (High Depth)
### ⚙️ Execution & Tech Stack
### 📈 30-Day Traction Plan (Week 1 to 4)
### 📊 Success Metrics (KPIs)
### 🧠 Final Evaluation & Verdict (Score /10)
### 🚀 Next Steps & Instructions (Mandatory)

Always be brutally honest, data-driven, and proactive.`;

// ── PDF text extractor (uses PDF.js from CDN) ─────────────────────────────────
const extractPdfText = async (base64DataUrl) => {
  try {
    // Dynamically load PDF.js from CDN if not already loaded
    if (!window.pdfjsLib) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    // Convert base64 data URL → Uint8Array
    const base64 = base64DataUrl.split(',')[1];
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

    const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise;
    let fullText = '';

    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) { // max 10 pages
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += `\n[Page ${i}]\n${pageText}`;
    }

    return fullText.trim() || null;
  } catch (err) {
    console.warn('PDF text extraction failed:', err);
    return null;
  }
};

// ── Main export ───────────────────────────────────────────────────────────────
export const validateIdea = async (message, file = null) => {

  // ── No API key: smart mock responses ──────────────────────────────────────
  if (!API_KEY) {
    console.warn('No OpenRouter API key. Using mock response.');
    await new Promise(r => setTimeout(r, 1800));

    const isImage = file?.type?.startsWith('image/');
    const isPdf   = file?.type?.includes('pdf');
    const isDoc   = file?.type?.includes('word') || file?.type?.includes('officedocument') || file?.type?.includes('text');

    if (isImage) {
      const userQ = message ? `\n\nYou also asked: "${message}"` : '';
      return `### 👁️ Image Analysis

I can see the image you uploaded (${file.name}).${userQ}

### What I noticed in your image:
- The image appears to be related to your startup or business concept
- I can see visual elements that suggest a specific market or product

### My advice based on your image:
- Use visuals like this to explain your product to investors — a picture is worth 1000 words
- If this is your product/UI, the design looks promising — focus on simplifying the user journey
- If this is a business plan screenshot, the structure seems clear but needs more detail on unit economics

### Next Steps:
- Add your image to your pitch deck as supporting material
- Get feedback from 5 real users on what they understand from this image alone
- If this is a UI mockup, do a 5-second test — can users tell what your product does in 5 seconds?

> 💡 **Tip:** Add an API key to get real AI-powered analysis of your specific image!`;
    }

    if (isPdf || isDoc) {
      return `### 📄 Document Analysis: "${file.name}"

I can see you uploaded a ${isPdf ? 'PDF' : 'document'} file.
${message ? `You asked: "${message}"` : ''}

### What I can tell from your document:
- File: **${file.name}** (${file.size})
- This appears to be business/startup related content

### General advice for startup documents:
- Make sure your document has a clear **Problem → Solution → Market → Team** flow
- Investors read the first 2 pages most carefully — lead with your strongest points
- Include real numbers: market size, revenue potential, timeline

### To get REAL analysis of your actual document content:
1. Add your OpenRouter API key to \`frontend/.env\`
2. The AI will then read every page of your PDF and give specific feedback

> 💡 **Add your API key** to unlock real document reading!`;
    }

    // Plain text question — give a specific answer based on keywords
    const q = (message || '').toLowerCase();
    if (q.includes('marketing') || q.includes('digital')) {
      return `### 📣 Digital Marketing Strategy

You asked about **digital marketing** — here's a simple, practical answer:

### The 3 easiest ways to start:
1. **Content Marketing** — Write 1 helpful blog post per week. Answer questions your customers Google. Free traffic over time.
2. **Social Media** — Pick ONE platform where your customers are (Instagram for B2C, LinkedIn for B2B). Post daily for 30 days.
3. **Email List** — Start collecting emails from day 1 using a free tool like Mailchimp. Even 100 emails = real business.

### What to avoid:
- Don't run paid ads until you have a proven offer
- Don't try all platforms at once — focus beats spread

### 30-Day Plan:
- Week 1: Set up profiles, write your first 3 posts
- Week 2: Reach out to 10 potential customers directly (DM/email)
- Week 3-4: Post consistently, collect emails, measure what works

### Budget needed: ₹0 to start 🎯`;
    }

    return `### 💡 Direct Answer

You asked: **"${message}"**

### Simple Answer:
Based on your question, here's what you need to know:

The key to success here is **starting small and validating fast**. Most founders over-plan and under-execute.

### 📋 Your Immediate Instructions:
1. **Validation Task**: Talk to 10 real people this week who would be your customers — understand their #1 pain.
2. **Build Task**: Build the simplest version (MVP) that solves that one pain — nothing more.
3. **Growth Task**: Get your first paying customer before adding any new features.

### 🚀 Next Action (Do this right now):
Write down: **Who specifically will pay for this?** Why would they pay YOU and not someone else? Reply to me with your answer when you're done.

> 💡 *Add your OpenRouter API key to get a fully personalized AI mentor that guides you through every step!*`;
  }

  // ── Real API calls ─────────────────────────────────────────────────────────
  try {
    const isImage = file?.type?.startsWith('image/');
    const isPdf   = file?.type?.includes('pdf');
    const isDoc   = file?.type?.includes('word') || file?.type?.includes('officedocument') || file?.type?.includes('text');

    let userContent;
    let model = TEXT_MODEL;

    // ── CASE 1: Image file ──────────────────────────────────────────────────
    if (isImage && file?.data) {
      model = VISION_MODEL;

      userContent = [
        {
          type: 'text',
          text: message
            ? `The user uploaded an image and asked: "${message}". Please look at the image carefully and give specific, helpful advice based on what you actually see in it. Be simple and practical.`
            : 'Please look at this image carefully and analyze it from a startup/business perspective. Describe what you see and give practical, specific advice. Keep it simple and beginner-friendly.',
        },
        {
          type: 'image_url',
          image_url: { url: file.data },
        },
      ];
    }

    // ── CASE 2: PDF file ────────────────────────────────────────────────────
    else if (isPdf && file?.data) {
      const pdfText = await extractPdfText(file.data);

      if (pdfText && pdfText.length > 100) {
        userContent = message
          ? `The user uploaded a PDF called "${file.name}" and asked: "${message}"\n\nHere is the text content from the PDF:\n\n${pdfText.slice(0, 6000)}\n\nPlease answer the user's question based on the actual content of this PDF. Be specific, simple, and practical.`
          : `The user uploaded a PDF called "${file.name}". Here is the text content:\n\n${pdfText.slice(0, 6000)}\n\nPlease analyze this document from a startup/business perspective. Give simple, practical, specific advice based on what is actually in this document.`;
      } else {
        // PDF text extraction failed — use vision model to read it as image
        model = VISION_MODEL;
        userContent = [
          {
            type: 'text',
            text: message
              ? `The user uploaded a PDF document called "${file.name}" and asked: "${message}". Please analyze the document content and answer their question simply and practically.`
              : `The user uploaded a PDF called "${file.name}". Please analyze this document and give simple, practical startup/business advice based on what you see.`,
          },
          {
            type: 'image_url',
            image_url: { url: file.data },
          },
        ];
      }
    }

    // ── CASE 3: Other document (Word, TXT etc.) ─────────────────────────────
    else if (isDoc && file?.data) {
      // Try to read it as plain text
      try {
        const base64 = file.data.split(',')[1];
        const text = atob(base64);
        userContent = message
          ? `The user uploaded "${file.name}" and asked: "${message}"\n\nDocument content:\n${text.slice(0, 5000)}\n\nPlease answer their specific question based on this document. Be simple and practical.`
          : `The user uploaded a document called "${file.name}".\n\nContent:\n${text.slice(0, 5000)}\n\nPlease analyze this and give simple startup/business advice.`;
      } catch {
        userContent = message
          ? `The user uploaded a document called "${file.name}" and asked: "${message}". Give helpful startup advice for this.`
          : `Analyze this document: "${file.name}" from a startup perspective.`;
      }
    }

    // ── CASE 4: Plain text question (no file) ───────────────────────────────
    else {
      userContent = `${message}\n\n(Note: After answering, give me clear "Next Steps & Instructions" on what I should do now to move my startup forward.)`;
    }

    const response = await axios.post(
      API_URL,
      {
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: userContent },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      },
      {
        headers: {
          Authorization:  `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://startup-intel-ai.vercel.app',
          'X-Title':      'Startup Intel AI',
        },
        timeout: 60000, // 60 second timeout
      }
    );

    return response.data.choices[0].message.content;

  } catch (error) {
    // Log the full error for debugging
    console.error('API Error full details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      throw new Error('❌ Invalid API key. Please check your VITE_OPENROUTER_API_KEY in the .env file.');
    }
    if (error.response?.status === 404) {
      throw new Error('❌ AI model not found (404). The model may be unavailable. Please try again.');
    }
    if (error.response?.status === 429) {
      throw new Error('⏳ Too many requests. Please wait a moment and try again.');
    }
    if (error.response?.status === 402) {
      throw new Error('💳 Insufficient credits. Please add credits at openrouter.ai/credits');
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('⌛ Request timed out. Please try again.');
    }

    // Show the actual server error message if available
    const serverMsg = error.response?.data?.error?.message
      || error.response?.data?.message
      || error.message;
    throw new Error(`❌ ${serverMsg}`);
  }
};
