import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileImage, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface FileUploadProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export function FileUpload({ onUpload, isUploading }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <div
      {...getRootProps()}
      className={clsx(
        "relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-500",
        isDragActive ? "border-primary bg-primary/5" : "border-white/10 hover:border-white/20 glass hover:bg-white/[0.05]",
        isUploading && "pointer-events-none opacity-70"
      )}
    >
      <input {...getInputProps()} />
      
      {/* Animated gradient border effect on hover/drag */}
      <div className={clsx(
        "absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-accent/0 translate-x-[-100%] transition-transform duration-1000",
        isDragActive && "translate-x-[100%] animate-pulse-slow"
      )} />

      <div className="relative p-8 flex flex-col items-center justify-center text-center z-10 min-h-[200px]">
        {isUploading ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4 text-primary"
          >
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="font-medium text-white">Uploading & Analyzing...</p>
          </motion.div>
        ) : (
          <motion.div
            animate={{ scale: isDragActive ? 1.05 : 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className={clsx(
              "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-300",
              isDragActive ? "bg-primary text-white shadow-primary/25" : "bg-white/5 text-white/50 group-hover:text-primary group-hover:bg-primary/10"
            )}>
              {isDragActive ? <FileImage className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
            </div>
            
            <div>
              <p className="text-lg font-medium text-white mb-1">
                {isDragActive ? "Drop design here!" : "Upload Design"}
              </p>
              <p className="text-sm text-white/40">
                Drag & drop or click to select image
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
