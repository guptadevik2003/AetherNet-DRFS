import fs from 'fs';
import path from 'path';
import config from '../config/appConfig.js';

export const initSystemFiles = () => {
  try {

    const userUploadsPath = config.paths.userUploads;
    const dhtMappingPath = config.paths.dhtMapping;
    const peerRegistryPath = config.paths.peerRegistry;

    // Ensure master/persistent folder exists
    const persistentDir = path.dirname(peerRegistryPath);
    if(!fs.existsSync(persistentDir)) {
      fs.mkdirSync(persistentDir, { recursive: true });
    }

    // Create peer-registry.json if it doesn't exist
    if(!fs.existsSync(peerRegistryPath)) {
      fs.writeFileSync(peerRegistryPath, JSON.stringify({ peers: [] }, null, 2));
      console.log('[SysInit] Created peer-registry.json');
    }

    // Create dht-mapping.json if it doesn't exist
    if(!fs.existsSync(dhtMappingPath)) {
      fs.writeFileSync(dhtMappingPath, JSON.stringify({ files: [] }, null, 2));
      console.log('[SysInit] Created dht-mapping.json');
    }

    // Create user-uploads folder if not exists
    if(!fs.existsSync(userUploadsPath)) {
      fs.mkdirSync(userUploadsPath);
      console.log('[SysInit] Created user-uploads folder');
    }

  } catch(err) {
    console.log(err);
  }
};
