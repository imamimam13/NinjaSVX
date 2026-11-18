import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Check, AlertCircle, Radio, Network, Cpu, Sliders } from 'lucide-react';

export const ConfigModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('radio');
  const [configData, setConfigData] = useState(null);
  const [echoLinkData, setEchoLinkData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/config')
        .then(r => r.json())
        .then(d => setConfigData(d))
        .catch(err => console.error(err));

      fetch('/api/config/echolink')
        .then(r => r.json())
        .then(d => setEchoLinkData(d))
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const res1 = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });
      const res2 = await fetch('/api/config/echolink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(echoLinkData)
      });

      if (res1.ok && res2.ok) {
        setSaveStatus({ success: true, message: 'Settings saved & SvxLink updated!' });
        setTimeout(() => {
          setSaveStatus(null);
          onClose();
        }, 1500);
      } else {
        setSaveStatus({ success: false, message: 'Failed to write configuration file.' });
      }
    } catch (err) {
      setSaveStatus({ success: false, message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (section, key, val) => {
    setConfigData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: val
      }
    }));
  };

  const updateEchoLinkField = (key, val) => {
    setEchoLinkData(prev => ({
      ...prev,
      ModuleEchoLink: {
        ...prev.ModuleEchoLink,
        [key]: val
      }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="tactical-card w-full max-w-2xl bg-ninja-900 border-ninja-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-ninja-border flex items-center justify-between bg-ninja-950/60">
          <div className="flex items-center gap-2">
            <Sliders className="text-ninja-neon w-5 h-5" />
            <h3 className="font-mono font-bold text-sm tracking-wider uppercase text-slate-100">
              SVXLINK CONFIGURATION // SYSTEM SETUP
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-ninja-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-ninja-border px-5 bg-ninja-950/40 gap-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('radio')}
            className={`py-2.5 border-b-2 font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'radio'
                ? 'border-ninja-neon text-ninja-neon'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio size={14} />
            <span>RADIO & LOGIC</span>
          </button>
          <button
            onClick={() => setActiveTab('gpio')}
            className={`py-2.5 border-b-2 font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'gpio'
                ? 'border-ninja-neon text-ninja-neon'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu size={14} />
            <span>GPIO & AUDIO</span>
          </button>
          <button
            onClick={() => setActiveTab('reflector')}
            className={`py-2.5 border-b-2 font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'reflector'
                ? 'border-ninja-neon text-ninja-neon'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network size={14} />
            <span>REFLECTOR</span>
          </button>
          <button
            onClick={() => setActiveTab('echolink')}
            className={`py-2.5 border-b-2 font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'echolink'
                ? 'border-ninja-neon text-ninja-neon'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network size={14} />
            <span>ECHOLINK</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 font-mono text-xs flex-1">
          {configData && activeTab === 'radio' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">CALLSIGN</label>
                <input
                  type="text"
                  value={configData.SimplexLogic?.CALLSIGN || ''}
                  onChange={(e) => updateField('SimplexLogic', 'CALLSIGN', e.target.value)}
                  className="w-full bg-ninja-950 border border-ninja-border rounded px-3 py-2 text-slate-100 focus:border-ninja-neon focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">LOGIC TYPE</label>
                <select
                  value={configData.SimplexLogic?.TYPE || 'Simplex'}
                  onChange={(e) => updateField('SimplexLogic', 'TYPE', e.target.value)}
                  className="w-full bg-ninja-950 border border-ninja-border rounded px-3 py-2 text-slate-100 focus:border-ninja-neon focus:outline-none"
                >
                  <option value="Simplex">Simplex Node</option>
                  <option value="Repeater">Repeater Controller</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">CTCSS TONE (HZ)</label>
                <input
                  type="text"
                  value={configData.SimplexLogic?.REPORT_CTCSS || '88.5'}
                  onChange={(e) => updateField('SimplexLogic', 'REPORT_CTCSS', e.target.value)}
                  className="w-full bg-ninja-950 border border-ninja-border rounded px-3 py-2 text-slate-100 focus:border-ninja-neon focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">ROGER BEEP DELAY (MS)</label>
                <input
                  type="number"
                  value={configData.SimplexLogic?.RGR_SOUND_DELAY || '250'}
                  onChange={(e) => updateField('SimplexLogic', 'RGR_SOUND_DELAY', e.target.value)}
                  className="w-full bg-ninja-950 border border-ninja-border rounded px-3 py-2 text-slate-100 focus:border-ninja-neon focus:outline-none"
                />
              </div>
            </div>
          )}

          {configData && activeTab === 'gpio' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">RX SQUELCH GPIO PIN</label>
                <input
                  type="text"
                  value={configData.Rx1?.GPIO_SQL_PIN || 'gpio24'}
                  onChange={(e) => updateField('Rx1', 'GPIO_SQL_PIN', e.target.value)}
                  className="w-full bg-ninja-950 border border-ninja-border rounded px-3 py-2 text-slate-100 focus:border-ninja-neon focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">TX PTT GPIO PIN</label>
                <input
                  type="text"
                  value={configData.Tx1?.PTT_PIN || 'gpio25'}
                  onChange={(e) => updateField('Tx1', 'PTT_PIN', e.target.value)}
                  className="w-full bg-ninja-950 border border-ninja-border rounded px-3 py-2 text-slate-100 focus:border-ninja-neon focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">AUDIO INPUT DEVICE</label>
                <input
                  type="text"
                  value={configData.Rx1?.AUDIO_DEV || 'alsa:plughw:0'}
                  onChange={(e) => updateField('Rx1', 'AUDIO_DEV', e.target.value)}
                  className="w-full bg-ninja-950 border border-ninja-border rounded px-3 py-2 text-slate-100 focus:border-ninja-neon focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">AUDIO OUTPUT DEVICE</label>
                <input
                  type="text"
                  value={configData.Tx1?.AUDIO_DEV || 'alsa:plughw:0'}
                  onChange={(e) => updateField('Tx1', 'AUDIO_DEV', e.target.value)}
                  className="w-full bg-ninja-950 border border-ninja-border rounded px-3 py-2 text-slate-100 focus:border-ninja-neon focus:outline-none"
                />
              </div>
            </div>
          )}

          {configData && activeTab === 'reflector' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">REFLECTOR HOST</label>
                <input
                  type="text"
                  value={configData.ReflectorLogic?.HOST || 'reflector.svxlink.org'}
                  onChange={(e) => updateField('ReflectorLogic', 'HOST', e.target.value)}
                  className="w-full bg-ninja-950 border border-ninja-border rounded px-3 py-2 text-slate-100 focus:border-ninja-neon focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">PORT</label>
                <input
                  type="text"
                  value={configData.ReflectorLogic?.PORT || '5300'}
                  onChange={(e) => updateField('ReflectorLogic', 'PORT', e.target.value)}
                  className="w-full bg-ninja-950 border border-ninja-border rounded px-3 py-2 text-slate-100 focus:border-ninja-neon focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">DEFAULT TALKGROUP</label>
                <input
                  type="text"
                  value={configData.ReflectorLogic?.DEFAULT_TG || '91'}
                  onChange={(e) => updateField('ReflectorLogic', 'DEFAULT_TG', e.target.value)}
                  className="w-full bg-ninja-950 border border-ninja-border rounded px-3 py-2 text-slate-100 focus:border-ninja-neon focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">AUTH KEY / PASSWORD</label>
                <input
                  type="password"
                  value={configData.ReflectorLogic?.AUTH_KEY || ''}
                  onChange={(e) => updateField('ReflectorLogic', 'AUTH_KEY', e.target.value)}
                  className="w-full bg-ninja-950 border border-ninja-border rounded px-3 py-2 text-slate-100 focus:border-ninja-neon focus:outline-none"
                />
              </div>
            </div>
          )}

          {echoLinkData && activeTab === 'echolink' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">ECHOLINK CALLSIGN</label>
                <input
                  type="text"
                  value={echoLinkData.ModuleEchoLink?.CALLSIGN || ''}
                  onChange={(e) => updateEchoLinkField('CALLSIGN', e.target.value)}
                  className="w-full bg-ninja-950 border border-ninja-border rounded px-3 py-2 text-slate-100 focus:border-ninja-neon focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">PASSWORD</label>
                <input
                  type="password"
                  value={echoLinkData.ModuleEchoLink?.PASSWORD || ''}
                  onChange={(e) => updateEchoLinkField('PASSWORD', e.target.value)}
                  className="w-full bg-ninja-950 border border-ninja-border rounded px-3 py-2 text-slate-100 focus:border-ninja-neon focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">SYSOP NAME</label>
                <input
                  type="text"
                  value={echoLinkData.ModuleEchoLink?.SYSOPNAME || ''}
                  onChange={(e) => updateEchoLinkField('SYSOPNAME', e.target.value)}
                  className="w-full bg-ninja-950 border border-ninja-border rounded px-3 py-2 text-slate-100 focus:border-ninja-neon focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">LOCATION / QTH</label>
                <input
                  type="text"
                  value={echoLinkData.ModuleEchoLink?.LOCATION || ''}
                  onChange={(e) => updateEchoLinkField('LOCATION', e.target.value)}
                  className="w-full bg-ninja-950 border border-ninja-border rounded px-3 py-2 text-slate-100 focus:border-ninja-neon focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-ninja-border bg-ninja-950/60 flex items-center justify-between">
          <div>
            {saveStatus && (
              <span className={`text-xs font-mono flex items-center gap-1 ${saveStatus.success ? 'text-ninja-neon' : 'text-ninja-crimson'}`}>
                {saveStatus.success ? <Check size={14} /> : <AlertCircle size={14} />}
                {saveStatus.message}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-ninja-900 hover:bg-ninja-800 border border-ninja-border text-slate-300 font-mono text-xs font-semibold"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded bg-ninja-neon hover:bg-ninja-neonHover text-ninja-950 font-mono text-xs font-bold shadow-neon flex items-center gap-1.5 transition-all"
            >
              <Save size={14} />
              <span>{isSaving ? 'SAVING...' : 'SAVE & APPLY'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
