import React from 'react';

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
      <div style={divStyle} key={id}>
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
