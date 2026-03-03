import { useState, useRef } from "react";
import { Monitor, Smartphone, RefreshCw, Download, ExternalLink, Maximize2, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useProject } from "@/hooks/use-api";

interface PreviewPanelProps {
  projectId: string | null;
  statusMessage: string | null;
}

export function PreviewPanel({ projectId, statusMessage }: PreviewPanelProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [key, setKey] = useState(0); // For forcing iframe reload
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const { data: project, isLoading } = useProject(projectId);

  const handleExport = () => {
    if (projectId) {
      window.location.href = `/api/export/${projectId}`;
    }
  };

  const handleReload = () => {
    setKey(prev => prev + 1);
  };

  if (!projectId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/30 p-8 text-center bg-black/20">
        <div className="w-24 h-24 mb-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
          <Maximize2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-semibold text-white/50 mb-2">Live Preview</h2>
        <p className="max-w-xs">Select or upload a design to see the magic happen in real-time.</p>
      </div>
    );
  }

  const isGenerating = !!statusMessage || (projectId && !project && !isLoading);

  return (
    <div className="h-full flex flex-col bg-black/40 relative">
      {/* Toolbar */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 glass shrink-0 z-10">
        <div className="flex items-center gap-1 p-1 bg-black/40 rounded-lg border border-white/5">
          <button
            onClick={() => setViewport("desktop")}
            className={clsx(
              "p-1.5 rounded-md transition-all flex items-center gap-2 text-sm",
              viewport === "desktop" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/80"
            )}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={clsx(
              "p-1.5 rounded-md transition-all flex items-center gap-2 text-sm",
              viewport === "mobile" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/80"
            )}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {project?.description && (
            <span className="text-xs font-mono text-primary/80 bg-primary/10 px-2 py-1 rounded border border-primary/20 max-w-[200px] truncate hidden md:block">
              {project.description}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleReload}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title="Reload Preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href={`/preview/${projectId}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-colors shadow-lg shadow-primary/25"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-hidden relative flex justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')]">
        
        {isGenerating ? (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-panel p-8 rounded-2xl flex flex-col items-center border border-primary/20 shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)]"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Generating Design...</h3>
              <p className="text-white/60 font-mono text-sm animate-pulse">
                {statusMessage || "Analyzing layout and styles"}
              </p>
            </motion.div>
          </div>
        ) : (
          <motion.div 
            key={viewport}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={clsx(
              "h-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl overflow-hidden bg-white",
              viewport === "mobile" 
                ? "w-[375px] my-8 rounded-[2.5rem] border-[8px] border-black ring-1 ring-white/10 max-h-[812px]" 
                : "w-full rounded-tl-lg border-l border-t border-white/10"
            )}
          >
            {/* The actual iframe pointing to the preview endpoint */}
            <iframe
              key={key}
              ref={iframeRef}
              src={`/preview/${projectId}`}
              className="w-full h-full border-none bg-white"
              title="Design Preview"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
