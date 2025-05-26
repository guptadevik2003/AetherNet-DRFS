import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const args = process.argv.slice(2);
const filePath = args.join(' ');

if(!filePath) {
  console.log(`[CorruptSim] Please provide the file path as an argument.`);
  process.exit(1);
}

async function corruptFile(filePath, chunkCount = 6) {
  try {

    const fileBuffer = await fs.readFileSync(filePath);
    const totalSize = fileBuffer.length;
    const chunkSize = Math.ceil(totalSize/chunkCount);

    const chunkIndex = Math.floor(Math.random() * chunkCount);
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, totalSize);

    console.log(`[CorruptSim] Corrupting chunk at index ${chunkIndex} (${start}-${end}) of "${path.basename(filePath)}"`);

    const corruptedData = crypto.randomBytes(end - start);
    corruptedData.copy(fileBuffer, start); // Overwrite original buffer

    fs.writeFileSync(filePath, fileBuffer);

    console.log(`[CorruptSim] Successfully corrupted chunk at index ${chunkIndex}`);

  } catch(err) {
    console.log(`[CorruptSim] ${err.message}`);
  }
}

corruptFile(filePath);
