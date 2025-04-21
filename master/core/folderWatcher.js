import chokidar from 'chokidar';
import config from '../config/appConfig.js';
import { handleNewFile } from '../services/fileService.js';

export const startFolderWatcher = () => {
  const watcher = chokidar.watch(config.paths.userUploads, {
    ignored: /(^|[/\\])\../,
    persistent: true,
  });
  watcher.on('add', (filePath) => handleNewFile(filePath));
};
