import React, { useRef, useState } from 'react';
import { Icons } from './Icons';

interface ImageUploaderProps {
  label: string;
  image: string | null;
  onUpload: (file: File) => void;
  onClear: () => void;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  label, 
  image, 
  onUpload, 
  onClear,
  className = "" 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onUpload(file);
      }
    }
  };

  const handleClick = () => {
    if (!image) {
      inputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className={`relative flex flex-col gap-2 ${className}`}>
      <span className="text-sm font-medium text-slate-400 uppercase tracking-wider pl-1">{label}</span>
      
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          group relative w-full aspect-video rounded-xl border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-500/10' 
            : image 
              ? 'border-transparent bg-slate-900' 
              : 'border-slate-700 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-800'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {image ? (
          <>
            <img 
              src={image} 
              alt={label} 
              className="w-full h-full object-contain p-2"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
              <button 
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="p-2 rounded-full bg-slate-700 hover:bg-indigo-600 text-white transition-colors"
                title="Change Image"
              >
                <Icons.Upload size={20} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="p-2 rounded-full bg-slate-700 hover:bg-red-600 text-white transition-colors"
                title="Remove Image"
              >
                <Icons.Close size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 group-hover:text-slate-300 transition-colors">
            <div className={`p-4 rounded-full bg-slate-800 mb-3 group-hover:scale-110 transition-transform duration-300 ${isDragging ? 'bg-indigo-500/20 text-indigo-400' : ''}`}>
              <Icons.Image size={32} />
            </div>
            <p className="font-medium text-sm">Click or drag image</p>
            <p className="text-xs text-slate-600 mt-1">PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
};