import { useState, useRef } from "react";
import { Monitor, Smartphone, RefreshCw, Download, ExternalLink, LayoutTemplate, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "@/hooks/use-api";

interface PreviewPanelProps {
  projectId: string | null;
  statusMessage: string | null;
}

export function PreviewPanel({ projectId, statusMessage }: PreviewPanelProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [key, setKey] = useState(0);

  const { data: project, isLoading } = useProject(projectId);

  const handleExport = () => {
    if (projectId) window.location.href = `/api/export/${projectId}`;
  };

  const isGenerating = !!statusMessage;
  const hasPreview = !!project?.html;

  if (!projectId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-black/20">
        <div className="w-20 h-20 mb-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
          <LayoutTemplate className="w-9 h-9 text-white/15" />
        </div>
        <h2 className="text-base font-semibold text-white/40 mb-1.5">Live Preview</h2>
        <p className="text-sm text-white/20 max-w-xs leading-relaxed">
          Upload a design image to convert it into a working webpage.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black/30 relative">
      {/* Toolbar */}
      <div className="h-12 border-b border-white/[0.06] flex items-center justify-between px-3 glass shrink-0 z-10">
        <div className="flex items-center gap-1 p-1 bg-black/30 rounded-lg border border-white/[0.05]">
          <button
            onClick={() => setViewport("desktop")}
            className={clsx(
              "px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
              viewport === "desktop" ? "bg-white/10 text-white" : "text-white/35 hover:text-white/70"
            )}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={clsx(
              "px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
              viewport === "mobile" ? "bg-white/10 text-white" : "text-white/35 hover:text-white/70"
            )}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </button>
        </div>

        {project?.description && (
          <span className="hidden md:block text-xs text-primary/70 bg-primary/10 border border-primary/15 px-2.5 py-1 rounded-full max-w-[220px] truncate">
            {project.description}
          </span>
        )}

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setKey((k) => k + 1)}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.07] transition-colors"
            title="Reload preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <a
            href={`/preview/${projectId}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.07] transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <div className="w-px h-5 bg-white/[0.07] mx-0.5" />
          <button
            onClick={handleExport}
            disabled={!hasPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all shadow-md shadow-primary/20"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-[#0c0c0e]">
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">{statusMessage}</p>
                  <p className="text-xs text-white/40 mt-1">This may take 10–30 seconds</p>
                </div>
                <div className="flex gap-1.5 mt-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-primary/60"
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex items-center gap-2 text-white/30 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
          </div>
        ) : hasPreview ? (
          <div
            className={clsx(
              "h-full transition-all duration-500 ease-in-out overflow-hidden",
              viewport === "mobile" ? "w-[390px] shadow-2xl shadow-black/60 my-4 rounded-xl border border-white/10" : "w-full"
            )}
          >
            <iframe
              key={key}
              src={`/preview/${projectId}`}
              className="w-full h-full border-0 bg-white"
              title="Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-white/25 text-sm">
            <LayoutTemplate className="w-8 h-8" />
            <span>No preview yet — upload and convert a design</span>
          </div>
        )}
      </div>
    </div>
  );
}
