import fs from 'fs';
import config from '../config/appConfig.js';

export let DHT = [];

export const loadDHTOnRestart = async () => {
  try {

    const data = await fs.readFileSync(config.paths.dhtMapping, 'utf-8');
    DHT = JSON.parse(data).files || [];

    console.log(`[SysInit] Loaded dht-mapping.json into memory.`);

  } catch(err) {
    console.log(`Failed to load dht-mapping.json. Starting fresh.\nError:`, err.message);
    DHT = [];
  }
};

const saveDHTToFile = async () => {
  try {
    const content = JSON.stringify({ files: DHT }, null, 2);
    await fs.writeFileSync(config.paths.dhtMapping, content);
  } catch(err) {
    console.log(err);
  }
};

export const addMetadataToDHT = async (fileName, chunkMap, chunkSize) => {
  DHT.push({
    fileName,
    chunkSize,
    dataChunkCount: chunkMap.filter(c => c.encFileName.endsWith('.data.enc')).length,
    parityChunkCount: chunkMap.filter(c => c.encFileName.endsWith('.parity.enc')).length,
    chunkMap
  });

  await saveDHTToFile();
};
