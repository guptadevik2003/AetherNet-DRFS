import fs from 'fs';
import path from 'path';
import config from '../config/appConfig.js';

export let storedChunks = [];

export const loadStoredChunks = async () => {
  try {

    const data = await fs.readFileSync(config.paths.chunkRecord, 'utf-8');
    storedChunks = JSON.parse(data).chunks || [];

  } catch(err) {
    console.log(`Failed to load stored-chunks.json. Starting fresh.\nError:`, err.message);
    storedChunks = [];
  }
};

const saveChunkMetadata = async () => {
  try {
    const content = JSON.stringify({ chunks: storedChunks }, null, 2);
    await fs.writeFileSync(config.paths.chunkRecord, content);
  } catch(err) {
    console.log(err);
  }
};

export const saveChunk = async (chunkId, base64Data, type) => {
  const buffer = Buffer.from(base64Data, 'base64');
  const folder = type==='parity' ? config.paths.parityStorage : config.paths.dataStorage;
  const filePath = path.join(folder, `${chunkId}.enc`);

  await fs.writeFileSync(filePath, buffer);

  const chunkMeta = {
    id: chunkId,
    type,
    createdAt: new Date().toLocaleString('en-GB')
  };

  storedChunks.push(chunkMeta);
  await saveChunkMetadata();
};

export const getChunk = async (chunkId) => {
  const meta = storedChunks.find(c => c.id === chunkId);
  if(!meta) return null;
  const folder = meta.type==='parity' ? config.paths.parityStorage : config.paths.dataStorage;
  const filePath = path.join(folder, `${meta.id}.enc`);
  try {
    return await fs.readFileSync(filePath);
  } catch(err) {
    console.log(err.message);
    return null;
  }
};
