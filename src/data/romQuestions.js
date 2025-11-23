// ROM Assessment Questions and Joint Measurements
// Organized by body region with expected normal ranges

export const romBodyRegions = {
  SHOULDER: 'shoulder',
  ELBOW: 'elbow',
  WRIST: 'wrist',
  HIP: 'hip',
  KNEE: 'knee',
  ANKLE: 'ankle',
  SPINE: 'spine'
};

export const romSides = {
  LEFT: 'left',
  RIGHT: 'right',
  BILATERAL: 'bilateral'
};

// ROM measurements with normal ranges (in degrees)
export const romMeasurements = [
  // Shoulder
  {
    id: 'shoulder_flexion',
    region: romBodyRegions.SHOULDER,
    movement: 'Flexion',
    normalRange: { min: 0, max: 180 },
    description: 'Raise arm forward and upward',
    bilateral: true
  },
  {
    id: 'shoulder_extension',
    region: romBodyRegions.SHOULDER,
    movement: 'Extension',
    normalRange: { min: 0, max: 60 },
    description: 'Move arm backward',
    bilateral: true
  },
  {
    id: 'shoulder_abduction',
    region: romBodyRegions.SHOULDER,
    movement: 'Abduction',
    normalRange: { min: 0, max: 180 },
    description: 'Raise arm out to the side',
    bilateral: true
  },
  {
    id: 'shoulder_adduction',
    region: romBodyRegions.SHOULDER,
    movement: 'Adduction',
    normalRange: { min: 0, max: 50 },
    description: 'Move arm across body',
    bilateral: true
  },
  {
    id: 'shoulder_internal_rotation',
    region: romBodyRegions.SHOULDER,
    movement: 'Internal Rotation',
    normalRange: { min: 0, max: 70 },
    description: 'Rotate arm inward',
    bilateral: true
  },
  {
    id: 'shoulder_external_rotation',
    region: romBodyRegions.SHOULDER,
    movement: 'External Rotation',
    normalRange: { min: 0, max: 90 },
    description: 'Rotate arm outward',
    bilateral: true
  },

  // Elbow
  {
    id: 'elbow_flexion',
    region: romBodyRegions.ELBOW,
    movement: 'Flexion',
    normalRange: { min: 0, max: 150 },
    description: 'Bend elbow',
    bilateral: true
  },
  {
    id: 'elbow_extension',
    region: romBodyRegions.ELBOW,
    movement: 'Extension',
    normalRange: { min: 0, max: 0 },
    description: 'Straighten elbow',
    bilateral: true
  },
  {
    id: 'forearm_supination',
    region: romBodyRegions.ELBOW,
    movement: 'Supination',
    normalRange: { min: 0, max: 80 },
    description: 'Rotate forearm palm up',
    bilateral: true
  },
  {
    id: 'forearm_pronation',
    region: romBodyRegions.ELBOW,
    movement: 'Pronation',
    normalRange: { min: 0, max: 80 },
    description: 'Rotate forearm palm down',
    bilateral: true
  },

  // Wrist
  {
    id: 'wrist_flexion',
    region: romBodyRegions.WRIST,
    movement: 'Flexion',
    normalRange: { min: 0, max: 80 },
    description: 'Bend wrist forward',
    bilateral: true
  },
  {
    id: 'wrist_extension',
    region: romBodyRegions.WRIST,
    movement: 'Extension',
    normalRange: { min: 0, max: 70 },
    description: 'Bend wrist backward',
    bilateral: true
  },
  {
    id: 'wrist_radial_deviation',
    region: romBodyRegions.WRIST,
    movement: 'Radial Deviation',
    normalRange: { min: 0, max: 20 },
    description: 'Bend wrist toward thumb',
    bilateral: true
  },
  {
    id: 'wrist_ulnar_deviation',
    region: romBodyRegions.WRIST,
    movement: 'Ulnar Deviation',
    normalRange: { min: 0, max: 30 },
    description: 'Bend wrist toward pinky',
    bilateral: true
  },

  // Hip
  {
    id: 'hip_flexion',
    region: romBodyRegions.HIP,
    movement: 'Flexion',
    normalRange: { min: 0, max: 120 },
    description: 'Raise thigh toward chest',
    bilateral: true
  },
  {
    id: 'hip_extension',
    region: romBodyRegions.HIP,
    movement: 'Extension',
    normalRange: { min: 0, max: 30 },
    description: 'Move thigh backward',
    bilateral: true
  },
  {
    id: 'hip_abduction',
    region: romBodyRegions.HIP,
    movement: 'Abduction',
    normalRange: { min: 0, max: 45 },
    description: 'Move leg out to side',
    bilateral: true
  },
  {
    id: 'hip_adduction',
    region: romBodyRegions.HIP,
    movement: 'Adduction',
    normalRange: { min: 0, max: 30 },
    description: 'Move leg across body',
    bilateral: true
  },
  {
    id: 'hip_internal_rotation',
    region: romBodyRegions.HIP,
    movement: 'Internal Rotation',
    normalRange: { min: 0, max: 45 },
    description: 'Rotate thigh inward',
    bilateral: true
  },
  {
    id: 'hip_external_rotation',
    region: romBodyRegions.HIP,
    movement: 'External Rotation',
    normalRange: { min: 0, max: 45 },
    description: 'Rotate thigh outward',
    bilateral: true
  },

  // Knee
  {
    id: 'knee_flexion',
    region: romBodyRegions.KNEE,
    movement: 'Flexion',
    normalRange: { min: 0, max: 135 },
    description: 'Bend knee',
    bilateral: true
  },
  {
    id: 'knee_extension',
    region: romBodyRegions.KNEE,
    movement: 'Extension',
    normalRange: { min: 0, max: 0 },
    description: 'Straighten knee',
    bilateral: true
  },

  // Ankle
  {
    id: 'ankle_dorsiflexion',
    region: romBodyRegions.ANKLE,
    movement: 'Dorsiflexion',
    normalRange: { min: 0, max: 20 },
    description: 'Bring toes toward shin',
    bilateral: true
  },
  {
    id: 'ankle_plantarflexion',
    region: romBodyRegions.ANKLE,
    movement: 'Plantarflexion',
    normalRange: { min: 0, max: 50 },
    description: 'Point toes downward',
    bilateral: true
  },
  {
    id: 'ankle_inversion',
    region: romBodyRegions.ANKLE,
    movement: 'Inversion',
    normalRange: { min: 0, max: 35 },
    description: 'Turn sole of foot inward',
    bilateral: true
  },
  {
    id: 'ankle_eversion',
    region: romBodyRegions.ANKLE,
    movement: 'Eversion',
    normalRange: { min: 0, max: 15 },
    description: 'Turn sole of foot outward',
    bilateral: true
  },

  // Spine
  {
    id: 'cervical_flexion',
    region: romBodyRegions.SPINE,
    movement: 'Cervical Flexion',
    normalRange: { min: 0, max: 45 },
    description: 'Bend neck forward',
    bilateral: false
  },
  {
    id: 'cervical_extension',
    region: romBodyRegions.SPINE,
    movement: 'Cervical Extension',
    normalRange: { min: 0, max: 45 },
    description: 'Bend neck backward',
    bilateral: false
  },
  {
    id: 'cervical_lateral_flexion',
    region: romBodyRegions.SPINE,
    movement: 'Cervical Lateral Flexion',
    normalRange: { min: 0, max: 45 },
    description: 'Bend neck to side',
    bilateral: true
  },
  {
    id: 'cervical_rotation',
    region: romBodyRegions.SPINE,
    movement: 'Cervical Rotation',
    normalRange: { min: 0, max: 60 },
    description: 'Turn head to side',
    bilateral: true
  },
  {
    id: 'lumbar_flexion',
    region: romBodyRegions.SPINE,
    movement: 'Lumbar Flexion',
    normalRange: { min: 0, max: 80 },
    description: 'Bend trunk forward',
    bilateral: false
  },
  {
    id: 'lumbar_extension',
    region: romBodyRegions.SPINE,
    movement: 'Lumbar Extension',
    normalRange: { min: 0, max: 25 },
    description: 'Bend trunk backward',
    bilateral: false
  },
  {
    id: 'lumbar_lateral_flexion',
    region: romBodyRegions.SPINE,
    movement: 'Lumbar Lateral Flexion',
    normalRange: { min: 0, max: 25 },
    description: 'Bend trunk to side',
    bilateral: true
  },
  {
    id: 'lumbar_rotation',
    region: romBodyRegions.SPINE,
    movement: 'Lumbar Rotation',
    normalRange: { min: 0, max: 45 },
    description: 'Rotate trunk to side',
    bilateral: true
  }
];

// Helper function to get measurements by region
export const getMeasurementsByRegion = (region) => {
  return romMeasurements.filter(m => m.region === region);
};

// Helper function to calculate percentage of normal ROM
export const calculateROMPercentage = (measured, normalMax) => {
  if (!measured || !normalMax) return 0;
  return Math.min(Math.round((measured / normalMax) * 100), 100);
};

// Helper function to determine ROM status
export const getROMStatus = (percentage) => {
  if (percentage >= 90) return 'normal';
  if (percentage >= 75) return 'mild';
  if (percentage >= 50) return 'moderate';
  return 'severe';
};

// Region display names
export const regionNames = {
  [romBodyRegions.SHOULDER]: 'Shoulder',
  [romBodyRegions.ELBOW]: 'Elbow/Forearm',
  [romBodyRegions.WRIST]: 'Wrist',
  [romBodyRegions.HIP]: 'Hip',
  [romBodyRegions.KNEE]: 'Knee',
  [romBodyRegions.ANKLE]: 'Ankle',
  [romBodyRegions.SPINE]: 'Spine'
};
