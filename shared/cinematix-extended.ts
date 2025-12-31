/**
 * NEURAFIELD QUANTUM v5.0 - CINEMATIX ENGINE (Extended)
 * Innovations #4-#12
 */

// ==================== INNOVATION #4: SCENE DNA ANALYZER ====================

export interface IconicScene {
  id: string;
  title: string;
  movie: string;
  year: number;
  visualDNA: {
    colorPalette: string[];
    lighting: string;
    composition: string;
    mood: string;
    cameraWork: string;
    specialElements: string[];
  };
  promptTemplate: string;
}

export const iconicScenes: IconicScene[] = [
  {
    id: 'blade-runner-tears',
    title: 'Tears in Rain',
    movie: 'Blade Runner',
    year: 1982,
    visualDNA: {
      colorPalette: ['#0A1929', '#FF6B35', '#00D9FF', '#1A0F1E'],
      lighting: 'Neon noir, cyan-orange contrast, rain-diffused lights',
      composition: 'Close-up, rain, atmospheric haze, backlit',
      mood: 'Melancholic, philosophical, cyberpunk',
      cameraWork: 'Static close-up, gentle push-in, rain in foreground',
      specialElements: ['Heavy rain', 'Neon reflections', 'Dove', 'Steam', 'Atmospheric fog']
    },
    promptTemplate: 'Cinematic close-up, heavy rain, neon cyan and orange lighting, atmospheric fog, backlit subject, cyberpunk noir aesthetic, melancholic mood, steam rising, blade runner style'
  },
  {
    id: 'inception-hallway',
    title: 'Rotating Hallway Fight',
    movie: 'Inception',
    year: 2010,
    visualDNA: {
      colorPalette: ['#2B2B2B', '#8B7355', '#D4C5B9', '#1A1A1A'],
      lighting: 'Dynamic practical hotel lighting, rotating environment',
      composition: 'Wide shot, impossible geometry, practical effects',
      mood: 'Disorienting, action-packed, surreal',
      cameraWork: 'Rotating with environment, tracking action, wide coverage',
      specialElements: ['Rotating set', 'Zero-G fight', 'Practical stunts', 'Dynamic physics']
    },
    promptTemplate: 'Cinematic wide shot, rotating hallway, hotel interior, dynamic action, practical lighting, impossible physics, surreal gravity-defying choreography, inception style'
  },
  {
    id: 'matrix-bullet-time',
    title: 'Bullet Time',
    movie: 'The Matrix',
    year: 1999,
    visualDNA: {
      colorPalette: ['#003D1A', '#00FF41', '#0D0D0D', '#1A3D2E'],
      lighting: 'Matrix green tint, high contrast, dramatic',
      composition: 'Frozen time, orbital camera movement, bullet trails',
      mood: 'Action-packed, surreal, revolutionary',
      cameraWork: '360° orbital while subject frozen, super slow-motion',
      specialElements: ['Bullet time', 'Bullet trails', 'Frozen pose', 'Green tint', 'Code aesthetic']
    },
    promptTemplate: 'Cinematic bullet time effect, frozen mid-action, 360-degree camera orbit, matrix green color grading, bullet trails, dramatic pose, revolutionary cinematography, the matrix style'
  },
  {
    id: 'godfather-office',
    title: 'The Office',
    movie: 'The Godfather',
    year: 1972,
    visualDNA: {
      colorPalette: ['#1A0F0A', '#8B6F47', '#D4A574', '#2B1810'],
      lighting: 'Chiaroscuro, warm amber, deep shadows, window light',
      composition: 'Medium shot, Italian Renaissance painting-like, deep shadows',
      mood: 'Powerful, ominous, classical',
      cameraWork: 'Static, formal, tableau compositions',
      specialElements: ['Venetian blinds', 'Deep shadows', 'Warm amber glow', 'Formal composition']
    },
    promptTemplate: 'Cinematic chiaroscuro lighting, warm amber tones, deep shadows, office interior, venetian blind shadows, formal composition, Italian Renaissance painting aesthetic, godfather style'
  },
  {
    id: '2001-stargate',
    title: 'Stargate Sequence',
    movie: '2001: A Space Odyssey',
    year: 1968,
    visualDNA: {
      colorPalette: ['#FF0080', '#00FFFF', '#FFFF00', '#8000FF'],
      lighting: 'Psychedelic, cosmic, abstract patterns',
      composition: 'Symmetrical, abstract, transcendent',
      mood: 'Cosmic, transcendent, mind-bending',
      cameraWork: 'Forward movement through abstract space, POV',
      specialElements: ['Light streaks', 'Color shifts', 'Abstract patterns', 'Cosmic phenomena']
    },
    promptTemplate: 'Cinematic stargate sequence, psychedelic colors, abstract light streaks, cosmic phenomena, forward movement through space, transcendent atmosphere, vibrant color shifts, 2001 space odyssey style'
  },
  {
    id: 'mad-max-chase',
    title: 'Fury Road Chase',
    movie: 'Mad Max: Fury Road',
    year: 2015,
    visualDNA: {
      colorPalette: ['#FF6B35', '#00B4D8', '#FFD60A', '#8B4513'],
      lighting: 'Harsh desert sun, extreme orange-teal grade',
      composition: 'Wide action, dynamic movement, extreme colors',
      mood: 'Intense, high-octane, apocalyptic',
      cameraWork: 'Dynamic tracking, wide action coverage, high-speed',
      specialElements: ['Desert landscape', 'Vehicle action', 'Extreme color grade', 'Dust', 'Explosions']
    },
    promptTemplate: 'Cinematic desert chase, extreme orange and teal color grade, harsh sunlight, high-octane vehicle action, dynamic camera movement, dust clouds, apocalyptic wasteland, mad max fury road style'
  },
  {
    id: 'her-skyline',
    title: 'LA Skyline',
    movie: 'Her',
    year: 2013,
    visualDNA: {
      colorPalette: ['#FFB4A2', '#E5989B', '#B5838D', '#6D6875'],
      lighting: 'Soft golden hour, warm pastel, diffused',
      composition: 'Geometric architecture, minimalist, centered',
      mood: 'Lonely, contemplative, warm yet isolated',
      cameraWork: 'Static wide shots, centered compositions, symmetry',
      specialElements: ['Pastel colors', 'Soft focus', 'Golden hour', 'Modern architecture', 'Minimalism']
    },
    promptTemplate: 'Cinematic soft pastel aesthetic, golden hour lighting, modern architecture, minimalist composition, warm lonely atmosphere, centered symmetrical framing, contemplative mood, her movie style'
  },
  {
    id: 'joker-stairs',
    title: 'Stairs Dance',
    movie: 'Joker',
    year: 2019,
    visualDNA: {
      colorPalette: ['#4A5859', '#B8A47E', '#8B7355', '#2B3A3F'],
      lighting: 'Natural, gritty, urban decay',
      composition: 'Wide shot of stairs, urban environment, centered subject',
      mood: 'Liberation, madness, transformation',
      cameraWork: 'Slow push-in, following movement, natural handheld',
      specialElements: ['Urban stairs', 'Natural grit', 'Dance movement', 'Transformation moment']
    },
    promptTemplate: 'Cinematic urban stairs scene, gritty natural lighting, muted color palette, centered composition, dance movement, atmospheric urban decay, liberating yet unsettling mood, joker style'
  }
];

