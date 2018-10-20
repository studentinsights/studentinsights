import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';


// Resize the fontSize of text to fit within the container bounds.
export default class FitText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSized: false,
      fontSize: props.maxFontSize
    };
  }

  componentDidMount() {
    this.measureAndResize();
  }

  componentDidUpdate(prevProps, prevState) {
    const {maxFontSize} = this.props;
    const havePropsChanged = !_.isEqual(prevProps, this.props);
    if (havePropsChanged) {
      this.setState({isSized: false, fontSize: maxFontSize});
    } else {
      this.measureAndResize();
    }
  }

  measureAndResize() {
    const {isSized, fontSize} = this.state;
    const {minFontSize, fontSizeStep} = this.props;

    // Resize in font size in steps until the element size is less than `targetHeight`
    const elHeight = this.realEl.offsetHeight;
    const targetHeight = this.measureEl.offsetHeight;

    // just became sized, great!  record that and stop the process
    if (!isSized && elHeight <= targetHeight) {
      this.setState({isSized: true});
      return;
    }

    // if we'd go below minFontSize, stop
    if (!isSized && (fontSize - fontSizeStep < minFontSize)) {
      this.setState({isSized: true});
      return;
    }

    // not sized but space to try a smaller font, so try shrinking the font
    if (!isSized && elHeight > targetHeight) {
      this.setState({isSized: false, fontSize: fontSize - fontSizeStep});
      return;
    }
  }


  render() {
    const {text, style} = this.props;
    const {isSized, fontSize} = this.state;
    const opacity = isSized ? 1 : 0;

    // Render an element with the text, and shrink the font size until it fits within the bounds
    // of the container element.
    return (
      <div ref={el => this.measureEl = el} className="FixText" style={{...styles.root, ...style}}>
        <div ref={el => this.realEl = el} style={{...styles.absolute, opacity, fontSize}}>{text}</div>
      </div>
    );
  }
}
FitText.propTypes = {
  text: PropTypes.string.isRequired,
  maxFontSize: PropTypes.number,
  minFontSize: PropTypes.number,
  fontSizeStep: PropTypes.number,
  style: PropTypes.object
};
FitText.defaultProps = {
  maxFontSize: 60,
  minFontSize: 12,
  fontSizeStep: 2,
  style: {}
};

const styles = {
  root: {
    flex: 1,
    position: 'relative'
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  }
};
