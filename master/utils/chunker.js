import fs from 'fs';

export const chunkFile = async (filePath, chunkCount) => {
  const fileBuffer = await fs.readFileSync(filePath);
  const totalSize = fileBuffer.length;
  const chunkSize = Math.ceil(totalSize/chunkCount);

  const chunks = [];

  for(let i=0; i<chunkCount; i++) {
    const start = i*chunkSize;
    const end = Math.min(start+chunkSize, totalSize);
    chunks.push(fileBuffer.slice(start, end));
  }

  return chunks;
};
