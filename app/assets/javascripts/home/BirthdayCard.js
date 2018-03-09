import React from 'react';
import Card from '../components/Card';
import {toMomentFromTime} from '../helpers/toMoment';


// Render a card in the feed for an EventNote
class BirthdayCard extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {studentBirthdayCard, style = {}} = this.props;
    const thisYearBirthdateMoment = toMomentFromTime(studentBirthdayCard.date_of_birth).year(moment.utc().year());
    const isWas = (thisYearBirthdateMoment.isSameOrAfter(nowFn())) ? 'is' : 'was';
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