import React from 'react';
import Card from '../components/Card';
import CheckStudentsWithLowGrades from './CheckStudentsWithLowGrades';
import CheckStudentsWithHighAbsences from './CheckStudentsWithHighAbsences';


// On the home page, show users the answers to their most
// important questions.
class HomeInsights extends React.Component {
  render() {
    const {educatorId, inExperienceTeam} = this.props;
    return (
      <div className="HomeInsights" style={styles.root}>
        {inExperienceTeam && <CheckStudentsWithLowGrades educatorId={educatorId} />}
        <CheckStudentsWithHighAbsences educatorId={educatorId} />
        {this.renderPlaceholder()}
      </div>
    );
  }

  renderPlaceholder() {
    return (
      <Card style={styles.card}>
        <div>
          <div>What else would help you support your students?</div>
          <div>Come talk with us about what we should build next!</div>
        </div>
      </Card>
    );
  }
}
HomeInsights.propTypes = {
  educatorId: React.PropTypes.number.isRequired,
  inExperienceTeam: React.PropTypes.bool.isRequired
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
  }
};


export default HomeInsights;