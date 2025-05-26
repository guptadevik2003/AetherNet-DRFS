import { Router } from 'express';
import { saveChunk, getChunk } from '../services/storageService.js';

const router = Router();

// POST /api/storage/save
router.post('/save', async (req, res) => {
  try {

    const { chunkId, data, type } = req.body;
    await saveChunk(chunkId, data, type);

    console.log(`[PeerComm] Saved ${type}:${chunkId}`);

    return res.json({ success: true, message: 'Chunk saved successfully.' });

  } catch(err) {
    console.log(err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// GET /api/storage/:chunkId
router.get('/:chunkId', async (req, res) => {
  try {

    const chunk = await getChunk(req.params.chunkId);
    if(!chunk) {
      return res.status(404).json({ success: false, error: 'Chunk not found.' });
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(chunk);

  } catch(err) {
    console.log(err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

export default router;
