import PropTypes from 'prop-types';
import React from 'react';


// For using <textarea /> but resizing the element as the user types
// so it shows all the text.
export default class ResizingTextArea extends React.Component {
  componentDidMount() {
    if (this.el) {
      this.el.style['overflow-y'] = 'hidden';
    }
    this.resize();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.value !== prevProps.value) {
      this.resize();
    }
  }

  // This component is fragile to changes; verify changes across browsers and
  // with these test cases below.
  //
  // Cases:
  // - on load, resizes to show all text
  // - on wrap or enter, expands height without jumping focus or scroll
  // - on remove lines, contracts height
  // - no unexpected losing focus or jumping scroll when expanding/contracting
  // - works when trailing newline
  // - across browsers to IE11
  //
  // More helpful bits in:
  // - https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
  // - https://stackoverflow.com/questions/3341496/how-to-get-the-height-of-the-text-inside-of-a-textarea
  resize() {
    if (!this.el) return;
    if (!this.span) return;

    // There's some unexpected sizing behavior with trailing newlines, where the
    // size of the span does not include the height for the trailing newline.
    // This hacks around, and always appends a character to the hidden span for the
    // purposes of sizing.  This limits the impact to when there is a trailing
    // newline, and the last character is about to wrap.
    this.span.textContent = this.el.textContent + '#';
    console.log('>> resize', this.el.style.height, '.', this.el.offsetHeight, this.el.scrollHeight, '|', this.span.style.height, '.', this.span.offsetHeight, this.span.scrollHeight);

    // simple, just set `height` if it's not big enough
    const needsToExpand = (this.el.offsetHeight < this.el.scrollHeight);
    if (needsToExpand) {
       console.log('  expand!', this.el.scrollHeight);
      this.el.style.height = this.el.scrollHeight + 'px';
      return;
    }

    // needs span to measure once `height` is set the first time
    const needsToContract = (this.el.scrollHeight > this.span.scrollHeight);
    if (needsToContract) {
       console.log('  contract!', this.span.scrollHeight);
      this.el.style.height = this.span.scrollHeight + 'px';
      return;
    }
  }

  render() {
    return (
      <div className="ResizingTextArea" style={{position: 'relative'}}>
        <span
          ref={el => this.span = el}
          style={{
            ...this.props.style, // eg, margins
            pointerEvents: 'none', 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            zIndex: -1,
            opacity: 0,

            // to debug visually, do something like this:
            // zIndex: 1,
            // opacity: 0.5,
            // color: 'red',
            // outline: '1px solid red'
          }} 
        />
        <textarea
          ref={el => this.el = el}
          {...this.props}
          // to debug visually, do something like this:
          // style={{...this.props.style, outline: '1px solid blue'}}
        />
      </div>
    );
  }
}
ResizingTextArea.propTypes = {
  value: PropTypes.string,
  style: PropTypes.object
};