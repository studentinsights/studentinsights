import React from 'react';
import PropTypes from 'prop-types';
import Card from '../components/Card';

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

    return (
      <Card style={styles.cardStyle}>
        <h4 style={styles.cardTitleStyle}>Queued Job #{id}</h4>
        <div>Run at: {run_at}</div>
        <div>Locked at: {locked_at}</div>
        <div>Failed at: {failed_at}</div>
        <div>Attempts: {attempts}</div>
        <div>Last error: {last_error}</div>
      </Card>
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


const styles = {
  cardTitleStyle: {
    marginBottom: 15,
    borderBottom: '1px solid #eee',
    fontSize: 18
  },
  cardStyle: {
    margin: '20px 0'
  }
};
