const textMap =  {
  300: 'SST Meeting',
  301: 'MTSS Meeting',
  302: 'Parent conversation',
  304: 'Something else',
  305: '9th Grade Experience',
  306: '10th Grade Experience',
  400: 'BBST Meeting'
};
export function eventNoteTypeText(eventNoteTypeId) {
  return textMap[eventNoteTypeId] || 'Other';
}

const miniTextMap = {
  300: 'SST',
  301: 'MTSS',
  302: 'Parent',
  304: 'Other',
  305: 'NGE',
  306: '10GE',
  400: 'BBST'
};
export function eventNoteTypeTextMini(eventNoteTypeId) {
  return miniTextMap[eventNoteTypeId] || 'Other';
}

const colorMap =  {
  300: '#31AB39',
  301: '#EB4B26',
  302: '#CDD71A',
  305: '#139DEA',
  306: '#333333',
  400: '#31AB39'
};
export function eventNoteTypeColor(eventNoteTypeId) {
  return colorMap[eventNoteTypeId] || '#666';
}