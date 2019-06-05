import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import {modalFromRight} from '../components/HelpBubble';
import DownloadCsvLink from '../components/DownloadCsvLink';
import DownloadIcon from '../components/DownloadIcon';


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
          : <DownloadIcon />
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
