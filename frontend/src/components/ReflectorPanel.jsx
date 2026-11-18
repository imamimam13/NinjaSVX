import React, { useState } from 'react';
import { useSvx } from '../context/SvxContext';
import { Globe, Plus, Trash2, Radio, CheckCircle, Clock } from 'lucide-react';

export const ReflectorPanel = () => {
  const { radioState, selectTalkgroup, toggleMonitorTg, lastHeard } = useSvx();
  const [customTg, setCustomTg] = useState('');
  const [monitorInput, setMonitorInput] = useState('');

  const presetTgs = [
    { id: 91, label: '91 WW' },
    { id: 92, label: '92 EU' },
    { id: 93, label: '93 NA' },
    { id: 510, label: '510 ID' },
    { id: 5100, label: '5100 NUS' },
    { id: 38, label: '38 ASIA' }
  ];

  const handleSelectTg = (tg) => {
    selectTalkgroup(tg);
  };

  const handleCustomTgSubmit = (e) => {
    e.preventDefault();
    if (customTg.trim()) {
      selectTalkgroup(customTg.trim());
      setCustomTg('');
    }
  };

  const handleAddMonitor = (e) => {
    e.preventDefault();
    if (monitorInput.trim()) {
      toggleMonitorTg(monitorInput.trim(), 'add');
      setMonitorInput('');
    }
  };

  return (
    <div className="tactical-card p-4 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-ninja-border/70 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Globe className="text-ninja-neon w-5 h-5" />
          <h2 className="font-mono font-bold text-sm tracking-wider uppercase text-slate-100">
            SVX REFLECTOR // TALKGROUPS
          </h2>
        </div>
        <div className="font-mono text-xs px-2 py-0.5 rounded bg-ninja-900 border border-ninja-neon/30 text-ninja-neon">
          ACTIVE TG: #{radioState.activeTg}
        </div>
      </div>

      {/* Preset TG Buttons */}
      <div className="mb-4">
        <div className="text-[11px] font-mono uppercase text-slate-400 mb-2">QUICK TALKGROUP SELECT</div>
        <div className="grid grid-cols-3 gap-2">
          {presetTgs.map(tg => {
            const isActive = radioState.activeTg === tg.id;
            return (
              <button
                key={tg.id}
                onClick={() => handleSelectTg(tg.id)}
                className={`py-1.5 px-2 rounded font-mono text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-ninja-neon text-ninja-950 border-ninja-neon shadow-neon'
                    : 'bg-ninja-900 hover:bg-ninja-800 text-slate-300 border-ninja-border hover:border-slate-500'
                }`}
              >
                {tg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom TG Input */}
      <form onSubmit={handleCustomTgSubmit} className="flex gap-2 mb-4">
        <input
          type="number"
          placeholder="Enter TG (e.g. 91)"
          value={customTg}
          onChange={(e) => setCustomTg(e.target.value)}
          className="flex-1 bg-ninja-950 border border-ninja-border rounded px-3 py-1.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-ninja-neon"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded bg-ninja-800 hover:bg-ninja-700 border border-ninja-neon/50 text-ninja-neon font-mono text-xs font-bold transition-all"
        >
          SELECT
        </button>
      </form>

      {/* Monitored Talkgroups */}
      <div className="mb-4">
        <div className="text-[11px] font-mono uppercase text-slate-400 mb-2">MONITORED TALKGROUPS</div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {radioState.monitoredTgs && radioState.monitoredTgs.map(tg => (
            <span
              key={tg}
              className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded bg-ninja-900 border border-ninja-border text-ninja-cyan"
            >
              TG #{tg}
              <button
                onClick={() => toggleMonitorTg(tg, 'remove')}
                className="text-slate-500 hover:text-ninja-crimson ml-1"
                title="Remove monitor"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <form onSubmit={handleAddMonitor} className="flex gap-2">
          <input
            type="number"
            placeholder="Add TG to monitor"
            value={monitorInput}
            onChange={(e) => setMonitorInput(e.target.value)}
            className="flex-1 bg-ninja-950 border border-ninja-border rounded px-3 py-1 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-ninja-cyan"
          />
          <button
            type="submit"
            className="px-2.5 py-1 rounded bg-ninja-900 hover:bg-ninja-800 border border-ninja-cyan/40 text-ninja-cyan font-mono text-xs font-bold"
          >
            + ADD
          </button>
        </form>
      </div>

      {/* Last Heard List */}
      <div className="flex-1 flex flex-col min-h-[160px]">
        <div className="text-[11px] font-mono uppercase text-slate-400 mb-2 flex items-center justify-between">
          <span>LAST HEARD STATIONS</span>
          <Clock size={12} className="text-slate-500" />
        </div>
        <div className="flex-1 bg-ninja-950/70 border border-ninja-border/70 rounded overflow-y-auto max-h-56 divide-y divide-ninja-border/40">
          {lastHeard && lastHeard.length > 0 ? (
            lastHeard.map((item) => (
              <div key={item.id} className="p-2 flex items-center justify-between hover:bg-ninja-900/40 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-ninja-neon">
                    {item.callsign}
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-ninja-900 text-ninja-cyan border border-ninja-border">
                    TG #{item.tg}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>{item.duration}s</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center font-mono text-xs text-slate-600">
              No recent traffic recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
