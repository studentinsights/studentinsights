import React from 'react';
import PropTypes from 'prop-types';
import SectionHeading from '../components/SectionHeading';
import ExperimentalBanner from '../components/ExperimentalBanner';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {
  updateGlobalStylesToTakeFullHeight,
  updateGlobalStylesToRemoveHorizontalScrollbars
} from '../helpers/globalStylingWorkarounds';
import TieringView from './TieringView';


// Experimental page for looking at HS support tiers (Somerville only)
export const SYSTEMS_AND_SUPPORTS_URL = 'https://docs.google.com/document/d/10Rm-FMeQsj_ArxqVWefa6bz8-cs2zsCEubaP3iR24KA/edit';
export default class TieringPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchTiering = this.fetchTiering.bind(this);
    this.renderTiering = this.renderTiering.bind(this);
  }

  componentDidMount() {
    updateGlobalStylesToRemoveHorizontalScrollbars();
    updateGlobalStylesToTakeFullHeight();
  }

  fetchTiering() {
    const {schoolId} = this.props;
    const url = `/api/tiering/${schoolId}/show_json`;
    return apiFetchJson(url).then(json => json.students_with_tiering);
  }

  render() {
    return (
      <div className="TieringPage" style={styles.flexVertical}>
        <ExperimentalBanner />
        <div style={{margin: 10}}>
          <SectionHeading titleStyle={styles.title}>
            <div>HS Levels: v1 prototype</div>
            <a style={{fontSize: 12}} href={SYSTEMS_AND_SUPPORTS_URL} target="_blank">Open SHS Systems and Supports doc</a>
          </SectionHeading>
        </div>
        <GenericLoader
          promiseFn={this.fetchTiering}
          style={styles.flexVertical}
          render={this.renderTiering} />
      </div>
    );
  }

  renderTiering(studentsWithTiering) {
    return (
      <TieringView
        systemsAndSupportsUrl={SYSTEMS_AND_SUPPORTS_URL}
        studentsWithTiering={studentsWithTiering}
      />
    );
  }
}
TieringPage.propTypes = {
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
  }
};