import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ComparisonSlider } from './components/ComparisonSlider';
import { Icons } from './components/Icons';

function App() {
  const [beforeImg, setBeforeImg] = useState<string | null>(null);
  const [afterImg, setAfterImg] = useState<string | null>(null);

  const handleUpload = (file: File, type: 'before' | 'after') => {
    const url = URL.createObjectURL(file);
    if (type === 'before') {
      if (beforeImg) URL.revokeObjectURL(beforeImg);
      setBeforeImg(url);
    } else {
      if (afterImg) URL.revokeObjectURL(afterImg);
      setAfterImg(url);
    }
  };

  const handleClear = (type: 'before' | 'after') => {
    if (type === 'before') {
      if (beforeImg) URL.revokeObjectURL(beforeImg);
      setBeforeImg(null);
    } else {
      if (afterImg) URL.revokeObjectURL(afterImg);
      setAfterImg(null);
    }
  };

  const handleSwap = () => {
    const temp = beforeImg;
    setBeforeImg(afterImg);
    setAfterImg(temp);
  };

  const handleReset = () => {
    if (beforeImg) URL.revokeObjectURL(beforeImg);
    if (afterImg) URL.revokeObjectURL(afterImg);
    setBeforeImg(null);
    setAfterImg(null);
  };

  const isReady = beforeImg && afterImg;

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-white/5 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Icons.Swap size={18} />
            </div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              DiffSlide
            </h1>
          </div>
          <div className="flex items-center gap-4">
             {isReady && (
                <button
                  onClick={handleReset}
                  className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Icons.Trash size={14} />
                  <span className="hidden sm:inline">Reset All</span>
                </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full gap-8">
        
        {/* Upload Section */}
        <div className={`
          grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 md:gap-8 items-center transition-all duration-500
          ${isReady ? 'opacity-100' : 'flex-1'}
        `}>
          <ImageUploader 
            label="Original Image (Before)" 
            image={beforeImg} 
            onUpload={(f) => handleUpload(f, 'before')}
            onClear={() => handleClear('before')}
          />
          
          <div className="flex justify-center">
             <button 
                onClick={handleSwap}
                disabled={!beforeImg && !afterImg}
                className="p-3 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                title="Swap Images"
             >
               <Icons.Swap size={20} className="group-hover:rotate-180 transition-transform duration-500" />
             </button>
          </div>

          <ImageUploader 
            label="Modified Image (After)" 
            image={afterImg} 
            onUpload={(f) => handleUpload(f, 'after')}
            onClear={() => handleClear('after')}
          />
        </div>

        {/* Comparison Section */}
        <div className={`transition-all duration-700 delay-100 ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 hidden'}`}>
           {isReady && (
             <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="flex items-center justify-between px-2">
                 <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                   <Icons.Maximize size={20} className="text-indigo-400" />
                   Comparison View
                 </h2>
                 <p className="text-sm text-slate-500 hidden sm:block">Drag slider to reveal differences</p>
               </div>
               
               <ComparisonSlider beforeImage={beforeImg!} afterImage={afterImg!} />
               
               <div className="text-center sm:hidden text-xs text-slate-500 py-2">
                 Tap and drag to compare
               </div>
             </div>
           )}
        </div>
        
        {!isReady && (
          <div className="flex-1 flex items-center justify-center min-h-[200px] text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
             <p className="text-center px-4">Upload both images to enable comparison mode</p>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6 text-center text-slate-600 text-sm">
        <p>Built with React & Tailwind. All processing happens locally in your browser.</p>
      </footer>
    </div>
  );
}

export default App;