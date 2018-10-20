import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {rankedByGradeLevel} from '../helpers/SortHelpers';
import {gradeText} from '../helpers/gradeText';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import Educator from '../components/Educator';
import HomeroomTable from './HomeroomTable';
import HomeroomNavigator from './HomeroomNavigator';

/*
Homeroom page, for K8 classroom teachers.  Most meaningful the first week or two of school.
*/
export default class HomeroomPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderHomeroom = this.renderHomeroom.bind(this);
  }

  fetchJson() {
    const {homeroomIdOrSlug} = this.props;
    const url = `/api/homerooms/${homeroomIdOrSlug}/homeroom_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="HomeroomPage" style={{...styles.flexVertical, margin: 10}}>
        <GenericLoader
          promiseFn={this.fetchJson}
          style={styles.flexVertical}
          render={this.renderHomeroom} />
      </div>
    );
  }

  renderHomeroom(json) {
    const {homeroom, rows, homerooms} = json;
    return (
      <HomeroomPageView
        homeroom={homeroom}
        rows={rows}
        homerooms={homerooms}
      />
    );
  }
}
HomeroomPage.propTypes = {
  homeroomIdOrSlug: PropTypes.string.isRequired
};

class HomeroomPageView extends React.Component {
  orderedGradesFromStudentRows() {
    const {rows} = this.props;
    const grades = _.uniq(rows.map(row => row.grade));
    return _.sortBy(grades, rankedByGradeLevel);
  }

  render() {
    const {homeroom, rows, homerooms} = this.props;
    const {name, school, educator} = homeroom;
    const orderedGrades = this.orderedGradesFromStudentRows();
    return (
      <div style={styles.flexVertical}>
        <SectionHeading titleStyle={styles.sectionTitleStyle}>
          <span style={styles.nameAndInfo}>
            <span>Homeroom: {name}</span>
            <span style={styles.homeroomInfo}>
              {orderedGrades.length > 0 && <span>{orderedGrades.map(gradeText).join(' and ')} </span>}
              <span>at {school.name}</span>
              {educator && <span> with <Educator educator={educator} /></span>}
            </span>
          </span>
          <HomeroomNavigator
            style={styles.navigator}
            homerooms={homerooms} />
        </SectionHeading>
        <HomeroomTable
          style={styles.table}
          rows={rows}
          school={school}
        />
      </div>
    );
  }
}
HomeroomPageView.propTypes = {
  homeroom: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    school: PropTypes.object.isRequired,
    educator: PropTypes.object,
  }),
  rows: PropTypes.array.isRequired,
  homerooms: PropTypes.array.isRequired
};

const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  nameAndInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  homeroomInfo: {
    fontSize: 14,
    paddingTop: 5,
    paddingLeft: 1
  },
  sectionTitleStyle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navigator: {
    margin: 10,
    fontSize: 14
  },
  table: {
    paddingTop: 20
  }
};