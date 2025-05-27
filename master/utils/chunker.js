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

export const chunkFileBySize = async (filePath, chunkSize, chunkCount) => {
  const fileBuffer = await fs.readFileSync(filePath);
  const totalSize = fileBuffer.length;
  
  const chunks = [];
  let offset = 0;

  while(offset < totalSize && chunks.length < chunkCount) {
    const end = Math.min(offset + chunkSize, totalSize);
    chunks.push(fileBuffer.slice(offset, end));
    offset = end;
  }

  return chunks;
};
