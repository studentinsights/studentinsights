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
      <div className="wrapper">
        <div className="notes-feed-header" style={{ margin: "2.5% 5%"}}>
          <div className="page-title" style={{ fontSize: "28px", fontWeight: "bold", color: "#155094"}}>
            My Notes
          </div>
          <p style={{ fontSize: "18px", marginTop: "5px"}}> Notes you created in the past 30 days. </p>
        </div>
        <div className="notes-feed" style={{ margin: 'auto 10%'}}>
          <div className="notes-list">
            <NotesList
              educatorsIndex={this.props.educatorsIndex}
              eventNoteTypesIndex={this.props.eventNoteTypesIndex}
              feed={feed} />
          </div>
        </div>
      </div>
    );
  }
}

NotesFeedPage.propTypes = {
  educatorsIndex: React.PropTypes.object.isRequired,
  eventNotes: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  eventNoteTypesIndex: React.PropTypes.object.isRequired,
};

export default NotesFeedPage;
