import React from 'react';
import PropTypes from 'prop-types';
import Card from '../components/Card';
import {toSchoolYear} from '../helpers/schoolYear';

export default class TransitionNotesBox extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {style, titleStyle, educatorLabels} = this.props;
    const showTransitionNotes = (educatorLabels.indexOf('enable_transition_note_features') !== -1);
    if (!showTransitionNotes) return null;

    const schoolYear = toSchoolYear(nowFn());
    return (
      <div style={style}>
        <div style={titleStyle}>School transitions for {schoolYear+1}</div>
        <Card style={{border: 'none'}}>
          <div>Add <a style={{fontWeight: 'bold'}} href="/counselors/transitions">transition notes</a> to introduce your colleagues to the students you worked with this year.</div>
        </Card>
      </div>
    );
  }
}
TransitionNotesBox.contextTypes= {
  nowFn: PropTypes.func.isRequired
};
TransitionNotesBox.propTypes = {
  educatorLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
  style: PropTypes.object,
  titleStyle: PropTypes.object
};