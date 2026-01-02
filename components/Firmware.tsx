import React, { useState } from 'react';
import { ARDUINO_CODE, WIRING_GUIDE } from '../utils/firmwareTemplate';
import { Copy, Check, Download } from 'lucide-react';

export const Firmware: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ARDUINO_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([ARDUINO_CODE], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "CoopController.ino";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Viewer */}
        <div className="bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-800 flex flex-col h-[600px]">
          <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-white font-semibold flex items-center gap-2">
              Firmware Code (.ino)
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs transition-colors"
              >
                <Download size={14} /> Download
              </button>
              <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 py-1.5 ${copied ? 'bg-emerald-600' : 'bg-emerald-700 hover:bg-emerald-600'} text-white rounded text-xs transition-colors`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-slate-950">
            <pre className="font-mono text-xs md:text-sm text-emerald-300 whitespace-pre-wrap">
              <code>{ARDUINO_CODE}</code>
            </pre>
          </div>
        </div>

        {/* Wiring Guide */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 flex flex-col h-[600px]">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
             <h3 className="text-slate-800 font-semibold">Hardware Setup</h3>
          </div>
          <div className="flex-1 overflow-auto p-6 prose prose-slate text-sm max-w-none">
             <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                <p className="text-amber-700 m-0 font-medium">Safety First</p>
                <p className="text-amber-600 m-0 mt-1">Always disconnect power before wiring components. Double check motor driver polarities.</p>
             </div>
             <pre className="whitespace-pre-wrap font-sans text-slate-600">{WIRING_GUIDE}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};