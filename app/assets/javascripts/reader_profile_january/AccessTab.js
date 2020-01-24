import React from 'react';
import tabProptypes from './tabPropTypes';
import {readAccessOral} from '../helpers/language';
import {roundedWidaLevel, hasAnyAccessData} from '../helpers/language';
import {NoInformation, Tab} from './Tabs';


export default class AccessTab extends React.Component {
  render() {
    const {onClick, readerJson} = this.props;
    const {access} = readerJson;
    if (!hasAnyAccessData(access)) {
      return <NoInformation />;
    }

    const dataPoint = readAccessOral(access);
    if (dataPoint === null || dataPoint === undefined) {
      return <NoInformation />;
    }

    // Rounding is meaningful educationally; see `roundedWidaLevel` for more
    const performanceLevel = dataPoint && dataPoint.performance_level;
    const roundedScore = roundedWidaLevel(performanceLevel, {shouldRenderFractions: true});
    const orange = (roundedScore < 6);
    return (
      <Tab
        text="ACCESS oral language"
        orange={orange}
        onClick={onClick}
      />
    );
  }
}
AccessTab.propTypes = tabProptypes;
