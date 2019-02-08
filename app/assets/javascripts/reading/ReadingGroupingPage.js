import React from 'react';
import PropTypes from 'prop-types';
import {
  updateGlobalStylesToTakeFullHeight,
  updateGlobalStylesToRemoveHorizontalScrollbars
} from '../helpers/globalStylingWorkarounds';
import {apiFetchJson} from '../helpers/apiFetchJson';
import GenericLoader from '../components/GenericLoader';
import ReadingGroupingWorkflow from './ReadingGroupingWorkflow';


// Page for a grade-level team to making reading groups (eg, during A&R meeting).
export default class ReadingGroupingPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  componentDidMount() {
    updateGlobalStylesToTakeFullHeight();
    updateGlobalStylesToRemoveHorizontalScrollbars();
  }

  fetchJson() {
    return apiFetchJson('/api/reading/teams_json');
  }

  render() {
    return (
      <div className="ReadingGroupingPage" style={styles.flexVertical}>
        <GenericLoader
          promiseFn={this.fetchJson}
          style={styles.flexVertical}
          render={this.renderJson} />
      </div>
    );
  }

  renderJson(json) {
    const {schoolSlug, grade} = this.props;
    return (
      <ReadingGroupingWorkflow
        teams={{
          schools: json.schools,
          grades: json.grades,
          educators: json.educators,
          benchmarkWindows: json.benchmark_windows
        }}
        defaultSchoolSlug={schoolSlug}
        defaultGrade={grade}
      />
    );
  }
}
ReadingGroupingPage.propTypes ={
  schoolSlug: PropTypes.string,
  grade: PropTypes.string
};


const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  }
};
