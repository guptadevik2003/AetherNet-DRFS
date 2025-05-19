import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import config from '../config/appConfig.js';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(config.secrets.encryptionKey, 'hex');

const encryptChunk = async (chunk) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const encryptedData = Buffer.concat([cipher.update(chunk), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return { encryptedData, iv, authTag };
};

const getChunkHash = async (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

export const encryptAndSaveChunks = async (chunks, dataChunkCount, destFolder) => {
  const chunkMap = [];

  await fs.mkdirSync(destFolder, { recursive: true });

  for(let i=0; i<chunks.length; i++) {
    const chunk = chunks[i];
    const { encryptedData, iv, authTag } = await encryptChunk(chunk);

    const hash = await getChunkHash(encryptedData);
    const fileName = `${hash}.${i<dataChunkCount?'data':'parity'}.enc`;
    const filePath = path.join(destFolder, fileName);

    await fs.writeFileSync(filePath, encryptedData);

    chunkMap.push({
      index: i,
      encFileName: fileName,
      ivHex: iv.toString('hex'),
      authTagHex: authTag.toString('hex'),
    });
  }

  return chunkMap;
};
