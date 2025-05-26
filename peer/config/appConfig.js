import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const config = {
  node: {
    id: process.env.NODE_ID || 'peer-01',
    role: process.env.ROLE || 'peer',
    port: process.env.PORT || 4001,
  },
  masterApi: process.env.MASTER_API || 'http://localhost:3000',
  paths: {
    baseStorage: path.resolve(`${process.env.STORAGE_FOLDER}` || 'storage/peer-01'),
    dataStorage: path.resolve(`${process.env.STORAGE_FOLDER}/data` || 'storage/peer-01/data'),
    parityStorage: path.resolve(`${process.env.STORAGE_FOLDER}/parity` || 'storage/peer-01/parity'),
    chunkRecord: path.resolve(`${process.env.STORAGE_FOLDER}/stored-chunks.json` || 'storage/peer-01/stored-chunks.json')
  },
};

export default config;
