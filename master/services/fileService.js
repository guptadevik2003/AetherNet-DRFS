import fs from 'fs';
import config from '../config/appConfig.js';
import { chunkFile, chunkFileBySize } from '../utils/chunker.js';
import { generateParityChunks } from '../utils/reedSolomonCodec.js';
import { encryptAndSaveChunks, encryptAndCompareChunkHashes } from '../utils/encryption.js';
import { distributeChunks } from './peerCommunicator.js';
import { deleteEncryptedChunks } from '../utils/deleteChunks.js';
import { addMetadataToDHT, getFileDHTData } from '../core/dhtManager.js';
import { recoverCorruptedChunks } from '../utils/recovery.js';

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
    console.log(`[FileSvc] Error processing file ${fileName}:`, err.message);
  }
};

export const recoverFileIfCorrupted = async (filePath, fileName) => {
  try {

    // Getting DHT Data for this file
    const dhtData = await getFileDHTData(fileName);
    if(!dhtData) {
      throw new Error('File not found in DHT Mapping.');
    }

    // Splitting File into Data Chunks (unencrypted)
    const dataChunks = await chunkFileBySize(filePath, dhtData.chunkSize, dhtData.dataChunkCount);

    // Re-encrypt chunks with stored IV and comparing hashes to detect corruption
    const corruptedIndices = await encryptAndCompareChunkHashes(dataChunks, dhtData.chunkMap);

    if(corruptedIndices.length === 0) {
      return console.log(`[FileSvc] No corruption detected for ${fileName}`);
    }

    console.log(`[FileSvc] Corruption detected at chunk(s): ${corruptedIndices.join(', ')}`);
    
    // Repairing corrupted chunks
    const fixedChunks = await recoverCorruptedChunks(dataChunks, corruptedIndices, dhtData);

    // Reassemble fixed chunks into a single buffer
    const fixedBuffer = Buffer.concat(fixedChunks);

    // Saving recovered file
    await fs.writeFileSync(filePath, fixedBuffer);

    console.log(`[FileSvc] File repaired and saved: ${fileName}`);

  } catch(err) {
    console.log(`[FileSvc] Error recovering file ${fileName}:`, err.message);
  }
};
