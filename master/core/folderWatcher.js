import chokidar from 'chokidar';
import path from 'path';
import config from '../config/appConfig.js';
import { handleNewFile, recoverFileIfCorrupted } from '../services/fileService.js';

export const startWatcher = () => {
  const watcher = chokidar.watch(config.paths.userUploads, {
    ignored: /(^|[/\\])\../,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 100,
    },
  });

  const recovering = new Set(); // to prevent recovery loops

  watcher.on('add', (filePath) => {
    const fileName = path.basename(filePath);
    console.log(`\n[Watcher] New file detected: ${fileName}`);  
    setTimeout(() => {
      handleNewFile(filePath, fileName);
    }, 500);
  });

  watcher.on('change', (filePath) => {
    const fileName = path.basename(filePath);

    if(recovering.has(fileName)) {
      recovering.delete(fileName);
      return;
    }

    
    setTimeout(() => {
      console.log(`\n[Watcher] File change detected: ${fileName}`);
      recovering.add(fileName);
      recoverFileIfCorrupted(filePath, fileName);
    }, 2000);
  });
};
