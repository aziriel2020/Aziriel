/**
 * NEURAFIELD QUANTUM v5.0 - CINEMATIX ENGINE
 * 12 Revolutionary Filmmaking Innovations
 */

// ==================== INNOVATION #1: AI DIRECTOR MODE ====================

export interface ShotType {
  id: string;
  name: string;
  description: string;
  abbreviation: string;
  useCases: string[];
}

export const shotTypes: ShotType[] = [
  { id: 'ews', name: 'Extreme Wide Shot', abbreviation: 'EWS', description: 'Shows vast landscape or environment', useCases: ['Establishing shots', 'Scale', 'Location reveal'] },
  { id: 'ws', name: 'Wide Shot', abbreviation: 'WS', description: 'Shows full subject and surroundings', useCases: ['Action sequences', 'Context', 'Movement'] },
  { id: 'mws', name: 'Medium Wide Shot', abbreviation: 'MWS', description: 'Shows subject from knees up', useCases: ['Dialogue', 'Walking', 'Interaction'] },
  { id: 'ms', name: 'Medium Shot', abbreviation: 'MS', description: 'Shows subject from waist up', useCases: ['Conversations', 'Standard coverage', 'Interviews'] },
  { id: 'mcu', name: 'Medium Close-Up', abbreviation: 'MCU', description: 'Shows subject from chest up', useCases: ['Emotional moments', 'Important dialogue', 'Character focus'] },
  { id: 'cu', name: 'Close-Up', abbreviation: 'CU', description: 'Shows face or important detail', useCases: ['Emotion', 'Reactions', 'Important objects'] },
  { id: 'ecu', name: 'Extreme Close-Up', abbreviation: 'ECU', description: 'Shows very tight detail', useCases: ['Tension', 'Mystery', 'Specific details'] },
  { id: 'pov', name: 'Point of View', abbreviation: 'POV', description: 'Shows from character\'s perspective', useCases: ['Subjective experience', 'Immersion', 'Character perspective'] },
  { id: 'ots', name: 'Over-the-Shoulder', abbreviation: 'OTS', description: 'Shows over character\'s shoulder', useCases: ['Conversations', 'Reactions', 'Phone/computer screens'] },
  { id: 'two-shot', name: 'Two Shot', abbreviation: '2S', description: 'Shows two subjects', useCases: ['Dialogue', 'Relationships', 'Interactions'] },
  { id: 'group-shot', name: 'Group Shot', abbreviation: 'GS', description: 'Shows multiple subjects', useCases: ['Meetings', 'Ensembles', 'Social scenes'] },
  { id: 'insert', name: 'Insert Shot', abbreviation: 'INS', description: 'Shows specific detail or object', useCases: ['Important objects', 'Text', 'Actions'] },
  { id: 'cutaway', name: 'Cutaway', abbreviation: 'CA', description: 'Shows different subject/location', useCases: ['Time passage', 'Reactions', 'Parallel action'] },
  { id: 'dutch', name: 'Dutch Angle', abbreviation: 'DA', description: 'Tilted camera for unease', useCases: ['Disorientation', 'Tension', 'Madness'] },
  { id: 'low-angle', name: 'Low Angle', abbreviation: 'LA', description: 'Camera below subject looking up', useCases: ['Power', 'Dominance', 'Intimidation'] },
  { id: 'high-angle', name: 'High Angle', abbreviation: 'HA', description: 'Camera above subject looking down', useCases: ['Vulnerability', 'Weakness', 'Observation'] },
  { id: 'birds-eye', name: 'Bird\'s Eye View', abbreviation: 'BEV', description: 'Directly overhead shot', useCases: ['Geography', 'Patterns', 'Unique perspective'] },
  { id: 'worms-eye', name: 'Worm\'s Eye View', abbreviation: 'WEV', description: 'Directly below looking up', useCases: ['Scale', 'Power', 'Architecture'] }
];

export interface CameraMovement {
  id: string;
  name: string;
  description: string;
  emotionalImpact: string;
  complexity: 'simple' | 'moderate' | 'complex';
}

