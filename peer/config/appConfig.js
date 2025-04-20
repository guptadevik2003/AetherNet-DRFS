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
    chunksStorage: path.resolve(`${process.env.STORAGE_FOLDER}/chunks` || 'storage/peer-01/chunks'),
    parityStorage: path.resolve(`${process.env.STORAGE_FOLDER}/parity` || 'storage/peer-01/parity'),
  },
};

export default config;
