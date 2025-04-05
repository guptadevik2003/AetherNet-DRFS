import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const config = {
  node: {
    id: process.env.NODE_ID || 'master-01',
    role: process.env.ROLE || 'master',
    port: process.env.PORT || 3000,
  },
  paths: {
    userUploads: path.resolve(process.env.USER_UPLOADS_FOLDER || 'user-uploads'),
    dhtMapping: path.resolve(process.env.DHT_MAPPING_FILE || 'persistent/dht-mapping.json'),
    peerRegistry: path.resolve(process.env.PEER_REGISTRY_FILE || 'persistent/peer-registry.json'),
    encryptedData: path.resolve('temp/encrypted-data'),
    chunkStaging: path.resolve('temp/chunk-staging'),
    recoveryCache: path.resolve('temp/recovery-cache'),
  },
  reedSolomon: {
    chunkCount: process.env.CHUNK_COUNT || 6,
    parityCount: process.env.PARITY_COUNT || 3,
  },
  secrets: {
    encryptionKey: process.env.ENCRYPTION_KEY,
  },
};

export default config;
