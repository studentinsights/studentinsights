import React from 'react';
import PropTypes from 'prop-types';
import Card from '../components/Card';
import {toSchoolYear} from '../helpers/schoolYear';

export class TransitionNotesBox extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {style, titleStyle} = this.props;
    const schoolYear = toSchoolYear(nowFn());
    const schoolYearText = `${schoolYear}-${schoolYear+1}`;
    return (
      <div style={style}>
        <div style={titleStyle}>School transitions for {schoolYearText}</div>
        <Card style={{border: 'none'}}>
          <div>Add <a style={{fontWeight: 'bold'}} href="/counselors/transitions">transition notes</a> and introduce your students to the educators working with them next year.</div>
        </Card>
      </div>
    );
  }
}
TransitionNotesBox.contextTypes= {
  nowFn: PropTypes.func.isRequired
};
TransitionNotesBox.propTypes = {
  style: PropTypes.object,
  titleStyle: PropTypes.object
};