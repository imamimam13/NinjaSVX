import React from 'react';
import { useSvx } from '../context/SvxContext';
import { Layers, Disc, CloudSun, HelpCircle, Power, Check } from 'lucide-react';

export const ModulesPanel = () => {
  const { radioState, activateModule, deactivateModule } = useSvx();

  const modules = [
    {
      id: '1',
      name: 'Parrot',
      fullName: 'ModuleParrot',
      desc: 'Voice recorder & audio playback test',
      icon: Disc,
      color: 'text-ninja-neon',
      cmd: '*1#'
    },
    {
      id: '2',
      name: 'EchoLink',
      fullName: 'ModuleEchoLink',
      desc: 'Global VoIP linking network',
      icon: Layers,
      color: 'text-ninja-cyan',
      cmd: '*2#'
    },
    {
      id: '5',
      name: 'MetarInfo',
      fullName: 'ModuleMetarInfo',
      desc: 'Real-time airport weather voice synthesis',
      icon: CloudSun,
      color: 'text-ninja-amber',
      cmd: '*5#'
    },
    {
      id: '0',
      name: 'Help',
      fullName: 'ModuleHelp',
      desc: 'Interactive voice guidance system',
      icon: HelpCircle,
      color: 'text-slate-300',
      cmd: '*0#'
    }
  ];

  return (
    <div className="tactical-card p-4 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-ninja-border/70 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Layers className="text-ninja-neon w-5 h-5" />
          <h2 className="font-mono font-bold text-sm tracking-wider uppercase text-slate-100">
            SVXLINK MODULES
          </h2>
        </div>
        <button
          onClick={deactivateModule}
          className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950/30 hover:bg-rose-900/40 text-ninja-crimson border border-ninja-crimson/40 flex items-center gap-1"
        >
          <Power size={11} />
          <span>DEACTIVATE ALL (#)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const isActive = radioState.activeModule === mod.name || radioState.activeModule === mod.fullName;

          return (
            <div
              key={mod.id}
              className={`p-3 rounded-lg border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-ninja-900 border-ninja-neon shadow-neon'
                  : 'bg-ninja-950/80 border-ninja-border hover:border-slate-500'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${mod.color}`} />
                    <span className="font-mono font-bold text-xs text-slate-100">
                      {mod.name}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-ninja-900 border border-ninja-border text-slate-400">
                    {mod.cmd}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {mod.desc}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-ninja-border/40">
                <span className="text-[10px] font-mono flex items-center gap-1">
                  {isActive ? (
                    <span className="text-ninja-neon flex items-center gap-1 font-bold">
                      <Check size={12} /> ACTIVE
                    </span>
                  ) : (
                    <span className="text-slate-600">STANDBY</span>
                  )}
                </span>

                <button
                  onClick={() => (isActive ? deactivateModule() : activateModule(mod.id, mod.name))}
                  className={`px-2.5 py-1 rounded font-mono text-[11px] font-bold border transition-all ${
                    isActive
                      ? 'bg-rose-950/40 border-ninja-crimson/60 text-ninja-crimson hover:bg-rose-900/60'
                      : 'bg-ninja-850 hover:bg-ninja-800 border-ninja-border hover:border-ninja-neon text-slate-200'
                  }`}
                >
                  {isActive ? 'EXIT' : 'START'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
