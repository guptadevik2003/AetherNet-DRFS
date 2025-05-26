import fs from 'fs';
import axios from 'axios';
import config from '../config/appConfig.js';

export const initializePeer = async () => {
  const folders = [
    config.paths.baseStorage,
    config.paths.dataStorage,
    config.paths.parityStorage
  ];

  folders.forEach(folder => {
    if(!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log(`[PeerInit] Created folder: ${folder}`);
    }
  });

  const storedChunksPath = config.paths.chunkRecord;
  if(!fs.existsSync(storedChunksPath)) {
    fs.writeFileSync(storedChunksPath, JSON.stringify({ chunks: [] }, null, 2));
    console.log(`[PeerInit] Created: ${storedChunksPath}`);
  }

  // Registering Peer with Master on start
  let response = await axios.post(`${config.masterApi}/api/peers/register`, {
    peerId: config.node.id,
    host: 'localhost',
    port: config.node.port
  });
  if(response?.data?.success) {
    console.log(`[PeerInit] Registered with ${response.data.masterId}.`);
  }

};
