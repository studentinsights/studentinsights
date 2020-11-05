import React from 'react';
import PropTypes from 'prop-types';
import SectionHeading from '../components/SectionHeading';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import ConnectionsView from './ConnectionsView';
import ExperimentalBanner from '../components/ExperimentalBanner';


// Page for looking at students who indicated they had no adult they felt
// comfortable approaching with a problem in the Fall 2020 student voice survey

export default class ConnectionsPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  componentDidMount() {
    updateGlobalStylesToTakeFullHeight();
  }

  fetchJson() {
    const {schoolId} = this.props;
    const url = `/api/connections/${schoolId}/show_json`;
    return apiFetchJson(url).then(json => json.students_with_2020_survey_data);
  }

  render() {
    return (
      <div className="ConnectionsPage" style={styles.flexVertical}>
        <div style={{margin: 10}}>
          <SectionHeading titleStyle={styles.title}>
            <div>Students who need adults to connect to in SHS</div>
          </SectionHeading>
        </div>
        <ExperimentalBanner />
        <GenericLoader
          promiseFn={this.fetchJson}
          style={styles.flexVertical}
          render={this.renderJson} />
      </div>
    );
  }

  renderJson(studentsWith2020Surveys) {
    return (
      <ConnectionsView
        studentsWith2020Surveys={studentsWith2020Surveys}
      />
    );
  }
}
ConnectionsPage.propTypes = {
  schoolId: PropTypes.string.isRequired
};


const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  title: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLinkContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  headerLink: {
    fontSize: 12
  }
};