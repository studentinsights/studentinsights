import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import SectionHeading from '../components/SectionHeading';
import BoxCard from '../components/BoxCard';
import WordCloud from '../components/WordCloud';
import NotesList from '../student_profile/NotesList'; // refactor to feed


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
        <div style={styles.subTitle}>Showing {eventNotes.length} notes</div>
        <div className="feed" style={styles.feed}>
          <div style={styles.leftColumn} className="notes-list">
            <NotesList
              currentEducatorId={currentEducatorId}
              includeStudentPanel={true}
              forceShowingAllNotes={true}
              canUserAccessRestrictedNotes={canUserAccessRestrictedNotes}
              educatorsIndex={educatorsIndex}
              feed={feed} />
          </div>
          <div style={styles.rightColumn}>
            {this.renderSidebar()}
          </div>
        </div>
          {this.renderFooter()}
      </div>
    );
  }

  renderSidebar() {
    const {showWordCloud, eventNotes} = this.props;
    if (!showWordCloud && window.location.search.indexOf('wordcloud') === -1) return null;
    
    const words = wordsFromEventNotes(eventNotes);
    return (
      <div style={styles.flexVertical}>
        <BoxCard title="Most common words" style={{marginTop: 10}}>
          <WordCloud
            width={400}
            height={400}
            words={words}
          />
        </BoxCard>
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
  showWordCloud: PropTypes.bool
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
    display: 'flex',
    flexDirection: 'row',
    margin: 10
  },
  leftColumn: {
    flex: 1
  },
  rightColumn: {
    paddingLeft: 20,
    flex: 1
  },
  footer: {
    margin: '5% 41%'
  },
  subTitle: {
    margin: 10,
    marginTop: 20,
    color: '#aaa'
  }
};


// Quick and dirty grabbing the list of words
function wordsFromEventNotes(eventNotes) {
  return _.flatMap(eventNotes, eventNote => {
    return eventNote.text.split(' ');
  });
}