export const cameraMovements: CameraMovement[] = [
  { id: 'static', name: 'Static', description: 'No camera movement', emotionalImpact: 'Stable, observational, documentary', complexity: 'simple' },
  { id: 'pan', name: 'Pan', description: 'Horizontal rotation on axis', emotionalImpact: 'Revealing, following, sweeping', complexity: 'simple' },
  { id: 'tilt', name: 'Tilt', description: 'Vertical rotation on axis', emotionalImpact: 'Revealing height, scale, ascension/descension', complexity: 'simple' },
  { id: 'dolly', name: 'Dolly', description: 'Camera moves forward/backward', emotionalImpact: 'Approaching, retreating, intensity change', complexity: 'moderate' },
  { id: 'truck', name: 'Truck', description: 'Camera moves left/right', emotionalImpact: 'Following, parallax, exploration', complexity: 'moderate' },
  { id: 'pedestal', name: 'Pedestal', description: 'Camera moves up/down', emotionalImpact: 'Rising/falling, elevation change', complexity: 'moderate' },
  { id: 'zoom', name: 'Zoom', description: 'Lens focal length change', emotionalImpact: 'Attention focusing, dramatic emphasis', complexity: 'simple' },
  { id: 'crash-zoom', name: 'Crash Zoom', description: 'Fast dramatic zoom', emotionalImpact: 'Shock, comedy, sudden realization', complexity: 'simple' },
  { id: 'dolly-zoom', name: 'Dolly Zoom (Vertigo)', description: 'Dolly + opposite zoom', emotionalImpact: 'Disorientation, anxiety, realization', complexity: 'complex' },
  { id: 'tracking', name: 'Tracking Shot', description: 'Camera follows subject', emotionalImpact: 'Journey, pursuit, following action', complexity: 'moderate' },
  { id: 'steadicam', name: 'Steadicam', description: 'Smooth handheld movement', emotionalImpact: 'Fluid, immersive, following naturally', complexity: 'moderate' },
  { id: 'handheld', name: 'Handheld', description: 'Shaky camera movement', emotionalImpact: 'Chaos, realism, urgency, documentary feel', complexity: 'simple' },
  { id: 'crane', name: 'Crane Shot', description: 'Sweeping vertical movement', emotionalImpact: 'Grand, epic, revealing scale', complexity: 'complex' },
  { id: 'jib', name: 'Jib Shot', description: 'Controlled arc movement', emotionalImpact: 'Smooth transition, elegance', complexity: 'complex' },
  { id: 'drone', name: 'Drone Shot', description: 'Aerial movement', emotionalImpact: 'Epic scale, freedom, overview', complexity: 'complex' },
  { id: 'orbit', name: 'Orbit', description: 'Camera circles subject', emotionalImpact: 'Showcase, 360 view, focus on subject', complexity: 'complex' },
  { id: '360', name: '360° Shot', description: 'Full rotation around subject', emotionalImpact: 'Complete reveal, time passage, showcase', complexity: 'complex' },
  { id: 'whip-pan', name: 'Whip Pan', description: 'Fast horizontal blur', emotionalImpact: 'Transition, energy, sudden change', complexity: 'moderate' },
  { id: 'rack-focus', name: 'Rack Focus', description: 'Focus shift between subjects', emotionalImpact: 'Attention shift, revelation, connection', complexity: 'moderate' },
  { id: 'push-in', name: 'Push In', description: 'Slow dolly toward subject', emotionalImpact: 'Intimacy, tension building, focus', complexity: 'moderate' },
  { id: 'pull-out', name: 'Pull Out', description: 'Dolly away from subject', emotionalImpact: 'Isolation, context reveal, distancing', complexity: 'moderate' }
];

export interface Transition {
  id: string;
  name: string;
  description: string;
  useCases: string[];
}

