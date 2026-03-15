/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Settings2, 
  Image as ImageIcon, 
  Maximize2, 
  RefreshCw, 
  Check, 
  Trash2,
  Layers,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import ImageTracer from 'imagetracerjs';

interface ConversionOptions {
  ltres: number;
  qtres: number;
  pathomit: number;
  colorsampling: number;
  numberofcolors: number;
  mincolorratio: number;
  colorquantcycles: number;
  scale: number;
  strokewidth: number;
}

const DEFAULT_OPTIONS: ConversionOptions = {
  ltres: 1,
  qtres: 1,
  pathomit: 8,
  colorsampling: 2,
  numberofcolors: 16,
  mincolorratio: 0,
  colorquantcycles: 3,
  scale: 1,
  strokewidth: 1,
};

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [options, setOptions] = useState<ConversionOptions>(DEFAULT_OPTIONS);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const vectorize = useCallback((imageUrl: string, opts: ConversionOptions) => {
    setIsConverting(true);
    // Small delay to allow UI to show loading state
    setTimeout(() => {
      try {
        ImageTracer.imageToSVG(
          imageUrl,
          (svgString: string) => {
            setSvgContent(svgString);
            setIsConverting(false);
          },
          opts
        );
      } catch (error) {
        console.error('Vectorization failed:', error);
        setIsConverting(false);
      }
    }, 100);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setOriginalImage(result);
        setSvgContent(null);
        vectorize(result, options);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setOriginalImage(result);
        setSvgContent(null);
        vectorize(result, options);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vectorized_image.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setOriginalImage(null);
    setSvgContent(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateOption = (key: keyof ConversionOptions, value: number) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
    if (originalImage) {
      vectorize(originalImage, newOptions);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
              <Zap size={20} fill="currentColor" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Vectorize</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {originalImage && (
              <button 
                onClick={reset}
                className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                title="Reset"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {!originalImage ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold tracking-tight mb-4">
                Convert PNG to SVG <br />
                <span className="text-emerald-500">Instantly.</span>
              </h2>
              <p className="text-lg text-black/60">
                High-quality vectorization right in your browser. No server uploads, no privacy concerns.
              </p>
            </div>

            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="group relative border-2 border-dashed border-black/10 rounded-3xl bg-white p-12 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-50/30 transition-all duration-300"
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/png,image/jpeg"
                className="hidden"
              />
              <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Upload className="text-emerald-500" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Drop your image here</h3>
              <p className="text-black/40">PNG, JPG or JPEG up to 10MB</p>
              
              <div className="mt-8 flex items-center justify-center gap-4 text-sm font-medium text-black/60">
                <span className="flex items-center gap-1.5">
                  <Check size={16} className="text-emerald-500" /> Fast
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={16} className="text-emerald-500" /> Secure
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={16} className="text-emerald-500" /> Free
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Previews */}
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Preview */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-black/40 flex items-center gap-2">
                      <ImageIcon size={14} /> Original PNG
                    </span>
                  </div>
                  <div className="aspect-square rounded-xl bg-[#FAFAFA] overflow-hidden flex items-center justify-center border border-black/5">
                    <img 
                      src={originalImage} 
                      alt="Original" 
                      className="max-w-full max-h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* SVG Preview */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 relative">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-black/40 flex items-center gap-2">
                      <Layers size={14} /> Vectorized SVG
                    </span>
                    {isConverting && (
                      <RefreshCw size={14} className="animate-spin text-emerald-500" />
                    )}
                  </div>
                  <div className="aspect-square rounded-xl bg-[#FAFAFA] overflow-hidden flex items-center justify-center border border-black/5 relative">
                    {svgContent ? (
                      <div 
                        className="max-w-full max-h-full flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-black/20">
                        <RefreshCw size={40} className="animate-spin" />
                        <span className="text-sm font-medium">Processing...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => vectorize(originalImage!, options)}
                    disabled={isConverting}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-black/80 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={18} className={isConverting ? 'animate-spin' : ''} />
                    Re-process
                  </button>
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      showSettings ? 'bg-emerald-100 text-emerald-700' : 'bg-black/5 text-black/60 hover:bg-black/10'
                    }`}
                  >
                    <Settings2 size={18} />
                    Settings
                  </button>
                </div>

                <button 
                  onClick={downloadSvg}
                  disabled={!svgContent || isConverting}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none"
                >
                  <Download size={18} />
                  Download SVG
                </button>
              </div>
            </div>

            {/* Right Column: Settings */}
            <AnimatePresence>
              {showSettings && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-black/5 space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Vector Settings</h3>
                    <button 
                      onClick={() => setOptions(DEFAULT_OPTIONS)}
                      className="text-xs font-bold uppercase text-emerald-500 hover:text-emerald-600"
                    >
                      Reset Defaults
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <label className="font-medium text-black/60">Number of Colors</label>
                        <span className="font-mono text-emerald-500">{options.numberofcolors}</span>
                      </div>
                      <input 
                        type="range" min="2" max="64" step="1"
                        value={options.numberofcolors}
                        onChange={(e) => updateOption('numberofcolors', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-black/5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <p className="text-[10px] text-black/40 leading-relaxed">
                        Higher values preserve more detail but increase file size.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <label className="font-medium text-black/60">Detail Threshold (ltres)</label>
                        <span className="font-mono text-emerald-500">{options.ltres}</span>
                      </div>
                      <input 
                        type="range" min="0.1" max="10" step="0.1"
                        value={options.ltres}
                        onChange={(e) => updateOption('ltres', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-black/5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <label className="font-medium text-black/60">Curve Fitting (qtres)</label>
                        <span className="font-mono text-emerald-500">{options.qtres}</span>
                      </div>
                      <input 
                        type="range" min="0.1" max="10" step="0.1"
                        value={options.qtres}
                        onChange={(e) => updateOption('qtres', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-black/5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <label className="font-medium text-black/60">Path Omit</label>
                        <span className="font-mono text-emerald-500">{options.pathomit}</span>
                      </div>
                      <input 
                        type="range" min="0" max="64" step="1"
                        value={options.pathomit}
                        onChange={(e) => updateOption('pathomit', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-black/5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <p className="text-[10px] text-black/40 leading-relaxed">
                        Ignore paths smaller than this many pixels. Good for removing noise.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-black/5">
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl text-emerald-700 text-xs leading-relaxed">
                        <Zap size={16} className="shrink-0" />
                        <span>Changes are applied automatically. Processing time increases with higher color counts.</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-black/5 text-center">
        <p className="text-sm text-black/40">
          Built with React, Tailwind CSS, and ImageTracer.js
        </p>
      </footer>
    </div>
  );
}
