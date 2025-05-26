import fs from 'fs';
import config from '../config/appConfig.js';

const OFFLINE_THRESHOLD_MS = 30 * 1000; // 30 seconds

export let peers = [];

export const loadPeersOnRestart = async () => {
  try {

    const data = await fs.readFileSync(config.paths.peerRegistry, 'utf-8');
    const parsed = JSON.parse(data);

    if(Array.isArray(parsed.peers)) {

      peers = parsed.peers;
      console.log(`[SysInit] Loaded peer-registry.json into memory.`);

    } else {
      console.log(`persistent/peer-registry.json doesn't contain 'peers' array. Starting fresh.`);
      peers = [];
    }

  } catch(err) {
    console.log(`Failed to load persistent/peer-registry.json. Starting fresh.\nError:`, err.message);
    peers = [];
  }
};

const savePeersToFile = async () => {
  try {
    const content = JSON.stringify({ peers }, null, 2);
    await fs.writeFileSync(config.paths.peerRegistry, content);
  } catch(err) {
    console.log(err);
  }
};

export const registerPeer = async (peerData) => {
  const { peerId, host, port } = peerData;

  const api = `http://${host}:${port}`;

  const now = new Date().toLocaleString('en-GB');

  const existing = peers.find(p => p.id === peerId);
  if(existing) {
    existing.api = api;
    existing.lastSeen = now;
    existing.status = 'alive';
    
    console.log(`[PeerReg] Peer with ID: ${peerId} marked alive.`);
  } else {
    peers.push({
      id: peerId,
      api,
      lastSeen: now,
      status: 'alive',
      registeredAt: now
    });

    console.log(`[PeerReg] Registered peer with ID: ${peerData.peerId}`);
  }

  await savePeersToFile();

  return { success: true };
};

export const updatePeerHeartbeat = async (peerId) => {
  const now = new Date().toLocaleString('en-GB');

  const peer = peers.find(p => p.id === peerId);
  if(peer) {
    if(peer.status === 'offline') {
      console.log(`[PeerReg] Peer with ID: ${peerId} marked alive.`);
    }
    peer.lastSeen = now;
    peer.status = 'alive';
    await savePeersToFile();
  } else {
    console.log(`[PeerReg] Peer with ID: ${peerId} sent heartbeat but is not registered.`);
  }
};

export const checkPeerLiveness = () => {
  const now = Date.now()
  let changed = false;

  peers.forEach(peer => {
    const [datePart, timePart] = peer.lastSeen.split(', ');
    const [dd, mm, yyyy] = datePart.split('/');
    const lastSeen = new Date(`${yyyy}-${mm}-${dd}T${timePart}`);

    const isAlive = (now - lastSeen) <= OFFLINE_THRESHOLD_MS;

    if(peer.status === 'alive' && !isAlive) {
      peer.status = 'offline';
      changed = true;
      console.log(`[PeerReg] Peer with ID: ${peer.id} marked offline.`);
    }
  });

  if(changed) {
    savePeersToFile();
  }
};
