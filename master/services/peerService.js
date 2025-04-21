import fs from 'fs';
import config from '../config/appConfig.js';

export let peers = [];

export const loadPeersOnRestart = async () => {
  // Load list of already existing peers from master/persistent/peer-registry.json into the above variable called peers.
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
// Develop Logic for getting the peer data from the argument passed in this function
// and then saving that data into the global variable called peers above, and also saving the same info to
// the file master/persistent/peer-registry.json
};