// ==================== INNOVATION #5: CHARACTER CONSISTENCY ENGINE ====================

export interface CharacterProfile {
  id: string;
  name: string;
  physical: {
    age: string;
    gender: string;
    ethnicity: string;
    height: string;
    build: string;
    hair: string;
    eyes: string;
    skin: string;
    distinguishingFeatures: string[];
  };
  clothing: string[];
  expressions: string[];
  consistencyPrompt: string;
}

// ==================== INNOVATION #6: DIRECTOR STYLE PRESETS ====================

export interface DirectorStyle {
  id: string;
  director: string;
  yearsActive: string;
  signatureTechniques: string[];
  colorPalette: string;
  cameraStyle: string;
  editingStyle: string;
  themes: string[];
  iconicShots: string[];
  promptModifiers: string[];
}

export const directorStyles: DirectorStyle[] = [
  {
    id: 'spielberg',
    director: 'Steven Spielberg',
    yearsActive: '1971-Present',
    signatureTechniques: ['Lens flare', 'Silhouette shots', 'Wonder shots', 'Reaction shots', 'Natural lighting'],
    colorPalette: 'Warm, golden, natural, optimistic tones',
    cameraStyle: 'Smooth dolly movements, wide establishing shots, intimate close-ups',
    editingStyle: 'Invisible editing, emotional pacing, build-ups to wonder moments',
    themes: ['Wonder', 'Family', 'Hope', 'Adventure', 'Coming of age'],
    iconicShots: ['Silhouette against bright sky', 'Face lit by wonder', 'Lens flare', 'Oner action sequences'],
    promptModifiers: ['spielberg style', 'lens flare', 'warm golden lighting', 'sense of wonder', 'smooth dolly shot', 'natural cinematic']
  },
  {
    id: 'nolan',
    director: 'Christopher Nolan',
    yearsActive: '1998-Present',
    signatureTechniques: ['Practical effects', 'IMAX scale', 'Non-linear narrative', 'Time manipulation', 'Minimal CGI'],
    colorPalette: 'Desaturated, blue-grey, cold, realistic',
    cameraStyle: 'Steady handheld, IMAX wide shots, dramatic wide angles',
    editingStyle: 'Complex cross-cutting, parallel timelines, building tension',
    themes: ['Time', 'Memory', 'Identity', 'Sacrifice', 'Reality vs perception'],
    iconicShots: ['IMAX wide establishing', 'Rotating environments', 'Time-bending sequences', 'Practical large-scale action'],
    promptModifiers: ['christopher nolan style', 'IMAX quality', 'desaturated blue-grey', 'practical effects', 'epic scale', 'steady camera']
  },
  {
    id: 'tarantino',
    director: 'Quentin Tarantino',
    yearsActive: '1992-Present',
    signatureTechniques: ['Trunk shot', 'Mexican standoff', 'Feet shots', 'Long dialogue takes', 'Chapter structure'],
    colorPalette: 'Saturated, retro, bold primary colors',
    cameraStyle: 'Low angles, trunk POV, tracking shots during dialogue',
    editingStyle: 'Non-linear, chapter-based, sharp cuts, freeze frames',
    themes: ['Revenge', 'Pop culture', 'Violence as art', 'Redemption', 'Dialogue-driven'],
    iconicShots: ['Low angle trunk shot', 'Mexican standoff', 'Extreme close-up feet', 'Long tracking dialogue'],
    promptModifiers: ['tarantino style', 'saturated retro colors', 'low angle shot', 'trunk POV', 'stylized violence', 'bold composition']
  },
  {
    id: 'kubrick',
    director: 'Stanley Kubrick',
    yearsActive: '1951-1999',
    signatureTechniques: ['Symmetry', 'One-point perspective', 'Steadicam', 'Wide-angle lenses', 'Slow zooms'],
    colorPalette: 'Cold, clinical, blue-white, stark contrasts',
    cameraStyle: 'Perfect symmetry, one-point perspective, slow tracking, wide-angle',
    editingStyle: 'Deliberate pacing, long takes, precise cuts, match cuts',
    themes: ['Humanity', 'Violence', 'Dystopia', 'Isolation', 'Madness'],
    iconicShots: ['Perfect symmetrical composition', 'One-point perspective hallways', 'Steadicam follow', 'Wide-angle distortion'],
    promptModifiers: ['stanley kubrick style', 'perfect symmetry', 'one-point perspective', 'cold clinical lighting', 'wide-angle lens', 'meticulous composition']
  },
  {
    id: 'fincher',
    director: 'David Fincher',
    yearsActive: '1992-Present',
    signatureTechniques: ['Dark spaces', 'Impossible camera moves', 'Digital perfection', 'Hidden cuts', 'Moody atmosphere'],
    colorPalette: 'Desaturated green-yellow, dark, moody, sickly',
    cameraStyle: 'Precise digital tracking, impossible CG-assisted moves, locked-down compositions',
    editingStyle: 'Hidden cuts, perfect continuity, building dread',
    themes: ['Obsession', 'Darkness', 'Perfection', 'Psychological thriller', 'Modern malaise'],
    iconicShots: ['Through objects tracking shot', 'Dark moody interiors', 'Precise digital movement', 'Sickly green grade'],
    promptModifiers: ['david fincher style', 'dark moody atmosphere', 'desaturated green-yellow', 'precise camera movement', 'psychological thriller aesthetic']
  },
  {
    id: 'villeneuve',
    director: 'Denis Villeneuve',
    yearsActive: '1998-Present',
    signatureTechniques: ['Scale shots', 'Fog/atmosphere', 'Slow reveals', 'Minimalist dialogue', 'Environmental storytelling'],
    colorPalette: 'Orange-teal, desaturated, earthy, atmospheric',
    cameraStyle: 'Slow deliberate movement, epic scale, drone-like reveals',
    editingStyle: 'Contemplative pacing, atmospheric builds, minimal cuts',
    themes: ['Identity', 'Survival', 'Humanity', 'Scale', 'Atmosphere'],
    iconicShots: ['Tiny human in vast landscape', 'Slow atmospheric reveal', 'Through fog emergence', 'Scale comparison'],
    promptModifiers: ['denis villeneuve style', 'epic atmospheric scale', 'orange and teal', 'fog atmosphere', 'slow reveal', 'contemplative']
  },
  {
    id: 'anderson',
    director: 'Wes Anderson',
    yearsActive: '1996-Present',
    signatureTechniques: ['Symmetry', 'Planimetric composition', 'Whip pan', 'Color-coded', 'Miniatures'],
    colorPalette: 'Pastel, perfectly balanced, color-coded by character/scene',
    cameraStyle: 'Lateral tracking, perfectly centered, dollhouse perspective',
    editingStyle: 'Whip pans, chapter structure, symmetrical cross-cutting',
    themes: ['Family dysfunction', 'Nostalgia', 'Quirky characters', 'Coming of age', 'Melancholy'],
    iconicShots: ['Perfect symmetry', 'Lateral tracking shot', 'Overhead dollhouse', 'Pastel tableau'],
    promptModifiers: ['wes anderson style', 'perfect symmetry', 'pastel colors', 'centered composition', 'lateral tracking', 'whimsical aesthetic']
  },
  {
    id: 'del-toro',
    director: 'Guillermo del Toro',
    yearsActive: '1993-Present',
    signatureTechniques: ['Creature design', 'Practical monsters', 'Gothic architecture', 'Color symbolism', 'Fairy tale darkness'],
    colorPalette: 'Deep amber, teal, gothic rich colors, bioluminescent',
    cameraStyle: 'Gliding through environments, creature reveals, immersive',
    editingStyle: 'Fantasy pacing, wonder moments, creature showcases',
    themes: ['Monsters', 'Innocence', 'Fairy tales', 'Fascism', 'Beauty in darkness'],
    iconicShots: ['Creature reveal', 'Gothic architecture', 'Amber-teal contrast', 'Practical monster close-up'],
    promptModifiers: ['guillermo del toro style', 'gothic atmosphere', 'deep amber and teal', 'creature design', 'fairy tale darkness', 'bioluminescent']
  },
  {
    id: 'miyazaki',
    director: 'Hayao Miyazaki',
    yearsActive: '1963-Present',
    signatureTechniques: ['Flight sequences', 'Environmental detail', 'Clouds', 'Food', 'Gentle character moments'],
    colorPalette: 'Natural, sky blue, soft pastels, vibrant nature',
    cameraStyle: 'Slow pans across details, flight following, contemplative',
    editingStyle: 'Quiet moments, ma (emptiness), building to action',
    themes: ['Nature', 'Flight', 'Coming of age', 'Environmentalism', 'Pacifism'],
    iconicShots: ['Flight over clouds', 'Detailed food', 'Wind through grass', 'Quiet contemplation'],
    promptModifiers: ['hayao miyazaki style', 'studio ghibli aesthetic', 'soft natural colors', 'sky and clouds', 'gentle atmosphere', 'hand-drawn feel']
  },
  {
    id: 'scott',
    director: 'Ridley Scott',
    yearsActive: '1965-Present',
    signatureTechniques: ['Atmospheric smoke', 'Backlit subjects', 'Industrial design', 'Practical sets', 'Lived-in future'],
    colorPalette: 'Industrial grey, smoke-diffused, contrasty, lived-in',
    cameraStyle: 'Steadicam exploration, smoke atmosphere, detailed environments',
    editingStyle: 'World-building pacing, atmospheric cuts, tension building',
    themes: ['Survival', 'Humanity', 'Creation', 'Corporate dystopia', 'Alien other'],
    iconicShots: ['Smoke-filled corridors', 'Backlit atmospheric', 'Industrial cathedral', 'Detailed future tech'],
    promptModifiers: ['ridley scott style', 'atmospheric smoke', 'industrial sci-fi', 'backlit subjects', 'lived-in future', 'contrasty lighting']
  }
];