export const transitions: Transition[] = [
  { id: 'cut', name: 'Cut', description: 'Direct instant transition', useCases: ['Standard', 'Fast pacing', 'Invisible editing'] },
  { id: 'dissolve', name: 'Dissolve', description: 'Gradual blend between shots', useCases: ['Time passage', 'Dream sequences', 'Connections'] },
  { id: 'fade-black', name: 'Fade to Black', description: 'Fade to black screen', useCases: ['Chapter end', 'Time jump', 'Death/sleep'] },
  { id: 'fade-white', name: 'Fade to White', description: 'Fade to white screen', useCases: ['Flashback', 'Death/heaven', 'Memory'] },
  { id: 'wipe', name: 'Wipe', description: 'One shot replaces another directionally', useCases: ['Location change', 'Stylistic', 'Star Wars style'] },
  { id: 'match-cut', name: 'Match Cut', description: 'Visual/action match between shots', useCases: ['Comparison', 'Time jump', 'Visual poetry'] },
  { id: 'j-cut', name: 'J-Cut', description: 'Audio precedes video', useCases: ['Smooth transitions', 'Audio bridge', 'Anticipation'] },
  { id: 'l-cut', name: 'L-Cut', description: 'Video precedes audio', useCases: ['Smooth transitions', 'Reactions', 'Audio overlap'] },
  { id: 'smash-cut', name: 'Smash Cut', description: 'Abrupt jarring transition', useCases: ['Shock', 'Comedy', 'Contrast'] },
  { id: 'jump-cut', name: 'Jump Cut', description: 'Discontinuous same scene cut', useCases: ['Time passage', 'Energy', 'Modern style'] },
  { id: 'cross-cut', name: 'Cross Cut', description: 'Alternating between parallel scenes', useCases: ['Parallel action', 'Suspense', 'Comparison'] },
  { id: 'morph', name: 'Morph', description: 'Fluid transformation between shots', useCases: ['Transformation', 'Visual effects', 'Surreal'] },
  { id: 'iris', name: 'Iris In/Out', description: 'Circular reveal/close', useCases: ['Vintage style', 'Focus', 'Silent film homage'] },
  { id: 'flash', name: 'Flash Frame', description: 'Brief white/bright flash', useCases: ['Impact', 'Explosion', 'Energy'] },
  { id: 'glitch', name: 'Glitch Transition', description: 'Digital distortion effect', useCases: ['Sci-fi', 'Technology', 'Modern'] },
  { id: 'zoom-transition', name: 'Zoom Transition', description: 'Fast zoom blur between scenes', useCases: ['Energy', 'Comedy', 'Time travel'] }
];

// ==================== INNOVATION #2: VFX COMPOSER ====================

export interface VFXVariant {
  id: string;
  name: string;
  description: string;
  intensity: 'subtle' | 'moderate' | 'intense' | 'extreme';
}

export interface VFXCategory {
  id: string;
  name: string;
  description: string;
  variants: VFXVariant[];
}

