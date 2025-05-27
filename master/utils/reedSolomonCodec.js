import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { ReedSolomonEncoder, ReedSolomonDecoder, GenericGF } = require('reedsolomon');

export const generateParityChunks = async (dataChunks, chunkCount, parityCount) => {
  if(chunkCount+parityCount > 255) {
    throw new Error(`Total chunks (data + parity) cannot exceed 255. Got: ${chunkCount+parityCount}`);
  }

  const chunkSize = Math.max(...dataChunks.map(c => c.length));

  // Making all data chunks of equal size, (padding if needed)
  const paddedDataChunks = dataChunks.map(chunk => {
    if(chunk.length < chunkSize) {
      const padded = Buffer.alloc(chunkSize);
      chunk.copy(padded);
      return padded;
    }
    return chunk;
  });

  // Allocating Empty Buffers for Parity Chunks
  const parityChunks = Array(parityCount).fill(null).map(() => Buffer.alloc(chunkSize));

  // Initializing RSEncoder
  const gf256 = new GenericGF(0x011d, 256, 0, true);
  const RSEncoder = new ReedSolomonEncoder(gf256);

  for(let byteIndex=0; byteIndex<chunkSize; byteIndex++) {
    const dataColumn = new Uint8Array(chunkCount);
    for(let i=0; i<chunkCount; i++) {
      dataColumn[i] = paddedDataChunks[i][byteIndex];
    }

    const codeword = new Uint8Array(chunkCount + parityCount);
    codeword.set(dataColumn);

    RSEncoder.encode(codeword, parityCount);

    for(let p=0; p<parityCount; p++) {
      parityChunks[p][byteIndex] = codeword[chunkCount + p];
    }
  }

  return parityChunks;
};

export const recoverChunksUsingParity = async (chunks, missingIndex, totalChunks, dataChunkCount) => {
  if(chunks.length !== totalChunks) {
    throw new Error(`Expected ${totalChunks} chunks but got ${chunks.length}`);
  }

  const parityChunks = totalChunks - dataChunkCount;
  const chunkSize = Math.max(...chunks.filter(Boolean).map(c => c.length));
  const matrix = [];

  // Padding all chunks to equal size and building matrix
  for(let i=0; i<totalChunks; i++) {
    if(chunks[i]) {
      const padded = Buffer.alloc(chunkSize);
      chunks[i].copy(padded);
      matrix.push(Uint8Array.from(padded));
    } else {
      matrix.push(null);
    }
  }

  const gf256 = new GenericGF(0x011d, 256, 0, true);
  const RSDecoder = new ReedSolomonDecoder(gf256);

  for(let byteIndex=0; byteIndex<chunkSize; byteIndex++) {
    const data = new Uint8Array(totalChunks);
    const erasures = [];

    for(let i=0; i<totalChunks; i++) {
      if(matrix[i] === null) {
        data[i] = 0;
        erasures.push(i);
      } else {
        data[i] = matrix[i][byteIndex];
      }
    }

    if(erasures.length > parityChunks) {
      throw new Error(`Too many corrupted/missing chunks to recover byte ${byteIndex}`);
    }

    try {
      RSDecoder.decode(data, parityChunks, erasures);
    } catch(err) {
      throw new Error(`RS decode failed at byte ${byteIndex}: ${err.message}`);
    }

    for(const idx of erasures) {
      if(!matrix[idx]) {
        matrix[idx] = new Uint8Array(chunkSize);
      }
      matrix[idx][byteIndex] = data[idx];
    }
  }

  return Buffer.from(matrix[missingIndex]);
};
