import fs from 'fs';
import path from 'path';
import axios from 'axios';
import config from '../config/appConfig.js';
import { peers } from './peerService.js';

let globalPeerIndex = 0;

const getNextAlivePeer = (lastPeer) => {
  const alivePeers = peers.filter(p => p.status === 'alive');
  if(alivePeers.length === 0) return null;

  const selectedPeer = alivePeers[globalPeerIndex % alivePeers.length];

  globalPeerIndex = (globalPeerIndex + 1) % alivePeers.length;

  return selectedPeer;
};

export const distributeChunks = async (chunkMap) => {
  const updatedChunkMap = [];

  for(const chunk of chunkMap) {
    try {

      let peer = getNextAlivePeer();
      if(!peer) {
        console.log(`No alive peers found. Skipping chunk index ${chunk.index}`);
        continue;
      }

      const filePath = path.join(config.paths.encryptedData, chunk.encFileName);
      const fileBuffer = await fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');

      const response = await axios.post(`${peer.api}/api/storage/save`, {
        chunkId: chunk.encFileName.split('.')[0],
        data: base64Data,
        type: chunk.encFileName.split('.')[1]==='parity' ? 'parity' : 'data'
      });

      if(response.data.success) {
        updatedChunkMap.push({
          ...chunk,
          peerId: peer.id
        });
        console.log(`[PeerCom] Chunk ${chunk.encFileName} sent to ${peer.id}`);
      } else {
        console.log(`Failed to upload chunk ${chunk.encFileName} to ${peer.id}`);
      }

    } catch(err) {
      console.log(err);
    }
  }

  return updatedChunkMap;
};