export const vfxCategories: VFXCategory[] = [
  {
    id: 'fire',
    name: 'Fire Effects',
    description: 'Fire, flames, and heat-based effects',
    variants: [
      { id: 'basic-fire', name: 'Basic Fire', description: 'Standard realistic fire', intensity: 'moderate' },
      { id: 'inferno', name: 'Inferno', description: 'Massive raging flames', intensity: 'extreme' },
      { id: 'ember', name: 'Embers', description: 'Floating glowing embers', intensity: 'subtle' },
      { id: 'magical-fire', name: 'Magical Fire', description: 'Colored mystical flames', intensity: 'intense' },
      { id: 'candleflame', name: 'Candle Flame', description: 'Small gentle flame', intensity: 'subtle' },
      { id: 'wildfire', name: 'Wildfire', description: 'Spreading natural fire', intensity: 'extreme' },
      { id: 'dragon-fire', name: 'Dragon Fire', description: 'Intense concentrated blast', intensity: 'extreme' },
      { id: 'phoenix-fire', name: 'Phoenix Fire', description: 'Rebirth flames with glow', intensity: 'intense' }
    ]
  },
  {
    id: 'water',
    name: 'Water Effects',
    description: 'Water, liquid, and aquatic effects',
    variants: [
      { id: 'rain', name: 'Rain', description: 'Normal rainfall', intensity: 'moderate' },
      { id: 'heavy-rain', name: 'Heavy Rain', description: 'Torrential downpour', intensity: 'intense' },
      { id: 'drizzle', name: 'Drizzle', description: 'Light rain', intensity: 'subtle' },
      { id: 'ocean', name: 'Ocean Waves', description: 'Sea waves and foam', intensity: 'moderate' },
      { id: 'splash', name: 'Water Splash', description: 'Impact splash', intensity: 'intense' },
      { id: 'underwater', name: 'Underwater', description: 'Submerged atmosphere with bubbles', intensity: 'moderate' },
      { id: 'waterfall', name: 'Waterfall', description: 'Cascading water', intensity: 'intense' },
      { id: 'tsunami', name: 'Tsunami', description: 'Massive destructive wave', intensity: 'extreme' }
    ]
  },
  {
    id: 'smoke',
    name: 'Smoke Effects',
    description: 'Smoke, vapor, and gaseous effects',
    variants: [
      { id: 'wispy-smoke', name: 'Wispy Smoke', description: 'Thin elegant smoke', intensity: 'subtle' },
      { id: 'thick-smoke', name: 'Thick Smoke', description: 'Dense billowing smoke', intensity: 'intense' },
      { id: 'colored-smoke', name: 'Colored Smoke', description: 'Vibrant colored smoke', intensity: 'moderate' },
      { id: 'mystical-smoke', name: 'Mystical Smoke', description: 'Magical swirling vapor', intensity: 'moderate' },
      { id: 'industrial-smoke', name: 'Industrial Smoke', description: 'Dark pollution smoke', intensity: 'intense' },
      { id: 'fog', name: 'Fog', description: 'Ground-level mist', intensity: 'moderate' },
      { id: 'steam', name: 'Steam', description: 'Hot vapor', intensity: 'subtle' },
      { id: 'exhaust', name: 'Exhaust Smoke', description: 'Vehicle exhaust', intensity: 'moderate' }
    ]
  },
  {
    id: 'lightning',
    name: 'Lightning Effects',
    description: 'Electrical and lightning effects',
    variants: [
      { id: 'lightning-bolt', name: 'Lightning Bolt', description: 'Natural lightning strike', intensity: 'intense' },
      { id: 'storm-lightning', name: 'Storm Lightning', description: 'Multiple storm bolts', intensity: 'extreme' },
      { id: 'electrical-arc', name: 'Electrical Arc', description: 'Sustained electric arc', intensity: 'moderate' },
      { id: 'magic-lightning', name: 'Magic Lightning', description: 'Controlled magical electricity', intensity: 'intense' },
      { id: 'tesla-coil', name: 'Tesla Coil', description: 'Tesla coil electricity', intensity: 'intense' },
      { id: 'emp', name: 'EMP Pulse', description: 'Electromagnetic pulse wave', intensity: 'extreme' }
    ]
  },
  {
    id: 'explosion',
    name: 'Explosion Effects',
    description: 'Explosive and destructive effects',
    variants: [
      { id: 'fiery-explosion', name: 'Fiery Explosion', description: 'Classic fire and smoke blast', intensity: 'extreme' },
      { id: 'nuclear', name: 'Nuclear Explosion', description: 'Mushroom cloud blast', intensity: 'extreme' },
      { id: 'magical-explosion', name: 'Magical Explosion', description: 'Colored energy burst', intensity: 'intense' },
      { id: 'scifi-explosion', name: 'Sci-Fi Explosion', description: 'Futuristic energy blast', intensity: 'intense' },
      { id: 'grenade', name: 'Grenade Explosion', description: 'Small tactical blast', intensity: 'moderate' },
      { id: 'c4-explosion', name: 'C4 Explosion', description: 'Concentrated explosive', intensity: 'extreme' },
      { id: 'implosion', name: 'Implosion', description: 'Inward collapse', intensity: 'intense' },
      { id: 'gas-explosion', name: 'Gas Explosion', description: 'Rapid expanding fireball', intensity: 'extreme' }
    ]
  },
  {
    id: 'particles',
    name: 'Particle Effects',
    description: 'Particle systems and ambient elements',
    variants: [
      { id: 'sparkles', name: 'Sparkles', description: 'Twinkling light particles', intensity: 'subtle' },
      { id: 'dust', name: 'Dust Particles', description: 'Floating dust in light', intensity: 'subtle' },
      { id: 'magic-particles', name: 'Magic Particles', description: 'Glowing magical motes', intensity: 'moderate' },
      { id: 'snow', name: 'Snow', description: 'Falling snowflakes', intensity: 'moderate' },
      { id: 'confetti', name: 'Confetti', description: 'Celebratory paper bits', intensity: 'moderate' },
      { id: 'fireflies', name: 'Fireflies', description: 'Glowing insects', intensity: 'subtle' },
      { id: 'leaves', name: 'Falling Leaves', description: 'Autumn leaves', intensity: 'moderate' },
      { id: 'petals', name: 'Flower Petals', description: 'Floating petals', intensity: 'subtle' },
      { id: 'embers-particles', name: 'Ember Particles', description: 'Rising fire embers', intensity: 'moderate' },
      { id: 'bubbles', name: 'Bubbles', description: 'Floating soap bubbles', intensity: 'subtle' }
    ]
  },
  {
    id: 'energy',
    name: 'Energy Effects',
    description: 'Energy fields, beams, and power effects',
    variants: [
      { id: 'aura', name: 'Aura', description: 'Glowing energy field around subject', intensity: 'moderate' },
      { id: 'energy-shield', name: 'Energy Shield', description: 'Protective force field', intensity: 'intense' },
      { id: 'energy-beam', name: 'Energy Beam', description: 'Concentrated energy blast', intensity: 'intense' },
      { id: 'portal', name: 'Portal', description: 'Dimensional gateway', intensity: 'intense' },
      { id: 'power-up', name: 'Power-Up', description: 'Energy charging effect', intensity: 'moderate' },
      { id: 'energy-charge', name: 'Energy Charge', description: 'Building energy', intensity: 'moderate' },
      { id: 'plasma', name: 'Plasma', description: 'Ionized gas energy', intensity: 'intense' },
      { id: 'hologram', name: 'Hologram', description: 'Holographic projection', intensity: 'moderate' }
    ]
  },
  {
    id: 'weather',
    name: 'Weather Effects',
    description: 'Atmospheric and weather effects',
    variants: [
      { id: 'fog-weather', name: 'Fog', description: 'Atmospheric fog', intensity: 'moderate' },
      { id: 'heavy-fog', name: 'Heavy Fog', description: 'Dense visibility-limiting fog', intensity: 'intense' },
      { id: 'storm', name: 'Storm', description: 'Wind, rain, lightning combination', intensity: 'extreme' },
      { id: 'snow-weather', name: 'Snow', description: 'Falling snow', intensity: 'moderate' },
      { id: 'blizzard', name: 'Blizzard', description: 'Heavy snow and wind', intensity: 'extreme' },
      { id: 'sandstorm', name: 'Sandstorm', description: 'Desert sand storm', intensity: 'extreme' },
      { id: 'heatwave', name: 'Heat Wave', description: 'Heat distortion shimmer', intensity: 'moderate' },
      { id: 'aurora', name: 'Aurora Borealis', description: 'Northern lights', intensity: 'moderate' }
    ]
  },
  {
    id: 'destruction',
    name: 'Destruction Effects',
    description: 'Material breaking and destruction',
    variants: [
      { id: 'shatter', name: 'Shatter', description: 'Glass/ice breaking', intensity: 'intense' },
      { id: 'crumble', name: 'Crumble', description: 'Material degradation', intensity: 'moderate' },
      { id: 'disintegrate', name: 'Disintegration', description: 'Turning to dust/ash', intensity: 'intense' },
      { id: 'implode-destruction', name: 'Implosion', description: 'Inward collapse', intensity: 'extreme' },
      { id: 'melt', name: 'Melting', description: 'Heat-based liquefaction', intensity: 'moderate' },
      { id: 'freeze-shatter', name: 'Freeze & Shatter', description: 'Ice formation and break', intensity: 'intense' },
      { id: 'vaporize', name: 'Vaporization', description: 'Instant disappearance', intensity: 'extreme' },
      { id: 'collapse', name: 'Structural Collapse', description: 'Building/structure falling', intensity: 'extreme' }
    ]
  }
];