// ==================== INNOVATION #7: NARRATIVE ARC GENERATOR ====================

export interface StoryBeat {
  id: string;
  name: string;
  description: string;
  percentage: number; // Where in the story (0-100%)
  visualSuggestions: string[];
  emotionalTone: string;
}

export interface NarrativeStructure {
  id: string;
  name: string;
  description: string;
  beats: StoryBeat[];
}

export const narrativeStructures: NarrativeStructure[] = [
  {
    id: 'heros-journey',
    name: 'Hero\'s Journey',
    description: 'Joseph Campbell\'s monomyth - 12 stages of the hero\'s adventure',
    beats: [
      { id: 'ordinary-world', name: 'Ordinary World', description: 'Hero in their normal life before adventure', percentage: 0, visualSuggestions: ['Establish normal routine', 'Show comfort zone', 'Daily life'], emotionalTone: 'Comfortable, familiar' },
      { id: 'call-adventure', name: 'Call to Adventure', description: 'Hero receives challenge/quest', percentage: 8, visualSuggestions: ['Inciting incident', 'Mysterious message', 'Opportunity appears'], emotionalTone: 'Intriguing, unsettling' },
      { id: 'refusal', name: 'Refusal of the Call', description: 'Hero hesitates or refuses', percentage: 15, visualSuggestions: ['Internal conflict', 'Fear visualization', 'Doubt'], emotionalTone: 'Fear, uncertainty' },
      { id: 'mentor', name: 'Meeting the Mentor', description: 'Wise figure provides guidance', percentage: 20, visualSuggestions: ['Wisdom sharing', 'Training montage', 'Gift giving'], emotionalTone: 'Hopeful, learning' },
      { id: 'threshold', name: 'Crossing the Threshold', description: 'Hero commits to adventure', percentage: 25, visualSuggestions: ['Literal threshold crossing', 'Point of no return', 'New world reveal'], emotionalTone: 'Determined, anxious' },
      { id: 'tests', name: 'Tests, Allies, and Enemies', description: 'Hero faces challenges, makes friends and foes', percentage: 40, visualSuggestions: ['Action sequences', 'Team building', 'Obstacles'], emotionalTone: 'Challenging, bonding' },
      { id: 'approach', name: 'Approach to the Inmost Cave', description: 'Hero prepares for major challenge', percentage: 50, visualSuggestions: ['Planning scenes', 'Preparation', 'Calm before storm'], emotionalTone: 'Tense, anticipatory' },
      { id: 'ordeal', name: 'The Ordeal', description: 'Hero faces greatest fear, often a death/rebirth', percentage: 60, visualSuggestions: ['Major battle', 'Near death', 'Greatest challenge'], emotionalTone: 'Intense, desperate' },
      { id: 'reward', name: 'Reward', description: 'Hero survives and gains treasure/knowledge', percentage: 70, visualSuggestions: ['Victory moment', 'Prize obtained', 'Truth revealed'], emotionalTone: 'Triumphant, relieved' },
      { id: 'road-back', name: 'The Road Back', description: 'Hero begins journey home with new danger', percentage: 75, visualSuggestions: ['Chase scenes', 'New threat', 'Escape'], emotionalTone: 'Urgent, determined' },
      { id: 'resurrection', name: 'Resurrection', description: 'Final test, hero transformed', percentage: 85, visualSuggestions: ['Climactic battle', 'Final choice', 'Ultimate transformation'], emotionalTone: 'Climactic, transformative' },
      { id: 'return-elixir', name: 'Return with the Elixir', description: 'Hero returns home changed, with benefit for all', percentage: 100, visualSuggestions: ['Homecoming', 'Sharing wisdom', 'New normal'], emotionalTone: 'Resolved, hopeful' }
    ]
  },
  {
    id: 'three-act',
    name: 'Three Act Structure',
    description: 'Classic screenplay structure - Setup, Confrontation, Resolution',
    beats: [
      { id: 'opening-image', name: 'Opening Image', description: 'Snapshot of hero before journey', percentage: 0, visualSuggestions: ['Thematic image', 'Visual metaphor', 'World establishment'], emotionalTone: 'Establishing' },
      { id: 'setup', name: 'Setup', description: 'Introduce world, characters, status quo', percentage: 5, visualSuggestions: ['World building', 'Character introduction', 'Normal life'], emotionalTone: 'Expository, building' },
      { id: 'inciting-incident', name: 'Inciting Incident', description: 'Event that starts the story', percentage: 12, visualSuggestions: ['Disruption', 'Problem appears', 'Call to action'], emotionalTone: 'Disruptive, intriguing' },
      { id: 'act-1-turn', name: 'Act 1 Turn', description: 'Hero commits to journey', percentage: 25, visualSuggestions: ['Decision moment', 'No turning back', 'Journey begins'], emotionalTone: 'Committed, uncertain' },
      { id: 'midpoint', name: 'Midpoint', description: 'Major revelation or event changes direction', percentage: 50, visualSuggestions: ['False victory/defeat', 'Major revelation', 'Raising stakes'], emotionalTone: 'Pivotal, shocking' },
      { id: 'rising-action', name: 'Rising Action', description: 'Complications increase, stakes rise', percentage: 60, visualSuggestions: ['Mounting obstacles', 'Complications', 'Pressure building'], emotionalTone: 'Intensifying, complex' },
      { id: 'act-2-turn', name: 'Act 2 Turn', description: 'All is lost moment, lowest point', percentage: 75, visualSuggestions: ['Major loss', 'Betrayal', 'Darkest moment'], emotionalTone: 'Desperate, defeated' },
      { id: 'climax', name: 'Climax', description: 'Final confrontation, highest tension', percentage: 90, visualSuggestions: ['Final battle', 'Ultimate choice', 'Maximum intensity'], emotionalTone: 'Peak tension, decisive' },
      { id: 'resolution', name: 'Resolution', description: 'Consequences play out, loose ends tied', percentage: 95, visualSuggestions: ['Aftermath', 'Tying loose ends', 'New equilibrium'], emotionalTone: 'Winding down, resolving' },
      { id: 'final-image', name: 'Final Image', description: 'Mirror to opening, shows change', percentage: 100, visualSuggestions: ['Thematic bookend', 'Changed world', 'Visual parallel'], emotionalTone: 'Conclusive, transformative' }
    ]
  },
  {
    id: 'save-the-cat',
    name: 'Save the Cat',
    description: 'Blake Snyder\'s 15-beat structure for screenplays',
    beats: [
      { id: 'opening-image-stc', name: 'Opening Image', description: 'Visual snapshot of before', percentage: 1, visualSuggestions: ['Symbolic image', 'World before'], emotionalTone: 'Establishing' },
      { id: 'theme-stated', name: 'Theme Stated', description: 'Theme/question posed to hero', percentage: 5, visualSuggestions: ['Wisdom sharing', 'Question posed'], emotionalTone: 'Thematic' },
      { id: 'setup-stc', name: 'Setup', description: 'Introduce characters and world', percentage: 10, visualSuggestions: ['Character intros', 'World building'], emotionalTone: 'Expository' },
      { id: 'catalyst', name: 'Catalyst', description: 'Inciting incident', percentage: 12, visualSuggestions: ['Life-changing event'], emotionalTone: 'Disruptive' },
      { id: 'debate', name: 'Debate', description: 'Should hero go on journey?', percentage: 20, visualSuggestions: ['Internal conflict', 'Weighing options'], emotionalTone: 'Uncertain' },
      { id: 'break-2', name: 'Break into Two', description: 'Hero enters Act 2, new world', percentage: 25, visualSuggestions: ['New world', 'Journey begins'], emotionalTone: 'Adventurous' },
      { id: 'b-story', name: 'B Story', description: 'Subplot begins, often romantic', percentage: 30, visualSuggestions: ['New relationship', 'Subplot intro'], emotionalTone: 'Developing' },
      { id: 'fun-games', name: 'Fun and Games', description: 'Promise of the premise, trailer moments', percentage: 50, visualSuggestions: ['Best moments', 'Trailer shots'], emotionalTone: 'Entertaining' },
      { id: 'midpoint-stc', name: 'Midpoint', description: 'False victory or defeat, raise stakes', percentage: 50, visualSuggestions: ['Stakes raised', 'Victory/defeat'], emotionalTone: 'Pivotal' },
      { id: 'bad-guys', name: 'Bad Guys Close In', description: 'Complications and obstacles mount', percentage: 65, visualSuggestions: ['Mounting pressure', 'Complications'], emotionalTone: 'Pressured' },
      { id: 'all-lost', name: 'All Is Lost', description: 'Lowest point, whiff of death', percentage: 75, visualSuggestions: ['Major loss', 'Death moment'], emotionalTone: 'Devastating' },
      { id: 'dark-night', name: 'Dark Night of the Soul', description: 'Hero at lowest, reflects', percentage: 80, visualSuggestions: ['Reflection', 'Despair'], emotionalTone: 'Reflective, dark' },
      { id: 'break-3', name: 'Break into Three', description: 'Epiphany, solution found', percentage: 85, visualSuggestions: ['Realization', 'Solution'], emotionalTone: 'Hopeful' },
      { id: 'finale', name: 'Finale', description: 'Hero executes plan, defeats enemy', percentage: 95, visualSuggestions: ['Final battle', 'Plan execution'], emotionalTone: 'Climactic' },
      { id: 'final-image-stc', name: 'Final Image', description: 'Opposite of opening, change shown', percentage: 100, visualSuggestions: ['Transformed world', 'Bookend'], emotionalTone: 'Resolved' }
    ]
  }
];

