import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Trash2, PauseCircle, PlayCircle } from 'lucide-react';

interface LogsProps {
  logs: LogEntry[];
  clearLogs: () => void;
}

export const Logs: React.FC<LogsProps> = ({ logs, clearLogs }) => {
  const endRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = React.useState(false);

  useEffect(() => {
    if (!paused) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, paused]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-800">
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-white font-mono text-sm font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          /dev/ttyUSB0 (115200 baud)
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setPaused(!paused)}
            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
            title={paused ? "Resume" : "Pause"}
          >
            {paused ? <PlayCircle size={18} /> : <PauseCircle size={18} />}
          </button>
          <button 
            onClick={clearLogs}
            className="p-1.5 hover:bg-red-900/30 rounded text-slate-400 hover:text-red-400 transition-colors"
            title="Clear Logs"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs md:text-sm space-y-1 bg-slate-950 text-slate-300">
        {logs.length === 0 && (
          <div className="text-slate-600 italic text-center mt-10">Waiting for serial data...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 hover:bg-slate-900/50 px-2 py-0.5 rounded">
            <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
            <span className={`font-bold shrink-0 w-12 ${
              log.level === 'INFO' ? 'text-blue-400' :
              log.level === 'WARN' ? 'text-amber-400' :
              log.level === 'ERROR' ? 'text-red-400' : 'text-slate-400'
            }`}>{log.level}</span>
            <span className="break-all">{log.message}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};