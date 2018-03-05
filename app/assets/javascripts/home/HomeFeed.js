import React from 'react';
import _ from 'lodash';
import GenericLoader from '../components/GenericLoader';
import EventNoteCard from './EventNoteCard';
import Card from '../components/Card';
import {toMomentFromTime} from '../helpers/toMoment';


class HomeFeed extends React.Component {
  constructor(props) {
    super(props);
    this.fetchNotesAndBirthdays = this.fetchNotesAndBirthdays.bind(this);
    this.renderFeed = this.renderFeed.bind(this);
  }

  fetchNotesAndBirthdays() {
    return Promise.all([
      this.fetchNotes(),
      this.fetchStudentBirthdays()
    ]);
  }

  fetchNotes() {
    return fetch('/home/notes_json', { credentials: 'include' })
      .then(response => response.json())
      .then(json => json.event_notes);
  }

  fetchStudentBirthdays() {
    return fetch('/home/birthdays_json', { credentials: 'include' })
      .then(response => response.json())
      .then(json => json.students); 
  }

  render() {
    return (
      <div className="HomeFeed" style={styles.root}>
        <GenericLoader
          style={styles.card}
          promiseFn={this.fetchNotesAndBirthdays}
          render={this.renderFeed} />
      </div>
    );
  }

  renderFeed(promises) {
    const [eventNotes, students] = promises;
    const combined = _.flatten([
      eventNotes.map(json => {
        return {
          time: json.updated_at,
          json,
          type: 'event_note'
        };
      }),
      students.map(json => {
        return {
          time: moment.utc(json.date_of_birth).year(moment.utc().year()).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          json,
          type: 'birthday'
        };
      })
    ]);
    const sorted = _.sortBy(combined, c => new Date(c.time) * -1);

    return sorted.map(({json, time, type}) => {
      if (type === 'event_note') {
        return <EventNoteCard
          key={json.id}
          style={styles.card}
          eventNote={json} />;
      } else if (type === 'birthday') {
        const student = json;
        return (
          <Card key={student.id} style={styles.card}>
            🎉<a style={styles.person} href={`/students/${student.id}`}>{student.first_name} {student.last_name}</a>
            <span>'s birthday is on </span>
            <span>{toMomentFromTime(student.date_of_birth).format('dddd M/D/YY')}!</span>
          </Card>
        );
      }
    });
  }
}

const styles = {
  root: {
    fontSize: 14
  },
  person: {
    fontWeight: 'bold'
  },
  card: {
    marginTop: 20
  }
};

export default HomeFeed;