import { Router } from 'express';
import { registerPeer, updatePeerHeartbeat } from '../services/peerService.js';
import config from '../config/appConfig.js';

const router = Router();

// POST /api/peers/register
router.post('/register', async (req, res) => {
  try {

    const peerData = req.body;

    if(!peerData || !peerData.peerId || !peerData.host || !peerData.port) {
      return res.status(400).json({ success: false, error: 'Missing required peer data.' });
    }

    const result = await registerPeer(peerData);

    if(!result.success) {
      return res.status(500).json({ success: false, error: result.error || 'Registration failed.' });
    }

    return res.json({
      success: true,
      message: 'Successfully registered peer.',
      masterId: config.node.id,
    });

  } catch(err) {
    console.log(err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// POST /api/peers/heartbeat
router.post('/heartbeat', async (req, res) => {
  try {

    const { peerId } = req.body;
    if(!peerId) {
      return res.status(400).json({ success: false, error: 'Peer ID is required.' });
    }

    await updatePeerHeartbeat(peerId);
    
    return res.json({ success: true, message: 'Heartbeat received.' });

  } catch(err) {
    console.log(err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

export default router;
