import React from 'react';
import PropTypes from 'prop-types';

// Render a large quote with smaller notes about where it came from
export default class LightInsightQuote extends React.Component {
  render() {
    const {quoteEl, taglineEl, sourceEl} = this.props;

    return (
      <div className="LightInsightQuote" style={styles.flexVertical}>
        <div style={styles.quoteContainer}>
          <div style={styles.quote}>{quoteEl}</div>
        </div>
        <div style={styles.underQuoteContainer}>
          <div>
            <div style={{color: '#333'}}>
              <div>{taglineEl}</div>
              <div>{sourceEl}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
LightInsightQuote.propTypes = {
  quoteEl: PropTypes.node.isRequired,
  taglineEl: PropTypes.node.isRequired,
  sourceEl: PropTypes.node.isRequired
};

const styles = {
  flexVertical: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  quoteContainer: {
    flex: 1,
    display: 'flex',
    margin: 20,
    marginBottom: 0,
    marginTop: 15
  },
  quote: {
    flex: 1,
    fontSize: 18,
    overflow: 'hidden'
  },
  underQuoteContainer: {
    fontSize: 12,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    margin: 20,
    marginTop: 10,
    marginBottom: 15
  },
  link: {
    color: '#ccc',
    cursor: 'pointer'
  }
};
