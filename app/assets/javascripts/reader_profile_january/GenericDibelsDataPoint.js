import React from 'react';
import PropTypes from 'prop-types';
import {gradeText} from '../helpers/gradeText';


export default class GenericDibelsDataPoint extends React.Component {
  render() {
    const {dataPoint, gradeThen} = this.props;
    return (
      <div>
        <div>
          <b style={{paddingRight: 5}}>{dataPoint.json.value}</b>
          <span>in {dataPoint.benchmark_period_key} of {gradeText(gradeThen)}</span>
        </div>
      </div>
    );
  }
}
GenericDibelsDataPoint.propTypes = {
  dataPoint: PropTypes.object.isRequired,
  gradeThen: PropTypes.string.isRequired
};
