import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import config from '../config/appConfig.js';
import { chunkFile } from '../utils/chunker.js';
import { generateParityChunks } from '../utils/reedSolomonCodec.js';
import { encryptAndSaveChunks } from '../utils/encryption.js';

import { timeCalc } from '../utils/timeCalc.js';
import { addFileMetadata } from '../core/dhtManager.js';

export const handleNewFile = async (filePath, fileName) => {
  try {

    let totStart = Date.now();

    const fileId = crypto.randomUUID();

    let start = Date.now();
    // Splitting File into Data Chunks (unencrypted)
    const dataChunks = await chunkFile(filePath, config.reedSolomon.chunkCount);
    console.log(dataChunks)
    let end = Date.now();
    timeCalc(end-start, 'Data Chunking');

    start = Date.now();
    // Generating Parity Chunks (unencrypted)
    const parityChunks = await generateParityChunks(
      dataChunks, dataChunks.length,
      Number(config.reedSolomon.parityCount)
    );
    console.log(parityChunks)
    end = Date.now();
    timeCalc(end-start, 'Generating Parity');

    start = Date.now();
    // Encrypting Chunks
    const chunkMap = await encryptAndSaveChunks(
      [...dataChunks, ...parityChunks],
      config.reedSolomon.chunkCount,
      config.paths.encryptedData
    );
    end = Date.now();
    timeCalc(end-start, 'Encrypting Chunks');

    
    
    
    
    let totEnd = Date.now();
    timeCalc(totEnd-totStart, 'Total Time');
    
    console.log(chunkMap);

    // Distributing File

    // Updating DHT

    console.log(`[FileService] Processed file ${fileName} successfully`);

  } catch(err) {
    console.log(`[FileService] Error processing file ${fileName}:`, err);
  }
};
