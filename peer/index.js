import express from 'express';
import config from './config/appConfig.js';
import { initializePeer } from './utils/initSetup.js';
import storageRoutes from "./routes/storageRoutes.js";
import { loadStoredChunks } from './services/storageService.js';
import { startHeartbeat } from './services/heartbeatService.js';

// Express configs
const app = express();
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Routes
app.use("/api/storage", storageRoutes);

// Initializing Functions
initializePeer();
loadStoredChunks();

app.listen(config.node.port, () => {
  console.log(`[${config.node.id}] Running on port ${config.node.port}`);
  startHeartbeat();
});
