import React from 'react';
import PropTypes from 'prop-types';
import SectionHeading from '../components/SectionHeading';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import CourseBreakdownView from './CourseBreakdownView';

export default class CourseBreakdownPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  fetchJson() {
    const {schoolId} = this.props;
    const url = `/api/course_breakdown/${schoolId}/show_json`;
    return apiFetchJson(url).then(json => json);
  }

  render() {
    return (
      <div className="CourseBreakdownPage" style={styles.flexVertical}>
        <div style={{margin: 10}}>
          <SectionHeading titleStyle={styles.title}>
            <div>Course demographic breakdown</div>
          </SectionHeading>
        </div>
        <GenericLoader
          promiseFn={this.fetchJson}
          style={styles.flexVertical}
          render={this.renderJson} />
      </div>
    );
  }

  renderJson(json) {
    const coursesWithBreakdown = json.course_breakdown;
    const studentProportions = json.student_proportions;
    return (
      <CourseBreakdownView
        coursesWithBreakdown={coursesWithBreakdown}
        studentProportions={studentProportions}
      />
    );
  }
}

CourseBreakdownPage.propTypes = {
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