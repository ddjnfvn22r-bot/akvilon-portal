import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Placeholder routes for apartments
router.get('/', authMiddleware, async (req, res) => {
  res.json({ message: 'Get all apartments' });
});

router.get('/:id', authMiddleware, async (req, res) => {
  res.json({ message: `Get apartment ${req.params.id}` });
});

router.put('/:id', authMiddleware, async (req, res) => {
  res.json({ message: `Update apartment ${req.params.id}` });
});

router.post('/:id/book-inspection', authMiddleware, async (req, res) => {
  res.json({ message: `Book inspection for apartment ${req.params.id}` });
});

router.get('/:id/construction-status', authMiddleware, async (req, res) => {
  res.json({ message: `Get construction status for apartment ${req.params.id}` });
});

export default router;
