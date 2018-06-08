import React from 'react';
import ReactDOM from 'react-dom';
import NotesHeatmap from './NotesHeatmap';

function testProps(props) {
  return {
    heatmapNotes: [
      {"id":1,"recorded_at":"2010-10-13T00:00:00.000Z","event_note_type_id":300,"student": { "id":1, "grade":"3", "school_id": 2 }},
      {"id":2,"recorded_at":"2010-10-13T00:00:00.000Z","event_note_type_id":302,"student": { "id":2, "grade":"3", "school_id": 2 }},
      {"id":3,"recorded_at":"2010-12-27T00:00:00.000Z","event_note_type_id":301,"student": { "id":1, "grade":"3", "school_id": 3 }},
      {"id":4,"recorded_at":"2010-12-23T00:00:00.000Z","event_note_type_id":300,"student": { "id":1, "grade":"3", "school_id": 2 }}
    ],
    schools: [
      {"id": 2, "name": "Parker" }, 
      {"id": 3, "name": "Pulaski" }
    ],
    ...props
  };
}

it('renders UI elements', () => {
  const div = document.createElement('div');
  ReactDOM.render(<NotesHeatmap {...testProps()} />, div);
  const text = $(div).text();
  expect(text).toContain('Notes over time');
  expect(text).toContain('Legend');
  expect(text).toContain('2010 - 2011');
  expect(text).toContain('District');
  expect(text).toContain('SST: 50%');
  expect(text).toContain('MTSS: 25%');
  expect(div.querySelector('.btn').innerHTML).toContain('Show each grade');
  expect(div.querySelectorAll('rect').length).toEqual(364);
  expect(div.querySelectorAll('rect[fill]').length).toEqual(3);
});
