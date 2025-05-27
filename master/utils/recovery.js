import { fetchChunkFromPeer, fetchAvailableParityChunks } from '../services/peerCommunicator.js';
import { decryptChunk } from './encryption.js';
import { recoverChunksUsingParity } from './reedSolomonCodec.js';

export const recoverCorruptedChunks = async (chunks, corruptedIndices, dhtData) => {
  const fixedChunks = [...chunks];

  for(const index of corruptedIndices) {
    let chunkDHTData = dhtData.chunkMap[index];

    // Trying to fetch from peers (encrypted)
    let encryptedChunk = await fetchChunkFromPeer(
      chunkDHTData.encFileName.split('.')[0],
      chunkDHTData.peerId,
      index
    );

    if(encryptedChunk) {
      try {
        const decryptedChunk = await decryptChunk(encryptedChunk, chunkDHTData.ivHex, chunkDHTData.authTagHex);
        if(!decryptedChunk) throw new Error('Decryption failed');
        fixedChunks[index] = decryptedChunk;
        continue;
      } catch(err) {
        console.log(`[FileRec] Peer chunk decryption failed for chunk ${index}, falling back to parity.`);
      }
    }

    console.log(`[FileRec] Chunk ${index} not recoverable from peer. Attempting parity-based recovery.`);

    const parityChunks = await fetchAvailableParityChunks(dhtData.dataChunkCount, dhtData.parityChunkCount, dhtData.chunkMap);

    try {
      const allChunks = [...fixedChunks, ...parityChunks];
      allChunks[index] = null;

      const recoveredChunk = await recoverChunksUsingParity(
        allChunks,
        index,
        dhtData.dataChunkCount+dhtData.parityChunkCount,
        dhtData.dataChunkCount
      );

      if(!recoveredChunk) {
        throw new Error('Reed-Solomon decode returned null.');
      }

      fixedChunks[index] = recoveredChunk;
    } catch(err) {
      console.log(`[FileRec] Failed to reconstruct chunk ${index}: ${err.message}.`);
      throw new Error('Reed-Solomon decode failed.');
    }
  }

  return fixedChunks;
};

