import React from 'react';
import ReactDOM from 'react-dom';
import NotesHeatmapPage from './NotesHeatmapPage';

function testProps(props) {
  return {
    heatmapNotes: [
      {"id":1,"recorded_at":"2010-10-13T00:00:00.000Z","student_id":1,"event_note_type_id":300,"grade":"3"},
      {"id":2,"recorded_at":"2010-10-13T00:00:00.000Z","student_id":2,"event_note_type_id":302,"grade":"3"},
      {"id":3,"recorded_at":"2010-12-27T00:00:00.000Z","student_id":1,"event_note_type_id":301,"grade":"3"},
      {"id":4,"recorded_at":"2010-12-23T00:00:00.000Z","student_id":1,"event_note_type_id":300,"grade":"3"}
    ],
    ...props
  };
}

it('renders UI elements', () => {
  const div = document.createElement('div');
  ReactDOM.render(<NotesHeatmapPage {...testProps()} />, div);
  const text = $(div).text();
  expect(text).toContain('Notes over time');
  expect(text).toContain('Legend');
  expect(text).toContain('Year: 2010');
  expect(text).toContain('District');
  expect(text).toContain('SST: 50%');
  expect(text).toContain('MTSS: 25%');
  expect(div.querySelector('.btn').innerHTML).toContain('Show each grade');
  expect(div.querySelectorAll('rect').length).toEqual(365);
  expect(div.querySelectorAll('rect[fill]').length).toEqual(3);
});
