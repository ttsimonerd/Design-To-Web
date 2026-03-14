import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, ImagePlus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

interface FileUploadProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export function FileUpload({ onUpload, isUploading }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) onUpload(acceptedFiles[0]);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      data-testid="dropzone-upload"
      className={clsx(
        "relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 overflow-hidden",
        isDragActive
          ? "border-primary/70 bg-primary/5 shadow-lg shadow-primary/10"
          : "border-white/10 hover:border-white/20 glass hover:bg-white/[0.03]",
        isUploading && "pointer-events-none opacity-60"
      )}
    >
      <input {...getInputProps()} data-testid="input-file" />

      <div className="flex flex-col items-center justify-center gap-3 px-4 py-8 text-center">
        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
              <p className="text-sm text-white/60 font-medium">Uploading & converting…</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className={clsx(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300",
                isDragActive ? "bg-primary/30 text-primary" : "bg-white/[0.05] text-white/30"
              )}>
                {isDragActive ? (
                  <UploadCloud className="w-6 h-6" />
                ) : (
                  <ImagePlus className="w-6 h-6" />
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-white/70">
                  {isDragActive ? "Drop to convert" : "Upload a design"}
                </p>
                <p className="text-xs text-white/30 mt-1">
                  PNG, JPG, WebP, GIF — drag & drop or click
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
