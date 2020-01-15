import React from 'react';
import expandedViewPropTypes from './expandedViewPropTypes';
import AccessPanel from '../student_profile/AccessPanel';


export default class AccessView extends React.Component {
  render() {
    const {student, readerJson} = this.props;
    return (
      <AccessPanel
        studentFirstName={student.first_name}
        ellTransitionDate={student.ell_transition_date}
        limitedEnglishProficiency={student.limited_english_proficiency}
        access={readerJson.access}
      />
    );
  }
}
AccessView.propTypes = expandedViewPropTypes;
