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
    const errText = await response.text();
    throw new Error(`AI Provider Error: ${response.status} ${errText}`);
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
