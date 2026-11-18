import React from 'react';
import { useSvx } from '../context/SvxContext';
import { Cpu, Thermometer, HardDrive, Server, RotateCcw, Play, Square, AlertTriangle } from 'lucide-react';

export const SystemHealth = () => {
  const { telemetry, service, controlService } = useSvx();

  const formatUptime = (secs) => {
    if (!secs) return '0m';
    const d = Math.floor(secs / 86400);
    const h = Math.floor((secs % 86400) / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const temp = telemetry?.cpuTemp || 42;
  const isHighTemp = temp > 68;

  return (
    <div className="tactical-card p-4 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-ninja-border/70 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Server className="text-ninja-cyan w-5 h-5" />
          <h2 className="font-mono font-bold text-sm tracking-wider uppercase text-slate-100">
            HOST TELEMETRY & SERVICE
          </h2>
        </div>
        <span className="font-mono text-xs text-slate-400">
          {telemetry?.hostname || 'svxlink-pi'}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* CPU Load */}
        <div className="bg-ninja-950/70 border border-ninja-border rounded p-2.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono mb-1">
            <Cpu size={13} className="text-ninja-neon" />
            <span>CPU LOAD</span>
          </div>
          <div className="font-mono text-lg font-bold text-slate-100">
            {telemetry?.cpuUsage || 0}%
          </div>
        </div>

        {/* CPU Temp */}
        <div className={`bg-ninja-950/70 border rounded p-2.5 ${isHighTemp ? 'border-ninja-crimson' : 'border-ninja-border'}`}>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono mb-1">
            <Thermometer size={13} className={isHighTemp ? 'text-ninja-crimson' : 'text-ninja-cyan'} />
            <span>CPU TEMP</span>
          </div>
          <div className={`font-mono text-lg font-bold flex items-center gap-1 ${isHighTemp ? 'text-ninja-crimson' : 'text-slate-100'}`}>
            <span>{temp}°C</span>
            {isHighTemp && <AlertTriangle size={14} />}
          </div>
        </div>

        {/* RAM Usage */}
        <div className="bg-ninja-950/70 border border-ninja-border rounded p-2.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono mb-1">
            <HardDrive size={13} className="text-ninja-amber" />
            <span>RAM USE</span>
          </div>
          <div className="font-mono text-lg font-bold text-slate-100">
            {telemetry?.memoryUsage || 0}%
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            {telemetry?.memoryUsedMb || 0} / {telemetry?.memoryTotalMb || 1024} MB
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-ninja-950/70 border border-ninja-border rounded p-2.5">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono mb-1">
            <Server size={13} className="text-slate-400" />
            <span>UPTIME</span>
          </div>
          <div className="font-mono text-lg font-bold text-slate-100">
            {formatUptime(telemetry?.uptimeSeconds)}
          </div>
        </div>
      </div>

      {/* SvxLink Service Control */}
      <div className="p-3 bg-ninja-950/80 border border-ninja-border rounded flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto">
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              service?.active
                ? 'bg-ninja-neon shadow-neon animate-pulse'
                : 'bg-ninja-crimson shadow-crimson'
            }`}
          />
          <div>
            <div className="font-mono text-xs font-bold text-slate-200">
              DAEMON: svxlink.service
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              STATUS: {service?.status || 'inactive'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => controlService('restart')}
            className="px-2.5 py-1 rounded bg-ninja-900 hover:bg-ninja-800 border border-ninja-border hover:border-ninja-cyan text-slate-200 font-mono text-xs flex items-center gap-1 transition-all"
            title="Restart SvxLink Service"
          >
            <RotateCcw size={12} className="text-ninja-cyan" />
            <span>RESTART</span>
          </button>
          {service?.active ? (
            <button
              onClick={() => controlService('stop')}
              className="px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/50 border border-ninja-crimson/50 text-ninja-crimson font-mono text-xs flex items-center gap-1 transition-all"
              title="Stop SvxLink Service"
            >
              <Square size={12} />
              <span>STOP</span>
            </button>
          ) : (
            <button
              onClick={() => controlService('start')}
              className="px-2.5 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/50 border border-ninja-neon/50 text-ninja-neon font-mono text-xs flex items-center gap-1 transition-all"
              title="Start SvxLink Service"
            >
              <Play size={12} />
              <span>START</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
