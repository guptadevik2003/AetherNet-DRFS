import fs from 'fs';
import path from 'path';
import config from '../config/appConfig.js';

export const deleteEncryptedChunks = async (chunkMap) => {
  for(const chunk of chunkMap) {
    const filePath = path.join(config.paths.encryptedData, chunk.encFileName);

    try {
      await fs.unlinkSync(filePath);
    } catch(err) {
      console.log(err);
    }
  }
};
