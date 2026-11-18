import React, { useState, useEffect } from 'react';
import { useSvx } from '../context/SvxContext';
import { Radio, Volume2, VolumeX, Sliders, Shield, Activity, Wifi, WifiOff } from 'lucide-react';

export const HeaderHUD = ({ onOpenConfig }) => {
  const { radioState, socketConnected, isSimulation, soundEnabled, setSoundEnabled } = useSvx();
  const [timeUtc, setTimeUtc] = useState('');
  const [timeLocal, setTimeLocal] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().slice(17, 25) + ' UTC');
      setTimeLocal(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="tactical-card mb-4 px-4 py-3 border-b border-ninja-border/80 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Callsign */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-ninja-900 border border-ninja-neon/50 flex items-center justify-center text-xl shadow-neon">
          🥷
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-wider text-slate-100 uppercase font-mono">
              NINJA<span className="text-ninja-neon">SVX</span>
            </h1>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-ninja-800 text-ninja-cyan border border-ninja-cyan/30">
              v1.0
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-ninja-neon font-bold">{radioState.callsign}</span>
            <span>•</span>
            <span>{radioState.freq}</span>
            <span>•</span>
            <span>CTCSS {radioState.ctcss}</span>
          </div>
        </div>
      </div>

      {/* Clocks & Connection Telemetry */}
      <div className="hidden md:flex items-center gap-6 font-mono text-xs">
        <div className="text-right">
          <div className="text-slate-200 font-bold">{timeLocal}</div>
          <div className="text-slate-400 text-[11px]">{timeUtc}</div>
        </div>

        <div className="h-7 w-[1px] bg-ninja-border" />

        {/* Server & Link Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {socketConnected ? (
              <span className="flex items-center gap-1 text-ninja-neon">
                <Wifi size={14} /> LINK OK
              </span>
            ) : (
              <span className="flex items-center gap-1 text-ninja-crimson">
                <WifiOff size={14} /> LINK LOST
              </span>
            )}
          </div>

          {isSimulation && (
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-ninja-amber border border-ninja-amber/40 text-[10px] uppercase font-bold tracking-wider">
              SIMULATOR
            </span>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Mute UI Audio' : 'Unmute UI Audio'}
          className={`p-2 rounded border transition-all ${
            soundEnabled
              ? 'bg-ninja-850 border-ninja-border text-ninja-neon hover:border-ninja-neon'
              : 'bg-ninja-900 border-ninja-border text-slate-500 hover:text-slate-300'
          }`}
        >
          {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
        </button>

        <button
          onClick={onOpenConfig}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-ninja-850 hover:bg-ninja-800 border border-ninja-border hover:border-ninja-cyan text-slate-200 text-xs font-mono font-semibold transition-all shadow-sm"
        >
          <Sliders size={15} className="text-ninja-cyan" />
          <span>CONFIG</span>
        </button>
      </div>
    </header>
  );
};
