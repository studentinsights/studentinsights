import React from 'react';
import SectionHeading from '../components/SectionHeading';
import HomeFeed from './HomeFeed';
import HomeInsights from './HomeInsights';

/*
This is the home page for all user roles, focused on
"What is happening with my students?" and helping focus attention on 
"How can we adapt?"
*/
class HomePage extends React.Component {
  render() {
    return (
      <div className="HomePage">
        <div style={styles.columnsContainer}>
          <div style={styles.column}>
            <SectionHeading>What's happening?</SectionHeading>
            <HomeFeed />
          </div>
          <div  style={styles.column}>
            <SectionHeading>How can we adapt?</SectionHeading>
            <HomeInsights />
          </div>
        </div>
      </div>
    );
  }
}


const styles = {
  columnsContainer: {
    display: 'flex'
  },
  column: {
    flex: 1,
    margin: 10
  }
};

export default HomePage;