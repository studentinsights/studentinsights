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
    const {educatorId, inExperienceTeam} = this.props;
    return (
      <div className="HomePage">
        <div style={styles.columnsContainer}>
          <div style={styles.column}>
            <SectionHeading>{`What's happening?`}</SectionHeading>
            <HomeFeed educatorId={educatorId} />
          </div>
          <div style={styles.column}>
            <SectionHeading>How can we adapt?</SectionHeading>
            <HomeInsights educatorId={educatorId} inExperienceTeam={inExperienceTeam} />
          </div>
        </div>
      </div>
    );
  }
}
HomePage.propTypes = {
  educatorId: React.PropTypes.number.isRequired,
  inExperienceTeam: React.PropTypes.bool.isRequired
};

const styles = {
  columnsContainer: {
    display: 'flex'
  },
  column: {
    flex: 1,
    width: 0,
    margin: 10
  }
};

export default HomePage;