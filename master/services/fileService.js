import config from '../config/appConfig.js';
import { chunkFile } from '../utils/chunker.js';
import { generateParityChunks } from '../utils/reedSolomonCodec.js';
import { encryptAndSaveChunks } from '../utils/encryption.js';
import { distributeChunks } from './peerCommunicator.js';
import { deleteEncryptedChunks } from '../utils/deleteChunks.js';
import { addMetadataToDHT } from '../core/dhtManager.js';

export const handleNewFile = async (filePath, fileName) => {
  try {

    // Splitting File into Data Chunks (unencrypted)
    const dataChunks = await chunkFile(filePath, config.reedSolomon.chunkCount);

    // Generating Parity Chunks (unencrypted)
    const parityChunks = await generateParityChunks(
      dataChunks, dataChunks.length,
      Number(config.reedSolomon.parityCount)
    );

    // Encrypting Chunks
    const chunkMap = await encryptAndSaveChunks(
      [...dataChunks, ...parityChunks],
      config.reedSolomon.chunkCount,
      config.paths.encryptedData
    );

    // Distributing Chunks
    const distributedChunkMap = await distributeChunks(chunkMap);
    await deleteEncryptedChunks(chunkMap);

    // Updating DHT
    await addMetadataToDHT(fileName, distributedChunkMap, dataChunks[0].length);

    console.log(`[FileSvc] Processed file ${fileName} successfully`);

  } catch(err) {
    console.log(`[FileSvc] Error processing file ${fileName}:`, err);
  }
};
