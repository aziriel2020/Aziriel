/**
 * INNOVATION #5: Camera Operator DNA
 *
 * Human-like camera operation with authentic micro-movements and operator personality.
 *
 * Features:
 * - Operator profiles: Steadicam, handheld, gimbal, crane, dolly styles
 * - Breathing simulation: Subtle camera rise/fall matching respiratory rhythm
 * - Micro-adjustments: Frame correction, anticipation, operator personality
 * - Weight simulation: Inertia, momentum, settling based on rig type
 * - Pull/push timing: Organic acceleration curves for zooms and dollies
 * - Human error modeling: Slight imperfections in tracking and framing
 *
 * Revolutionary Impact: First AI platform with humanized camera movement
 */

export interface OperatorProfile {
  id: string;
  name: string;
  rigType: 'steadicam' | 'handheld' | 'gimbal' | 'crane' | 'dolly' | 'tripod';
  experience: 'novice' | 'intermediate' | 'expert' | 'master';
  characteristics: OperatorCharacteristics;
  physicalProfile: PhysicalProfile;
}

export interface OperatorCharacteristics {
  smoothness: number; // 0-1 (0 = shaky, 1 = perfectly smooth)
  anticipation: number; // 0-1 (how well they predict subject movement)
  reactiveness: number; // 0-1 (speed of response to unexpected events)
  framing: 'loose' | 'tight' | 'rule-of-thirds' | 'centered';
  personalityQuirks: string[]; // e.g., 'slight-drift-left', 'over-corrects'
}

export interface PhysicalProfile {
  breathingRate: number; // breaths per minute
  breathingAmplitude: number; // pixels of vertical movement
  heartRate: number; // affects micro-tremor
  fatigueFactor: number; // increases over time in long takes
  dominantHand: 'left' | 'right'; // affects directional bias
}

export interface CameraMovement {
  type: 'static' | 'pan' | 'tilt' | 'dolly' | 'truck' | 'crane' | 'orbit' | 'handheld-follow';
  startPosition: { x: number; y: number; z: number };
  endPosition: { x: number; y: number; z: number };
  duration: number; // seconds
  easingCurve: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'operator-organic';
}

export class CameraOperatorDNA {
  private static operators: Map<string, OperatorProfile> = new Map();

