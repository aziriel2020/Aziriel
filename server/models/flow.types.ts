/**
 * FLOW STUDIO TYPE DEFINITIONS
 *
 * Complete TypeScript types for Flow features
 */

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  assetIds: string[];
  color?: string;
  icon?: string;
  shared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export { Asset, Collection } from '../services/flow/asset-manager.service';
export { Scene, SceneIngredient, Storyboard } from '../services/flow/scenebuilder.service';
export { Timeline, TimelineTrack, TimelineClip } from '../services/flow/timeline-editor.service';
export { Ingredient, RecipeSettings } from '../services/flow/ingredients-to-video.service';
export { ExportPreset, ExportSettings, ExportOptions } from '../services/flow/export.service';
export { CollaborationSession, CollaborationUser, Comment } from '../services/flow/collaboration.service';
export { FlowProject, FlowWorkflow } from '../services/flow/flow-engine.service';
