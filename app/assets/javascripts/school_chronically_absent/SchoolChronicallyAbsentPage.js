import React from 'react';
import PropTypes from 'prop-types';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import SchoolChronicallyAbsentView from './SchoolChronicallyAbsentView';
import {
  updateGlobalStylesToTakeFullHeight,
  updateGlobalStylesToRemoveHorizontalScrollbars
} from '../helpers/globalStylingWorkarounds';


// For school or house admin to see students missing school, that the
// school isn't yet providing supports for (eg, SST, reaching out to family.
// etc.).  The intention is to focus attention on individual students and
// taking action, rather than understanding distributions or aggregate
// patterns.
const CHRONICALLY_ABSENT_URL = 'https://docs.google.com/document/d/11tucT1qNN5jOjeNanAFw4TGt2rcLepw3UGt6WbdBUqo';
export default class SchoolChronicallyAbsentPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  componentDidMount() {
    const {disableStylingForTest} = this.props;
    if (disableStylingForTest) return;
    updateGlobalStylesToTakeFullHeight();
    updateGlobalStylesToRemoveHorizontalScrollbars();
  }

  fetchJson() {
    const {schoolIdOrSlug} = this.props;
    const url = `/api/schools/${schoolIdOrSlug}/chronically_absent_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <GenericLoader
        style={{flex: 1, display: 'flex'}}
        loadingEl={
          <div style={{padding: 10}}>
            <div style={{padding: 20, border: '1px solid #eee', backgroundColor: '#f8f8f8'}}>
              <div style={{marginBottom: 20}}>These are three common root causes when students are missing school:</div>
              <div style={{padding: 10}}>
                <div>1. Not <b>able</b> to get to the building</div>
                <div>2. Not feeling <b>welcomed</b> by the school community</div>
                <div>3. Not feeling <b>engaged</b> by the classroom</div>
              </div>
              <div style={{marginTop: 20}}>From <a style={{fontSize: 14}} href={CHRONICALLY_ABSENT_URL} target="_blank" rel="noopener noreferrer">Root Causes for Students Missing School</a>.</div>
            </div>
            <div style={{margin: 20}}>Loading...</div>
          </div>
        }
        promiseFn={this.fetchJson}
        render={this.renderJson} />
    );
  }

  renderJson(json) {
    return (
      <SchoolChronicallyAbsentView
        chronicallyAbsentUrl={CHRONICALLY_ABSENT_URL}
        studentsWithAbsences={json.students_with_events}
        school={json.school}
      />
    );
  }
}

SchoolChronicallyAbsentPage.propTypes = {
  schoolIdOrSlug: PropTypes.string.isRequired,
  disableStylingForTest: PropTypes.bool
};
