import express from 'express';
import { ptyManager } from '../svxlink/ptyManager.js';
import { logWatcher } from '../svxlink/logWatcher.js';
import { configParser } from '../svxlink/configParser.js';
import { serviceManager } from '../svxlink/serviceManager.js';
import { telemetry } from '../system/telemetry.js';
import { config } from '../config.js';

export const apiRouter = express.Router();

// Full Status
apiRouter.get('/status', async (req, res) => {
  const [telemetryData, serviceStatus] = await Promise.all([
    telemetry.getMetrics(),
    serviceManager.getStatus()
  ]);

  res.json({
    radioState: logWatcher.state,
    lastHeard: logWatcher.lastHeard,
    echolinkStations: logWatcher.echolinkStations,
    telemetry: telemetryData,
    service: serviceStatus,
    isSimulation: config.isSimulation
  });
});

// Telemetry Only
apiRouter.get('/telemetry', async (req, res) => {
  const data = await telemetry.getMetrics();
  res.json(data);
});

// DTMF Inject
apiRouter.post('/dtmf', (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).json({ error: 'Command is required' });
  
  logWatcher.addLog(`NinjaWeb: Injecting DTMF command "${command}"`);
  const result = ptyManager.sendDtmf(command);
  res.json(result);
});

// Select Talkgroup
apiRouter.post('/talkgroup/select', (req, res) => {
  const { tg } = req.body;
  if (!tg) return res.status(400).json({ error: 'TG is required' });
  
  logWatcher.addLog(`NinjaWeb: Switching to Talkgroup #${tg}`);
  logWatcher.state.activeTg = parseInt(tg, 10);
  const result = ptyManager.selectTalkgroup(tg);
  logWatcher.emit('state_change', logWatcher.state);
  res.json(result);
});

// Monitor Talkgroup
apiRouter.post('/talkgroup/monitor', (req, res) => {
  const { tg, action } = req.body;
  if (!tg) return res.status(400).json({ error: 'TG is required' });
  
  const numTg = parseInt(tg, 10);
  if (action === 'remove') {
    logWatcher.state.monitoredTgs = logWatcher.state.monitoredTgs.filter(t => t !== numTg);
    logWatcher.addLog(`NinjaWeb: Removing monitor for TG #${tg}`);
  } else {
    if (!logWatcher.state.monitoredTgs.includes(numTg)) {
      logWatcher.state.monitoredTgs.push(numTg);
    }
    logWatcher.addLog(`NinjaWeb: Adding monitor for TG #${tg}`);
  }
  
  const result = ptyManager.monitorTalkgroup(tg, action || 'add');
  logWatcher.emit('state_change', logWatcher.state);
  res.json(result);
});

// EchoLink Connect
apiRouter.post('/echolink/connect', (req, res) => {
  const { nodeId } = req.body;
  if (!nodeId) return res.status(400).json({ error: 'Node ID is required' });
  
  logWatcher.addLog(`NinjaWeb: Dialing EchoLink Node #${nodeId}`);
  const result = ptyManager.connectEchoLink(nodeId);
  res.json(result);
});

// EchoLink Disconnect
apiRouter.post('/echolink/disconnect', (req, res) => {
  logWatcher.addLog(`NinjaWeb: Disconnecting EchoLink connection`);
  const result = ptyManager.disconnectEchoLink();
  res.json(result);
});

// Module Controls
apiRouter.post('/module/activate', (req, res) => {
  const { moduleId, name } = req.body;
  logWatcher.addLog(`NinjaWeb: Activating Module ${name || moduleId}`);
  logWatcher.state.activeModule = name || `Module${moduleId}`;
  logWatcher.emit('state_change', logWatcher.state);
  const result = ptyManager.activateModule(moduleId);
  res.json(result);
});

apiRouter.post('/module/deactivate', (req, res) => {
  logWatcher.addLog(`NinjaWeb: Deactivating current module`);
  logWatcher.state.activeModule = 'None';
  logWatcher.emit('state_change', logWatcher.state);
  const result = ptyManager.deactivateModule();
  res.json(result);
});

// Web PTT Trigger (Simulate or activate PTT)
apiRouter.post('/ptt', (req, res) => {
  const { state } = req.body; // true = TX ON, false = TX OFF
  logWatcher.state.tx = Boolean(state);
  logWatcher.addLog(`NinjaWeb: Web PTT ${state ? 'ENGAGED (TX ON)' : 'RELEASED (TX OFF)'}`);
  logWatcher.emit('state_change', logWatcher.state);
  res.json({ success: true, tx: logWatcher.state.tx });
});

// Logs
apiRouter.get('/logs', (req, res) => {
  res.json(logWatcher.recentLogs);
});

// Config Read & Write
apiRouter.get('/config', (req, res) => {
  const data = configParser.readConfig();
  res.json(data);
});

apiRouter.post('/config', (req, res) => {
  const result = configParser.saveConfig(req.body);
  if (result.success) {
    logWatcher.addLog('NinjaWeb: svxlink.conf updated by admin');
  }
  res.json(result);
});

apiRouter.get('/config/echolink', (req, res) => {
  const data = configParser.readEchoLinkConfig();
  res.json(data);
});

apiRouter.post('/config/echolink', (req, res) => {
  const result = configParser.saveEchoLinkConfig(req.body);
  if (result.success) {
    logWatcher.addLog('NinjaWeb: ModuleEchoLink.conf updated by admin');
  }
  res.json(result);
});

// Service Manager
apiRouter.post('/service/:action', async (req, res) => {
  const { action } = req.params;
  logWatcher.addLog(`NinjaWeb: Requesting svxlink service action: ${action.toUpperCase()}`);
  const result = await serviceManager.control(action);
  res.json(result);
});
