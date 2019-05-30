import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import FitText from '../components/FitText';


// Render a large quote with smaller notes about where it came from
export default class LightInsightQuote extends React.Component {
  render() {
    const {quoteEl, sourceEl, className, style, containerStyle} = this.props;
    const classNameText = _.compact(['LightInsightQuote', className]).join(' ');
    return (
      <div className={classNameText} style={{...styles.flexVertical, style}}>
        <div style={{...styles.quoteContainer, ...containerStyle}}>
          <div style={styles.quote}>{quoteEl}</div>
        </div>
        <div style={styles.underQuoteContainer}>
          <div style={{color: '#333'}}>{sourceEl}</div>
        </div>
      </div>
    );
  }
}
LightInsightQuote.propTypes = {
  quoteEl: PropTypes.node.isRequired,
  sourceEl: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  containerStyle: PropTypes.object
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
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
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


export const fontSizeStyle = { fontSize: 12 };


// For a prompt, response with resizing font size for the response.
export function Resizing(props) {
  const {promptText, responseText, responseStyle} = props;
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={fontSizeStyle}>{promptText}</div>
      <div style={{
        marginTop: 5,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        ...responseStyle
      }}>
        <FitText
          minFontSize={12}
          maxFontSize={48}
          fontSizeStep={4}
          text={responseText} />
      </div>
    </div>
  );
}
Resizing.propTypes = {
  promptText: PropTypes.string.isRequired, 
  responseText: PropTypes.string.isRequired,
  responseStyle: PropTypes.object
};
Resizing.defaultProps = {
  responseStyle: {}
};