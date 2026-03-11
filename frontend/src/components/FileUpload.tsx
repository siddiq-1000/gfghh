"use client";

import { useCallback, useState } from "react";
import { UploadCloud } from "lucide-react";

export default function FileUpload({ onSuccess }: { onSuccess: (data: Record<string, unknown>) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.endsWith('.csv')) {
        setError("Only CSV files are allowed.");
        return;
      }
      uploadFile(file);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Upload failed");
      
      onSuccess(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.csv')) {
        setError("Only CSV files are allowed.");
        return;
      }
      uploadFile(file);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <label 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all duration-300 ease-in-out cursor-pointer ${
          isDragging 
            ? 'border-blue-500 bg-blue-500/10 scale-105 shadow-xl' 
            : 'border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900'
        }`}
      >
        <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-blue-500/20 text-blue-400' : 'bg-neutral-800 text-neutral-400'}`}>
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Click or drop your CSV here</h3>
        <p className="text-sm text-neutral-500 text-center">
          {isUploading ? "Uploading & Analyzing..." : "We'll automatically read and structure your data."}
        </p>
        
        <input 
          type="file" 
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden" 
        />
      </label>
      {error && <div className="text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</div>}
    </div>
  );
}
