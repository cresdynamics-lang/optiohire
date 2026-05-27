import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { resendInboundService } from '../services/inboundEmailService.js';

export const router = Router();

router.post('/resend', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const result = await resendInboundService.processEmailReceivedEvent(payload);

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error('[WEBHOOK] Error processing Resend webhook:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
