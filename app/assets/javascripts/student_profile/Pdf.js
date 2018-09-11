import React from 'react';
import PropTypes from 'prop-types';


// View a PDF inline if the browser supports it.  See https://pdfobject.com/
// Unfortunately 
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


export function canViewPdfInline() {
  return true;
}