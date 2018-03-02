import React from 'react';
import MixpanelUtils from '../helpers/mixpanel_utils.jsx';
import SectionHeading from '../components/SectionHeading';
import HomeFeed from './HomeFeed';
import HomeInsights from './HomeInsights';

class HomePage extends React.Component {
  componentDidMount() {
    const serializedData = $('#serialized-data').data();
    this.setState({serializedData});
    MixpanelUtils.registerUser(serializedData.currentEducator);
    MixpanelUtils.track('PAGE_VISIT', { page_key: 'STUDENT_PROFILE' });
  }

  render() {
    return (
      <div className="HomePage">
        <div style={styles.columnsContainer}>
          <div style={styles.column}>
            <SectionHeading>What's happening?</SectionHeading>
            <HomeFeed />
          </div>
          <div  style={styles.column}>
            <SectionHeading>Have you noticed...</SectionHeading>
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