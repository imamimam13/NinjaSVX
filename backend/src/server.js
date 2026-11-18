import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config.js';
import { apiRouter } from './routes/api.js';
import { logWatcher } from './svxlink/logWatcher.js';
import { simulator } from './svxlink/simulator.js';
import { telemetry } from './system/telemetry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// CORS for local dev and remote clients
app.use(cors({ origin: '*' }));
app.use(express.json());

// API Endpoints
app.use('/api', apiRouter);

// Serve built frontend if exists
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', async (socket) => {
  // Send initial snapshot
  const metrics = await telemetry.getMetrics();
  socket.emit('radio_state', logWatcher.state);
  socket.emit('last_heard', logWatcher.lastHeard);
  socket.emit('echolink_stations', logWatcher.echolinkStations);
  socket.emit('telemetry', metrics);
  socket.emit('logs_bulk', logWatcher.recentLogs);
});

// Broadcast log watcher events to all connected clients
logWatcher.on('state_change', (state) => {
  io.emit('radio_state', state);
});

logWatcher.on('last_heard_change', (lastHeard) => {
  io.emit('last_heard', lastHeard);
});

logWatcher.on('echolink_change', (stations) => {
  io.emit('echolink_stations', stations);
});

logWatcher.on('log', (logEntry) => {
  io.emit('log_line', logEntry);
});

// Periodic telemetry broadcast every 3 seconds
setInterval(async () => {
  try {
    const metrics = await telemetry.getMetrics();
    io.emit('telemetry', metrics);
  } catch (err) {
    // ignore
  }
}, 3000);

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>NinjaSVX Tactical Node</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
          <body style="background:#090d16;color:#00ff9d;font-family:sans-serif;padding:2rem;text-align:center;">
            <h1>⚔️ NinjaSVX Tactical Backend Active</h1>
            <p style="color:#94a3b8;">Port: ${config.port} | Mode: ${config.isSimulation ? 'SIMULATION' : 'PRODUCTION'}</p>
            <p>API is running at <a href="/api/status" style="color:#38bdf8;">/api/status</a>.</p>
            <p style="color:#64748b;font-size:0.9rem;">To view the full Tactical UI, build the frontend or run frontend dev server.</p>
          </body>
        </html>
      `);
    }
  });
});

// Start services
server.listen(config.port, config.host, () => {
  console.log(`\n=================================================`);
  console.log(`  🥷  NINJASVX TACTICAL CONTROLLER RUNNING       `);
  console.log(`=================================================`);
  console.log(`  Target Host   : http://${config.host}:${config.port}`);
  console.log(`  Platform      : ${process.platform} (${config.isLinux ? 'Linux OS' : 'Dev Platform'})`);
  console.log(`  Mode          : ${config.isSimulation ? 'TACTICAL SIMULATOR' : 'HARDWARE SVXLINK'}`);
  console.log(`  Callsign      : ${config.callsign}`);
  console.log(`  Default TG    : #${config.defaultTg}`);
  console.log(`=================================================\n`);

  logWatcher.start();
  if (config.isSimulation) {
    simulator.start();
  }
});
