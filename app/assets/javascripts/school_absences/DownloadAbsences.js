import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import DownloadCsvLink, {joinCsvRow} from '../components/DownloadCsvLink';
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
          : <svg style={{fill: "#3177c9", opacity: 0.5, cursor: 'pointer'}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
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
