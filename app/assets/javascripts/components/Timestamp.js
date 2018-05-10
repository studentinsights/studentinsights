import React from 'react';
import {toMomentFromTime} from '../helpers/toMoment';


// Render a timestamp with "from" and short date
export default class Timestamp extends React.Component {
  render() {
    const {nowFn} = this.context;
    const now = nowFn();
    const {railsTimestamp, style} = this.props;
    const momentTimestamp = toMomentFromTime(railsTimestamp);

    return (
      <div className="Timestamp" style={style || {}}>
        {momentTimestamp.from(now)} on {momentTimestamp.format('M/D')}
      </div>
    );
  }
}
Timestamp.contextTypes = {
  nowFn: React.PropTypes.func.isRequired
};
Timestamp.propTypes = {
  railsTimestamp: React.PropTypes.string.isRequired,
  style: React.PropTypes.object
};
