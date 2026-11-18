import fs from 'fs';
import { EventEmitter } from 'events';
import { config } from '../config.js';

class LogWatcher extends EventEmitter {
  constructor() {
    super();
    this.logFile = config.paths.logFile;
    this.recentLogs = [];
    this.maxLogs = 250;
    this.filePosition = 0;

    this.state = {
      callsign: config.callsign,
      sql: false,
      tx: false,
      activeTg: config.defaultTg,
      monitoredTgs: [91, 92, 93],
      activeTalker: null,
      activeModule: 'None',
      vuLevel: 0,
      ctcss: '88.5 Hz',
      freq: '144.850 MHz',
      nodeType: 'Simplex / Repeater Server'
    };

    this.lastHeard = [
      { id: 1, callsign: 'YB0ABC', tg: 91, source: 'Reflector', duration: 14, timestamp: new Date(Date.now() - 45000).toISOString() },
      { id: 2, callsign: 'YC1DEF', tg: 91, source: 'EchoLink', duration: 22, timestamp: new Date(Date.now() - 120000).toISOString() },
      { id: 3, callsign: 'W1AW', tg: 91, source: 'Reflector', duration: 8, timestamp: new Date(Date.now() - 360000).toISOString() }
    ];

    this.echolinkStations = [
      { callsign: 'YC1DEF-L', id: '123456', ip: '192.168.1.105', connectedAt: new Date(Date.now() - 600000).toISOString() }
    ];
  }

  addLog(line) {
    const entry = {
      id: Date.now() + Math.random(),
      time: new Date().toLocaleTimeString(),
      text: line
    };
    this.recentLogs.push(entry);
    if (this.recentLogs.length > this.maxLogs) {
      this.recentLogs.shift();
    }
    this.emit('log', entry);
    this.parseLine(line);
  }

  parseLine(line) {
    // Squelch state
    if (line.includes('The squelch is OPEN')) {
      this.state.sql = true;
      this.emit('state_change', this.state);
    } else if (line.includes('The squelch is CLOSED')) {
      this.state.sql = false;
      this.state.vuLevel = 0;
      this.emit('state_change', this.state);
    }

    // Transmitter state
    if (line.includes('Turning the transmitter ON')) {
      this.state.tx = true;
      this.emit('state_change', this.state);
    } else if (line.includes('Turning the transmitter OFF')) {
      this.state.tx = false;
      this.emit('state_change', this.state);
    }

    // Reflector talker start
    const talkerMatch = line.match(/talker start on TG\s+([0-9]+)\s+from\s+([A-Z0-9\/-]+)/i);
    if (talkerMatch) {
      const tg = parseInt(talkerMatch[1], 10);
      const call = talkerMatch[2];
      this.state.activeTg = tg;
      this.state.activeTalker = call;
      this.state.sql = true;
      this.addLastHeard(call, tg, 'Reflector');
      this.emit('state_change', this.state);
    }

    // Reflector talker stop
    if (line.includes('talker stop')) {
      this.state.activeTalker = null;
      this.emit('state_change', this.state);
    }

    // TG selection
    const tgSelectMatch = line.match(/Selecting TG\s*#?([0-9]+)/i);
    if (tgSelectMatch) {
      this.state.activeTg = parseInt(tgSelectMatch[1], 10);
      this.emit('state_change', this.state);
    }

    // EchoLink connection
    const elMatch = line.match(/Incoming EchoLink connection from\s+([A-Z0-9\/-]+)\s+\(([0-9]+)\)/i);
    if (elMatch) {
      const call = elMatch[1];
      const id = elMatch[2];
      if (!this.echolinkStations.some(s => s.callsign === call)) {
        this.echolinkStations.push({
          callsign: call,
          id,
          ip: 'Remote Client',
          connectedAt: new Date().toISOString()
        });
        this.emit('echolink_change', this.echolinkStations);
      }
    }

    // EchoLink disconnection
    const elDiscMatch = line.match(/EchoLink connection closed to\s+([A-Z0-9\/-]+)/i);
    if (elDiscMatch) {
      const call = elDiscMatch[1];
      this.echolinkStations = this.echolinkStations.filter(s => s.callsign !== call);
      this.emit('echolink_change', this.echolinkStations);
    }

    // Module activation
    const modMatch = line.match(/Activating module Module([A-Za-z]+)/i);
    if (modMatch) {
      this.state.activeModule = modMatch[1];
      this.emit('state_change', this.state);
    } else if (line.includes('Deactivating module')) {
      this.state.activeModule = 'None';
      this.emit('state_change', this.state);
    }
  }

  addLastHeard(callsign, tg, source) {
    const entry = {
      id: Date.now(),
      callsign,
      tg: tg || this.state.activeTg,
      source: source || 'RF',
      duration: Math.floor(Math.random() * 20) + 5,
      timestamp: new Date().toISOString()
    };
    this.lastHeard.unshift(entry);
    if (this.lastHeard.length > 20) {
      this.lastHeard.pop();
    }
    this.emit('last_heard_change', this.lastHeard);
  }

  start() {
    if (config.isSimulation) {
      console.log('[LogWatcher] Running in SIMULATION mode.');
      return;
    }

    try {
      if (fs.existsSync(this.logFile)) {
        const stats = fs.statSync(this.logFile);
        this.filePosition = Math.max(0, stats.size - 5000); // read last 5KB
        this.readNewLogs();

        fs.watchFile(this.logFile, { interval: 500 }, () => {
          this.readNewLogs();
        });
        console.log(`[LogWatcher] Watching real SvxLink log: ${this.logFile}`);
      } else {
        console.warn(`[LogWatcher] Log file not found at ${this.logFile}`);
      }
    } catch (err) {
      console.error(`[LogWatcher] Watch error:`, err.message);
    }
  }

  readNewLogs() {
    try {
      const stats = fs.statSync(this.logFile);
      if (stats.size < this.filePosition) {
        this.filePosition = 0; // log was rotated
      }
      if (stats.size > this.filePosition) {
        const length = stats.size - this.filePosition;
        const buffer = Buffer.alloc(length);
        const fd = fs.openSync(this.logFile, 'r');
        fs.readSync(fd, buffer, 0, length, this.filePosition);
        fs.closeSync(fd);
        this.filePosition = stats.size;

        const lines = buffer.toString('utf-8').split('\n');
        for (const line of lines) {
          if (line.trim()) {
            this.addLog(line.trim());
          }
        }
      }
    } catch (err) {
      console.error('[LogWatcher] Read error:', err.message);
    }
  }
}

export const logWatcher = new LogWatcher();
