import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import Freshness from './Freshness';
import {TwoLineChip, Support} from './layout';


export default class ChipForService extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {serviceTypeId, services} = this.props;
    // const mostRecentMoment = _.last(matches.map(match => {
    //   return toMomentFromTimestamp(match.note.recorded_at);
    // }).sort());
    // const daysAgo = (mostRecentMoment)
    //   ? nowFn().clone().diff(mostRecentMoment, 'days')
    //   : null;

    const matches = services.filter(service => service.service_type_id === serviceTypeId);
    if (matches.length === 0) return null;
    console.log('matches', matches);

    const daysAgos = _.compact(matches.map(service => {
      const momentStarted = toMomentFromTimestamp(service.date_started);
      return momentStarted ? nowFn().clone().diff(momentStarted, 'days') : null;
    }));
    const secondLine = daysAgos.map(daysAgo => `${daysAgo} days ago`).join(' and ');
    

    return (
      <Freshness daysAgo={Math.max(...daysAgos)}>
        <Support>
          <TwoLineChip
            key={serviceTypeId}
            firstLine={matches[0].service_type.name}
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
  services: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    date_started: PropTypes.string.isRequired,
    service_type_id: PropTypes.number.isRequired,
    service_type: PropTypes.shape({
      name: PropTypes.string.isRequired
    }).isRequired
  })).isRequired
};