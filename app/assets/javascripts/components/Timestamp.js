import PropTypes from 'prop-types';
import React from 'react';
import {toMomentFromTimestamp} from '../helpers/toMoment';


// Render a timestamp with "from" and short date
export default class Timestamp extends React.Component {
  render() {
    const {nowFn} = this.context;
    const now = nowFn();
    const {railsTimestamp, shouldIncludeTime, style} = this.props;
    const momentTimestamp = toMomentFromTimestamp(railsTimestamp);

    return (
      <div className="Timestamp" style={style || {}}>
        {momentTimestamp.from(now)} on {momentTimestamp.format('M/D')}
        {shouldIncludeTime && `, ${momentTimestamp.format('h:mma')}`}
      </div>
    );
  }
}
Timestamp.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
Timestamp.propTypes = {
  railsTimestamp: PropTypes.string.isRequired,
  shouldIncludeTime: PropTypes.bool,
  style: PropTypes.object
};
