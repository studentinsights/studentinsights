import PropTypes from 'prop-types';
import React from 'react';
import NotesList from '../student_profile/NotesList';


const styles = {
  button: {
    marginTop: '10px',
    display: 'inline'
  },
  feed: {
    margin: 'auto 10%'
  },
  footer: {
    margin: '5% 41%'
  },
  header: {
    margin: '2.5% 5%'
  },
  subTitle: {
    fontSize: '18px',
    marginTop: '5px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#155094'
  },
};

class NotesFeedPage extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
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
        <div className="header" style={styles.header}>
          <div className="title" style={styles.title}>
            My Notes
          </div>
          <p style={styles.subTitle}> Past {this.props.eventNotes.length} notes.</p>
        </div>
        <div className="feed" style={styles.feed}>
          <div className="notes-list">
            <NotesList
              educatorsIndex={this.props.educatorsIndex}
              eventNoteTypesIndex={this.props.eventNoteTypesIndex}
              feed={feed} />
          </div>
        </div>
          {this.renderFooter()}
      </div>
    );
  }

  renderFooter() {
    if (this.props.eventNotes.length != this.props.totalNotesCount) {
      return (
        <div className="footer" style={styles.footer}>
          <button
            className="btn load-more-notes"
            style={styles.button}
            onClick={this.props.onClickLoadMoreNotes}>
            Load 30 More Notes
          </button>
        </div>
      );
    }
    else {
      return (
        <div className="footer" style={styles.footer}>
          <p>You have no more notes to display.</p>
        </div>
      );
    }
  }
}


NotesFeedPage.propTypes = {
  educatorsIndex: PropTypes.object.isRequired,
  eventNotes: PropTypes.arrayOf(PropTypes.object).isRequired,
  eventNoteTypesIndex: PropTypes.object.isRequired,
  onClickLoadMoreNotes: PropTypes.func.isRequired,
  totalNotesCount: PropTypes.number.isRequired
};

export default NotesFeedPage;
