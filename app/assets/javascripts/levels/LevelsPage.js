import React from 'react';
import PropTypes from 'prop-types';
import SectionHeading from '../components/SectionHeading';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {
  updateGlobalStylesToTakeFullHeight,
  updateGlobalStylesToRemoveHorizontalScrollbars
} from '../helpers/globalStylingWorkarounds';
import LevelsView from './LevelsView';


// Page for looking at HS support levels (Somerville only)
export const SYSTEMS_AND_SUPPORTS_URL = 'https://docs.google.com/document/d/10Rm-FMeQsj_ArxqVWefa6bz8-cs2zsCEubaP3iR24KA/edit';
export const SOURCE_CODE_URL = 'https://github.com/studentinsights/studentinsights/blob/master/app/lib/somerville_high_levels_definitions.rb';
export default class LevelsPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  componentDidMount() {
    updateGlobalStylesToRemoveHorizontalScrollbars();
    updateGlobalStylesToTakeFullHeight();
  }

  fetchJson() {
    const {schoolId} = this.props;
    const url = `/api/levels/${schoolId}/show_json`;
    return apiFetchJson(url).then(json => json.students_with_levels);
  }

  render() {
    return (
      <div className="LevelsPage" style={styles.flexVertical}>
        <div style={{margin: 10}}>
          <SectionHeading titleStyle={styles.title}>
            <div>Levels for SHS Systems and Supports</div>
            <div style={styles.headerLinkContainer}>
              <a style={styles.headerLink} href={SYSTEMS_AND_SUPPORTS_URL} target="_blank">SHS Systems and Supports doc</a>
              <a style={styles.headerLink} href={SOURCE_CODE_URL} target="_blank">Source code</a>
            </div>
          </SectionHeading>
        </div>
        <GenericLoader
          promiseFn={this.fetchJson}
          style={styles.flexVertical}
          render={this.renderJson} />
      </div>
    );
  }

  renderJson(studentsWithLevels) {
    return (
      <LevelsView
        systemsAndSupportsUrl={SYSTEMS_AND_SUPPORTS_URL}
        sourceCodeUrl={SOURCE_CODE_URL}
        studentsWithLevels={studentsWithLevels}
      />
    );
  }
}
LevelsPage.propTypes = {
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