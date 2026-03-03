import { formatDistanceToNow } from "date-fns";
import { Image as ImageIcon, Trash2, Code, Clock } from "lucide-react";
import { useProjects, useDeleteProject } from "@/hooks/use-api";
import { clsx } from "clsx";
import { motion } from "framer-motion";

interface ProjectListProps {
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function ProjectList({ activeId, onSelect }: ProjectListProps) {
  const { data: projects, isLoading } = useProjects();
  const deleteMutation = useDeleteProject();

  if (isLoading) {
    return (
      <div className="space-y-3 mt-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!projects?.length) {
    return (
      <div className="mt-8 text-center p-6 border border-white/5 rounded-xl border-dashed">
        <ImageIcon className="w-10 h-10 text-white/20 mx-auto mb-3" />
        <p className="text-white/50 text-sm">No projects yet. Upload a design to get started.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4" /> Recent Projects
        </h3>
      </div>
      
      {projects.map((project, idx) => {
        const isActive = activeId === project.id;
        
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={project.id}
            onClick={() => onSelect(project.id)}
            className={clsx(
              "group relative p-3 rounded-xl cursor-pointer transition-all duration-300 border",
              isActive 
                ? "bg-primary/10 border-primary/30 shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]" 
                : "glass hover:bg-white/[0.08] hover:border-white/20 border-white/5"
            )}
          >
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black/50">
                <img 
                  src={project.originalImageUrl} 
                  alt={project.filename}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 py-1">
                <h4 className={clsx(
                  "font-medium truncate text-sm mb-1",
                  isActive ? "text-primary" : "text-white/90"
                )}>
                  {project.filename}
                </h4>
                <div className="flex items-center gap-3 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Code className="w-3 h-3" />
                    {project.components?.length || 0} cmp
                  </span>
                  <span>
                    {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if(confirm('Delete this project?')) {
                    deleteMutation.mutate(project.id);
                  }
                }}
                className={clsx(
                  "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all",
                  "opacity-0 group-hover:opacity-100",
                  "hover:bg-destructive/20 text-white/30 hover:text-destructive"
                )}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
