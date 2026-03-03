import { useState, useEffect } from "react";
import { X, Settings2, Key, Server, Cpu, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/hooks/use-settings";

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    if (isOpen) setLocalSettings(settings);
  }, [isOpen, settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
          >
            <div className="glass-panel rounded-2xl p-8 shadow-2xl shadow-primary/10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/20 text-primary">
                    <Settings2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Configuration</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                    <Server className="w-4 h-4" /> Provider
                  </label>
                  <select
                    value={localSettings.provider}
                    onChange={(e) => setLocalSettings({ ...localSettings, provider: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-3 appearance-none cursor-pointer"
                  >
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="openai">OpenAI</option>
                    <option value="custom">Custom / Local API</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> Model
                  </label>
                  <input
                    type="text"
                    value={localSettings.model}
                    onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-3"
                    placeholder="e.g., claude-3-5-sonnet-20241022"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                    <Key className="w-4 h-4" /> API Key
                  </label>
                  <input
                    type="password"
                    value={localSettings.apiKey}
                    onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-3"
                    placeholder="Enter your API key (stored locally)"
                  />
                </div>

                {localSettings.provider === "custom" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                      <Database className="w-4 h-4" /> Base URL
                    </label>
                    <input
                      type="text"
                      value={localSettings.baseUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, baseUrl: e.target.value })}
                      className="w-full glass-input rounded-xl px-4 py-3"
                      placeholder="e.g., http://localhost:11434/v1"
                    />
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-[0_0_20px_-5px_var(--tw-gradient-from)] hover:shadow-[0_0_30px_-5px_var(--tw-gradient-from)] transition-all hover:-translate-y-0.5"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