export interface PhysicsInteraction {
  combination: string[];
  result: string;
  description: string;
}

export const physicsInteractions: PhysicsInteraction[] = [
  { combination: ['fire', 'water'], result: 'Steam & Extinguish', description: 'Fire creates steam when meeting water, both diminish' },
  { combination: ['fire', 'smoke'], result: 'Enhanced Fire', description: 'Smoke trails intensify with fire, creating dramatic effect' },
  { combination: ['water', 'lightning'], result: 'Conductivity', description: 'Lightning spreads through water, creating branching arcs' },
  { combination: ['wind', 'particles'], result: 'Drift & Scatter', description: 'Wind affects particle trajectories and spread' },
  { combination: ['explosion', 'debris'], result: 'Shrapnel Scatter', description: 'Explosion propels debris outward realistically' },
  { combination: ['fire', 'wind'], result: 'Spread & Intensify', description: 'Wind spreads fire and increases intensity' },
  { combination: ['water', 'fire'], result: 'Steam Eruption', description: 'Large water meeting intense fire creates steam explosion' },
  { combination: ['lightning', 'metal'], result: 'Arc Concentration', description: 'Lightning attracts to and intensifies around metal' }
];

// ==================== INNOVATION #3: EMOTIONAL CINEMATOGRAPHY AI ====================

