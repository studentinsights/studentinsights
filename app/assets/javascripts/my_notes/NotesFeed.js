import PropTypes from 'prop-types';
import React from 'react';
import SectionHeading from '../components/SectionHeading';
import NotesList from '../student_profile/NotesList';


export default class NotesFeed extends React.Component {
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
      <div className="NotesFeed" style={styles.root}>
        <SectionHeading>My notes</SectionHeading>
        <div style={styles.subTitle}> Past {eventNotes.length} notes.</div>
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
NotesFeed.propTypes = {
  currentEducatorId: PropTypes.number.isRequired,
  canUserAccessRestrictedNotes: PropTypes.bool.isRequired,
  educatorsIndex: PropTypes.object.isRequired,
  eventNotes: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClickLoadMoreNotes: PropTypes.func.isRequired,
  totalNotesCount: PropTypes.number.isRequired,
};


const styles = {
  root: {
    fontSize: 14,
    margin: 10
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
  subTitle: {
    margin: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#155094'
  },
};
