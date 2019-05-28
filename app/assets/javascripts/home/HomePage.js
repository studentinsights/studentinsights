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
export default class HomePage extends React.Component {
  render() {
    const {currentEducator} = this.props;
    return (
      <div className="HomePage">
        <div style={styles.columnsContainer}>
          <div style={styles.column}>
            <SectionHeading titleStyle={styles.sectionTitleStyle}>
              <div>What's happening?</div>
              {this.renderSearch()}
            </SectionHeading>
            <HomeFeed educatorId={currentEducator.id} />
          </div>
          <div style={styles.column}>
            <SectionHeading>How can we adapt?</SectionHeading>
            <HomeInsights currentEducator={currentEducator} />
          </div>
        </div>
      </div>
    );
  }

  renderSearch() {
    const {currentEducator} = this.props;
    const {labels} = currentEducator;
    if (labels.indexOf('enable_searching_notes') === -1) return null;
    return <a href="/search/notes">Search notes</a>;
  }
}
HomePage.propTypes = {
  currentEducator: PropTypes.shape({
    id: PropTypes.number.isRequired,
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    can_view_restricted_notes: PropTypes.bool.isRequired
  }).isRequired
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
