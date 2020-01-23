import React from 'react';
import PropTypes from 'prop-types';


export default function Strategies({strategies}) {
  return (
    <div className="Strategies" style={styles.root}>
      <div>
        {strategies.map(strategy => {
          return (
            <a
              key={strategy.text}
              style={styles.strategy}
              href={strategy.url}
              target="_blank"
              rel="noopener noreferrer"
              title={strategy.description}>
              <div style={styles.strategyTitle}>{strategy.text}</div>
              <div>by {strategy.educator_email}</div>
            </a>
          );
        })}
      </div>
      <div style={styles.addSuggestion}>Add suggestion</div>
    </div>
  );
}
Strategies.propTypes = {
  strategies: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    educator_email: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  })).isRequired
};


const styles = {
  strategy: {
    background: '#eee',
    border: '1px solid #ccc',
    display: 'flex',
    flexDirection: 'column',
    height: '4em',
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 10
  },
  strategyTitle: {
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  },
  addSuggestion: {
    color: '#999',
    fontSize: 12,
    margin: 10
  }
};
