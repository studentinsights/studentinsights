const textMap =  {
  300: 'SST Meeting',
  301: 'MTSS Meeting',
  302: 'Parent conversation',
  304: 'Something else',
  305: '9th Grade Experience',
  306: '10th Grade Experience',
  307: 'High School Transition'
};
export function eventNoteTypeText(eventNoteTypeId) {
  return textMap[eventNoteTypeId] || 'Other';
}

const colorMap =  {
  300: '#31AB39',
  301: '#EB4B26',
  302: '#CDD71A',
  305: '#139DEA',
  306: '#333333'
};
export function eventNoteTypeColor(eventNoteTypeId) {
  return colorMap[eventNoteTypeId] || '#666';
}