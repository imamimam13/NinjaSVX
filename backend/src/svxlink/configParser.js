import fs from 'fs';
import path from 'path';
import ini from 'ini';
import { config } from '../config.js';

class ConfigParser {
  constructor() {
    this.mainConfPath = config.paths.svxlinkConf;
    this.echoLinkConfPath = config.paths.echolinkConf;
  }

  getDefaultConfig() {
    return {
      GLOBAL: {
        MODULE_PATH: '/usr/lib/svxlink',
        LOGICS: 'SimplexLogic',
        CFG_DIR: 'svxlink.d',
        TIMESTAMP_FORMAT: '%c',
        CARD_SAMPLE_RATE: '48000',
        CARD_CHANNELS: '1'
      },
      SimplexLogic: {
        TYPE: 'Simplex',
        RX: 'Rx1',
        TX: 'Tx1',
        MODULES: 'ModuleHelp,ModuleParrot,ModuleEchoLink',
        CALLSIGN: config.callsign,
        SHORT_IDENT_INTERVAL: '10',
        LONG_IDENT_INTERVAL: '60',
        EVENT_HANDLER: '/usr/share/svxlink/events.tcl',
        DEFAULT_LANG: 'en_US',
        RGR_SOUND_DELAY: '250',
        REPORT_CTCSS: '88.5',
        TX_CTCSS: 'ALWAYS',
        STATE_PTY: config.paths.statePty
      },
      ReflectorLogic: {
        TYPE: 'Reflector',
        HOST: 'reflector.svxlink.org',
        PORT: '5300',
        CALLSIGN: config.callsign,
        AUTH_KEY: 'MySecretPassword',
        DEFAULT_TG: String(config.defaultTg),
        MONITOR_TGS: '91,92,93',
        TG_SELECT_TIMEOUT: '30'
      },
      Rx1: {
        TYPE: 'Local',
        AUDIO_DEV: 'alsa:plughw:0',
        AUDIO_CHANNEL: '0',
        SQL_DET: 'GPIO',
        GPIO_SQL_PIN: 'gpio24',
        SQL_START_DELAY: '0',
        SQL_DELAY: '40',
        SQL_HANGTIME: '300',
        DTMF_DEC_TYPE: 'PTY',
        DTMF_PTY: config.paths.dtmfPty
      },
      Tx1: {
        TYPE: 'Local',
        AUDIO_DEV: 'alsa:plughw:0',
        AUDIO_CHANNEL: '0',
        PTT_TYPE: 'GPIO',
        PTT_PIN: 'gpio25',
        PTT_HANGTIME: '1000',
        TIMEOUT: '300',
        TX_DELAY: '500',
        CTCSS_FQ: '88.5',
        CTCSS_MODE: 'ALWAYS'
      }
    };
  }

  getDefaultEchoLinkConfig() {
    return {
      ModuleEchoLink: {
        NAME: 'EchoLink',
        ID: '2',
        TIMEOUT: '60',
        CALLSIGN: `${config.callsign}-L`,
        PASSWORD: 'YourEchoLinkPassword',
        SYSOPNAME: 'Ninja Sysop',
        LOCATION: 'Jakarta, Indonesia',
        DESCRIPTION: 'NinjaSVX High-Tech Radio Node',
        MAX_QSOS: '10',
        MAX_CONNECTIONS: '11',
        LINK_IDLE_TIMEOUT: '300',
        AUTOCON_ECHOLINK_ID: '9999',
        USE_GSM_ONLY: '0',
        DEFAULT_LANG: 'en_US'
      }
    };
  }

  readConfig() {
    try {
      if (fs.existsSync(this.mainConfPath)) {
        const raw = fs.readFileSync(this.mainConfPath, 'utf-8');
        return ini.parse(raw);
      }
    } catch (err) {
      console.warn(`[Config] Failed reading ${this.mainConfPath}:`, err.message);
    }
    return this.getDefaultConfig();
  }

  readEchoLinkConfig() {
    try {
      if (fs.existsSync(this.echoLinkConfPath)) {
        const raw = fs.readFileSync(this.echoLinkConfPath, 'utf-8');
        return ini.parse(raw);
      }
    } catch (err) {
      console.warn(`[Config] Failed reading ${this.echoLinkConfPath}:`, err.message);
    }
    return this.getDefaultEchoLinkConfig();
  }

  saveConfig(newConfig) {
    if (config.isSimulation) {
      console.log('[SIMULATOR] Saved configuration successfully (simulated).');
      return { success: true, simulated: true };
    }

    try {
      // Create backup
      if (fs.existsSync(this.mainConfPath)) {
        const backupPath = `${this.mainConfPath}.bak.${Date.now()}`;
        fs.copyFileSync(this.mainConfPath, backupPath);
      }

      const formatted = ini.stringify(newConfig);
      fs.writeFileSync(this.mainConfPath, formatted, 'utf-8');
      return { success: true };
    } catch (err) {
      console.error('[Config] Error saving config:', err);
      return { success: false, error: err.message };
    }
  }

  saveEchoLinkConfig(newConfig) {
    if (config.isSimulation) {
      console.log('[SIMULATOR] Saved EchoLink config successfully (simulated).');
      return { success: true, simulated: true };
    }

    try {
      if (fs.existsSync(this.echoLinkConfPath)) {
        const backupPath = `${this.echoLinkConfPath}.bak.${Date.now()}`;
        fs.copyFileSync(this.echoLinkConfPath, backupPath);
      }

      const formatted = ini.stringify(newConfig);
      fs.writeFileSync(this.echoLinkConfPath, formatted, 'utf-8');
      return { success: true };
    } catch (err) {
      console.error('[Config] Error saving EchoLink config:', err);
      return { success: false, error: err.message };
    }
  }
}

export const configParser = new ConfigParser();
