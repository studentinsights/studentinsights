import React from 'react';
import Card from '../components/Card';
import CheckStudentsWithLowGrades from './CheckStudentsWithLowGrades';


// On the home page, show users the answers to their most
// important questions.
class HomeInsights extends React.Component {
  render() {
    return (
      <div className="HomeInsights" style={styles.root}>
        <CheckStudentsWithLowGrades />
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
  educatorId: React.PropTypes.number.isRequired
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