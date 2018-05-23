import React from 'react';
import Card from '../components/Card';
import {toMomentFromTime} from '../helpers/toMoment';


// Render a card in the feed for an EventNote
class BirthdayCard extends React.Component {
  render() {
    const now = this.context.nowFn();
    const {studentBirthdayCard, style = {}} = this.props;
    const birthdateMoment = toMomentFromTime(studentBirthdayCard.date_of_birth).utc().startOf('day').local();
    const thisYearBirthdateMoment = birthdateMoment.year(now.year());
    console.log('BirthdayCard....');
    console.log(thisYearBirthdateMoment.unix(), now.clone().startOf('day').unix());
    console.log(thisYearBirthdateMoment.format('MM/DD/YY hh:mm:ss.SSSa Z'), now.clone().startOf('day').format('MM/DD/YY hh:mm:ss.SSSa Z'));

    console.log('isBefore', thisYearBirthdateMoment.isBefore(now.clone().startOf('day')));
    console.log('isAfter', thisYearBirthdateMoment.isAfter(now.clone().startOf('day')));
    console.log('isSame', thisYearBirthdateMoment.isSame(now.clone().startOf('day')));
    console.log('diff', thisYearBirthdateMoment.clone().diff(now.clone().startOf('day')));

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
  nowFn: React.PropTypes.func.isRequired
};
BirthdayCard.propTypes = {
  studentBirthdayCard: React.PropTypes.shape({
    id: React.PropTypes.number.isRequired,
    first_name: React.PropTypes.string.isRequired,
    last_name: React.PropTypes.string.isRequired,
    date_of_birth: React.PropTypes.string.isRequired
  }).isRequired,
  style: React.PropTypes.object
};


const styles = {
  person: {
    fontWeight: 'bold'
  }
};

export default BirthdayCard;