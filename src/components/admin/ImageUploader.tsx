"use client";

import { Upload } from "lucide-react";
import { useState, useRef } from "react";

interface ImageUploaderProps {
  onFileSelect: (files: File[]) => void;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
  multiple?: boolean;
}

export function ImageUploader({
  onFileSelect,
  maxSize = 5 * 1024 * 1024, // 5MB default
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  className = "",
  multiple = true,
}: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type: ${file.name}. Allowed types: ${acceptedTypes.join(", ")}`;
    }

    // Validate file size
    if (file.size > maxSize) {
      return `File size exceeds limit: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB > ${(maxSize / 1024 / 1024).toFixed(2)}MB)`;
    }

    return null;
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join("\n"));
    } else {
      setError(null);
    }

    if (validFiles.length === 0) return;

    // Call callback with valid files
    onFileSelect(validFiles);
    
    // Reset input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
            : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className={`w-10 h-10 mb-3 ${isDragging ? "text-blue-500 dark:text-blue-400" : "text-gray-400"}`} />
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag
            and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {multiple ? "Multiple images supported" : "Single image"} - {acceptedTypes.join(", ").toUpperCase()} (MAX.{" "}
            {(maxSize / 1024 / 1024).toFixed(2)}MB)
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes.join(",")}
          onChange={handleFileChange}
          multiple={multiple}
        />
      </div>
      {error && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 whitespace-pre-line">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

