import PropTypes from 'prop-types';
import React from 'react';
import Card from '../components/Card';
import {Email} from '../components/PublicLinks';
import CheckStudentsWithLowGrades from './CheckStudentsWithLowGrades';
import CheckStudentsWithHighAbsences from './CheckStudentsWithHighAbsences';
import TransitionNotesBox from './TransitionNotesBox';
import ReadingDataEntryBox from './ReadingDataEntryBox';
import {shouldShowLowGradesBox} from '../helpers/PerDistrict';
import {anyTransitionNotesAllowed} from '../student_profile/SecondTransitionNoteDialog';


// On the home page, show users the answers to their most
// important questions.  Branches depending on role and labels.
export default class HomeInsights extends React.Component {
  render() {
    const {currentEducator} = this.props;
    const {id, labels} = currentEducator;
    const showTransitionNotes = anyTransitionNotesAllowed(currentEducator);
    return (
      <div className="HomeInsights" style={styles.root}>
        {shouldShowLowGradesBox(labels) &&
          <CheckStudentsWithLowGrades educatorId={id} />}
        <CheckStudentsWithHighAbsences educatorId={id} />
        {showTransitionNotes &&
          <TransitionNotesBox educatorId={id} />}
        <ReadingDataEntryBox
          style={styles.card}
          titleStyle={styles.cardTitle}
          educatorLabels={labels} />
        {this.renderPlaceholder()}
      </div>
    );
  }

  renderPlaceholder() {
    return (
      <Card style={styles.card}>
        <div>
          <div>What else would help you support your students?</div>
          <div>Come <Email>talk with us</Email> about what we should build next!</div>
        </div>
      </Card>
    );
  }
}
HomeInsights.propTypes = {
  currentEducator: PropTypes.shape({
    id: PropTypes.number.isRequired,
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    can_view_restricted_notes: PropTypes.bool.isRequired
  }).isRequired
};

const styles = {
  root: {
    fontSize: 14
  },
  card: {
    margin: 10,
    marginTop: 20,
    border: '1px solid #ccc',
    borderRadius: 3
  },
  cardTitle: {
    backgroundColor: '#eee',
    padding: 10,
    color: 'black',
    borderBottom: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'space-between'
  }
};
