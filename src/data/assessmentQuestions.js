// Program Evaluation Assessment Questions
// 17 questions across 4 domains

export const assessmentDomains = {
  PLAY: 'play',
  SELF_CARE: 'self_care',
  FINE_MOTOR: 'fine_motor',
  GROSS_MOTOR: 'gross_motor'
};

export const assessmentQuestions = [
  // Play Domain (Questions 1-5)
  {
    id: 'q1',
    domain: assessmentDomains.PLAY,
    question: 'Child engages in age-appropriate play activities',
    number: 1
  },
  {
    id: 'q2',
    domain: assessmentDomains.PLAY,
    question: 'Child shows creativity and imagination during play',
    number: 2
  },
  {
    id: 'q3',
    domain: assessmentDomains.PLAY,
    question: 'Child participates in cooperative play with peers',
    number: 3
  },
  {
    id: 'q4',
    domain: assessmentDomains.PLAY,
    question: 'Child demonstrates sustained attention during play',
    number: 4
  },
  {
    id: 'q5',
    domain: assessmentDomains.PLAY,
    question: 'Child shows interest in variety of play materials',
    number: 5
  },

  // Self-Care Domain (Questions 6-10)
  {
    id: 'q6',
    domain: assessmentDomains.SELF_CARE,
    question: 'Child feeds self independently',
    number: 6
  },
  {
    id: 'q7',
    domain: assessmentDomains.SELF_CARE,
    question: 'Child dresses self with minimal assistance',
    number: 7
  },
  {
    id: 'q8',
    domain: assessmentDomains.SELF_CARE,
    question: 'Child maintains personal hygiene routines',
    number: 8
  },
  {
    id: 'q9',
    domain: assessmentDomains.SELF_CARE,
    question: 'Child uses utensils appropriately',
    number: 9
  },
  {
    id: 'q10',
    domain: assessmentDomains.SELF_CARE,
    question: 'Child manages toileting independently',
    number: 10
  },

  // Fine Motor Domain (Questions 11-14)
  {
    id: 'q11',
    domain: assessmentDomains.FINE_MOTOR,
    question: 'Child demonstrates appropriate pencil grasp',
    number: 11
  },
  {
    id: 'q12',
    domain: assessmentDomains.FINE_MOTOR,
    question: 'Child manipulates small objects with precision',
    number: 12
  },
  {
    id: 'q13',
    domain: assessmentDomains.FINE_MOTOR,
    question: 'Child cuts with scissors along lines',
    number: 13
  },
  {
    id: 'q14',
    domain: assessmentDomains.FINE_MOTOR,
    question: 'Child performs age-appropriate handwriting tasks',
    number: 14
  },

  // Gross Motor Domain (Questions 15-17)
  {
    id: 'q15',
    domain: assessmentDomains.GROSS_MOTOR,
    question: 'Child demonstrates balance and coordination',
    number: 15
  },
  {
    id: 'q16',
    domain: assessmentDomains.GROSS_MOTOR,
    question: 'Child participates in age-appropriate physical activities',
    number: 16
  },
  {
    id: 'q17',
    domain: assessmentDomains.GROSS_MOTOR,
    question: 'Child demonstrates body awareness and motor planning',
    number: 17
  }
];

export const domainNames = {
  [assessmentDomains.PLAY]: 'Play',
  [assessmentDomains.SELF_CARE]: 'Self-Care',
  [assessmentDomains.FINE_MOTOR]: 'Fine Motor',
  [assessmentDomains.GROSS_MOTOR]: 'Gross Motor'
};

// Rating scale: 1-5
// 1 = Cannot do / Not observed
// 2 = Does with significant assistance
// 3 = Does with moderate assistance
// 4 = Does with minimal assistance
// 5 = Does independently

export const ratingScale = [
  { value: 1, label: 'Cannot do / Not observed' },
  { value: 2, label: 'Significant assistance' },
  { value: 3, label: 'Moderate assistance' },
  { value: 4, label: 'Minimal assistance' },
  { value: 5, label: 'Independent' }
];

// Calculate domain average
export const calculateDomainAverage = (responses, domain) => {
  const domainQuestions = assessmentQuestions.filter(q => q.domain === domain);
  const domainResponses = domainQuestions
    .map(q => responses[q.id])
    .filter(r => r !== undefined && r !== null && r !== '');

  if (domainResponses.length === 0) return null;

  const sum = domainResponses.reduce((acc, val) => acc + Number(val), 0);
  return (sum / domainResponses.length).toFixed(2);
};

// Calculate all domain averages
export const calculateAllDomainAverages = (responses) => {
  return {
    [assessmentDomains.PLAY]: calculateDomainAverage(responses, assessmentDomains.PLAY),
    [assessmentDomains.SELF_CARE]: calculateDomainAverage(responses, assessmentDomains.SELF_CARE),
    [assessmentDomains.FINE_MOTOR]: calculateDomainAverage(responses, assessmentDomains.FINE_MOTOR),
    [assessmentDomains.GROSS_MOTOR]: calculateDomainAverage(responses, assessmentDomains.GROSS_MOTOR)
  };
};
