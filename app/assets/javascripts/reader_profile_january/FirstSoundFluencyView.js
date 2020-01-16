import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import expandedViewPropTypes from './expandedViewPropTypes';
import ExpandedLayout from './ExpandedLayout';
import {adjustedGrade} from '../helpers/gradeText';
import {DIBELS_FSF} from '../reading/thresholds';
import {benchmarkPeriodToMoment} from '../reading/readingData';


export default class FirstSoundFluencyView extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {student, readerJson, instructionalStrategies, onClose} = this.props;
    
     // Most recent data point
    // const benchmarkDataPoints = readerJson.benchmark_data_points.filter(d => d.benchmark_assessment_key === DIBELS_FSF);
    // const dataPoint = _.last(benchmarkDataPoints.map(dataPoint => {
    //   return benchmarkPeriodToMoment(dataPoint.benchmark_period_key, dataPoint.benchmark_school_year);
    // }));

    // // Format
    // const gradeThen = adjustedGrade(dataPoint.benchmark_school_year, student.grade, nowFn());
    // const materialKey = [gradeThen, dataPoint.benchmark_period_key].join('-');
    // const fileKey = URLS[materialKey];
    const fileKey = 'FirstSoundFluency-K.1';

    // Instructional strategies are by category and grade, generically.
    const strategies = matchStrategies(instructionalStrategies, student.grade, 'Phonics Fluency');
    
    return (
      <ExpandedLayout
        titleText="First Sound Fluency"
        studentFirstName={student.first_name}
        materialsEl={<MaterialImage fileKey={fileKey} />}
        strategiesEl={<Strategies strategies={strategies} />}
        dataEl="..."
        onClose={onClose}
      />
    );
  }
}
FirstSoundFluencyView.propTypes = expandedViewPropTypes;
FirstSoundFluencyView.contextTypes = {
  nowFn: PropTypes.func.isRequired
};


const URLS = {
  'KF-fall': 'FirstSoundFluency-K1',
  'KF-winter': 'FirstSoundFluency-K2'
};

/* ------------------------------------------------------ */

// Instructional strategies are by category and grade, generically.
// Also filter ones that don't have text or educator_email.
function matchStrategies(strategies, grade, categoryText) {
  return strategies.filter(strategy => {
    if (strategy.grades.indexOf(grade) === -1) return false;
    if (strategy.category_text.toLowerCase() !== categoryText.toLowerCase()) return false;
    if (strategy.text === '') return false;
    if (strategy.educator_email === '') return false;

    return true;
  });
}


function MaterialImage({fileKey}) {
  // fileKey values are checked into source, but be defensive anyway
  const safeFileKey = fileKey.replace(/[^a-zA-Z0-9\-]/g,'');
  const path = `/assets/reading/${safeFileKey}.jpg`;
  return (
    <img
      className="MaterialImage"
      width="100%"
      style={{border: '1px solid #ccc'}}
      src={path}
    />
  );
}
MaterialImage.propTypes = {
  fileKey: PropTypes.string.isRequired
};

function Strategies({strategies}) {
  return (
    <div className="Strategies">
      <div>
        {strategies.map(strategy => {
          return (
            <a
              key={strategy.text}
              style={styles.strategy}
              href={strategy.url}
              target="_blank"
              rel="noopener noreferrer"
              title={strategy.description}>
              <div style={styles.strategyTitle}>{strategy.text}</div>
              <div>by {strategy.educator_email}</div>
            </a>
          );
        })}
      </div>
      <div style={styles.addSuggestion}>Add suggestion</div>
    </div>
  );
}
Strategies.propTypes = {
  strategies: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    educator_email: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  })).isRequired
};


const styles = {
  strategy: {
    background: '#eee',
    border: '1px solid #ccc',
    display: 'flex',
    flexDirection: 'column',
    height: '4em',
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 10
  },
  strategyTitle: {
    fontWeight: 'bold'
  },
  addSuggestion: {
    color: '#999',
    fontSize: 12,
    margin: 10
  }
};
