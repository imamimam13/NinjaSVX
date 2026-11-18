import React, { useState } from 'react';
import { SvxProvider } from './context/SvxContext';
import { HeaderHUD } from './components/HeaderHUD';
import { RadioHUD } from './components/RadioHUD';
import { ReflectorPanel } from './components/ReflectorPanel';
import { EchoLinkPanel } from './components/EchoLinkPanel';
import { DtmfKeypad } from './components/DtmfKeypad';
import { ModulesPanel } from './components/ModulesPanel';
import { SystemHealth } from './components/SystemHealth';
import { LogViewer } from './components/LogViewer';
import { ConfigModal } from './components/ConfigModal';

function DashboardContent() {
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <div className="min-h-screen p-3 md:p-6 max-w-7xl mx-auto flex flex-col justify-between">
      <div>
        {/* Top Tactical HUD Bar */}
        <HeaderHUD onOpenConfig={() => setConfigOpen(true)} />

        {/* Center Primary Radio HUD */}
        <RadioHUD />

        {/* Main Tactical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Reflector & Talkgroups */}
          <div className="h-full">
            <ReflectorPanel />
          </div>

          {/* EchoLink Matrix */}
          <div className="h-full">
            <EchoLinkPanel />
          </div>

          {/* DTMF & Modules */}
          <div className="flex flex-col gap-4 h-full">
            <div className="flex-1">
              <DtmfKeypad />
            </div>
            <div className="flex-1">
              <ModulesPanel />
            </div>
          </div>
        </div>

        {/* Host Telemetry & Live SvxLink Console */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-1">
            <SystemHealth />
          </div>
          <div className="lg:col-span-2">
            <LogViewer />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-4 pt-3 border-t border-ninja-border/50 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500">
        <div>
          <span>NINJASVX TACTICAL SUITE • FOR SVXLINK BY SM0SVX</span>
        </div>
        <div>
          <span>OPTIMIZED FOR RASPBERRY PI 3/4/5 & DEBIAN / UBUNTU SERVER</span>
        </div>
      </footer>

      {/* Settings Modal */}
      <ConfigModal isOpen={configOpen} onClose={() => setConfigOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <SvxProvider>
      <DashboardContent />
    </SvxProvider>
  );
}
