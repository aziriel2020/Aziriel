/**
 * VOICE TRANSLATION API ROUTES
 *
 * Endpoints for real-time voice translation
 * - Translate voice with voice cloning
 * - Multi-participant translation sessions
 * - Voice profile management
 */

import express, { Request, Response } from 'express';
import { VoiceTranslationService } from '../../services/nexus/voice-translation.service';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Translate voice
 * POST /api/nexus/translation/translate
 */
router.post('/translate', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file required' });
    }

    const { userId, sourceLanguage, targetLanguages, preserveVoice, context } = req.body;

    const results = await VoiceTranslationService.translateVoice({
      userId,
      audioBuffer: req.file.buffer,
      sourceLanguage,
      targetLanguages: JSON.parse(targetLanguages),
      preserveVoice: preserveVoice === 'true',
      context: context ? JSON.parse(context) : undefined,
    });

    res.json({ success: true, results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Start translation session
 * POST /api/nexus/translation/session/start
 */
router.post('/session/start', async (req: Request, res: Response) => {
  try {
    const { participants } = req.body;

    const session = await VoiceTranslationService.startSession({ participants });

    res.json({ success: true, session });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Add message to session
 * POST /api/nexus/translation/session/:sessionId/message
 */
router.post('/session/:sessionId/message', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file required' });
    }

    const { sessionId } = req.params;
    const { speakerId, sourceLanguage } = req.body;

    const result = await VoiceTranslationService.addMessageToSession({
      sessionId,
      speakerId,
      audioBuffer: req.file.buffer,
      sourceLanguage,
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * End translation session
 * POST /api/nexus/translation/session/:sessionId/end
 */
router.post('/session/:sessionId/end', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    await VoiceTranslationService.endSession(sessionId);

    res.json({ success: true, message: 'Session ended' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get translation analytics
 * GET /api/nexus/translation/analytics/:userId
 */
router.get('/analytics/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const analytics = await VoiceTranslationService.getAnalytics(userId);

    res.json({ success: true, analytics });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
