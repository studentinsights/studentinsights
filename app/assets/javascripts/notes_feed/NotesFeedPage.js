import React from 'react';

class NotesFeedPage extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const NotesList = window.shared.NotesList;
    const feed = {
      event_notes: this.props.eventNotes,
      deprecated: {
        interventions: []
      },
      services: {
        active: [],
        discontinued: []
      }
    };

    return (
      <div className="notes-feed">
        {/* <div className="notes-list" style={{ backgroundColor: 'red'}}> */}
        <div className="notes-list">
          <NotesList
            educatorsIndex={this.props.educatorsIndex}
            eventNoteTypesIndex={this.props.eventNoteTypesIndex}
            feed={feed}
            students={this.props.students} />
        </div>
      </div>
    );
  }
}

NotesFeedPage.propTypes = {
  educatorsIndex: React.PropTypes.object.isRequired,
  eventNotes: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  eventNoteTypesIndex: React.PropTypes.object.isRequired,
  students: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};

export default NotesFeedPage;
