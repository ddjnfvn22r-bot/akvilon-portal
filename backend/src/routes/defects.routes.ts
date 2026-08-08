import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Defects routes
router.get('/', authMiddleware, async (req, res) => {
  res.json({ message: 'Get all defects' });
});

router.post('/', authMiddleware, async (req, res) => {
  res.json({ message: 'Create defect' });
});

router.get('/:id', authMiddleware, async (req, res) => {
  res.json({ message: `Get defect ${req.params.id}` });
});

router.put('/:id', authMiddleware, async (req, res) => {
  res.json({ message: `Update defect ${req.params.id}` });
});

router.patch('/:id/status', authMiddleware, async (req, res) => {
  res.json({ message: `Update defect status ${req.params.id}` });
});

router.post('/:id/photos', authMiddleware, async (req, res) => {
  res.json({ message: `Upload photos for defect ${req.params.id}` });
});

router.post('/:id/reject', authMiddleware, async (req, res) => {
  res.json({ message: `Reject defect ${req.params.id}` });
});

export default router;
