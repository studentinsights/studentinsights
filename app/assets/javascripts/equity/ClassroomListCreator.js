import React from 'react';
import _ from 'lodash';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {gradeText} from '../helpers/gradeText';
import MultipleListsCreatorView from './MultipleListsCreatorView';
import SectionHeading from '../components/SectionHeading';
import Bar from '../components/Bar';
import BoxAndWhisker from '../components/BoxAndWhisker';

const styles = {
  root: {
  },
  loader: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  }
};

// For grade-level teaching teams 
export default class ClassroomListCreator extends React.Component {
  constructor(props) {
    super(props);

    this.fetchStudents = this.fetchStudents.bind(this);
    this.renderContent = this.renderContent.bind(this);
  }

  // TODO(KR) this wouldn't work for teacher authorization; this is just placeholder
  // TODO(KR) authorization is tricky since we're not using the same rules here.
  fetchStudents() {
    const {schoolId} = this.props;
    const url = `/schools/${schoolId}/overview_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="ClassroomListCreator" style={styles.root}>
        <GenericLoader
          style={styles.loader}
          promiseFn={this.fetchStudents}
          render={this.renderContent} />
      </div>
    );
  }

  renderContent(json) {
    const {gradeLevelNextYear, educators, classroomsCount} = this.props;
    const {students, school} = json;
    const roomNames = _.range(0, classroomsCount).map(index => {
      return `Room ${String.fromCharCode(65 + index)}`;
    });

    return (
      <MultipleListsCreatorView
        students={students}
        roomNames={roomNames} />
    );
  }
}
ClassroomListCreator.propTypes = {
  schoolId: React.PropTypes.number.isRequired,
  gradeLevelNextYear: React.PropTypes.string.isRequired, 
  educators: React.PropTypes.array.isRequired,
  classroomsCount: React.PropTypes.number.isRequired
};
