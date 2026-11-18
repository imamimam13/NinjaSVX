import React, { useState } from 'react';
import { useSvx } from '../context/SvxContext';
import { Hash, Send, Delete, Play } from 'lucide-react';

export const DtmfKeypad = () => {
  const { sendDtmf } = useSvx();
  const [digits, setDigits] = useState('');

  const keys = [
    ['1', '2', '3', 'A'],
    ['4', '5', '6', 'B'],
    ['7', '8', '9', 'C'],
    ['*', '0', '#', 'D']
  ];

  const handleKeyPress = (char) => {
    sendDtmf(char);
    setDigits(prev => prev + char);
  };

  const handleSendFull = () => {
    if (digits.trim()) {
      sendDtmf(digits.trim());
      setDigits('');
    }
  };

  const handleClear = () => {
    setDigits('');
  };

  const macros = [
    { label: '*1# PARROT', cmd: '*1#' },
    { label: '*# STATUS', cmd: '*#' },
    { label: '# DEACTIVATE', cmd: '#' },
    { label: '9191# TG91', cmd: '9191#' },
    { label: '9999# ECHOTEST', cmd: '9999#' }
  ];

  return (
    <div className="tactical-card p-4 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-ninja-border/70 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Hash className="text-ninja-amber w-5 h-5" />
          <h2 className="font-mono font-bold text-sm tracking-wider uppercase text-slate-100">
            DTMF MATRIX // COMMAND INJECTOR
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase">PTY LINKED</span>
      </div>

      {/* Digits Display / Input Bar */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 bg-ninja-950 border border-ninja-border rounded px-3 py-1.5 font-mono text-base font-bold text-ninja-amber tracking-widest min-h-[38px] flex items-center overflow-x-auto">
          {digits || <span className="text-slate-600 text-xs">AWAITING KEYSTROKES...</span>}
        </div>
        <button
          onClick={handleClear}
          title="Clear digits"
          className="px-2.5 rounded bg-ninja-900 hover:bg-ninja-800 border border-ninja-border text-slate-400 hover:text-white"
        >
          <Delete size={14} />
        </button>
        <button
          onClick={handleSendFull}
          title="Send sequence"
          className="px-3 rounded bg-ninja-800 hover:bg-ninja-700 border border-ninja-amber/50 text-ninja-amber font-mono font-bold text-xs flex items-center gap-1"
        >
          <Send size={13} />
          <span>SEND</span>
        </button>
      </div>

      {/* 4x4 DTMF Keypad Grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {keys.flat().map((k) => {
          const isLetter = ['A', 'B', 'C', 'D'].includes(k);
          const isAction = ['*', '#'].includes(k);

          return (
            <button
              key={k}
              onClick={() => handleKeyPress(k)}
              className={`h-11 rounded font-mono text-base font-bold border transition-all active:scale-95 flex items-center justify-center ${
                isLetter
                  ? 'bg-ninja-900 border-ninja-cyan/40 text-ninja-cyan hover:bg-ninja-cyan/10'
                  : isAction
                  ? 'bg-ninja-900 border-ninja-amber/40 text-ninja-amber hover:bg-ninja-amber/10'
                  : 'bg-ninja-900/90 border-ninja-border hover:border-slate-400 text-slate-100 hover:bg-ninja-800'
              }`}
            >
              {k}
            </button>
          );
        })}
      </div>

      {/* Macro Presets */}
      <div>
        <div className="text-[11px] font-mono uppercase text-slate-400 mb-2">MACRO PRESETS</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {macros.map((m, idx) => (
            <button
              key={idx}
              onClick={() => sendDtmf(m.cmd)}
              className="py-1 px-2 rounded bg-ninja-950 hover:bg-ninja-900 border border-ninja-border/80 hover:border-ninja-amber/50 text-[11px] font-mono text-slate-300 hover:text-ninja-amber transition-colors text-left flex items-center justify-between"
            >
              <span>{m.label}</span>
              <Play size={10} className="opacity-50" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
