import React, { useState } from 'react';
import { useSvx } from '../context/SvxContext';
import { Network, PhoneCall, PhoneOff, UserCheck, Radio } from 'lucide-react';

export const EchoLinkPanel = () => {
  const { echolinkStations, connectEchoLink, disconnectEchoLink } = useSvx();
  const [nodeInput, setNodeInput] = useState('');

  const quickEchoLinks = [
    { id: '9999', name: 'Echo Test (9999)' },
    { id: '9100', name: 'Conference #9100' },
    { id: '123456', name: 'Demo Node' }
  ];

  const handleConnect = (e) => {
    e.preventDefault();
    if (nodeInput.trim()) {
      connectEchoLink(nodeInput.trim());
      setNodeInput('');
    }
  };

  return (
    <div className="tactical-card p-4 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-ninja-border/70 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Network className="text-ninja-cyan w-5 h-5" />
          <h2 className="font-mono font-bold text-sm tracking-wider uppercase text-slate-100">
            ECHOLINK // NODE LINKING
          </h2>
        </div>
        <div className="font-mono text-xs px-2 py-0.5 rounded bg-ninja-900 border border-ninja-cyan/30 text-ninja-cyan">
          {echolinkStations.length} CONNECTED
        </div>
      </div>

      {/* Dial Input Form */}
      <form onSubmit={handleConnect} className="flex gap-2 mb-4">
        <input
          type="number"
          placeholder="EchoLink Node ID (e.g. 9999)"
          value={nodeInput}
          onChange={(e) => setNodeInput(e.target.value)}
          className="flex-1 bg-ninja-950 border border-ninja-border rounded px-3 py-1.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-ninja-cyan"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded bg-ninja-800 hover:bg-ninja-700 border border-ninja-cyan/50 text-ninja-cyan font-mono text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <PhoneCall size={13} />
          <span>CONNECT</span>
        </button>
      </form>

      {/* Quick Connect Presets */}
      <div className="mb-4">
        <div className="text-[11px] font-mono uppercase text-slate-400 mb-2">QUICK NODES</div>
        <div className="flex flex-wrap gap-2">
          {quickEchoLinks.map(n => (
            <button
              key={n.id}
              onClick={() => connectEchoLink(n.id)}
              className="py-1 px-2.5 rounded bg-ninja-900 hover:bg-ninja-800 border border-ninja-border hover:border-ninja-cyan text-slate-300 hover:text-white font-mono text-xs transition-all"
            >
              {n.name}
            </button>
          ))}
          <button
            onClick={() => disconnectEchoLink()}
            className="py-1 px-2.5 rounded bg-rose-950/30 hover:bg-rose-900/40 border border-ninja-crimson/50 text-ninja-crimson font-mono text-xs font-bold transition-all ml-auto flex items-center gap-1"
          >
            <PhoneOff size={12} />
            <span>DISCONNECT ALL (#)</span>
          </button>
        </div>
      </div>

      {/* Connected Stations List */}
      <div className="flex-1 flex flex-col min-h-[160px]">
        <div className="text-[11px] font-mono uppercase text-slate-400 mb-2 flex items-center justify-between">
          <span>ACTIVE ECHOLINK CONNECTIONS</span>
          <UserCheck size={12} className="text-slate-500" />
        </div>
        <div className="flex-1 bg-ninja-950/70 border border-ninja-border/70 rounded overflow-y-auto max-h-56 divide-y divide-ninja-border/40">
          {echolinkStations && echolinkStations.length > 0 ? (
            echolinkStations.map((station, idx) => (
              <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-ninja-900/40 transition-colors">
                <div>
                  <div className="font-mono font-bold text-xs text-ninja-cyan">
                    {station.callsign}
                  </div>
                  <div className="font-mono text-[10px] text-slate-500">
                    Node ID: #{station.id} • {station.ip}
                  </div>
                </div>
                <button
                  onClick={() => disconnectEchoLink()}
                  className="px-2 py-0.5 rounded text-[10px] font-mono text-ninja-crimson border border-ninja-crimson/40 hover:bg-ninja-crimson/10 transition-colors"
                >
                  DISCONNECT
                </button>
              </div>
            ))
          ) : (
            <div className="p-4 text-center font-mono text-xs text-slate-600">
              No EchoLink stations currently linked.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
