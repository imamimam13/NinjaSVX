import { logWatcher } from './logWatcher.js';

class Simulator {
  constructor() {
    this.intervalId = null;
    this.audioIntervalId = null;
    this.callsigns = ['YB0ABC', 'YC1DEF', 'YB2VZX', 'W1AW', 'JA1ABC', 'DL4MDF', 'VK2HAM', '9M2PJU'];
    this.talkgroups = [91, 92, 93, 510, 5100, 38];
  }

  start() {
    console.log('[Simulator] Starting Ninja Tactical SvxLink Simulator...');

    logWatcher.addLog('SvxLink v1.99.99 (Ninja Edition) Copyright (C) 2003-2026 Tobias Blomberg / SM0SVX');
    logWatcher.addLog('SvxLink comes with ABSOLUTELY NO WARRANTY. This is free software.');
    logWatcher.addLog('Using configuration file: /etc/svxlink/svxlink.conf');
    logWatcher.addLog('--- Starting Logic: SimplexLogic ---');
    logWatcher.addLog('Loading module "ModuleEchoLink" into logic "SimplexLogic"');
    logWatcher.addLog('Module EchoLink v1.3.99 starting...');
    logWatcher.addLog('EchoLink: Connecting to echo server at echolink.org');
    logWatcher.addLog('EchoLink: Logged on as YB0NINJA-L');
    logWatcher.addLog('Reflector: Connected to reflector.svxlink.org:5300');
    logWatcher.addLog('Reflector: Selecting TG #91');

    // Simulate VU meter updates
    this.audioIntervalId = setInterval(() => {
      if (logWatcher.state.sql || logWatcher.state.tx) {
        logWatcher.state.vuLevel = Math.floor(Math.random() * 55) + 35; // 35 - 90%
      } else {
        logWatcher.state.vuLevel = Math.max(0, logWatcher.state.vuLevel - 15);
      }
      logWatcher.emit('state_change', logWatcher.state);
    }, 200);

    // Simulate radio & reflector traffic every 7 - 15 seconds
    this.cycleTraffic();
  }

  cycleTraffic() {
    const delay = Math.floor(Math.random() * 8000) + 6000;
    this.intervalId = setTimeout(() => {
      this.simulateEvent();
      this.cycleTraffic();
    }, delay);
  }

  simulateEvent() {
    const rand = Math.random();

    if (rand < 0.45) {
      // Incoming transmission
      const call = this.callsigns[Math.floor(Math.random() * this.callsigns.length)];
      const tg = logWatcher.state.activeTg;
      logWatcher.addLog(`Rx1: The squelch is OPEN`);
      logWatcher.addLog(`Reflector: Received talker start on TG ${tg} from ${call}`);

      // Transmission duration
      const duration = Math.floor(Math.random() * 4000) + 3000;
      setTimeout(() => {
        logWatcher.addLog(`Reflector: Received talker stop on TG ${tg} from ${call}`);
        logWatcher.addLog(`Rx1: The squelch is CLOSED`);
        logWatcher.addLog(`Tx1: Turning the transmitter ON (Roger Beep)`);
        setTimeout(() => {
          logWatcher.addLog(`Tx1: Turning the transmitter OFF`);
        }, 800);
      }, duration);

    } else if (rand < 0.7) {
      // Occasional TG activity notice
      const otherTg = this.talkgroups[Math.floor(Math.random() * this.talkgroups.length)];
      const call = this.callsigns[Math.floor(Math.random() * this.callsigns.length)];
      logWatcher.addLog(`Reflector: TG ${otherTg} activity detected from ${call}`);

    } else if (rand < 0.85) {
      // Heartbeat or status log
      logWatcher.addLog(`SimplexLogic: Node status: RX IDLE, Squelch CLOSED, EchoLink: 1 client`);
    }
  }

  stop() {
    if (this.intervalId) clearTimeout(this.intervalId);
    if (this.audioIntervalId) clearInterval(this.audioIntervalId);
  }
}

export const simulator = new Simulator();
