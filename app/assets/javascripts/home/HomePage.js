import PropTypes from 'prop-types';
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
    const {educatorId, educatorLabels} = this.props;
    return (
      <div className="HomePage">
        <div style={styles.columnsContainer}>
          <div style={styles.column}>
            <SectionHeading titleStyle={styles.sectionTitleStyle}>
              <div>What’s happening?</div>
              {this.renderSearch()}
            </SectionHeading>
            <HomeFeed educatorId={educatorId} />
          </div>
          <div style={styles.column}>
            <SectionHeading>How can we adapt?</SectionHeading>
            <HomeInsights educatorId={educatorId} educatorLabels={educatorLabels} />
          </div>
        </div>
      </div>
    );
  }

  renderSearch() {
    const {educatorLabels} = this.props;
    if (educatorLabels.indexOf('enable_searching_notes') === -1) return null;
    return <a href="/search/notes">Search notes</a>;
  }
}
HomePage.propTypes = {
  educatorId: PropTypes.number.isRequired,
  educatorLabels: PropTypes.arrayOf(PropTypes.string).isRequired
};

const styles = {
  columnsContainer: {
    display: 'flex'
  },
  sectionTitleStyle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  column: {
    flex: 1,
    width: 0,
    margin: 10
  }
};

export default HomePage;