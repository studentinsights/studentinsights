import React from 'react';
import PropTypes from 'prop-types';


// View a PDF inline if the browser supports it.  See https://pdfobject.com/
export default class Pdf extends React.Component {
  render() {
    const {url, style, fallbackEl} = this.props;
    return (
      <object
        data={url}
        type='application/pdf' 
        style={style}
        width='100%' 
        height='100%'
      >{fallbackEl || null}</object>
    );
  }
}
Pdf.propTypes = {
  url: PropTypes.string.isRequired,
  style: PropTypes.object,
  fallbackEl: PropTypes.node
};

// For callers to do different layouts
export function canViewPdfInline() {
  if (window.PDF_INLINE_VIEWING_DISABLED_IN_TEST) return false;
  return require('pdfobject').supportsPDFs;
}