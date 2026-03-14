import { useState, useEffect } from "react";
import { X, Settings2, Key, Server, Cpu, Database, ChevronDown, ExternalLink, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/hooks/use-settings";

const PROVIDER_CONFIGS: Record<string, { label: string; defaultModel: string; models: string[]; docsUrl: string; hint: string }> = {
  anthropic: {
    label: "Anthropic (Claude)",
    defaultModel: "claude-3-5-sonnet-20241022",
    models: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
    docsUrl: "https://console.anthropic.com/",
    hint: "Best quality. Requires an Anthropic API key with vision access.",
  },
  openai: {
    label: "OpenAI",
    defaultModel: "gpt-4o",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
    docsUrl: "https://platform.openai.com/api-keys",
    hint: "Great quality. Requires an OpenAI API key.",
  },
  openrouter: {
    label: "OpenRouter",
    defaultModel: "anthropic/claude-3.5-sonnet",
    models: ["anthropic/claude-3.5-sonnet", "openai/gpt-4o", "google/gemini-pro-vision", "meta-llama/llama-3.2-90b-vision-instruct"],
    docsUrl: "https://openrouter.ai/keys",
    hint: "Access many models through a single API key.",
  },
  grok: {
    label: "xAI Grok",
    defaultModel: "grok-2-vision-1212",
    models: ["grok-2-vision-1212"],
    docsUrl: "https://console.x.ai/",
    hint: "Requires an xAI API key.",
  },
  groq: {
    label: "Groq",
    defaultModel: "llava-v1.5-7b-4096-preview",
    models: ["llava-v1.5-7b-4096-preview"],
    docsUrl: "https://console.groq.com/keys",
    hint: "Very fast inference. Requires a Groq API key.",
  },
  nvidia: {
    label: "Nvidia NIM",
    defaultModel: "nvidia/llama-3.2-90b-vision-instruct",
    models: ["nvidia/llama-3.2-90b-vision-instruct"],
    docsUrl: "https://build.nvidia.com/",
    hint: "Requires an Nvidia NIM API key.",
  },
  ollama: {
    label: "Ollama (Local)",
    defaultModel: "llava",
    models: ["llava", "llama3.2-vision", "bakllava"],
    docsUrl: "https://ollama.com/",
    hint: "Run AI locally — no API key needed. Set the base URL below.",
  },
  custom: {
    label: "Custom / OpenAI-compatible",
    defaultModel: "",
    models: [],
    docsUrl: "",
    hint: "Any OpenAI-compatible endpoint. Set the base URL and model manually.",
  },
};

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setSaved(false);
    }
  }, [isOpen, settings]);

  const handleProviderChange = (provider: string) => {
    const config = PROVIDER_CONFIGS[provider];
    setLocalSettings((prev) => ({
      ...prev,
      provider,
      model: config?.defaultModel || "",
    }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => {
      onClose();
      setSaved(false);
    }, 700);
  };

  const currentConfig = PROVIDER_CONFIGS[localSettings.provider] || PROVIDER_CONFIGS.custom;
  const needsBaseUrl = localSettings.provider === "ollama" || localSettings.provider === "custom";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
          >
            <div className="w-full max-w-lg pointer-events-auto">
              <div className="glass-panel rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">

                {/* Header */}
                <div className="px-7 pt-6 pb-5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/20 text-primary">
                      <Settings2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white leading-none">AI Configuration</h2>
                      <p className="text-xs text-white/35 mt-1">Stored locally — never sent to our servers</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-7 py-6 space-y-5">

                  {/* Provider */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5" /> Provider
                    </label>
                    <div className="relative">
                      <select
                        value={localSettings.provider}
                        onChange={(e) => handleProviderChange(e.target.value)}
                        className="w-full glass-input rounded-xl px-4 py-3 pr-10 appearance-none cursor-pointer text-sm font-medium"
                      >
                        {Object.entries(PROVIDER_CONFIGS).map(([key, cfg]) => (
                          <option key={key} value={key} className="bg-zinc-900">{cfg.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    </div>
                    {currentConfig.hint && (
                      <p className="text-xs text-white/35 leading-relaxed pl-0.5">
                        {currentConfig.hint}{" "}
                        {currentConfig.docsUrl && (
                          <a
                            href={currentConfig.docsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-0.5 text-primary/70 hover:text-primary transition-colors"
                          >
                            Get API key <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Model */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" /> Model
                    </label>
                    {currentConfig.models.length > 0 ? (
                      <div className="relative">
                        <select
                          value={localSettings.model}
                          onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
                          className="w-full glass-input rounded-xl px-4 py-3 pr-10 appearance-none cursor-pointer text-sm font-medium"
                        >
                          {currentConfig.models.map((m) => (
                            <option key={m} value={m} className="bg-zinc-900">{m}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={localSettings.model}
                        onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
                        className="w-full glass-input rounded-xl px-4 py-3 text-sm"
                        placeholder="e.g., gpt-4o"
                      />
                    )}
                  </div>

                  {/* API Key */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" /> API Key
                      {localSettings.provider === "ollama" && (
                        <span className="normal-case font-normal text-white/25">(not required)</span>
                      )}
                    </label>
                    <input
                      type="password"
                      value={localSettings.apiKey}
                      onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                      className="w-full glass-input rounded-xl px-4 py-3 text-sm"
                      placeholder={localSettings.provider === "ollama" ? "Leave empty for local Ollama" : "Paste your API key here"}
                    />
                  </div>

                  {/* Base URL */}
                  {needsBaseUrl && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5" /> Base URL
                      </label>
                      <input
                        type="text"
                        value={localSettings.baseUrl}
                        onChange={(e) => setLocalSettings({ ...localSettings, baseUrl: e.target.value })}
                        className="w-full glass-input rounded-xl px-4 py-3 text-sm"
                        placeholder={localSettings.provider === "ollama" ? "http://localhost:11434" : "https://your-api.com/v1"}
                      />
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-7 pb-6 flex items-center justify-between gap-3 border-t border-white/5 pt-5">
                  <p className="text-xs text-white/25">Changes apply on the next conversion</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                    >
                      {saved ? (
                        <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                      ) : (
                        "Save Settings"
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
