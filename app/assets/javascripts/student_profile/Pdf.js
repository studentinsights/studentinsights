import React from 'react';
import PropTypes from 'prop-types';
import PDFObject from 'pdfobject';

// Based on https://pdfobject.com/

export default class Pdf extends React.Component {
  render() {
    const {url, style} = this.props;
    const urlWithFragment = `${url}#view=FitBH`;
    return (
      <object
        data={urlWithFragment}
        type='application/pdf' 
        style={style}
        width='100%' 
        height='100%'
      />
    );
  }
}
Pdf.propTypes = {
  url: PropTypes.string.isRequired,
  style: PropTypes.object
};

// For callers to do different layouts
export function canViewPdfInline() {
  return PDFObject.supportsPDFs;
}