import React from 'react';
import qs from 'query-string';
import GenericLoader from '../components/GenericLoader';
import EventNoteCard from './EventNoteCard';
import Card from '../components/Card';
import {toMomentFromTime} from '../helpers/toMoment';


/*
This component fetches data and renders it, showing the user
the feed of what's happening with their students.
*/
class HomeFeed extends React.Component {
  constructor(props) {
    super(props);
    this.fetchFeed = this.fetchFeed.bind(this);
    this.renderFeed = this.renderFeed.bind(this);
  }

  fetchFeed() {
    const limit = 20;
    const url = '/home/feed_json?' + qs.stringify({limit});
    return fetch(url, { credentials: 'include' })
      .then(response => response.json())
      .then(json => json.feed_cards);
  }

  render() {
    return (
      <div className="HomeFeed" style={styles.root}>
        <GenericLoader
          style={styles.card}
          promiseFn={this.fetchFeed}
          render={this.renderFeed} />
      </div>
    );
  }

  renderFeed(feedCards) {
    return feedCards.map(feedCard => {
      const {type, json} = feedCard;
      if (type === 'event_note_card') return this.renderEventNoteCard(json);
      if (type === 'birthday_card') return this.renderBirthdayCard(json);
      console.log('Unexpected card type: ', type); // eslint-disable-line no-console
    });
  }

  renderEventNoteCard(json) {
    return <EventNoteCard
      key={json.id}
      style={styles.card}
      eventNoteCardJson={json} />;
  }

  renderBirthdayCard(json) {
    const student = json;
    const thisYearBirthdateMoment = toMomentFromTime(json.date_of_birth).year(moment.utc().year());
    const isWas = (thisYearBirthdateMoment.isBefore(moment.utc())) ? 'was' : 'is';
    return (
      <Card key={student.id} style={styles.card}>
        🎉<a style={styles.person} href={`/students/${student.id}`}>{student.first_name} {student.last_name}</a>
        <span>'s birthday {isWas} on </span>
        <span>{toMomentFromTime(student.date_of_birth).format('dddd M/D')}!</span>
      </Card>
    );
  }
}

const styles = {
  root: {
    fontSize: 14,
    padding: 10,
    paddingTop: 0
  },
  person: {
    fontWeight: 'bold'
  },
  card: {
    marginTop: 20
  }
};

export default HomeFeed;