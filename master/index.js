import express from 'express';
import config from './config/appConfig.js';
import registerPeerRoutes from './routes/peerRoutes.js';

const app = express();
app.use(express.json());

registerPeerRoutes(app);

app.listen(config.node.port, () => {
  console.log(`[${config.node.id}] Running on port ${config.node.port}`);
});