// ==================== INNOVATIONS #8-#12 (Simplified) ====================

export const advancedFeatures = {
  physicsAware: {
    gravity: 9.8,
    windDirection: 0,
    windStrength: 0,
    turbulence: 0,
    collisionDetection: true
  },
  audioReactive: {
    modes: ['beat-sync', 'bass-response', 'melody-tracking', 'drop-detection', 'vocal-isolation', 'intensity-mapping']
  },
  proceduralBiomes: [
    { id: 'forest', name: 'Forest', elements: ['trees', 'undergrowth', 'wildlife', 'streams'] },
    { id: 'desert', name: 'Desert', elements: ['sand dunes', 'cacti', 'rocks', 'heat shimmer'] },
    { id: 'ocean', name: 'Ocean', elements: ['waves', 'coral', 'fish', 'depth fade'] },
    { id: 'mountain', name: 'Mountain', elements: ['peaks', 'snow', 'rocks', 'alpine vegetation'] },
    { id: 'urban', name: 'Urban', elements: ['buildings', 'streets', 'vehicles', 'crowds'] },
    { id: 'alien', name: 'Alien', elements: ['exotic plants', 'strange geology', 'unusual sky', 'alien structures'] },
    { id: 'fantasy', name: 'Fantasy', elements: ['magical elements', 'castles', 'mythical creatures', 'enchanted forests'] },
    { id: 'apocalyptic', name: 'Apocalyptic', elements: ['ruins', 'overgrowth', 'decay', 'abandoned vehicles'] },
    { id: 'underwater', name: 'Underwater', elements: ['kelp', 'coral', 'bioluminescence', 'schools of fish'] },
    { id: 'arctic', name: 'Arctic', elements: ['ice', 'snow', 'auroras', 'frozen landscape'] }
  ],
  stuntStyles: [
    { id: 'martial-arts', name: 'Martial Arts', techniques: ['kicks', 'punches', 'throws', 'acrobatics'] },
    { id: 'brawl', name: 'Street Brawl', techniques: ['grappling', 'improvised weapons', 'dirty fighting'] },
    { id: 'sword', name: 'Sword Fighting', techniques: ['parries', 'lunges', 'flourishes', 'disarms'] },
    { id: 'gun-fu', name: 'Gun-Fu', techniques: ['dual wielding', 'acrobatic shooting', 'close quarters'] },
    { id: 'superhero', name: 'Superhero', techniques: ['super strength', 'flying punches', 'power moves'] },
    { id: 'wrestling', name: 'Wrestling', techniques: ['slams', 'submissions', 'throws'] },
    { id: 'boxing', name: 'Boxing', techniques: ['jabs', 'hooks', 'uppercuts', 'footwork'] },
    { id: 'ninja', name: 'Ninja', techniques: ['stealth', 'throwing weapons', 'flips', 'wall running'] }
  ],
  branchingOptions: {
    moodVariations: ['lighter', 'darker', 'more intense', 'more subtle'],
    alternateEndings: ['happy', 'tragic', 'ambiguous', 'twist'],
    pacingOptions: ['faster', 'slower', 'contemplative', 'action-packed'],
    styleVariations: ['realistic', 'stylized', 'surreal', 'documentary']
  }
};

export const cinematixExtended = {
  iconicScenes,
  directorStyles,
  narrativeStructures,
  advancedFeatures
};
