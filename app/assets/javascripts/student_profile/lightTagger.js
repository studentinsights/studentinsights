const ORDERED_TAGS = [
  'placement',
  'referral',

  '51a',
  'DCF',
  'judge',
  'court',
  'police',

  'kill',
  'dying',
  'dead',
  'death',

  'behavior',
  'conduct',
  'security',
  'restraint',
  'erratic',
  'manic',
  'defiant',
  'vandal',
  'pregnant',
  'trauma',
  'emergency',
  'aggression',
  'yelling',
  'disruptive',
  'defiant',

  'depressed',
  'depression',
  'anxiety',
  'suicide',
  'bullying',
  'safety plan',

  'ambulance',
  'hospital',
  'nurse',
  'medical',
  'medication',
  'health',

  'counseling',
  'counselor',
  'redirect',
  'sst',
  'riverside',

  'absence',
  'attendance',
  'tardy',
  'tardies',
  'attendance letter',
  'attendance officer',
  'attendance contract',

  'mtts',
  'comprehension',
  'decoding',
  'fluency',
  'wilson'
];

export function tags(text) {
  return ORDERED_TAGS.filter(tag => {
    return (text.match(new RegExp('\\b' + tag + '\\b', 'g')) !== null);
  });
}