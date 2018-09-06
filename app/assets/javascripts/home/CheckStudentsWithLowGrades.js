import React from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import CheckStudentsWithLowGradesBox from './CheckStudentsWithLowGradesBox';


// On the home page, show users the answers to their most important questions.
// This fetches data about students with low grades.  The copy will change depending
// on the role.
export default class CheckStudentsWithLowGrades extends React.Component {
  constructor(props) {
    super(props);
    this.fetchStudentsWithLowGrades = this.fetchStudentsWithLowGrades.bind(this);
    this.renderStudentsWithLowGrades = this.renderStudentsWithLowGrades.bind(this);
  }

  fetchStudentsWithLowGrades() {
    const {educatorId, limit} = this.props;
    const params = educatorId ? {limit, educator_id: educatorId} : {limit};
    const url = `/api/home/students_with_low_grades_json?${qs.stringify(params)}`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="CheckStudentsWithLowGrades" style={styles.root}>
        <GenericLoader
          style={styles.card}
          promiseFn={this.fetchStudentsWithLowGrades}
          render={this.renderStudentsWithLowGrades} />
      </div>
    );
  }

  renderStudentsWithLowGrades(json) {
    const props = {
      limit: json.limit,
      totalCount: json.total_count,
      studentsWithLowGrades: json.students_with_low_grades
    };
    return <CheckStudentsWithLowGradesBox {...props} />;
  }
}
CheckStudentsWithLowGrades.propTypes = {
  educatorId: PropTypes.number.isRequired,
  limit: PropTypes.number // limit the data returned, not the query itself
};
CheckStudentsWithLowGrades.defaultProps = {
  limit: 100
};

const styles = {
  root: {
    fontSize: 14
  },
  card: {
    margin: 10,
    marginTop: 20,
    border: '1px solid #ccc',
    borderRadius: 3
  }
};
