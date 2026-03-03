import { useState } from "react";
import { Settings, Sparkles, Code2, ShieldAlert } from "lucide-react";
import { SettingsModal } from "./settings-modal";
import { useSettings } from "@/hooks/use-settings";

export function TopNav() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { settings } = useSettings();

  const isConfigured = !!settings.apiKey;

  return (
    <>
      <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-lg flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Design<span className="font-light text-white/60">ToWeb</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isConfigured && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
              <ShieldAlert className="w-4 h-4" />
              API Key Required
            </div>
          )}
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/5">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-white/80 capitalize">
              {settings.provider} <span className="opacity-50 mx-1">•</span> {settings.model}
            </span>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 rounded-full glass-button flex items-center justify-center group"
          >
            <Settings className="w-5 h-5 text-white/70 group-hover:text-white group-hover:rotate-45 transition-all duration-300" />
          </button>
        </div>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
