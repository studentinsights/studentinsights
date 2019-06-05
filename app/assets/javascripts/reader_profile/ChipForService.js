import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import Freshness from './Freshness';
import {TwoLineChip, Support, noteChipStyle} from './layout';


export default class ChipForService extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {serviceTypeId, matchingServices} = this.props;
    const daysAgos = _.compact(matchingServices.map(service => {
      const momentStarted = toMomentFromTimestamp(service.date_started);
      return momentStarted ? nowFn().clone().diff(momentStarted, 'days') : null;
    }));
    const secondLine = daysAgos.map(daysAgo => `${daysAgo} days ago`).join(' and ');
    
    return (
      <Freshness daysAgo={Math.max(...daysAgos)}>
        <Support style={noteChipStyle}>
          <TwoLineChip
            key={serviceTypeId}
            firstLine={matchingServices[0].service_type.name}
            secondLine={secondLine}
          />
        </Support>
      </Freshness>
    );
  }
}
ChipForService.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
ChipForService.propTypes = {
  serviceTypeId: PropTypes.number.isRequired,
  matchingServices: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    date_started: PropTypes.string.isRequired,
    service_type_id: PropTypes.number.isRequired,
    service_type: PropTypes.shape({
      name: PropTypes.string.isRequired
    }).isRequired
  })).isRequired
};