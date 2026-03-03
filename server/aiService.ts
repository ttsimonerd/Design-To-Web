interface ConvertOptions {
  imageBase64: string;
  mimeType: string;
  provider: string;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export async function convertDesign(opts: ConvertOptions) {
  const systemPrompt = `You are an expert frontend developer. Analyze this design image and convert it to a complete, responsive webpage.
Return ONLY valid JSON in this exact format:
{
  "html": "<complete HTML string (just body content or full html)>",
  "css": "<complete CSS string>",
  "js": "<complete JavaScript string or empty string>",
  "description": "<brief description of what was detected in the design>",
  "components": ["list", "of", "detected", "components"]
}

Rules for the generated code:
- HTML must be complete (<!DOCTYPE html> ... </html>)
- CSS must be modern, responsive (mobile-first), use flexbox/grid
- Match colors, fonts, spacing as closely as possible to the design
- Use semantic HTML5 elements
- Include smooth hover effects
- The page must work standalone (no external dependencies unless CDN links included inline)
- JavaScript only if interactive elements are detected (sliders, modals, tabs, etc.)`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  let endpoint = "";
  let payload: any = {};

  if (opts.provider === "openai" || opts.provider === "openrouter" || opts.provider === "groq") {
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
    const errText = await response.text();
    throw new Error(`AI Provider Error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  
  let jsonString = "";
  if (opts.provider === "ollama") {
    jsonString = data.message.content;
  } else {
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
    console.error("Failed to parse JSON:", jsonString);
    throw new Error("AI did not return valid JSON.");
  }
}
