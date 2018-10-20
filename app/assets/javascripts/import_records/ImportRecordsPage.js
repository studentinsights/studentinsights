import React from 'react';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import ImportRecordCard from './ImportRecordCard';
import SectionHeading from '../components/SectionHeading';

export default class ImportRecordsPage extends React.Component {

  constructor(props) {
    super(props);

    this.fetchImportRecords = this.fetchImportRecords.bind(this);
    this.renderPage = this.renderPage.bind(this);
  }

  fetchImportRecords() {
    return apiFetchJson('/admin/api/import_records');
  }

  render() {
    return (
      <div className="ImportRecordsPage">
        <GenericLoader
          promiseFn={this.fetchImportRecords}
          render={this.renderPage} />
      </div>
    );
  }

  renderPage(json) {
    return (
      <div style={styles.outerWrapperStyle}>
        <div style={styles.columnStyle}>
          <SectionHeading>Import Records</SectionHeading>
          {this.renderImportRecords(json.import_records)}
        </div>
        <div style={styles.columnStyle}>
          <SectionHeading>Queued Jobs</SectionHeading>
          <div style={styles.divStyle}>No jobs in the queue.</div>
        </div>
      </div>
    );
  }

  renderImportRecords(importRecords) {
    if (importRecords.length === 0) return (
      <div style={styles.divStyle}>No import records.</div>
    );

    return importRecords.map(this.renderRecord, this);
  }

  renderRecord(importRecord) {
    return <ImportRecordCard {...importRecord} key={importRecord.id} />;
  }
}

const styles = {
  divStyle: {
    margin: '15px 0'
  },
  outerWrapperStyle: {
    display: 'flex'
  },
  columnStyle: {
    flex: 1,
    margin: '20px 40px',
    maxWidth: 600,
    overflowX: 'scroll'
  }
};
