import { Router } from 'express';
import { registerPeer } from '../services/peerService.js';

const router = Router();

// POST /api/peers/register
router.post('/register', async (req, res) => {
  try {

    // Get peer data from req.body
    // Call registerPeer function and register the peer on this master.

  } catch(err) {
    return res.status(500).json({ success: false, error: 'Failed to register peer.' });
  }
});

export default router;
