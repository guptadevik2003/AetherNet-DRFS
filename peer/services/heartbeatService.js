import axios from 'axios';
import config from '../config/appConfig.js';

const HEARTBEAT_INTERVAL_MS = 10 * 1000; // 10 seconds

export const startHeartbeat = async () => {
  setInterval(async () => {
    try {

      await axios.post(`${config.masterApi}/api/peers/heartbeat`, {
        peerId: config.node.id
      });
      
    } catch(err) {
      console.log('[Heartbeat] Failed to ping master:', err.message);
    }
  }, HEARTBEAT_INTERVAL_MS);
};
