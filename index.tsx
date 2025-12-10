<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DiffSlide - Image Comparison</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

    <style>
      /* Custom slider thumb styles */
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none; appearance: none;
        width: 16px; height: 16px; background: white;
        border-radius: 50%; cursor: pointer;
      }
      input[type=range]::-moz-range-thumb {
        width: 16px; height: 16px; border: 0; background: white;
        border-radius: 50%; cursor: pointer;
      }
      input[type=range]:focus { outline: none; }
    </style>
    
    <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18.2.0",
        "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
        "lucide-react": "https://esm.sh/lucide-react@0.263.1"
      }
    }
    </script>
  </head>
  
  <body class="bg-slate-950 text-slate-200 antialiased overflow-x-hidden selection:bg-indigo-500/30">
    <div id="root"></div>

    <script type="text/babel" data-type="module">
      import React, { useState } from 'react';
      import { createRoot } from 'react-dom/client';
      import { GripVertical } from 'lucide-react';

      // --- THE SLIDER COMPONENT ---
      const ImageComparison = () => {
        const [sliderPosition, setSliderPosition] = useState(50);

        // CONFIG: Change your images here
        const beforeImage = "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=1000&auto=format&fit=crop"; 
        const afterImage = "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=1000&auto=format&fit=crop"; 

        const handleMove = (event) => {
          setSliderPosition(event.target.value);
        };

        return (
          <div className="w-full max-w-4xl mx-auto p-6">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">Image Comparison</h2>
              <p className="text-gray-400">Drag the slider to see the difference</p>
            </div>

            <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-indigo-500/30 shadow-2xl select-none">
              
              {/* Image 1 (Background) */}
              <img src={afterImage} alt="After" className="absolute top-0 left-0 h-full w-full object-cover" />

              {/* Image 2 (Foreground - Clipped) */}
              <div 
                className="absolute top-0 left-0 h-full overflow-hidden border-r-2 border-white"
                style={{ width: `${sliderPosition}%` }}
              >
                <img 
                  src={beforeImage} 
                  alt="Before" 
                  className="absolute top-0 left-0 h-full max-w-none object-cover"
                  style={{ width: '100vw', maxWidth: '56rem' }} 
                />
              </div>

              {/* Slider Handle (Visual) */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <GripVertical className="w-5 h-5 text-slate-800" />
                </div>
              </div>

              {/* Range Input (Functional - Invisible) */}
              <input
                type="range" min="0" max="100" value={sliderPosition} onChange={handleMove}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
              />
            </div>
          </div>
        );
      };

      // --- MOUNTING THE APP ---
      const App = () => {
        return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <ImageComparison />
          </div>
        );
      };

      const root = createRoot(document.getElementById('root'));
      root.render(<App />);
    </script>
  </body>
</html>
