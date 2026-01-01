import { Router, Request, Response } from 'express';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    port: parseInt(process.env.PORT || '7777', 10),
    timestamp: new Date().toISOString()
  });
});

export default router;
