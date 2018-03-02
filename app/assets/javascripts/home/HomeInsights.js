import React from 'react';
import Card from '../components/Card';


// On the home page, show users the answers to their most important questions.
class HomeInsights extends React.Component {
  render() {
    return (
      <div className="HomeInsights">
        <Card style={styles.card}><div style={styles.placeholderCard}>...</div></Card>
        <Card style={styles.card}><div style={styles.placeholderCard}>...</div></Card>
        <Card style={styles.card}><div style={styles.placeholderCard}>...</div></Card>
      </div>
    );
  }
}

const styles = {
  card: {
    margin: 10,
    marginTop: 20
  },
  placeholderCard: {
    height: 200
  }
};


export default HomeInsights;