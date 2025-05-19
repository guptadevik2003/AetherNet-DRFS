import chokidar from 'chokidar';
import path from 'path';
import config from '../config/appConfig.js';
import { handleNewFile } from '../services/fileService.js';

export const startWatcher = () => {
  const watcher = chokidar.watch(config.paths.userUploads, {
    ignored: /(^|[/\\])\../,
    persistent: true,
    ignoreInitial: true,
  });
  watcher.on('add', (filePath) => {
    const fileName = path.basename(filePath);
    console.log(`[Watcher] New file detected: ${fileName}`);  
    setTimeout(() => {
      handleNewFile(filePath, fileName);
    }, 500);
  });
};
