import React from 'react';
import PropTypes from 'prop-types';

// Render a link that will download a CSV string as a file when clicked.
// This relies on the global `btn` CSS style.
export default class DownloadCsvLink extends React.Component {
  // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
  onClickDownload(csvText, filename, e) {
    if (!window.navigator.msSaveOrOpenBlob) return;

    e.preventDefault();
    const csvTextWithWindowsNewlines = csvText.replace(/\n/g, "\r\n");
    const blob = new Blob([csvTextWithWindowsNewlines], {type: 'text/csv;charset=utf-8;'});
    window.navigator.msSaveBlob(blob, filename);
  }

  render() {
    const {disabled, filename, csvText, style, children, disableButtonClass} = this.props;
    return (disabled)
      ? <span
          className={`DownloadCsvLink DownloadCsvLink-disabled ${!disableButtonClass ? 'btn btn-disabled' : ''}`}
          style={style}>{children}</span>
      : <a
          className={`DownloadCsvLink ${!disableButtonClass ? 'btn' : ''}`}
          href={`data:attachment/csv,${encodeURIComponent(csvText)}`}
          onClick={this.onClickDownload.bind(this, csvText, filename)}
          target="_blank"
          download={filename}
          style={style}>{children}</a>;
  }
}
DownloadCsvLink.propTypes = {
  filename: PropTypes.string.isRequired,
  csvText: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  style: PropTypes.object,
  disableButtonClass: PropTypes.bool
};

// Escape quotes as double quotes, and quote every cell
export function joinCsvRow(cells) {
  return '"' + cells.map(cell => cell.replace(/"/g, '""')).join('","') + '"';
}