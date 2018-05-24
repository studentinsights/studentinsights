import PropTypes from 'prop-types';
import React from 'react';


/*
DEPRECATED
Shows a "card" of an incident that happened with a student.
Note that this might contain sensitive data.
*/
class IncidentCard extends React.Component {
  render() {
    const {incident} = this.props;
    return (
      <div style={styles.box} key={incident.id}>
        <div style={styles.header}>
          <div style={styles.item}>
            <span style={styles.itemHead}>
              {'Date: '}
            </span>
            <span>
              {moment.utc(incident.occurred_at).format('MMM D, YYYY')}
            </span>
          </div>
          <div style={styles.centerItem}>
            <span style={styles.itemHead}>
              {'Code: '}
            </span>
            <span>
              {incident.incident_code}
            </span>
          </div>
          <div style={styles.item}>
            <span style={styles.itemHead}>
              {'Location: '}
            </span>
            <span>
              {incident.incident_location}
            </span>
          </div>
        </div>
        <div>
          <span style={styles.desc}>
            {'Description: '}
          </span>
        </div>
        <div>
          {incident.incident_description}
        </div>
      </div>
    );
  }
}
IncidentCard.propTypes = {
  incident: PropTypes.shape({
    id: PropTypes.number.isRequired,
    incident_code: PropTypes.string.isRequired,
    incident_location: PropTypes.string.isRequired,
    incident_description: PropTypes.string.isRequired
  })
};

const styles = {
  box: {
    border: '1px solid #ccc',
    padding:15,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    backgroundColor: '#f2f2f2'
  },
  item: {
    paddingBottom: 10,
    width: 160
  },
  itemHead: {
    fontWeight: 'bold',
  },
  header: {
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'space-between'
  },
  desc: {
    fontWeight: 'bold',
    paddingTop: 30
  },
  centerItem: {
    paddingBottom: 10,
    textAlign: 'center',
    width: 75
  }
};

export default IncidentCard;