  static initialize() {
    // Master Steadicam Operator
    this.registerOperator({
      id: 'garrett_brown_style',
      name: 'Master Steadicam (Garrett Brown Style)',
      rigType: 'steadicam',
      experience: 'master',
      characteristics: {
        smoothness: 0.98,
        anticipation: 0.95,
        reactiveness: 0.92,
        framing: 'rule-of-thirds',
        personalityQuirks: ['subtle-float', 'anticipates-turns'],
      },
      physicalProfile: {
        breathingRate: 12,
        breathingAmplitude: 0.5,
        heartRate: 65,
        fatigueFactor: 0.1,
        dominantHand: 'right',
      },
    });

    // Documentary Handheld Operator
    this.registerOperator({
      id: 'verite_handheld',
      name: 'Cinéma Vérité Handheld',
      rigType: 'handheld',
      experience: 'expert',
      characteristics: {
        smoothness: 0.65,
        anticipation: 0.88,
        reactiveness: 0.95,
        framing: 'loose',
        personalityQuirks: ['energetic-movement', 'occasional-wobble', 'rapid-reframes'],
      },
      physicalProfile: {
        breathingRate: 16,
        breathingAmplitude: 2.5,
        heartRate: 80,
        fatigueFactor: 0.3,
        dominantHand: 'right',
      },
    });

    // Modern Gimbal Operator
    this.registerOperator({
      id: 'ronin_gimbal',
      name: 'Modern Gimbal Operator',
      rigType: 'gimbal',
      experience: 'expert',
      characteristics: {
        smoothness: 0.92,
        anticipation: 0.85,
        reactiveness: 0.88,
        framing: 'tight',
        personalityQuirks: ['floating-quality', 'occasional-micro-jitter'],
      },
      physicalProfile: {
        breathingRate: 14,
        breathingAmplitude: 0.8,
        heartRate: 72,
        fatigueFactor: 0.15,
        dominantHand: 'right',
      },
    });

    // Crane Operator
    this.registerOperator({
      id: 'technocrane',
      name: 'Technocrane Operator',
      rigType: 'crane',
      experience: 'expert',
      characteristics: {
        smoothness: 0.96,
        anticipation: 0.90,
        reactiveness: 0.75, // Slower response due to crane mass
        framing: 'centered',
        personalityQuirks: ['momentum-drift', 'slight-overshoot'],
      },
      physicalProfile: {
        breathingRate: 10,
        breathingAmplitude: 0.3,
        heartRate: 68,
        fatigueFactor: 0.05,
        dominantHand: 'right',
      },
    });

    // Classic Dolly Operator
    this.registerOperator({
      id: 'fisher_dolly',
      name: 'Classic Dolly Grip',
      rigType: 'dolly',
      experience: 'master',
      characteristics: {
        smoothness: 0.99,
        anticipation: 0.93,
        reactiveness: 0.80,
        framing: 'rule-of-thirds',
        personalityQuirks: ['track-rumble', 'slight-sway'],
      },
      physicalProfile: {
        breathingRate: 11,
        breathingAmplitude: 0.4,
        heartRate: 70,
        fatigueFactor: 0.08,
        dominantHand: 'right',
      },
    });

    // Locked-off Tripod (minimal movement)
    this.registerOperator({
      id: 'tripod_locked',
      name: 'Locked-off Tripod',
      rigType: 'tripod',
      experience: 'expert',
      characteristics: {
        smoothness: 1.0,
        anticipation: 1.0,
        reactiveness: 0.0,
        framing: 'centered',
        personalityQuirks: ['micro-vibration'], // Only from environmental factors
      },
      physicalProfile: {
        breathingRate: 0,
        breathingAmplitude: 0.05, // Minimal environmental shake
        heartRate: 0,
        fatigueFactor: 0,
        dominantHand: 'right',
      },
    });

    console.log(`Camera Operator DNA initialized with ${this.operators.size} operator profiles`);
  }

  private static registerOperator(profile: OperatorProfile) {
    this.operators.set(profile.id, profile);
  }

  static getOperator(operatorId: string): OperatorProfile | undefined {
    return this.operators.get(operatorId);
  }

  static getAllOperators(): OperatorProfile[] {
    return Array.from(this.operators.values());
  }

  /**
   * Apply operator DNA to camera movement
   */
  static applyOperatorDNA(
    operatorId: string,
    movement: CameraMovement,
    shotDuration: number
  ): OperatorRenderConfig {
    const operator = this.getOperator(operatorId);
    if (!operator) {
      throw new Error(`Operator profile not found: ${operatorId}`);
    }

    // Calculate breathing oscillation
    const breathingCycle = this.calculateBreathingCycle(
      operator.physicalProfile,
      shotDuration
    );

    // Calculate micro-movements
    const microMovements = this.calculateMicroMovements(
      operator.characteristics,
      operator.physicalProfile,
      shotDuration
    );

    // Calculate momentum and inertia
    const momentum = this.calculateMomentum(
      operator.rigType,
      movement,
      operator.characteristics.smoothness
    );

    // Apply operator personality quirks
    const quirks = this.applyPersonalityQuirks(
      operator.characteristics.personalityQuirks,
      movement
    );

    return {
      operator: operator.name,
      rigType: operator.rigType,
      breathingCycle,
      microMovements,
      momentum,
      personalityQuirks: quirks,
      easingCurve: this.generateOrganicEasing(operator.characteristics),
    };
  }

  /**
   * Calculate breathing cycle oscillation
   */
  private static calculateBreathingCycle(
    physical: PhysicalProfile,
    duration: number
  ): BreathingCycle {
    const breathsPerSecond = physical.breathingRate / 60;
    const totalBreaths = breathsPerSecond * duration;

    return {
      frequency: breathsPerSecond,
      amplitude: physical.breathingAmplitude,
      phase: Math.random() * Math.PI * 2, // Random starting phase
      totalCycles: totalBreaths,
    };
  }

