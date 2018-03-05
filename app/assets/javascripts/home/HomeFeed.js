import React from 'react';
import Card from '../components/Card';
import Educator from '../components/Educator';
import Homeroom from '../components/Homeroom';
import HouseBadge from '../components/HouseBadge';
import NoteBadge from '../components/NoteBadge';
import {toMomentFromTime} from '../helpers/toMoment';
import {gradeText} from '../helpers/gradeText';
import {eventNoteTypeText} from '../components/eventNoteType';


class HomeFeed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      eventNotes: null
    };
    this.onData = this.onData.bind(this);
    this.onError = this.onError.bind(this);
  }

  componentDidMount() {
    fetch('/home/notes_json', { credentials: 'include' })
      .then(response => response.json())
      .then(this.onData)
      .catch(this.onError);
  }

  onData(json) {
    this.setState({ eventNotes: json.event_notes });
  }

  onError(err) {
    console.error(err); // eslint-disable-line no-console
  }

  render() {
    return (
      <div className="HomeFeed" style={styles.root}>
        {this.renderEventNotes()}
      </div>
    );
  }

  renderEventNotes() {
    const {eventNotes} = this.state;
    if (eventNotes === null) return <div style={styles.card}>Loading...</div>;

    return (
      <div>
        {eventNotes.map(eventNote => {
          return (
            <Card key={eventNote.id} style={styles.card}>
              <div style={styles.header}>
                <div>
                  <div>
                    <a style={styles.person} href={`/students/${eventNote.student.id}`}>{eventNote.student.first_name} {eventNote.student.last_name}</a>
                  </div>
                  <div>{gradeText(eventNote.student.grade)}</div>
                  <div>
                    <Homeroom
                      id={eventNote.student.homeroom.id}
                      name={eventNote.student.homeroom.name}
                      educator={eventNote.student.homeroom.educator} />
                  </div>
                </div>
                <div style={styles.by}>
                  <div>
                    <span>by </span>
                    <Educator
                      style={styles.person}
                      educator={eventNote.educator} />
                  </div>
                  <div>in {eventNoteTypeText(eventNote.event_note_type_id)}</div>
                  <div>{toMomentFromTime(eventNote.updated_at).fromNow()}</div>
                </div>
              </div>
              <div style={styles.body}>
                <div>{eventNote.text}</div>
              </div>
              <div style={styles.footer}>
                {eventNote.student.house && <HouseBadge style={styles.footerBadge} house={eventNote.student.house} />}
                <NoteBadge style={styles.footerBadge} eventNoteTypeId={eventNote.event_note_type_id} />
              </div>
            </Card>
          );
        })}
      </div>
    );
  }
}

const styles = {
  root: {
    fontSize: 14
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  body: {
    marginBottom: 20,
    marginTop: 20
  },
  by: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 5
  },
  footerBadge: {
    marginLeft: 5
  },
  person: {
    fontWeight: 'bold'
  },
  card: {
    margin: 10,
    marginTop: 20
  }
};

export default HomeFeed;