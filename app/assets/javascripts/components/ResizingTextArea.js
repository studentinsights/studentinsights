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
  // with these test cases below.  See also the story.
  //
  // Cases:
  // - on load, resizes to show all text
  // - on wrap or enter, expands height without jumping focus or scroll
  // - on remove lines, contracts height
  // - no unexpected losing focus or jumping scroll when expanding/contracting
  // - works when trailing newline
  // - across browsers to IE11
  // 
  // Also:
  // - when testing in the app, the behavior is different based on some
  //   other state I can't track down (window scroll history?).  this
  //   means you can experience  different behavior when editing an existing
  //   note, creating one from new and then editing, etc.
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
    // if (this.el.textContent.slice(-1) === '\n') {
    // this.el.textContent = this.el.textContent + '\n';
    // }
    this.span.textContent = this.el.textContent + '\n#';

    // debugging
    // debugLog('>> resize', this.el.style.height, '.', this.el.offsetHeight, this.el.scrollHeight, '|', this.span.style.height, '.', this.span.offsetHeight, this.span.scrollHeight);

    // simple, just set `height` if it's not big enough
    const needsToExpand = (this.el.offsetHeight < this.span.scrollHeight);
    if (needsToExpand) {
      // debugLog('  expand!', this.span.scrollHeight);
      // debugLog('this.el.scrollTop', this.el.scrollTop);
      this.el.style.height = this.span.scrollHeight + 'px';
      return;
    }

    // needs span to measure once `height` is set the first time
    const needsToContract = (this.el.scrollHeight > this.span.scrollHeight);
    if (needsToContract) {
      // debugLog('  contract!', this.span.scrollHeight);
      // debugLog('this.el.scrollTop', this.el.scrollTop);
      this.el.style.height = this.span.scrollHeight + 'px';
      return;
    }
  }

  render() {
    const {style = {}, containerStyle = {}} = this.props;
    return (
      <div
        className="ResizingTextArea"
        style={{...containerStyle, position: 'relative'}}>
        <span
          ref={el => this.span = el}
          style={{
            ...style, // eg, margins
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
          className="ResizingTextArea-textarea"
          ref={el => this.el = el}
          {...this.props}
          // to debug visually, do something like this:
          // style={{...style, outline: '1px solid blue'}}
        />
      </div>
    );
  }
}
ResizingTextArea.propTypes = {
  value: PropTypes.string,
  style: PropTypes.object,
  containerStyle: PropTypes.object
};


// For working around when in IE11 in a VM, when using the console
// or debugger tools can be prohibitively slow.
// function debugLog(...debugMsgs) {
//   let containerEl = document.querySelector('.ResizingTextArea-debug');
//   if (!containerEl) {
//     containerEl = document.createElement('div');
//     containerEl.classList.add('ResizingTextArea-debug');
//     containerEl.style['z-index'] = 999;
//     containerEl.style['position'] = 'fixed';
//     containerEl.style['top'] = '50px';
//     containerEl.style['right'] = '10px';
//     containerEl.style['bottom'] = '50px';
//     containerEl.style['width'] = '400px';
//     containerEl.style['background'] = 'white';
//     containerEl.style['overflow-y'] = 'scroll';
//     containerEl.style['border'] = '1px solid black';
//     containerEl.style['padding'] = '10px';
//     document.body.appendChild(containerEl);
//   }
//   const debugEl = document.createElement('pre');
//   debugEl.textContent = debugMsgs.join('  ');
//   debugEl.style['border-top'] = '1px solid #ccc';
//   debugEl.style['margin-top'] = '10px';
//   containerEl.insertBefore(debugEl, containerEl.children[0]);
//   console.log(...debugMsgs);
// }