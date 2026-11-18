import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SvxContext = createContext(null);

export const SvxProvider = ({ children }) => {
  const [socketConnected, setSocketConnected] = useState(false);
  const [radioState, setRadioState] = useState({
    callsign: 'YB0NINJA',
    sql: false,
    tx: false,
    activeTg: 91,
    monitoredTgs: [91, 92, 93],
    activeTalker: null,
    activeModule: 'None',
    vuLevel: 0,
    ctcss: '88.5 Hz',
    freq: '144.850 MHz',
    nodeType: 'Simplex / Repeater'
  });

  const [lastHeard, setLastHeard] = useState([]);
  const [echolinkStations, setEcholinkStations] = useState([]);
  const [logs, setLogs] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [service, setService] = useState({ active: true, status: 'active' });
  const [isSimulation, setIsSimulation] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const socketRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Play dual-frequency DTMF tone using Web Audio API
  const playDtmfTone = (char) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const dtmfFrequencies = {
        '1': [697, 1209], '2': [697, 1336], '3': [697, 1477], 'A': [697, 1633],
        '4': [770, 1209], '5': [770, 1336], '6': [770, 1477], 'B': [770, 1633],
        '7': [852, 1209], '8': [852, 1336], '9': [852, 1477], 'C': [852, 1633],
        '*': [941, 1209], '0': [941, 1336], '#': [941, 1477], 'D': [941, 1633]
      };

      const freqs = dtmfFrequencies[String(char).toUpperCase()] || [800, 1000];

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.frequency.value = freqs[0];
      osc2.frequency.value = freqs[1];

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.16);
      osc2.stop(ctx.currentTime + 0.16);
    } catch {
      // AudioContext may be blocked before user gesture
    }
  };

  useEffect(() => {
    // Initial fetch
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data.radioState) setRadioState(data.radioState);
        if (data.lastHeard) setLastHeard(data.lastHeard);
        if (data.echolinkStations) setEcholinkStations(data.echolinkStations);
        if (data.telemetry) setTelemetry(data.telemetry);
        if (data.service) setService(data.service);
        setIsSimulation(Boolean(data.isSimulation));
      })
      .catch(err => console.warn('Status fetch error:', err));

    // Socket.io connection
    const socket = io('/', {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('radio_state', (state) => {
      setRadioState(prev => ({ ...prev, ...state }));
    });

    socket.on('last_heard', (data) => {
      setLastHeard(data);
    });

    socket.on('echolink_stations', (data) => {
      setEcholinkStations(data);
    });

    socket.on('telemetry', (data) => {
      setTelemetry(data);
    });

    socket.on('logs_bulk', (bulkLogs) => {
      setLogs(bulkLogs);
    });

    socket.on('log_line', (line) => {
      setLogs(prev => [...prev.slice(-200), line]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendDtmf = async (command) => {
    if (command.length === 1) {
      playDtmfTone(command);
    }
    try {
      const res = await fetch('/api/dtmf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const selectTalkgroup = async (tg) => {
    playDtmfTone('9');
    try {
      const res = await fetch('/api/talkgroup/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tg })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const toggleMonitorTg = async (tg, action = 'add') => {
    try {
      const res = await fetch('/api/talkgroup/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tg, action })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const connectEchoLink = async (nodeId) => {
    playDtmfTone('2');
    try {
      const res = await fetch('/api/echolink/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const disconnectEchoLink = async () => {
    playDtmfTone('#');
    try {
      const res = await fetch('/api/echolink/disconnect', { method: 'POST' });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const activateModule = async (moduleId, name) => {
    playDtmfTone(moduleId);
    try {
      const res = await fetch('/api/module/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, name })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deactivateModule = async () => {
    playDtmfTone('#');
    try {
      const res = await fetch('/api/module/deactivate', { method: 'POST' });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const triggerPtt = async (state) => {
    try {
      const res = await fetch('/api/ptt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const controlService = async (action) => {
    try {
      const res = await fetch(`/api/service/${action}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setService(prev => ({ ...prev, status: action === 'stop' ? 'inactive' : 'active' }));
      }
      return data;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <SvxContext.Provider value={{
      socketConnected,
      radioState,
      lastHeard,
      echolinkStations,
      logs,
      telemetry,
      service,
      isSimulation,
      soundEnabled,
      setSoundEnabled,
      sendDtmf,
      selectTalkgroup,
      toggleMonitorTg,
      connectEchoLink,
      disconnectEchoLink,
      activateModule,
      deactivateModule,
      triggerPtt,
      controlService,
      playDtmfTone
    }}>
      {children}
    </SvxContext.Provider>
  );
};

export const useSvx = () => useContext(SvxContext);
