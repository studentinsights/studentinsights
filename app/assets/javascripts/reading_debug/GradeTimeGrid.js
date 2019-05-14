import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {gradeText} from '../helpers/gradeText';

// Render a grid of grade by time, with selection.
export default class GradeTimeGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selection: null
    };
  }

  render() {
    const {isFlipped} = this.props;
    return (isFlipped) 
      ? this.renderFlipped()
      : this.renderNormal();
  }
  
  renderNormal() {
    const {selection, grades, intervals, onSelectionChanged, renderCellFn} = this.props;

    return (
      <div>
        <table style={{width: '100%'}}>
          <thead>
            <tr>
              <th>Grade</th>
              {intervals.map(interval => {
                const [year, period] = interval;
                return (
                  <th key={interval.join('-')}>
                    <div>{year}</div>
                    <div>{period}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {grades.map(grade => (  
              <tr key={grade}>
                <td>{gradeText(grade)}</td>
                {intervals.map(interval => {
                  const [year, period] = interval;
                  return (
                    <td
                      key={interval.join('-')}>
                      <div 
                        style={_.isEqual(selection, {year, period, grade})
                          ? {cursor: 'pointer', padding: 10, border: `2px solid ${selection}`}
                          : {cursor: 'pointer', padding: 10, border: `2px solid white`}
                        }
                        onClick={() => onSelectionChanged({year, period, grade})}>
                        {renderCellFn({year, period, grade})}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  renderFlipped() {
    const {selection, grades, intervals, onSelectionChanged, renderCellFn} = this.props;
    
    return (
      <div>
        <table style={{width: '100%'}}>
          <thead>
            <tr>
              <th>Time period</th>
              {grades.map(grade => (
                <th key={grade}>
                  <td>{gradeText(grade)}</td>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {intervals.map(interval => {
              const [year, period] = interval;
              return (
                <tr key={interval.join('-')}>
                  <td><div>{year} {period}</div></td>
                  {grades.map(grade => {
                    return (
                      <td
                        key={grade}>
                        <div 
                          style={_.isEqual(selection, {year, period, grade})
                            ? {cursor: 'pointer', padding: 10, border: `2px solid ${selection}`}
                            : {cursor: 'pointer', padding: 10, border: `2px solid white`}
                          }
                          onClick={() => onSelectionChanged({year, period, grade})}>
                          {renderCellFn({year, period, grade})}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}
GradeTimeGrid.propTypes = {
  grades: PropTypes.arrayOf(PropTypes.string).isRequired,
  intervals: PropTypes.array.isRequired,
  renderCellFn: PropTypes.func.isRequired,
  selection: PropTypes.object,
  onSelectionChanged: PropTypes.func.isRequired,
  isFlipped: PropTypes.bool
};
