import express from 'express';
import config from './config/appConfig.js';
import peerRoutes from './routes/peerRoutes.js';
import { loadPeersOnRestart, checkPeerLiveness } from './services/peerService.js';
import { startWatcher } from './core/folderWatcher.js';
import { initSystemFiles } from './utils/initSetup.js';
import { loadDHTOnRestart } from './core/dhtManager.js';

// Express configs
const app = express();
app.use(express.json());

// API for Peers
app.use('/api/peers', peerRoutes);

// Initializing Functions
initSystemFiles();
loadPeersOnRestart();
loadDHTOnRestart();

// Runs every 20 seconds
setInterval(() => {
  checkPeerLiveness();
}, 20 * 1000);

app.listen(config.node.port, () => {
  console.log(`[${config.node.id}] Running on port ${config.node.port}`);
  startWatcher();
});
