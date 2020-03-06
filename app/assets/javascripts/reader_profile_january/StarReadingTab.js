import React from 'react';
import _ from 'lodash';
import {shouldHighlight} from '../helpers/star';
import tabProptypes from './tabPropTypes';
import {Tab, NoInformation} from './Tabs';


export default class StarReadingTab extends React.Component {
  render() {
    const {style, onClick, readerJson} = this.props;
    const starPercentiles = readerJson.reading_chart_data.star_series_reading_percentile || [];
    if (starPercentiles.length === 0) {
      return <NoInformation />;
    }
    
    const mostRecent = _.last(starPercentiles);
    const isOrange = shouldHighlight(mostRecent.percentile_rank);
    return (
      <Tab
        style={style}
        text="STAR Reading"
        orange={isOrange}
        onClick={onClick}
      />
    );
  }
}
StarReadingTab.propTypes = tabProptypes;
