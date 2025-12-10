import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ beforeImage, afterImage }) => {
  const [position, setPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExportingHtml, setIsExportingHtml] = useState(false);
  const [isExportingHover, setIsExportingHover] = useState(false);
  const [isExportingGif, setIsExportingGif] = useState(false);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  // Allow keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setPosition((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowRight') {
      setPosition((prev) => Math.min(100, prev + 1));
    }
  };

  // Helper to load image
  const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image resource"));
    img.src = src;
  });

  // Helper to compress and convert image to base64 JPEG
  const compressAndToBase64 = async (src: string, maxWidth = 1600): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.naturalWidth;
            let height = img.naturalHeight;

            // Resize if too big to keep file size manageable
            if (width > maxWidth) {
                height = Math.round(height * (maxWidth / width));
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Canvas context failed"));
                return;
            }
            // Draw on white background just in case of transparency
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to JPEG with 0.85 quality
            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = (err) => reject(new Error("Failed to load image for compression"));
        img.src = src;
    });
  };

  const generateInteractiveHtml = (width: number, height: number, base64Before: string, base64After: string) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DiffSlide Embed</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #1e293b; /* Dark slate */
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: system-ui, -apple-system, sans-serif;
            overflow: hidden;
        }
        .container {
            position: relative;
            width: 100%;
            aspect-ratio: ${width} / ${height};
            max-height: 100vh;
            overflow: hidden;
            user-select: none;
            background-color: #0f172a;
            z-index: 1;
        }
        img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            pointer-events: none;
        }
        .img-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        .img-before {
            z-index: 10;
            clip-path: inset(0 50% 0 0);
        }
        .img-after {
            z-index: 5;
        }
        .handle {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 50%;
            width: 2px;
            background: white;
            z-index: 20;
            cursor: col-resize;
            pointer-events: none;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
        .handle-knob {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .handle-knob::after {
            content: '↔';
            color: #0f172a;
            font-weight: bold;
        }
        input[type=range] {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            opacity: 0;
            cursor: col-resize;
            z-index: 30;
        }
        .label {
            position: absolute;
            bottom: 16px;
            padding: 4px 12px;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
            color: white;
            border-radius: 999px;
            font-size: 12px;
            font-weight: bold;
            pointer-events: none;
            z-index: 15;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .label-before { left: 16px; }
        .label-after { right: 16px; }
        
        #error-log {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #991b1b;
            color: white;
            padding: 8px;
            font-size: 12px;
            display: none;
            z-index: 9999;
        }
    </style>
</head>
<body>
    <div class="container" id="mainContainer">
        
        <div class="img-layer img-after">
            <img src="${base64After}" alt="After Image">
            <div class="label label-after">AFTER</div>
        </div>
        
        <div class="img-layer img-before" id="beforeLayer">
            <img src="${base64Before}" alt="Before Image">
            <div class="label label-before">BEFORE</div>
        </div>

        <div class="handle" id="handleLine">
            <div class="handle-knob"></div>
        </div>

        <input type="range" min="0" max="100" value="50" id="slider" aria-label="Comparison slider">
    </div>
    
    <div id="error-log"></div>

    <script>
        window.addEventListener('DOMContentLoaded', () => {
            try {
                const slider = document.getElementById('slider');
                const beforeLayer = document.getElementById('beforeLayer');
                const handleLine = document.getElementById('handleLine');

                if (slider && beforeLayer && handleLine) {
                    slider.addEventListener('input', (e) => {
                        requestAnimationFrame(() => {
                            const val = e.target.value;
                            beforeLayer.style.clipPath = \`inset(0 \${100 - val}% 0 0)\`;
                            handleLine.style.left = \`\${val}%\`;
                        });
                    });
                } else {
                    throw new Error("Missing slider elements");
                }
            } catch (err) {
                const log = document.getElementById('error-log');
                if (log) {
                    log.style.display = 'block';
                    log.textContent = 'Slider Error: ' + err.message;
                }
            }
        });
    </script>
</body>
</html>`;
  }

  const drawCanvasFrame = (
    ctx: CanvasRenderingContext2D, 
    imgBefore: HTMLImageElement, 
    imgAfter: HTMLImageElement, 
    width: number, 
    height: number, 
    splitPos: number // 0 to 100
  ) => {
    const canvasRatio = width / height;
    const afterRatio = imgAfter.naturalWidth / imgAfter.naturalHeight;
    
    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    if (afterRatio > canvasRatio) {
         drawHeight = width / afterRatio;
         offsetY = (height - drawHeight) / 2;
    } else {
         drawWidth = height * afterRatio;
         offsetX = (width - drawWidth) / 2;
    }
    
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(imgAfter, offsetX, offsetY, drawWidth, drawHeight);

    const splitX = width * (splitPos / 100);
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, splitX, height);
    ctx.clip();
    ctx.drawImage(imgBefore, 0, 0, width, height);
    ctx.restore();
    
    ctx.beginPath();
    ctx.moveTo(splitX, 0);
    ctx.lineTo(splitX, height);
    ctx.lineWidth = Math.max(2, width * 0.005);
    ctx.strokeStyle = 'white';
    ctx.stroke();

    const baseScale = width / 800;
    const fontSize = Math.max(14, Math.round(16 * baseScale));
    const badgePaddingX = Math.max(12, Math.round(12 * baseScale));
    const badgePaddingY = Math.max(6, Math.round(6 * baseScale));
    const badgeRadius = Math.max(4, Math.round(6 * baseScale));
    const margin = Math.max(16, Math.round(20 * baseScale));

    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    
    if (splitPos > 10) {
      const text = 'BEFORE';
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const boxWidth = textWidth + (badgePaddingX * 2);
      const boxHeight = fontSize + (badgePaddingY * 2);

      const x = margin;
      const y = height - margin - boxHeight;

      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x, y, boxWidth, boxHeight, badgeRadius);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, boxWidth, boxHeight);
      }

      ctx.fillStyle = 'white';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x + badgePaddingX, y + (boxHeight / 2) + 1);
    }
    
    if (splitPos < 90) {
      const text = 'AFTER';
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const boxWidth = textWidth + (badgePaddingX * 2);
      const boxHeight = fontSize + (badgePaddingY * 2);

      const x = width - margin - boxWidth;
      const y = height - margin - boxHeight;

      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x, y, boxWidth, boxHeight, badgeRadius);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, boxWidth, boxHeight);
      }

      ctx.fillStyle = 'white';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x + badgePaddingX, y + (boxHeight / 2) + 1);
    }
  };

  const handleDownloadVideo = async () => {
    setIsExportingVideo(true);
    try {
      const [imgBefore, imgAfter] = await Promise.all([
        loadImage(beforeImage),
        loadImage(afterImage)
      ]);

      const MAX_DIMENSION = 1920; 
      let width = imgBefore.naturalWidth;
      let height = imgBefore.naturalHeight;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = width / height;
        if (ratio > 1) {
          width = MAX_DIMENSION;
          height = Math.round(MAX_DIMENSION / ratio);
        } else {
          height = MAX_DIMENSION;
          width = Math.round(MAX_DIMENSION * ratio);
        }
      }

      if (width % 2 !== 0) width--;
      if (height % 2 !== 0) height--;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      const mimeTypes = [
        'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
        'video/mp4',
        'video/webm; codecs=vp9',
        'video/webm'
      ];
      
      let selectedMimeType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }

      if (!selectedMimeType) {
        alert("Your browser does not support video recording.");
        setIsExportingVideo(false);
        return;
      }

      const stream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : null;
      if (!stream) {
         throw new Error("Canvas captureStream not supported in this browser.");
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 8000000 
      });

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: selectedMimeType });
        const ext = selectedMimeType.includes('mp4') ? 'mp4' : 'webm';
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `diffslide-video-${Date.now()}.${ext}`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setIsExportingVideo(false);
      };

      recorder.start();

      const durationHold = 1000;
      const durationSlide = 1500;
      const totalDuration = durationHold + durationSlide + durationHold + durationSlide;
      const startTime = performance.now();

      const animate = (time: number) => {
        const elapsed = time - startTime;
        let pos = 0;

        if (elapsed < durationHold) {
          pos = 0;
        } else if (elapsed < durationHold + durationSlide) {
          const t = (elapsed - durationHold) / durationSlide;
          const ease = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          pos = ease * 100;
        } else if (elapsed < durationHold + durationSlide + durationHold) {
          pos = 100;
        } else if (elapsed < totalDuration) {
          const t = (elapsed - (durationHold + durationSlide + durationHold)) / durationSlide;
          const ease = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          pos = 100 - (ease * 100);
        } else {
          recorder.stop();
          return;
        }

        drawCanvasFrame(ctx, imgBefore, imgAfter, width, height, pos);
        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);

    } catch (error) {
      console.error("Video Generation failed", error);
      alert(`Video export failed: ${error}`);
      setIsExportingVideo(false);
    }
  };

  const handleDownloadGif = async () => {
    setIsExportingGif(true);
    try {
      const [imgBefore, imgAfter] = await Promise.all([
        loadImage(beforeImage),
        loadImage(afterImage)
      ]);

      const MAX_WIDTH = 800; 
      const scale = Math.min(1, MAX_WIDTH / imgBefore.naturalWidth);
      const width = Math.floor(imgBefore.naturalWidth * scale);
      const height = Math.floor(imgBefore.naturalHeight * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) throw new Error("No canvas context");

      // @ts-ignore
      const encoder = GIFEncoder();
      
      const startPos = 0;
      const endPos = 100;
      const step = 4; 
      const frameDelay = 5; 
      const pauseDelay = 200; 

      const writeFrame = (p: number, delay: number) => {
        drawCanvasFrame(ctx, imgBefore, imgAfter, width, height, p);
        const data = ctx.getImageData(0, 0, width, height).data;
        const palette = quantize(data, 256);
        const index = applyPalette(data, palette);
        encoder.writeFrame(index, width, height, { palette, delay });
      };
      
      for (let p = startPos; p <= endPos; p += step) {
        writeFrame(p, frameDelay);
      }
      writeFrame(100, pauseDelay);
      for (let p = endPos; p >= startPos; p -= step) {
        writeFrame(p, frameDelay);
      }
      writeFrame(0, pauseDelay);

      encoder.finish();
      
      // @ts-ignore
      const buffer = encoder.bytes(); 
      const blob = new Blob([buffer], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `diffslide-optimized-${Date.now()}.gif`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("GIF Generation failed", error);
      alert("Could not generate GIF. Try smaller images.");
    } finally {
      setIsExportingGif(false);
    }
  };

  const handleDownloadImage = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const [imgBefore, imgAfter] = await Promise.all([
        loadImage(beforeImage),
        loadImage(afterImage)
      ]);

      canvas.width = imgBefore.naturalWidth;
      canvas.height = imgBefore.naturalHeight;

      drawCanvasFrame(ctx, imgBefore, imgAfter, canvas.width, canvas.height, position);

      const link = document.createElement('a');
      link.download = `comparison-snapshot-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
    } catch (err) {
      console.error("Failed to generate download", err);
      alert("Failed to generate image.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadHtml = async () => {
    setIsExportingHtml(true);
    try {
      const imgRef = await loadImage(beforeImage);
      const width = Math.round(imgRef.naturalWidth);
      const height = Math.round(imgRef.naturalHeight);
      
      // Default to 1600px for file download
      const [base64Before, base64After] = await Promise.all([
        compressAndToBase64(beforeImage, 1600),
        compressAndToBase64(afterImage, 1600)
      ]);

      const htmlContent = generateInteractiveHtml(width, height, base64Before, base64After);

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `diffslide-embed-${Date.now()}.html`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Failed to export HTML", err);
      alert("Failed to export HTML file: " + (err as Error).message);
    } finally {
      setIsExportingHtml(false);
    }
  };

  const handleCopyHtml = async () => {
    setIsCopying(true);
    try {
      const imgRef = await loadImage(beforeImage);
      const width = Math.round(imgRef.naturalWidth);
      const height = Math.round(imgRef.naturalHeight);
      
      // Use stricter compression (1024px) for Clipboard to keep string size smaller
      const [base64Before, base64After] = await Promise.all([
        compressAndToBase64(beforeImage, 1024),
        compressAndToBase64(afterImage, 1024)
      ]);

      const htmlContent = generateInteractiveHtml(width, height, base64Before, base64After);
      await navigator.clipboard.writeText(htmlContent);
      setCopySuccess(true);
    } catch (err) {
      console.error("Failed to copy HTML", err);
      alert("Failed to copy code. Images might be too large.");
    } finally {
      setIsCopying(false);
    }
  };

  const handleDownloadHoverHtml = async () => {
    setIsExportingHover(true);
    try {
      const imgRef = await loadImage(beforeImage);
      const width = Math.round(imgRef.naturalWidth);
      const height = Math.round(imgRef.naturalHeight);
      
      const [base64Before, base64After] = await Promise.all([
        compressAndToBase64(beforeImage),
        compressAndToBase64(afterImage)
      ]);

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DiffSlide Hover Reveal</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #0f172a;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: system-ui, -apple-system, sans-serif;
            overflow: hidden;
        }
        .container {
            position: relative;
            width: 100%;
            aspect-ratio: ${width} / ${height};
            max-height: 100vh;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
        }
        img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            position: absolute;
            top: 0;
            left: 0;
        }
        .img-before {
            z-index: 10;
        }
        .img-after {
            z-index: 20;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        }
        .container:hover .img-after {
            opacity: 1;
        }
        .label {
            position: absolute;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%);
            padding: 4px 12px;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
            color: white;
            border-radius: 999px;
            font-size: 12px;
            font-weight: bold;
            pointer-events: none;
            z-index: 30;
            border: 1px solid rgba(255,255,255,0.1);
            transition: opacity 0.3s;
        }
        .container:hover .label {
            opacity: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="${base64Before}" alt="Before" class="img-before">
        <img src="${base64After}" alt="After" class="img-after">
        <div class="label">Hover to reveal</div>
    </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `diffslide-hover-${Date.now()}.html`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Failed to export Hover HTML", err);
      alert("Failed to export Hover HTML: " + (err as Error).message);
    } finally {
      setIsExportingHover(false);
    }
  };

  return (
    <div 
      className="w-full h-full flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 p-2 sm:p-4 shadow-2xl"
      onKeyDown={handleKeyDown}
    >
      <div 
        ref={containerRef}
        className="relative w-full max-w-5xl select-none overflow-hidden rounded-xl shadow-lg group bg-slate-950"
      >
        {/* Download Buttons Group */}
        <div className="absolute top-4 right-4 z-30 flex gap-2">

            {/* Download Video (MP4) */}
            <button
            onClick={handleDownloadVideo}
            disabled={isExportingVideo || isExportingGif || isDownloading || isExportingHtml || isExportingHover || isCopying}
            className="p-2.5 bg-black/60 hover:bg-indigo-600 text-white rounded-full backdrop-blur-md border border-white/10 transition-all disabled:opacity-50 disabled:cursor-wait group/btn shadow-xl flex items-center justify-center"
            title="Download Looping Video (MP4)"
            >
            {isExportingVideo ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <Icons.Video size={20} className="group-hover/btn:scale-110 transition-transform" />
            )}
            </button>

            {/* Download GIF */}
            <button
            onClick={handleDownloadGif}
            disabled={isExportingGif || isExportingVideo || isDownloading || isExportingHtml || isExportingHover || isCopying}
            className="p-2.5 bg-black/60 hover:bg-indigo-600 text-white rounded-full backdrop-blur-md border border-white/10 transition-all disabled:opacity-50 disabled:cursor-wait group/btn shadow-xl flex items-center justify-center"
            title="Download Optimized Animated GIF (< 20MB)"
            >
            {isExportingGif ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <Icons.Film size={20} className="group-hover/btn:scale-110 transition-transform" />
            )}
            </button>
            
            {/* Download Interactive HTML */}
            <button
            onClick={handleDownloadHtml}
            disabled={isExportingHtml || isExportingVideo || isDownloading || isExportingGif || isExportingHover || isCopying}
            className="p-2.5 bg-black/60 hover:bg-indigo-600 text-white rounded-full backdrop-blur-md border border-white/10 transition-all disabled:opacity-50 disabled:cursor-wait group/btn shadow-xl flex items-center justify-center"
            title="Download Interactive Slider HTML (File)"
            >
            {isExportingHtml ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <Icons.FileCode size={20} className="group-hover/btn:scale-110 transition-transform" />
            )}
            </button>

             {/* Copy Code */}
            <button
            onClick={handleCopyHtml}
            disabled={isCopying || isExportingHtml || isExportingVideo || isDownloading || isExportingGif || isExportingHover}
            className={`p-2.5 ${copySuccess ? 'bg-green-600 border-green-400' : 'bg-black/60 hover:bg-indigo-600 border-white/10'} text-white rounded-full backdrop-blur-md border transition-all disabled:opacity-50 disabled:cursor-wait group/btn shadow-xl flex items-center justify-center`}
            title="Copy Interactive HTML Code (For Direct Embedding)"
            >
            {isCopying ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : copySuccess ? (
                <Icons.Check size={20} />
            ) : (
                <Icons.Copy size={20} className="group-hover/btn:scale-110 transition-transform" />
            )}
            </button>

            {/* Download Hover HTML */}
            <button
            onClick={handleDownloadHoverHtml}
            disabled={isExportingHover || isExportingVideo || isDownloading || isExportingGif || isExportingHtml || isCopying}
            className="p-2.5 bg-black/60 hover:bg-indigo-600 text-white rounded-full backdrop-blur-md border border-white/10 transition-all disabled:opacity-50 disabled:cursor-wait group/btn shadow-xl flex items-center justify-center"
            title="Download Hover-Reveal HTML"
            >
            {isExportingHover ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <Icons.Hover size={20} className="group-hover/btn:scale-110 transition-transform" />
            )}
            </button>

            {/* Download Static Image */}
            <button
            onClick={handleDownloadImage}
            disabled={isDownloading || isExportingVideo || isExportingHtml || isExportingGif || isExportingHover || isCopying}
            className="p-2.5 bg-black/60 hover:bg-indigo-600 text-white rounded-full backdrop-blur-md border border-white/10 transition-all disabled:opacity-50 disabled:cursor-wait group/btn shadow-xl flex items-center justify-center"
            title="Download Static Snapshot Image"
            >
            {isDownloading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <Icons.Download size={20} className="group-hover/btn:scale-110 transition-transform" />
            )}
            </button>
        </div>

        {/* 
           Phantom image to maintain aspect ratio relative to width.
           We use the 'Before' image to set the stage.
        */}
        <img 
          src={beforeImage} 
          alt="Reference" 
          className="w-full h-auto opacity-0 pointer-events-none block" 
        />

        {/* AFTER Image (Background Layer) */}
        <div className="absolute inset-0 w-full h-full">
            <img 
                src={afterImage} 
                alt="After" 
                className="w-full h-full object-contain select-none"
                draggable={false}
            />
            
            {/* Label Badge */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white/90 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full border border-white/10 z-10 pointer-events-none select-none">
                AFTER
            </div>
        </div>

        {/* BEFORE Image (Foreground Layer - Clipped) */}
        <div 
            className="absolute inset-0 w-full h-full will-change-[clip-path]"
            style={{ 
                clipPath: `inset(0 ${100 - position}% 0 0)` 
            }}
        >
            <img 
                src={beforeImage} 
                alt="Before" 
                className="absolute inset-0 w-full h-full object-contain select-none max-w-none"
                draggable={false}
            />
             {/* Label Badge */}
             <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white/90 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full border border-white/10 z-10 pointer-events-none select-none">
                BEFORE
            </div>
        </div>

        {/* Custom Slider Handle */}
        <div 
            className="absolute inset-y-0 w-1 bg-white cursor-ew-resize hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-shadow"
            style={{ left: `${position}%` }}
        >
            <div className={`
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                w-12 h-12 bg-white rounded-full shadow-xl 
                flex items-center justify-center text-slate-900
                transition-transform duration-200
                ${isResizing ? 'scale-110' : 'scale-100'}
            `}>
                <Icons.Slider size={20} className="opacity-80" />
            </div>
        </div>

        {/* Input Range Overlay (The Interaction Engine) */}
        <input
            type="range"
            min="0"
            max="100"
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            onMouseDown={() => setIsResizing(true)}
            onMouseUp={() => setIsResizing(false)}
            onTouchStart={() => setIsResizing(true)}
            onTouchEnd={() => setIsResizing(false)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 touch-none"
            aria-label="Comparison slider"
        />
      </div>
    </div>
  );
};