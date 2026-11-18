import fs from 'fs';
import { config } from '../config.js';

class PtyManager {
  constructor() {
    this.dtmfPty = config.paths.dtmfPty;
    this.statePty = config.paths.statePty;
    this.onStateChange = null;
  }

  /**
   * Send DTMF command directly into SvxLink DTMF_PTY
   * E.g. command = "*1#" (Parrot), "9191#" (TG 91), "#" (Deactivate)
   */
  sendDtmf(command) {
    if (config.isSimulation) {
      console.log(`[SIMULATOR PTY] DTMF Injected: ${command}`);
      return { success: true, command, simulated: true };
    }

    try {
      if (!fs.existsSync(this.dtmfPty)) {
        console.warn(`[PTY] DTMF PTY does not exist at ${this.dtmfPty}`);
        return { success: false, error: `DTMF PTY not found at ${this.dtmfPty}` };
      }

      // Write character string followed by newline or raw
      fs.appendFileSync(this.dtmfPty, `${command}\n`);
      console.log(`[PTY] Sent DTMF: ${command} to ${this.dtmfPty}`);
      return { success: true, command };
    } catch (err) {
      console.error(`[PTY] Error writing DTMF:`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Select a Reflector Talkgroup
   * Typically '91' followed by '#' or '91<TG>#'
   */
  selectTalkgroup(tg) {
    const cleanTg = String(tg).replace(/[^0-9]/g, '');
    if (!cleanTg) return { success: false, error: 'Invalid Talkgroup' };
    const dtmf = `91${cleanTg}#`;
    return this.sendDtmf(dtmf);
  }

  /**
   * Add/Remove Talkgroup Monitor
   * E.g. '92<TG>#' to monitor, '93<TG>#' to unmonitor
   */
  monitorTalkgroup(tg, action = 'add') {
    const cleanTg = String(tg).replace(/[^0-9]/g, '');
    if (!cleanTg) return { success: false, error: 'Invalid Talkgroup' };
    const prefix = action === 'add' ? '92' : '93';
    return this.sendDtmf(`${prefix}${cleanTg}#`);
  }

  /**
   * Connect to EchoLink Node by ID
   * In SvxLink EchoLink Module (ID usually 2): 2<nodeId>#
   */
  connectEchoLink(nodeId) {
    const cleanId = String(nodeId).replace(/[^0-9]/g, '');
    if (!cleanId) return { success: false, error: 'Invalid EchoLink Node ID' };
    return this.sendDtmf(`2${cleanId}#`);
  }

  /**
   * Disconnect EchoLink
   * In SvxLink: '#'
   */
  disconnectEchoLink() {
    return this.sendDtmf('#');
  }

  /**
   * Activate Module (Parrot=1, EchoLink=2, etc.)
   */
  activateModule(moduleId) {
    return this.sendDtmf(`${moduleId}#`);
  }

  /**
   * Deactivate current module
   */
  deactivateModule() {
    return this.sendDtmf('#');
  }
}

export const ptyManager = new PtyManager();