export interface EmotionProfile {
  id: string;
  name: string;
  colorGrading: {
    temperature: number; // -100 to 100 (cool to warm)
    tint: number; // -100 to 100 (green to magenta)
    saturation: number; // 0 to 200
    contrast: number; // 0 to 200
    lut: string;
  };
  cameraSettings: {
    focalLength: string;
    aperture: string;
    motionBlur: 'low' | 'medium' | 'high';
    shake: 'none' | 'subtle' | 'moderate' | 'heavy';
  };
  musicSuggestion: string;
  pacingSuggestion: string;
  lightingSuggestion: string;
}

export const emotionProfiles: EmotionProfile[] = [
  {
    id: 'joy',
    name: 'Joy',
    colorGrading: { temperature: 30, tint: -10, saturation: 120, contrast: 110, lut: 'Warm Vibrant' },
    cameraSettings: { focalLength: '35-50mm', aperture: 'f/2.8', motionBlur: 'low', shake: 'none' },
    musicSuggestion: 'Uplifting, major key, bright instrumentation',
    pacingSuggestion: 'Quick cuts, energetic movement, dynamic transitions',
    lightingSuggestion: 'Bright, soft, warm golden hour quality'
  },
  {
    id: 'sadness',
    name: 'Sadness',
    colorGrading: { temperature: -40, tint: 20, saturation: 70, contrast: 90, lut: 'Cool Desaturated' },
    cameraSettings: { focalLength: '50-85mm', aperture: 'f/2.0', motionBlur: 'medium', shake: 'subtle' },
    musicSuggestion: 'Slow, minor key, piano or strings, melancholic',
    pacingSuggestion: 'Slow cuts, lingering shots, gentle movement',
    lightingSuggestion: 'Soft, diffused, overcast or window light, shadows'
  },
  {
    id: 'fear',
    name: 'Fear',
    colorGrading: { temperature: -50, tint: -20, saturation: 60, contrast: 140, lut: 'Dark Teal' },
    cameraSettings: { focalLength: '24-35mm', aperture: 'f/2.8', motionBlur: 'high', shake: 'moderate' },
    musicSuggestion: 'Dissonant, low frequencies, tense strings, silence breaks',
    pacingSuggestion: 'Erratic cuts, sudden movements, jump scares',
    lightingSuggestion: 'High contrast, dramatic shadows, practical sources, darkness'
  },
  {
    id: 'anger',
    name: 'Anger',
    colorGrading: { temperature: 50, tint: -30, saturation: 140, contrast: 150, lut: 'High Contrast Red' },
    cameraSettings: { focalLength: '28-50mm', aperture: 'f/4.0', motionBlur: 'high', shake: 'heavy' },
    musicSuggestion: 'Aggressive, intense percussion, distorted elements',
    pacingSuggestion: 'Fast cuts, aggressive camera movement, intense action',
    lightingSuggestion: 'Harsh, direct, high contrast, red tones, hard shadows'
  },
  {
    id: 'love',
    name: 'Love',
    colorGrading: { temperature: 40, tint: 10, saturation: 110, contrast: 95, lut: 'Soft Romantic' },
    cameraSettings: { focalLength: '50-85mm', aperture: 'f/1.4', motionBlur: 'low', shake: 'none' },
    musicSuggestion: 'Romantic, strings, piano, gentle swells',
    pacingSuggestion: 'Smooth transitions, slow motion moments, lingering',
    lightingSuggestion: 'Soft, warm, diffused, golden hour, candlelight'
  },
  {
    id: 'tension',
    name: 'Tension',
    colorGrading: { temperature: -30, tint: 0, saturation: 80, contrast: 130, lut: 'Desaturated Noir' },
    cameraSettings: { focalLength: '24-50mm', aperture: 'f/5.6', motionBlur: 'medium', shake: 'subtle' },
    musicSuggestion: 'Building suspense, ticking, drones, minimal',
    pacingSuggestion: 'Slow build, strategic cuts, held frames',
    lightingSuggestion: 'Moody, chiaroscuro, practical sources, motivated'
  },
  {
    id: 'wonder',
    name: 'Wonder',
    colorGrading: { temperature: 20, tint: -20, saturation: 130, contrast: 105, lut: 'Dreamy Vibrant' },
    cameraSettings: { focalLength: '24-35mm', aperture: 'f/2.8', motionBlur: 'low', shake: 'none' },
    musicSuggestion: 'Ethereal, orchestral swells, magical instrumentation',
    pacingSuggestion: 'Slow reveals, sweeping movements, smooth transitions',
    lightingSuggestion: 'Magical, volumetric, god rays, backlit, ethereal'
  },
  {
    id: 'nostalgia',
    name: 'Nostalgia',
    colorGrading: { temperature: 35, tint: 5, saturation: 90, contrast: 100, lut: 'Vintage Warm' },
    cameraSettings: { focalLength: '35-50mm', aperture: 'f/2.0', motionBlur: 'medium', shake: 'none' },
    musicSuggestion: 'Wistful, acoustic, vintage sound, familiar melodies',
    pacingSuggestion: 'Contemplative pacing, dissolves, slow motion',
    lightingSuggestion: 'Warm, soft, hazy, sun-dappled, vintage quality'
  },
  {
    id: 'excitement',
    name: 'Excitement',
    colorGrading: { temperature: 20, tint: -15, saturation: 140, contrast: 125, lut: 'Vivid Dynamic' },
    cameraSettings: { focalLength: '24-35mm', aperture: 'f/4.0', motionBlur: 'high', shake: 'moderate' },
    musicSuggestion: 'High energy, fast tempo, driving beat, epic',
    pacingSuggestion: 'Rapid cuts, dynamic movement, whip pans',
    lightingSuggestion: 'Dynamic, colorful, high energy, moving lights'
  },
  {
    id: 'serenity',
    name: 'Serenity',
    colorGrading: { temperature: 10, tint: -5, saturation: 95, contrast: 90, lut: 'Soft Calm' },
    cameraSettings: { focalLength: '35-85mm', aperture: 'f/2.8', motionBlur: 'low', shake: 'none' },
    musicSuggestion: 'Ambient, gentle, minimal, natural sounds',
    pacingSuggestion: 'Very slow cuts, static or very slow movement',
    lightingSuggestion: 'Soft, natural, diffused, even, peaceful'
  }
];

// Continue in next part...
export const cinematixEngine = {
  shotTypes,
  cameraMovements,
  transitions,
  vfxCategories,
  physicsInteractions,
  emotionProfiles
};
