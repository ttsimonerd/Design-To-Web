import { useState, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { TopNav } from "@/components/top-nav";
import { FileUpload } from "@/components/file-upload";
import { ProjectList } from "@/components/project-list";
import { PreviewPanel } from "@/components/preview-panel";
import { ChatPanel } from "@/components/chat-panel";
import { useUpload, useConvert } from "@/hooks/use-api";
import { useDesignWebSocket } from "@/hooks/use-websocket";
import { GripVertical } from "lucide-react";

export default function Dashboard() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  
  const uploadMutation = useUpload();
  const convertMutation = useConvert();
  
  const { statusMessage, previewReadyId, clearReadyState } = useDesignWebSocket();

  // Handle successful upload -> auto trigger conversion
  const handleUpload = async (file: File) => {
    try {
      const result = await uploadMutation.mutateAsync(file);
      setActiveProjectId(result.id);
      // Immediately trigger conversion
      convertMutation.mutate(result.id);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  // Listen for WebSocket completion
  useEffect(() => {
    if (previewReadyId) {
      if (previewReadyId === activeProjectId) {
        // Just trigger a re-render or state update if needed, 
        // the PreviewPanel will reload the iframe since the project is ready
      } else {
        setActiveProjectId(previewReadyId);
      }
      clearReadyState();
    }
  }, [previewReadyId, activeProjectId, clearReadyState]);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      <TopNav />
      
      <div className="flex-1 h-[calc(100vh-64px)] overflow-hidden">
        <PanelGroup direction="horizontal">
          
          {/* Left Panel: Upload & History */}
          <Panel defaultSize={20} minSize={15} maxSize={30} className="flex flex-col">
            <div className="h-full overflow-y-auto p-4 custom-scrollbar">
              <FileUpload 
                onUpload={handleUpload} 
                isUploading={uploadMutation.isPending} 
              />
              <div className="mt-8 border-t border-white/5 pt-4">
                <ProjectList 
                  activeId={activeProjectId} 
                  onSelect={setActiveProjectId} 
                />
              </div>
            </div>
          </Panel>

          <ResizeHandle />

          {/* Center Panel: Live Preview */}
          <Panel defaultSize={55} minSize={30}>
            <PreviewPanel 
              projectId={activeProjectId} 
              statusMessage={statusMessage} 
            />
          </Panel>

          <ResizeHandle />

          {/* Right Panel: Chat Assistant */}
          <Panel defaultSize={25} minSize={20} maxSize={40}>
            <ChatPanel projectId={activeProjectId} />
          </Panel>

        </PanelGroup>
      </div>
    </div>
  );
}

function ResizeHandle() {
  return (
    <PanelResizeHandle className="w-1.5 hover:w-2 bg-transparent hover:bg-primary/20 active:bg-primary/40 transition-all flex items-center justify-center group cursor-col-resize z-20">
      <div className="w-1 h-8 rounded-full bg-white/10 group-hover:bg-primary/50 flex items-center justify-center">
        <GripVertical className="w-3 h-3 text-transparent group-hover:text-primary-foreground/50" />
      </div>
    </PanelResizeHandle>
  );
}
