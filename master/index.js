import express from 'express';
import config from './config/appConfig.js';
import peerRoutes from './routes/peerRoutes.js';
import { loadPeersOnRestart } from './services/peerService.js';
import { startWatcher } from './core/folderWatcher.js';

// Express configs
const app = express();
app.use(express.json());

// API for Peers
app.use('/api/peers', peerRoutes);

// Initializing Functions
loadPeersOnRestart();

app.listen(config.node.port, () => {
  console.log(`[${config.node.id}] Running on port ${config.node.port}`);
  startWatcher();
});
