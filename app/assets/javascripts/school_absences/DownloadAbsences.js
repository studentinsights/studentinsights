import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import DownloadCsvLink, {joinCsvRow} from '../components/DownloadCsvLink';
import DownloadIcon from '../components/DownloadIcon';
import {modalFromRight} from '../components/HelpBubble';


export default class DownloadAbsences extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDownloadOpen: false
    };

    this.onDownloadDialogToggled = this.onDownloadDialogToggled.bind(this);
  }

  onDownloadDialogToggled(e) {
    const {isDownloadOpen} = this.state;
    this.setState({isDownloadOpen: !isDownloadOpen});
  }

  render() {
    const {isDownloadOpen} = this.state;
    
    return (
      <div className="DownloadAbsences" onClick={this.onDownloadDialogToggled}>
        {isDownloadOpen
          ? <ReactModal
              isOpen={true}
              onRequestClose={this.onDownloadDialogToggled}
              style={modalFromRight}>
              {this.renderLinkWithCsvDataInline()}
            </ReactModal>
          : <DownloadIcon />
        }
      </div>
    );
  }

  // This is usually expensive to render, since it unrolls the whole spreadsheet into a string
  // and writes it inline to the link.
  renderLinkWithCsvDataInline() {
    const {nowFn} = this.context;
    const {toCsvFn} = this.props;
    const {filename, csvText} = toCsvFn({
      joinCsvRow,
      nowMoment: nowFn()
    });

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
DownloadAbsences.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
DownloadAbsences.propTypes = {
  toCsvFn: PropTypes.func.isRequired
};

const styles = {
  downloadButton: {
    display: 'inline-block',
    marginBottom: 10,
    color: 'white'
  }
};
