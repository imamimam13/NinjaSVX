import React, { useState } from 'react';
import { useSvx } from '../context/SvxContext';
import { Radio, Mic, Activity, Volume2, ShieldAlert } from 'lucide-react';

export const RadioHUD = () => {
  const { radioState, triggerPtt } = useSvx();
  const [isHoldingPtt, setIsHoldingPtt] = useState(false);

  const handlePttDown = () => {
    setIsHoldingPtt(true);
    triggerPtt(true);
  };

  const handlePttUp = () => {
    setIsHoldingPtt(false);
    triggerPtt(false);
  };

  const vu = radioState.vuLevel || 0;

  return (
    <div className="tactical-card p-5 mb-4">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        
        {/* RX (Squelch) Indicator */}
        <div
          className={`flex-1 w-full p-4 rounded-lg border transition-all duration-200 flex items-center justify-between ${
            radioState.sql
              ? 'bg-emerald-950/30 border-ninja-neon shadow-neon'
              : 'bg-ninja-900/60 border-ninja-border/60 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center font-mono font-bold text-lg border transition-all ${
                radioState.sql
                  ? 'bg-ninja-neon/20 border-ninja-neon text-ninja-neon animate-pulse-glow'
                  : 'bg-ninja-950 border-ninja-border text-slate-600'
              }`}
            >
              RX
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">RECEIVER / SQL</div>
              <div
                className={`text-lg font-mono font-bold ${
                  radioState.sql ? 'text-ninja-neon' : 'text-slate-600'
                }`}
              >
                {radioState.sql ? 'SQUELCH OPEN' : 'CARRIER MUTED'}
              </div>
            </div>
          </div>
          <Activity
            className={`w-6 h-6 transition-all ${
              radioState.sql ? 'text-ninja-neon animate-bounce' : 'text-slate-700'
            }`}
          />
        </div>

        {/* Center Transmission Display */}
        <div className="flex-1 w-full text-center py-2 px-4 rounded-lg bg-ninja-900/80 border border-ninja-border">
          <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-1">
            CURRENT TALKER / NODE TRAFFIC
          </div>
          <div className="font-mono text-2xl lg:text-3xl font-extrabold tracking-wider min-h-[36px] flex items-center justify-center">
            {radioState.activeTalker ? (
              <span className="text-ninja-neon drop-shadow-[0_0_12px_rgba(0,255,157,0.5)]">
                {radioState.activeTalker}
              </span>
            ) : radioState.tx ? (
              <span className="text-ninja-crimson drop-shadow-[0_0_12px_rgba(255,42,95,0.6)]">
                {radioState.callsign} [TX]
              </span>
            ) : (
              <span className="text-slate-600 text-lg font-medium">STANDBY • CHANNEL CLEAR</span>
            )}
          </div>
          <div className="text-xs font-mono text-slate-400 mt-1 flex items-center justify-center gap-2">
            <span>ACTIVE TG: <strong className="text-ninja-cyan">#{radioState.activeTg}</strong></span>
            <span>•</span>
            <span>MODULE: <strong className="text-ninja-amber">{radioState.activeModule}</strong></span>
          </div>
        </div>

        {/* TX (PTT) Indicator */}
        <div
          className={`flex-1 w-full p-4 rounded-lg border transition-all duration-200 flex items-center justify-between ${
            radioState.tx
              ? 'bg-rose-950/40 border-ninja-crimson shadow-crimson'
              : 'bg-ninja-900/60 border-ninja-border/60 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center font-mono font-bold text-lg border transition-all ${
                radioState.tx
                  ? 'bg-ninja-crimson/20 border-ninja-crimson text-ninja-crimson animate-pulse-glow shadow-crimson-strong'
                  : 'bg-ninja-950 border-ninja-border text-slate-600'
              }`}
            >
              TX
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">TRANSMITTER</div>
              <div
                className={`text-lg font-mono font-bold ${
                  radioState.tx ? 'text-ninja-crimson' : 'text-slate-600'
                }`}
              >
                {radioState.tx ? 'TRANSMITTING' : 'TX IDLE'}
              </div>
            </div>
          </div>
          <Radio
            className={`w-6 h-6 transition-all ${
              radioState.tx ? 'text-ninja-crimson animate-pulse' : 'text-slate-700'
            }`}
          />
        </div>

      </div>

      {/* Audio Level VU Meter & Tactical PTT Trigger */}
      <div className="mt-5 pt-4 border-t border-ninja-border/60 flex flex-col md:flex-row items-center gap-4">
        {/* Dual VU Meter */}
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Volume2 size={12} className={vu > 0 ? 'text-ninja-cyan' : 'text-slate-600'} />
              AUDIO LEVEL (AF IN / OUT)
            </span>
            <span>{vu > 0 ? `${vu}%` : '0%'}</span>
          </div>

          <div className="h-4 bg-ninja-950 rounded border border-ninja-border/80 overflow-hidden relative flex">
            {/* VU Segments */}
            <div
              className="h-full transition-all duration-150 ease-out bg-gradient-to-r from-emerald-500 via-yellow-400 to-rose-600"
              style={{ width: `${Math.min(100, Math.max(0, vu))}%` }}
            />
            {/* Grid ticks */}
            <div className="absolute inset-0 flex justify-between pointer-events-none px-2">
              <span className="w-[1px] h-full bg-ninja-border/60" />
              <span className="w-[1px] h-full bg-ninja-border/60" />
              <span className="w-[1px] h-full bg-ninja-border/60" />
              <span className="w-[1px] h-full bg-ninja-border/60" />
              <span className="w-[1px] h-full bg-ninja-border/60" />
            </div>
          </div>
        </div>

        {/* Tactical Push-To-Talk Button */}
        <div className="w-full md:w-auto">
          <button
            onMouseDown={handlePttDown}
            onMouseUp={handlePttUp}
            onTouchStart={handlePttDown}
            onTouchEnd={handlePttUp}
            className={`w-full md:w-56 py-2.5 px-4 rounded font-mono font-bold text-sm tracking-wider uppercase border transition-all select-none flex items-center justify-center gap-2 ${
              radioState.tx || isHoldingPtt
                ? 'bg-ninja-crimson text-white border-white shadow-crimson-strong scale-95'
                : 'bg-ninja-850 hover:bg-ninja-800 text-ninja-crimson border-ninja-crimson/50 hover:border-ninja-crimson shadow-tactical'
            }`}
          >
            <Mic size={18} />
            <span>{radioState.tx ? 'TX ACTIVE (RELEASE)' : 'PUSH TO TRANSMIT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
