import React, { useState, useRef, useEffect } from 'react';
import { useSvx } from '../context/SvxContext';
import { Terminal, Search, Trash2, Pause, Play, Download } from 'lucide-react';

export const LogViewer = () => {
  const { logs } = useSvx();
  const [filter, setFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(l => 
    l.text.toLowerCase().includes(filter.toLowerCase())
  );

  const getLineClass = (text) => {
    if (text.includes('squelch is OPEN') || text.includes('talker start')) {
      return 'text-ninja-neon';
    }
    if (text.includes('transmitting ON') || text.includes('transmitter ON') || text.includes('PTT')) {
      return 'text-ninja-crimson font-semibold';
    }
    if (text.includes('EchoLink') || text.includes('Reflector')) {
      return 'text-ninja-cyan';
    }
    if (text.includes('ERROR') || text.includes('FAIL') || text.includes('Warn')) {
      return 'text-ninja-amber font-semibold';
    }
    return 'text-slate-400';
  };

  const handleDownloadLogs = () => {
    const raw = logs.map(l => `[${l.time}] ${l.text}`).join('\n');
    const blob = new Blob([raw], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ninjasvx-log-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tactical-card p-4 flex flex-col h-80">
      <div className="flex flex-wrap items-center justify-between border-b border-ninja-border/70 pb-3 mb-2 gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="text-ninja-neon w-5 h-5" />
          <h2 className="font-mono font-bold text-sm tracking-wider uppercase text-slate-100">
            SVXLINK REALTIME CONSOLE
          </h2>
          <span className="font-mono text-[10px] text-slate-500">
            ({logs.length} lines)
          </span>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-ninja-950 border border-ninja-border rounded px-2.5 py-1 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-ninja-cyan w-32 sm:w-48 pl-7"
            />
            <Search size={12} className="absolute left-2.5 top-2 text-slate-500" />
          </div>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded border text-xs font-mono transition-all ${
              autoScroll
                ? 'bg-ninja-850 border-ninja-border text-ninja-neon'
                : 'bg-ninja-900 border-ninja-border text-slate-500'
            }`}
            title={autoScroll ? 'Pause auto-scroll' : 'Resume auto-scroll'}
          >
            {autoScroll ? <Pause size={13} /> : <Play size={13} />}
          </button>

          <button
            onClick={handleDownloadLogs}
            className="p-1.5 rounded bg-ninja-900 border border-ninja-border text-slate-400 hover:text-white"
            title="Download Logs"
          >
            <Download size={13} />
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={logContainerRef}
        className="flex-1 bg-ninja-950 rounded border border-ninja-border/80 p-3 font-mono text-xs overflow-y-auto space-y-1 select-text"
      >
        {filteredLogs.map((l) => (
          <div key={l.id} className="flex gap-2 leading-relaxed">
            <span className="text-slate-600 text-[10px] select-none shrink-0">
              [{l.time}]
            </span>
            <span className={`break-all ${getLineClass(l.text)}`}>
              {l.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
