import React from 'react';
import PropTypes from 'props-types';
import ReactModal from 'react-modal';
import {modalFromRight} from '../components/HelpBubble';
import DownloadCsvLink from '../components/DownloadCsvLink';


// This tracks the modal state on its own rather than using <HelpBubble /> so that it
// can be lazy about rendering the actual download link (which is expensive) and defer that
// until the user expresses intent to download.  This adds an extra UX step to the download to do that.
export default class LazyExportLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDownloadOpen: false
    };

    this.onDownloadDialogToggled = this.onDownloadDialogToggled.bind(this);
  }

  onDownloadDialogToggled() {
    const {isDownloadOpen} = this.state;
    this.setState({isDownloadOpen: !isDownloadOpen});
  }

  render() {
    const {isDownloadOpen} = this.state;
    return (
      <div onClick={this.onDownloadDialogToggled}>
        {isDownloadOpen
          ? <ReactModal
              isOpen={true}
              onRequestClose={this.onDownloadDialogToggled}
              style={modalFromRight}>
              {this.renderDialog()}
            </ReactModal>
          : <svg style={{fill: "#3177c9", opacity: 0.5, cursor: 'pointer'}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
        }
      </div>
    );
  }

  // This is expensive to render, since it unrolls the whole spreadsheet into a string
  // and writes it inline to the link.
  renderDialog() {
    const {exportCsvFn} = this.props;
    const {csvText, filename} = exportCsvFn();
    return (
      <div style={{fontSize: 14}}>
        <h1 style={{
          borderBottom: '1px solid #333',
          paddingBottom: 10,
          marginBottom: 20
        }}>Export as spreadsheet</h1>
        <DownloadCsvLink filename={filename} style={styles.downloadButton} csvText={csvText}>
          Download CSV
        </DownloadCsvLink>
      </div>
    );
  }
}
LazyExportLink.propTypes = {
  exportCsvFn: PropTypes.func.isRequired
};


const styles = {
  downloadButton: {
    display: 'inline-block',
    marginBottom: 10,
    color: 'white'
  }
};
