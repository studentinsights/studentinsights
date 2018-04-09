import React from 'react';
import PropTypes from 'prop-types';

export default class QueuedJobCard extends React.Component {

  render() {
    const {
      id,
      run_at,
      locked_at,
      failed_at,
      attempts,
      last_error,
    } = this.props;
    const divStyle = {border: '1px solid #eee', padding: 15, margin: '15px 0'};
    const cardTitleStyle = {marginBottom: 15, borderBottom: '1px solid #eee', fontSize: 18};

    return (
      <div style={divStyle}>
        <div style={cardTitleStyle}>Queued Job #{id}</div>
        <div>Run at: {run_at}</div>
        <div>Locked at: {locked_at}</div>
        <div>Failed at: {failed_at}</div>
        <div>Attempts: {attempts}</div>
        <div>Last error: {last_error}</div>
      </div>
    );
  }

}

QueuedJobCard.propTypes = {
  id: PropTypes.number.isRequired,
  run_at: PropTypes.string,
  locked_at: PropTypes.string,
  failed_at: PropTypes.string,
  attempts: PropTypes.number.isRequired,
  last_error: PropTypes.string,
};
