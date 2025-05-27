import fs from 'fs';
import path from 'path';
import axios from 'axios';
import config from '../config/appConfig.js';
import { peers } from './peerService.js';
import { decryptChunk, getChunkHash } from '../utils/encryption.js';

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
        console.log(`[PeerCom] Chunk-${chunk.index}-${chunk.encFileName.split('.')[1]} sent to ${peer.id}`);
      } else {
        console.log(`Failed to upload chunk ${chunk.encFileName} to ${peer.id}`);
      }

    } catch(err) {
      console.log(err);
    }
  }

  return updatedChunkMap;
};

export const fetchChunkFromPeer = async (chunkId, peerId, chunkIndex) => {
  const peer = peers.find(p => p.id === peerId);
  
  if(peer.status !== 'alive') {
    console.log(`[FileRec] Unable to fetch chunk at index ${chunkIndex}: ${peerId} is down.`)
    return null;
  }

  try {

    const response = await axios.get(`${peer.api}/api/storage/${chunkId}`, {
      'responseType': 'arraybuffer',
    });

    let chunkData = Buffer.from(response.data);
    let chunkHash = await getChunkHash(chunkData);

    if(chunkHash !== chunkId) {
      throw new Error('Hash mismatch - possible tampering or corruption.');
    }

    return chunkData;

  } catch(err) {
    if(err.response && err.response.status === 404) {
      console.log(`[FileRec] Unable to fetch chunk at index ${chunkIndex}: Chunk not found on peer.`);
    } else {
      console.log(`[FileRec] Unable to fetch chunk at index ${chunkIndex}:`, err.message);
    }
    return null;
  }
};

export const fetchAvailableParityChunks = async (chunkCount, parityCount, chunkMap) => {
  const parityChunks = await Promise.all(
    Array.from({ length: parityCount }, async (__dirname, i) => {
      const globalIndex = chunkCount + i;
      const parityMeta = chunkMap[globalIndex];

      try {
        const chunk = await fetchChunkFromPeer(
          parityMeta.encFileName.split('.')[0],
          parityMeta.peerId,
          globalIndex
        );
        const decrypted = await decryptChunk(chunk, parityMeta.ivHex, parityMeta.authTagHex);
        return decrypted || null;
      } catch(err) {
        console.log(`[FileRec] Failed to fetch parity chunk ${i} (index ${globalIndex}): ${err.message}`);
      }
    })
  );

  return parityChunks;
};
