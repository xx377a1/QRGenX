import { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { Download, History, Palette, Image as ImageIcon, Trash2, RotateCcw, Moon, Sun } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { QRCodeConfig } from './types';

export default function App() {
  const [text, setText] = useState('https://google.com');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logoUrl, setLogoUrl] = useState('');
  
  const [history, setHistory] = useState<QRCodeConfig[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('qr-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('qr-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('qr-theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const saved = localStorage.getItem('qr-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const saveToHistory = () => {
    if (!text.trim()) return;
    
    // Check if the exact same configuration is already the latest in history
    if (history.length > 0) {
      const latest = history[0];
      if (
        latest.text === text &&
        latest.fgColor === fgColor &&
        latest.bgColor === bgColor &&
        latest.logoUrl === logoUrl
      ) {
        return;
      }
    }

    const newItem: QRCodeConfig = {
      id: crypto.randomUUID(),
      text,
      fgColor,
      bgColor,
      logoUrl,
      createdAt: Date.now(),
    };

    const newHistory = [newItem, ...history].slice(0, 50); // Keep last 50
    setHistory(newHistory);
    localStorage.setItem('qr-history', JSON.stringify(newHistory));
  };

  const downloadPng = () => {
    saveToHistory();
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const downloadSvg = () => {
    saveToHistory();
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `qrcode-${Date.now()}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const loadFromHistory = (item: QRCodeConfig) => {
    setText(item.text);
    setFgColor(item.fgColor);
    setBgColor(item.bgColor);
    setLogoUrl(item.logoUrl);
    setActiveTab('create');
  };

  const deleteFromHistory = (id: string) => {
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem('qr-history', JSON.stringify(newHistory));
  };
  
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('qr-history');
  };

  return (
    <div className="flex flex-col min-h-screen bg-indigo-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-indigo-100 dark:selection:bg-indigo-900 transition-colors duration-200">
      <header className="flex items-center justify-between px-6 sm:px-10 py-4 sm:py-6 bg-white dark:bg-slate-900 border-b border-indigo-100 dark:border-slate-800 shadow-sm shrink-0 sticky top-0 z-10 transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 3h7v7H3V3zM14 3h7v7h-7V3zM14 14h7v7h-7v-7zM3 14h7v7H3v-7zM7 7h.01M17 7h.01M7 17h.01M17 17h.01" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">QRGenX</span>
        </div>
        <div className="flex items-center gap-6 sm:gap-10">
          <nav className="flex items-center gap-4 sm:gap-8 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            <button
              onClick={() => setActiveTab('create')}
              className={activeTab === 'create' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 pb-1' : 'hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors'}
            >
              Generator
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={activeTab === 'history' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 pb-1 flex items-center gap-1.5' : 'hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors flex items-center gap-1.5'}
            >
              <History className="w-4 h-4" />
              History
              {history.length > 0 && (
                <span className="ml-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 py-0.5 px-1.5 rounded-full text-[10px]">
                  {history.length}
                </span>
              )}
            </button>
          </nav>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
        {activeTab === 'create' ? (
          <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full items-start">
            {/* Editor Settings */}
            <section className="flex-[1.2] bg-white dark:bg-slate-900 rounded-[40px] p-6 sm:p-10 shadow-xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50 dark:border-slate-800 flex flex-col gap-8 w-full transition-colors duration-200">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 dark:text-indigo-500 mb-2">Step 1: Your Content</h2>
                <textarea
                  id="qr-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-950 border-2 border-indigo-50 dark:border-slate-800 rounded-2xl text-lg focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-600 dark:text-slate-300 font-medium transition-all shadow-inner resize-none"
                  rows={3}
                />
              </div>

              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 dark:text-indigo-500 mb-4">Step 2: Custom Appearance</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">Main Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        id="fg-color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-12 h-12 rounded-full cursor-pointer border-4 border-white dark:border-slate-800 shadow-md ring-2 ring-indigo-600 p-0 shrink-0 bg-transparent"
                      />
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-mono uppercase font-bold">{fgColor}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">Background Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        id="bg-color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-12 h-12 rounded-full cursor-pointer border-4 border-white dark:border-slate-800 shadow-md p-0 shrink-0 bg-transparent"
                      />
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-mono uppercase font-bold">{bgColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 dark:text-indigo-500 mb-4">Step 3: Logo Overlay (Optional)</h2>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex-1 w-full space-y-3">
                    <input
                      type="url"
                      id="logo-url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Image URL (Optional - https://...)"
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-indigo-50 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-600 dark:text-slate-300 font-medium transition-all shadow-inner"
                    />
                  </div>
                  <div className="flex-1 p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 text-amber-700 dark:text-amber-400 w-full transition-colors duration-200">
                    <p className="text-sm leading-relaxed"><strong>Pro Tip:</strong> Transparent PNGs with high contrast work best for optimal scanning performance.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Preview & Download */}
            <section className="flex-1 flex flex-col gap-6 w-full lg:sticky lg:top-8">
              <div className="flex-1 bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-800 dark:to-violet-900 rounded-[40px] p-8 shadow-2xl dark:shadow-none border border-transparent dark:border-indigo-800/30 flex flex-col items-center justify-center text-center min-h-[450px] transition-colors duration-200">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-2xl relative group mb-8 inline-block transition-colors duration-200">
                  {!text.trim() ? (
                    <div className="w-[200px] h-[200px] flex items-center justify-center text-indigo-200 dark:text-indigo-800">
                      <p className="text-sm font-black uppercase tracking-widest text-center px-4">Enter text to generate QR</p>
                    </div>
                  ) : (
                    <>
                      {/* Render Canvas for PNG download & display */}
                      <QRCodeCanvas
                        id="qr-code-canvas"
                        value={text}
                        size={200}
                        level="H"
                        fgColor={fgColor}
                        bgColor={bgColor}
                        imageSettings={
                          logoUrl
                            ? { src: logoUrl, height: 48, width: 48, excavate: true, crossOrigin: "anonymous" }
                            : undefined
                        }
                        className="block"
                      />
                      {/* Render SVG hidden for SVG download */}
                      <div className="hidden">
                        <QRCodeSVG
                          id="qr-code-svg"
                          value={text}
                          size={200}
                          level="H"
                          fgColor={fgColor}
                          bgColor={bgColor}
                          imageSettings={
                            logoUrl
                              ? { src: logoUrl, height: 48, width: 48, excavate: true, crossOrigin: "anonymous" }
                              : undefined
                          }
                        />
                      </div>
                    </>
                  )}
                </div>

                <h3 className="text-white font-black text-2xl">Live Preview</h3>
                <p className="text-indigo-100 text-sm mt-2 font-medium">Ready to capture attention</p>

                <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full px-2 sm:px-6">
                  <button
                    onClick={downloadPng}
                    disabled={!text.trim()}
                    className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black py-4 rounded-2xl shadow-xl hover:-translate-y-1 transition-all uppercase text-sm disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Download PNG
                  </button>
                  <button
                    onClick={downloadSvg}
                    disabled={!text.trim()}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-400/20 dark:bg-indigo-300/10 text-white font-black py-4 rounded-2xl backdrop-blur-sm border border-indigo-300/30 dark:border-indigo-400/20 uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <Download className="w-4 h-4" />
                    Export SVG
                  </button>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto w-full">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-6 sm:p-10 shadow-xl shadow-indigo-100/50 dark:shadow-none border border-indigo-50 dark:border-slate-800 transition-colors duration-200">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Generation History</h2>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-sm font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center">
                  <History className="w-12 h-12 text-indigo-200 dark:text-indigo-900/50 mb-4" />
                  <h3 className="text-lg font-black text-slate-700 dark:text-slate-300">No history yet</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-medium">
                    Codes you generate and download will automatically be saved here for easy access later.
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-6 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-wider hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    Create your first QR Code →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {history.map((item) => (
                    <div key={item.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors flex flex-col">
                      <div className="flex justify-between items-start mb-6 gap-4">
                        <div className="flex-1 truncate">
                          <p className="font-bold text-slate-700 dark:text-slate-200 truncate" title={item.text}>
                            {item.text}
                          </p>
                          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteFromHistory(item.id)}
                          className="text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 p-2 rounded-xl transition-colors shrink-0 bg-white dark:bg-slate-900 shadow-sm"
                          title="Delete from history"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center justify-center mb-6 shadow-sm flex-1 border border-transparent dark:border-slate-800 transition-colors">
                        <QRCodeSVG
                          value={item.text}
                          size={120}
                          level="H"
                          fgColor={item.fgColor}
                          bgColor={item.bgColor}
                          imageSettings={
                            item.logoUrl
                              ? { src: item.logoUrl, height: 30, width: 30, excavate: true, crossOrigin: "anonymous" }
                              : undefined
                          }
                        />
                      </div>
                      
                      <button
                        onClick={() => loadFromHistory(item)}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white font-black uppercase tracking-wider py-3 px-4 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-md transition-all text-xs sm:text-sm"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reload Editor
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Analytics />
    </div>
  );
}