  /**
   * Calculate micro-movements (operator corrections, anticipation)
   */
  private static calculateMicroMovements(
    characteristics: OperatorCharacteristics,
    physical: PhysicalProfile,
    duration: number
  ): MicroMovement[] {
    const movements: MicroMovement[] = [];

    // Heart rate induced micro-tremor
    const tremorFrequency = physical.heartRate / 60;
    movements.push({
      type: 'tremor',
      frequency: tremorFrequency,
      amplitude: (1 - characteristics.smoothness) * 0.2,
    });

    // Anticipation adjustments
    if (characteristics.anticipation > 0.7) {
      movements.push({
        type: 'anticipation',
        frequency: 0.5, // Occasional predictive adjustments
        amplitude: 0.3,
      });
    }

    // Over-correction from reactiveness
    if (characteristics.reactiveness > 0.8) {
      movements.push({
        type: 'over-correction',
        frequency: 0.3,
        amplitude: (1 - characteristics.smoothness) * 0.5,
      });
    }

    return movements;
  }

  /**
   * Calculate momentum and inertia based on rig type
   */
  private static calculateMomentum(
    rigType: string,
    movement: CameraMovement,
    smoothness: number
  ): MomentumConfig {
    const rigMass = {
      'steadicam': 20, // kg
      'handheld': 5,
      'gimbal': 8,
      'crane': 500,
      'dolly': 200,
      'tripod': 10,
    };

    const mass = rigMass[rigType as keyof typeof rigMass] || 10;

    // Calculate acceleration time based on mass and smoothness
    const accelerationTime = (mass / 100) * (1 - smoothness * 0.5);
    const decelerationTime = accelerationTime * 1.2; // Deceleration takes slightly longer

    return {
      mass,
      accelerationTime,
      decelerationTime,
      overshoot: (1 - smoothness) * 0.1, // Slight overshoot on stop
      settling: (1 - smoothness) * 0.3, // Settling oscillation
    };
  }

  /**
   * Apply personality quirks to movement
   */
  private static applyPersonalityQuirks(
    quirks: string[],
    movement: CameraMovement
  ): QuirkConfig[] {
    return quirks.map(quirk => {
      switch (quirk) {
        case 'slight-drift-left':
          return { type: 'drift', direction: 'left', intensity: 0.1 };
        case 'over-corrects':
          return { type: 'over-correction', intensity: 0.15 };
        case 'subtle-float':
          return { type: 'float', frequency: 0.2, amplitude: 0.5 };
        case 'anticipates-turns':
          return { type: 'anticipation', leadTime: 0.3 };
        case 'energetic-movement':
          return { type: 'energy', intensity: 1.3 };
        case 'occasional-wobble':
          return { type: 'wobble', frequency: 0.5, amplitude: 0.8 };
        case 'track-rumble':
          return { type: 'rumble', frequency: 2.0, amplitude: 0.2 };
        default:
          return { type: 'none', intensity: 0 };
      }
    });
  }

  /**
   * Generate organic easing curve based on operator characteristics
   */
  private static generateOrganicEasing(
    characteristics: OperatorCharacteristics
  ): EasingFunction {
    return {
      type: 'operator-organic',
      smoothness: characteristics.smoothness,
      anticipation: characteristics.anticipation,
      reactiveness: characteristics.reactiveness,
    };
  }
}

export interface OperatorRenderConfig {
  operator: string;
  rigType: string;
  breathingCycle: BreathingCycle;
  microMovements: MicroMovement[];
  momentum: MomentumConfig;
  personalityQuirks: QuirkConfig[];
  easingCurve: EasingFunction;
}

export interface BreathingCycle {
  frequency: number;
  amplitude: number;
  phase: number;
  totalCycles: number;
}

export interface MicroMovement {
  type: 'tremor' | 'anticipation' | 'over-correction';
  frequency: number;
  amplitude: number;
}

export interface MomentumConfig {
  mass: number;
  accelerationTime: number;
  decelerationTime: number;
  overshoot: number;
  settling: number;
}

export interface QuirkConfig {
  type: string;
  direction?: string;
  intensity?: number;
  frequency?: number;
  amplitude?: number;
  leadTime?: number;
}

export interface EasingFunction {
  type: string;
  smoothness: number;
  anticipation: number;
  reactiveness: number;
}

// Initialize operator profiles
CameraOperatorDNA.initialize();
