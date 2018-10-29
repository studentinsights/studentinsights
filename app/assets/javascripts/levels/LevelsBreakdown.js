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

// A dialog that shows breakdowns for different levels, triggers, and services
// or supports.
export default class LevelsBreakdown extends React.Component {
  render() {
    const {studentsWithLevels, messageEl, levelsLinksEl} = this.props;
    return (
      <div>
        {messageEl}
        <div style={styles.summaryContainer}>
          <div style={styles.summaryColumn}>
            <h4 style={{marginBottom: 10}}>by levels</h4>
            {this.renderLevelCount(studentsWithLevels, 0)}
            {this.renderLevelCount(studentsWithLevels, 1)}
            {this.renderLevelCount(studentsWithLevels, 2)}
            {this.renderLevelCount(studentsWithLevels, 3)}
            {this.renderLevelCount(studentsWithLevels, 4)}
          </div>
          <div style={styles.summaryColumn}>
            <h4 style={{marginBottom: 10}}>by triggers</h4>
            {this.renderTriggerCount(studentsWithLevels)}
          </div>
          <div style={styles.summaryColumn}>
            <h4 style={{marginBottom: 10}}>by supports</h4>
            {this.renderServiceCount(studentsWithLevels, 'Credit recovery', CREDIT_RECOVERY)}
            {this.renderServiceCount(studentsWithLevels, 'Academic support', ACADEMIC_SUPPORT)}
            {this.renderServiceCount(studentsWithLevels, 'Redirect', REDIRECT)}
            {this.renderServiceCount(studentsWithLevels, 'Study skills', STUDY_SKILLS)}
          </div>
        </div>
        {levelsLinksEl}
      </div>
    );
  }

  renderLevelCount(studentsWithLevels, n) {
    const count = studentsWithLevels.filter(s => s.level.level_number === n).length;
    const percentage = Math.round(100 * count / studentsWithLevels.length);
    return this.renderSummaryBit(`Level ${n}`, count, percentage);
  }

  renderTriggerCount(studentsWithLevels) {
    const triggers = _.uniq(_.flatten(studentsWithLevels.map(s => s.level.triggers)));
    return (
      <div>{triggers.map(trigger => {
        const count = studentsWithLevels.filter(s => s.level.triggers.indexOf(trigger) !== -1).length;
        const percentage = Math.round(100 * count / studentsWithLevels.length);
        return this.renderSummaryBit(trigger, count, percentage);
      })}</div>
    );
  }

  renderServiceCount(studentsWithLevels, text, patterns) {
    const count = studentsWithLevels.filter(s => {
      return firstMatch(s.student_section_assignments_right_now, patterns) !== undefined;
    }).length;
    const percentage = Math.round(100 * count / studentsWithLevels.length);
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
LevelsBreakdown.propTypes = {
  studentsWithLevels: PropTypes.array.isRequired,
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
