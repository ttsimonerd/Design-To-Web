import { useState, useEffect } from "react";

export interface AppSettings {
  provider: string;
  apiKey: string;
  model: string;
  baseUrl: string;
}

const defaultSettings: AppSettings = {
  provider: "anthropic",
  apiKey: "",
  model: "claude-3-5-sonnet-20241022",
  baseUrl: "",
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem("design-converter-settings");
      return stored ? JSON.parse(stored) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem("design-converter-settings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return { settings, updateSettings };
}
