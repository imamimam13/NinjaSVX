import { exec } from 'child_process';
import util from 'util';
import { config } from '../config.js';

const execPromise = util.promisify(exec);

class ServiceManager {
  async getStatus() {
    if (config.isSimulation) {
      return {
        service: 'svxlink',
        active: true,
        status: 'active (running) [SIMULATED]',
        since: 'Simulated since server boot'
      };
    }

    try {
      const { stdout } = await execPromise('systemctl is-active svxlink');
      const isActive = stdout.trim() === 'active';
      return {
        service: 'svxlink',
        active: isActive,
        status: stdout.trim()
      };
    } catch (err) {
      return {
        service: 'svxlink',
        active: false,
        status: err.stdout?.trim() || 'inactive'
      };
    }
  }

  async control(action) {
    const validActions = ['start', 'stop', 'restart', 'reload'];
    if (!validActions.includes(action)) {
      return { success: false, error: 'Invalid service action' };
    }

    if (config.isSimulation) {
      console.log(`[SIMULATOR] systemctl ${action} svxlink executed.`);
      return { success: true, action, simulated: true };
    }

    try {
      await execPromise(`sudo systemctl ${action} svxlink`);
      return { success: true, action };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

export const serviceManager = new ServiceManager();
