import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import StudentPhoto from '../components/StudentPhoto';
import FountasAndPinnellLevelChart, {classifyLevel} from './FountasAndPinnellLevelChart';
import {
  render504Chip,
  renderIepChip,
  renderEnglishLearnerChip,
  renderMtss
} from './chips';
import {
  DIBELS_DORF_WPM, 
  DIBELS_DORF_ACC,
  F_AND_P_ENGLISH,
  INSTRUCTIONAL_NEEDS,
  readDoc,
  somervilleDibelsThresholdsFor,
  dibelsColor
} from './readingData';


export default class SidebarDialog extends React.Component {
  render() {
    const {student, doc, grade, benchmarkPeriodKey, onClose} = this.props;
    return (
      <div className="SidebarDialog" style={styles.root}>
        <div>
          <div style={styles.dialogHeading}>
            <StudentPhoto
              style={styles.photo}
              student={student}
              fallbackEl={<span>😃</span>}
            />
            <div style={styles.name}>{student.first_name} {student.last_name}</div>
            <div style={styles.close} onClick={onClose}>X</div>
          </div>
          <div style={styles.row}>
            <div style={styles.heading}>IEP, 504 or ELL plans</div>
            {this.renderChips(student)}
          </div>
          <div style={styles.row}>
            <div style={styles.heading}>Instructional needs</div>
            {renderInstructionalNeeds(readDoc(doc, student.id, INSTRUCTIONAL_NEEDS))}
          </div>
          <div style={styles.row}>
            <div style={styles.heading}>F&P level</div>
            {renderFountassAndPinnell(readDoc(doc, student.id, F_AND_P_ENGLISH))}
          </div>
          <div style={styles.row}>
            <div style={styles.heading}>ORF accuracy</div>
            <div>{renderDibels(benchmarkPeriodKey, grade, doc, student.id, DIBELS_DORF_ACC, '%')}</div>
          </div>
          <div style={styles.row}>
            <div style={styles.heading}>ORF fluency</div>
            <div>{renderDibels(benchmarkPeriodKey, grade, doc, student.id, DIBELS_DORF_WPM, 'wpm')}</div>
          </div>
          <div style={styles.row}>
            <div style={styles.heading}>STAR Reading (percentile)</div>
            {renderLatestStarReading(student)}
          </div>
        </div>
      </div>
    );
  }

  renderChips(student) {
    const {districtKey, nowFn} = this.context;
    const {mtssNotesForStudent} = this.props;
    const chips = [
      renderIepChip(districtKey, student, {style: styles.chip}),
      render504Chip(districtKey, student, {style: styles.chip}),
      renderEnglishLearnerChip(districtKey, student, {style: styles.chip}),
      renderMtss(mtssNotesForStudent, nowFn())
    ];
    if (_.compact(chips).length === 0) return none();
    return (
      <div style={{paddingLeft: 5}}>
        {chips.map((chip, index) => <div key={index}>{chip}</div>)}
      </div>
    );
  }
}
SidebarDialog.contextTypes = {
  districtKey: PropTypes.string.isRequired,
  nowFn: PropTypes.func.isRequired
};
SidebarDialog.propTypes = {
  student: PropTypes.object.isRequired,
  mtssNotesForStudent: PropTypes.arrayOf(PropTypes.shape({
    student_id: PropTypes.number.isRequired,
    id: PropTypes.number.isRequired,
    recorded_at: PropTypes.string.isRequired,
  })).isRequired,
  doc: PropTypes.object.isRequired,
  grade: PropTypes.string.isRequired,
  benchmarkPeriodKey: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

const styles = {
  root: {
    fontSize: 12
  },
  photo: {
    maxWidth: 70,
    maxHeight: 90,
    marginRight: 10
  },
  name: {
    flex: 1,
    paddingRight: 10
  },
  row: {
    marginLeft: 5,
    marginBottom: 15
  },
  dialogHeading: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 16,
    borderBottom: '1px solid #ddd',
    marginBottom: 15
  },
  heading: {
    fontWeight: 'bold',
    marginBottom: 5
  },
  close: {
    padding: 10
  },
  chip: {
    fontSize: 12
  }
};


function renderInstructionalNeeds(instructionalNeedsText) {
  return (
    <span style={{paddingLeft: 5}}>
      {instructionalNeedsText ? `“${instructionalNeedsText}”`: '(none entered)'}
    </span>
  );
}

function coloredBadge(value, color) {
  return (
    <div style={{
      display: 'flex',
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: 14,
      backgroundColor: color
    }}>{value}</div>
  );
}

function renderFountassAndPinnell(maybeLevel) {
  if (!maybeLevel) return none();
  const {color} = classifyLevel(maybeLevel);
  return (
    <div style={{paddingLeft: 5, display: 'flex', flexDirection: 'row'}}>
      <div style={{display: 'inline-block', marginRight: 5}}>
        {coloredBadge(maybeLevel, color)}
      </div>
      <FountasAndPinnellLevelChart
        height={40}
        style={{height: 40}}
        levels={[maybeLevel]}
        isForSingleFixedGradeLevel={true}
      />
    </div>
  );
}

function renderLatestStarReading(student) {
  if (student.star_reading_results.length === 0) return none();

  const latest = _.last(_.sortBy(student.star_reading_results, star => {
    return toMomentFromTimestamp(star.created_at).toDate().getTime();
  }));
  if (!latest.percentile_rank) return none();
  return <div style={{marginLeft: 5}}>{percentileWithSuffix(latest.percentile_rank)}</div>;
}


function percentileWithSuffix(percentile) {
  const lastDigit = _.last(percentile.toString());
  const suffix = {
    1: 'st',
    2: 'nd',
    3: 'rd'
  }[lastDigit] || 'th';
  return `${percentile}${suffix}`;
}


function renderDibels(benchmarkPeriodKey, grade, doc, studentId, benchmarkAssessmentKey, suffixEl) {
  const value = readDoc(doc, studentId, benchmarkAssessmentKey);
  if (!value) return none();

  const thresholds = somervilleDibelsThresholdsFor(benchmarkAssessmentKey, grade, benchmarkPeriodKey);
  const color = dibelsColor(value, thresholds);
  return (
    <div style={{paddingLeft: 5}}>
      <div style={{display: 'inline-block', marginRight: 5}}>
        {coloredBadge(value, color)}
      </div>
      <span>{suffixEl}</span>
    </div>
  );
}


function none() {
  return <span style={{paddingLeft: 5}}>(none)</span>;
}
