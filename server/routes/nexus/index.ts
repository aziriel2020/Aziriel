/**
 * NEXUS PLATFORM ROUTES INDEX
 *
 * Aggregates all Nexus platform routes
 */

import express from 'express';
import pdtRoutes from './pdt.routes';
import collaborationRoutes from './collaboration.routes';
import genuiRoutes from './genui.routes';
import spatialRoutes from './spatial.routes';
import activitypubRoutes from './activitypub.routes';
import translationRoutes from './translation.routes';
import trustRoutes from './trust.routes';

const router = express.Router();

// Mount all Nexus routes
router.use('/pdt', pdtRoutes);
router.use('/collaboration', collaborationRoutes);
router.use('/genui', genuiRoutes);
router.use('/spatial', spatialRoutes);
router.use('/activitypub', activitypubRoutes);
router.use('/translation', translationRoutes);
router.use('/trust', trustRoutes);

export default router;
