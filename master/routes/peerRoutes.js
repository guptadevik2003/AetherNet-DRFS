import { Router } from 'express';
import { registerPeer } from '../services/peerService.js';

const router = Router();

// POST /api/peers/register
router.post('/register', async (req, res) => {
  try {

    // Get peer data from req.body
    // Call registerPeer function and register the peer on this master.
    // send back master's NODE_ID from master/config/appConfig.js as a json
    // eg { success: true, message: 'Successfully registered peer', masterId: config.masterId }

  } catch(err) {
    return res.status(500).json({ success: false, error: 'Failed to register peer.' });
  }
});

export default router;
