import React from 'react';
import PropTypes from 'prop-types';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import Freshness from './Freshness';
import Tooltip from './Tooltip';
import {Support, noteChipStyle} from './containers';
import {TwoLineChip} from './layout';
import HoverSummary, {secondLineMonthsAgo} from './HoverSummary';

export default class ChipForService extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {service} = this.props;
    const momentStarted = toMomentFromTimestamp(service.date_started);
    const daysAgo = momentStarted ? nowFn().clone().diff(momentStarted, 'days') : null;
    const serviceName = service.service_type.name;

    return (
      <Freshness daysAgo={daysAgo}>
        <Support style={noteChipStyle}>
          <Tooltip tooltipStyle={{minWidth: 400}} title={
            <HoverSummary name={serviceName} atMoment={momentStarted} />
          }>
            <TwoLineChip
              firstLine={serviceName}
              secondLine={secondLineMonthsAgo(daysAgo)}
            />
          </Tooltip>
        </Support>
      </Freshness>
    );
  }
}
ChipForService.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
ChipForService.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.number.isRequired,
    date_started: PropTypes.string.isRequired,
    service_type_id: PropTypes.number.isRequired,
    service_type: PropTypes.shape({
      name: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};