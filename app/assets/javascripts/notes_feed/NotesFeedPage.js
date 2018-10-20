import PropTypes from 'prop-types';
import React from 'react';
import NotesList from '../student_profile/NotesList';


export default class NotesFeedPage extends React.Component {
  render() {
    const {currentEducatorId, eventNotes, educatorsIndex, canUserAccessRestrictedNotes} = this.props;
    const feed = {
      event_notes: eventNotes,
      deprecated: {
        interventions: []
      },
      services: {
        active: [],
        discontinued: []
      }
    };

    return (
      <div className="NotesFeedPage" style={styles.root}>
        <div className="header" style={styles.header}>
          <div className="title" style={styles.title}>
            My Notes
          </div>
          <p style={styles.subTitle}> Past {eventNotes.length} notes.</p>
        </div>
        <div className="feed" style={styles.feed}>
          <div className="notes-list">
            <NotesList
              currentEducatorId={currentEducatorId}
              includeStudentPanel={true}
              forceShowingAllNotes={true}
              canUserAccessRestrictedNotes={canUserAccessRestrictedNotes}
              educatorsIndex={educatorsIndex}
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
  }
}
NotesFeedPage.propTypes = {
  currentEducatorId: PropTypes.number.isRequired,
  educatorsIndex: PropTypes.object.isRequired,
  eventNotes: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClickLoadMoreNotes: PropTypes.func.isRequired,
  totalNotesCount: PropTypes.number.isRequired,
  canUserAccessRestrictedNotes: PropTypes.bool.isRequired
};


const styles = {
  root: {
    fontSize: 14
  },
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
