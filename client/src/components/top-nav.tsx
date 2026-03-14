import { useState } from "react";
import { Settings, Sparkles, AlertTriangle, Zap } from "lucide-react";
import { SettingsModal } from "./settings-modal";
import { useSettings } from "@/hooks/use-settings";

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: "Claude",
  openai: "OpenAI",
  openrouter: "OpenRouter",
  grok: "Grok",
  groq: "Groq",
  nvidia: "Nvidia",
  ollama: "Ollama",
  custom: "Custom",
};

export function TopNav() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { settings } = useSettings();

  const isConfigured = !!settings.apiKey || settings.provider === "ollama";
  const providerLabel = PROVIDER_LABELS[settings.provider] || settings.provider;
  const shortModel = settings.model.split("/").pop() || settings.model;

  return (
    <>
      <header className="h-14 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl flex items-center justify-between px-5 z-10 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">
            Design<span className="text-white/40 font-normal">ToWeb</span>
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          {/* Warning if not configured */}
          {!isConfigured && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              No API key set
            </div>
          )}

          {/* Active provider chip */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/[0.06] hover:border-white/10 transition-colors group"
          >
            <Zap className={`w-3.5 h-3.5 ${isConfigured ? "text-primary" : "text-white/30"}`} />
            <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors">
              {providerLabel}
            </span>
            <span className="text-white/20 text-xs">•</span>
            <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors max-w-[120px] truncate">
              {shortModel}
            </span>
          </button>

          {/* Settings button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            data-testid="button-settings"
            className="w-8 h-8 rounded-full glass-button flex items-center justify-center group"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-white/50 group-hover:text-white group-hover:rotate-45 transition-all duration-300" />
          </button>
        </div>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
