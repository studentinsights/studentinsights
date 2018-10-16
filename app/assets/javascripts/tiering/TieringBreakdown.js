import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  firstMatch,
  CREDIT_RECOVERY,
  ACADEMIC_SUPPORT,
  REDIRECT,
  STUDY_SKILLS
} from './Courses';


export default class TieringBreakdown extends React.Component {
  render() {
    const {studentsWithTiering, messageEl, levelsLinksEl} = this.props;
    return (
      <div>
        {messageEl}
        <div style={styles.summaryContainer}>
          <div style={styles.summaryColumn}>
            <h4 style={{marginBottom: 10}}>by levels</h4>
            {this.renderTierCount(studentsWithTiering, 0)}
            {this.renderTierCount(studentsWithTiering, 1)}
            {this.renderTierCount(studentsWithTiering, 2)}
            {this.renderTierCount(studentsWithTiering, 3)}
            {this.renderTierCount(studentsWithTiering, 4)}
          </div>
          <div style={styles.summaryColumn}>
            <h4 style={{marginBottom: 10}}>by triggers</h4>
            {this.renderTriggerCount(studentsWithTiering)}
          </div>
          <div style={styles.summaryColumn}>
            <h4 style={{marginBottom: 10}}>by supports</h4>
            {this.renderServiceCount(studentsWithTiering, 'Credit recovery', CREDIT_RECOVERY)}
            {this.renderServiceCount(studentsWithTiering, 'Academic support', ACADEMIC_SUPPORT)}
            {this.renderServiceCount(studentsWithTiering, 'Redirect', REDIRECT)}
            {this.renderServiceCount(studentsWithTiering, 'Study skills', STUDY_SKILLS)}
          </div>
        </div>
        {levelsLinksEl}
      </div>
    );
  }

  // Unused, but for internal debugging
  // renderUnlabeledCourses(studentsWithTiering) {
  //   const assignments = _.flatten(studentsWithTiering.map(s => s.student_section_assignments_right_now));
  //   const labeledAssignments = assignments.map(assignment => {
  //     return {
  //       ...assignment,
  //       departmentKey: labelDepartmentKey(assignment)
  //     };
  //   });

  //   const unlabeledCourses = _.uniq(labeledAssignments
  //     .filter(a => a.departmentKey === 'unknown')
  //     .map(a => a.section.course_description));

  //   return <pre>{JSON.stringify(unlabeledCourses(studentsWithTiering), null, 2)}</pre>;
  // }

  renderTierCount(studentsWithTiering, n) {
    const count = studentsWithTiering.filter(s => s.tier.level === n).length;
    const percentage = Math.round(100 * count / studentsWithTiering.length);
    return this.renderSummaryBit(`Level ${n}`, count, percentage);
  }

  renderTriggerCount(studentsWithTiering) {
    const triggers = _.uniq(_.flatten(studentsWithTiering.map(s => s.tier.triggers)));
    return (
      <div>{triggers.map(trigger => {
        const count = studentsWithTiering.filter(s => s.tier.triggers.indexOf(trigger) !== -1).length;
        const percentage = Math.round(100 * count / studentsWithTiering.length);
        return this.renderSummaryBit(trigger, count, percentage);
      })}</div>
    );
  }

  renderServiceCount(studentsWithTiering, text, patterns) {
    const count = studentsWithTiering.filter(s => {
      return firstMatch(s.student_section_assignments_right_now, patterns) !== undefined;
    }).length;
    const percentage = Math.round(100 * count / studentsWithTiering.length);
    return this.renderSummaryBit(text, count, percentage);
  }

  renderSummaryBit(labelText, count, percentage) {
    return (
      <div key={labelText}>
        <div><b>{labelText}</b>:</div>
        <div style={{marginLeft: 10, marginBottom: 5}}>{percentage}% ({count} students)</div>
      </div>
    );
  }
}
TieringBreakdown.propTypes = {
  studentsWithTiering: PropTypes.array.isRequired,
  messageEl: PropTypes.node,
  levelsLinksEl: PropTypes.node
};


const styles = {
  summaryContainer: {
    display: 'flex',
    margin: 10,
    fontSize: 14
  },
  summaryColumn: {
    flex: 1,
    margin: 10
  }
};
