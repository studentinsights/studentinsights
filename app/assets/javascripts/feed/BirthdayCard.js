import PropTypes from 'prop-types';
import React from 'react';
import Card from '../components/Card';
import {toMomentFromTimestamp} from '../helpers/toMoment';


// Render a card in the feed for an EventNote
class BirthdayCard extends React.Component {
  render() {
    const now = this.context.nowFn();
    const {studentBirthdayCard, style = {}} = this.props;
    const thisYearBirthdateMoment = toMomentFromTimestamp(studentBirthdayCard.date_of_birth).year(now.year());
    const isWas = (thisYearBirthdateMoment.isBefore(now.clone().startOf('day'))) ? 'was' : 'is';
    return (
      <Card key={studentBirthdayCard.id} className="BirthdayCard" style={style}>
        🎉<a style={styles.person} href={`/students/${studentBirthdayCard.id}`}>{studentBirthdayCard.first_name} {studentBirthdayCard.last_name}</a>
        <span>'s birthday {isWas} on </span>
        <span>{thisYearBirthdateMoment.format('dddd M/D')}!</span>
      </Card>
    );
  }
}
BirthdayCard.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
BirthdayCard.propTypes = {
  studentBirthdayCard: PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    date_of_birth: PropTypes.string.isRequired
  }).isRequired,
  style: PropTypes.object
};


const styles = {
  person: {
    fontWeight: 'bold'
  }
};

export default BirthdayCard;