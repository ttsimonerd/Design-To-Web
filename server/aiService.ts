interface ConvertOptions {
  imageBase64: string;
  mimeType: string;
  provider: string;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export async function convertDesign(opts: ConvertOptions) {
  const systemPrompt = `You are a senior frontend engineer specializing in pixel-perfect design implementation. Your task is to analyze the provided design image and produce a complete, production-quality webpage that faithfully reproduces it.

Return ONLY a single valid JSON object — no markdown, no explanation, no code fences. Use this exact structure:
{
  "html": "<full HTML document as a string>",
  "css": "<full CSS as a string>",
  "js": "<JavaScript as a string, or empty string if none needed>",
  "description": "<one sentence describing the page>",
  "components": ["navbar", "hero", "cards", "footer"]
}

DESIGN ANALYSIS — before coding, observe:
- Color palette: exact hex values from the design
- Typography: font sizes, weights, line heights, letter spacing
- Spacing rhythm: padding, margin, gap between elements
- Layout structure: grid/flex structure, column counts, alignment
- Interactive elements: buttons, forms, tabs, accordions, modals, sliders

HTML RULES:
- Full document: <!DOCTYPE html><html lang="en"><head>...</head><body>...</body></html>
- Use semantic elements: <header>, <nav>, <main>, <section>, <article>, <footer>
- Every section must have appropriate ARIA labels
- Link Google Fonts inline in <head> if custom fonts are needed
- Include <meta charset="UTF-8">, <meta name="viewport" content="width=device-width, initial-scale=1.0">

CSS RULES:
- CSS custom properties (variables) for all colors, fonts, spacing at :root
- Mobile-first responsive design with breakpoints at 640px, 768px, 1024px, 1280px
- Use CSS Grid for two-dimensional layouts, Flexbox for one-dimensional
- Smooth transitions on all interactive states: hover, focus, active
- Box shadows, border-radius, and gradients must match the design
- No external CSS frameworks — write all styles from scratch
- Use rem units for typography, px for borders/shadows, % or fr for layout widths
- Include @media (prefers-reduced-motion: reduce) for animations

JS RULES (only when interactive elements are present):
- Vanilla JavaScript only — no libraries or frameworks
- Event delegation where applicable
- Handle: mobile nav toggles, modals, tabs, carousels, accordions, smooth scroll, form validation
- All JS must be wrapped in DOMContentLoaded

QUALITY REQUIREMENTS:
- The output must be visually indistinguishable from the design at first glance
- All text from the design must be reproduced exactly
- All colors must match — use the exact hex values you observe
- Spacing and layout proportions must match the design
- The page must be fully functional and standalone (no broken links to external assets)`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  let endpoint = "";
  let payload: any = {};

  if (opts.provider === "openai" || opts.provider === "openrouter" || opts.provider === "groq" || opts.provider === "grok" || opts.provider === "nvidia") {
    if (opts.provider === "openai") {
      endpoint = "https://api.openai.com/v1/chat/completions";
      headers["Authorization"] = `Bearer ${opts.apiKey}`;
    } else if (opts.provider === "openrouter") {
      endpoint = "https://openrouter.ai/api/v1/chat/completions";
      headers["Authorization"] = `Bearer ${opts.apiKey}`;
      headers["HTTP-Referer"] = "http://localhost:3000";
      headers["X-Title"] = "DesignToWeb";
    } else if (opts.provider === "groq") {
      endpoint = "https://api.groq.com/openai/v1/chat/completions";
      headers["Authorization"] = `Bearer ${opts.apiKey}`;
    } else if (opts.provider === "grok") {
      endpoint = "https://api.x.ai/v1/chat/completions";
      headers["Authorization"] = `Bearer ${opts.apiKey}`;
    } else if (opts.provider === "nvidia") {
      endpoint = "https://integrate.api.nvidia.com/v1/chat/completions";
      headers["Authorization"] = `Bearer ${opts.apiKey}`;
    }

    payload = {
      model: opts.model || "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Convert this design to HTML/CSS/JS." },
            { type: "image_url", image_url: { url: `data:${opts.mimeType};base64,${opts.imageBase64}` } }
          ]
        }
      ]
    };
  } else if (opts.provider === "anthropic") {
    endpoint = "https://api.anthropic.com/v1/messages";
    headers["x-api-key"] = opts.apiKey || "";
    headers["anthropic-version"] = "2023-06-01";
    payload = {
      model: opts.model || "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: opts.mimeType,
                data: opts.imageBase64
              }
            },
            { type: "text", text: "Convert this design to HTML/CSS/JS. Return JSON only." }
          ]
        }
      ]
    };
  } else if (opts.provider === "ollama") {
    endpoint = `${opts.baseUrl || "http://localhost:11434"}/api/chat`;
    payload = {
      model: opts.model || "llava",
      format: "json",
      stream: false,
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: "Convert this design to HTML/CSS/JS.",
          images: [opts.imageBase64]
        }
      ]
    };
  } else {
    throw new Error(`Provider ${opts.provider} is not fully implemented in this MVP.`);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => null);
    const errMessage = errBody?.error?.message || "";

    if (response.status === 401 || errBody?.error?.type === "authentication_error") {
      throw new Error("Invalid or missing API key. Please check your provider settings.");
    }
    if (errMessage.includes("credit balance") || errMessage.includes("quota") || errMessage.includes("billing")) {
      throw new Error("Your AI provider account has insufficient credits. Please add credits to your account and try again.");
    }
    if (response.status === 429) {
      throw new Error("Too many requests. Please wait a moment and try again.");
    }
    if (response.status === 400 && errMessage.includes("image")) {
      throw new Error("This image format is not supported by the selected AI provider. Please use PNG, JPG, or WebP.");
    }

    const fallback = errMessage || `Request failed with status ${response.status}`;
    throw new Error(fallback);
  }

  const data = await response.json();
  
  let jsonString = "";
  if (opts.provider === "ollama") {
    jsonString = data.message.content;
  } else if (opts.provider === "anthropic") {
    jsonString = data.content[0].text;
  } else {
    // OpenAI-compatible providers (OpenAI, OpenRouter, Groq, Grok, Nvidia)
    jsonString = data.choices[0].message.content;
  }

  try {
    // Attempt to extract JSON if the model wrapped it in markdown
    if (jsonString.startsWith("\`\`\`json")) {
      jsonString = jsonString.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "");
    }
    
    const parsed = JSON.parse(jsonString);
    return {
      html: parsed.html || "",
      css: parsed.css || "",
      js: parsed.js || "",
      description: parsed.description || "",
      components: parsed.components || []
    };
  } catch (e) {
    // Fallback: try to find anything that looks like JSON if the model was talkative
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          html: parsed.html || "",
          css: parsed.css || "",
          js: parsed.js || "",
          description: parsed.description || "",
          components: parsed.components || []
        };
      } catch (innerE) {}
    }
    console.error("Failed to parse JSON:", jsonString);
    throw new Error("AI did not return valid JSON.");
  }
}
