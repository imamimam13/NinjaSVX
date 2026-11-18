import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const isLinux = process.platform === 'linux';
const confExists = fs.existsSync(process.env.SVXLINK_CONF || '/etc/svxlink/svxlink.conf');
const forceSim = process.env.SIMULATION_MODE === 'true';
const autoSim = process.env.SIMULATION_MODE === 'auto' || !process.env.SIMULATION_MODE;

const isSimulation = forceSim || (autoSim && (!isLinux || !confExists));

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  host: process.env.HOST || '0.0.0.0',
  isLinux,
  isSimulation,
  callsign: process.env.DEFAULT_CALLSIGN || 'YB0NINJA',
  defaultTg: parseInt(process.env.DEFAULT_TG || '91', 10),
  paths: {
    svxlinkConf: process.env.SVXLINK_CONF || '/etc/svxlink/svxlink.conf',
    echolinkConf: process.env.MODULE_ECHOLINK_CONF || '/etc/svxlink/svxlink.d/ModuleEchoLink.conf',
    logFile: process.env.SVXLINK_LOG || '/var/log/svxlink',
    dtmfPty: process.env.DTMF_PTY || '/tmp/svxlink_dtmf_pty',
    statePty: process.env.STATE_PTY || '/tmp/svxlink_state_pty',
    sampleConfDir: path.resolve(process.cwd(), '../scripts')
  }
};
