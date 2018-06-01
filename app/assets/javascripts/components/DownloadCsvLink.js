import React from 'react';

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
    const {disabled, filename, csvText, style, children} = this.props;
    return (disabled)
      ? <span
          className="DownloadCsvLink DownloadCsvLink-disabled btn btn-disabled"
          style={style}>{children}</span>
      : <a
          className="DownloadCsvLink btn"
          href={`data:attachment/csv,${encodeURIComponent(csvText)}`}
          onClick={this.onClickDownload.bind(this, csvText, filename)}
          target="_blank"
          download={filename}
          style={style}>{children}</a>;
  }
}
DownloadCsvLink.propTypes = {
  filename: React.PropTypes.string.isRequired,
  csvText: React.PropTypes.string.isRequired,
  children: React.PropTypes.node.isRequired,
  disabled: React.PropTypes.bool,
  style: React.PropTypes.object
};