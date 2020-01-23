import React from 'react';
import {F_AND_P_ENGLISH} from '../reading/thresholds';
import expandedViewPropTypes from './expandedViewPropTypes';
import {COMPREHENSION, matchStrategies} from './instructionalStrategies';
import {mostRecentDataPoint} from './dibelsParsing';
import ExpandedLayout from './ExpandedLayout';
import MaterialsCarousel from './MaterialsCarousel';
import Strategies from './Strategies';
import GenericDibelsDataPoint from './GenericDibelsDataPoint';


export default class FAndPEnglishView extends React.Component {
  render() {
    const {student, readerJson, instructionalStrategies, onClose} = this.props;
    const dataPoint = mostRecentDataPoint(readerJson, F_AND_P_ENGLISH);
    const fileKeys = []; // TODO(kr)
    const strategies = matchStrategies(instructionalStrategies, student.grade, COMPREHENSION);
    return (
      <ExpandedLayout
        titleText="F&P English"
        studentFirstName={student.first_name}
        materialsEl={<MaterialsCarousel fileKeys={fileKeys} />}
        strategiesEl={<Strategies strategies={strategies} />}
        dataEl={<GenericDibelsDataPoint dataPoint={dataPoint} />}
        onClose={onClose}
      />
    );
  }
}
FAndPEnglishView.propTypes = expandedViewPropTypes;
