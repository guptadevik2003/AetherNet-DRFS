import fs from 'fs';
import config from '../config/appConfig.js';

export let peers = [];

export const loadPeersOnRestart = async () => {
  try {

    const data = await fs.readFileSync(config.paths.peerRegistry, 'utf-8');
    const parsed = JSON.parse(data);

    if(Array.isArray(parsed.peers)) {

      peers = parsed.peers;

    } else {
      console.log(`persistent/peer-registry.json doesn't contain 'peers' array. Starting fresh.`);
      peers = [];
    }

  } catch(err) {
    console.log(`Failed to load persistent/peer-registry.json. Starting fresh.\nError:`, err.message);
    peers = [];
  }
};

export const registerPeer = async (peer) => {

};
