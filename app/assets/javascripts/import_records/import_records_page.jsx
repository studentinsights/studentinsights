import React from 'react';
import PropTypes from 'prop-types';
import FlexibleRoster from '../components/flexible_roster.jsx';

function formatDate(item, column) {
  const momentUTC = moment.utc(item[column.key]);

  if (momentUTC.isValid()) {
    return momentUTC.format('HH:mm:ss');
  }
  
  return '';
}

function formatDuration(item, column) {
  const timeEnded = item['time_ended'];

  if(timeEnded){
    const startMomentUTC = moment.utc(item['time_started']);
    const endMomentUTC = moment.utc(item['time_ended']);

    const duration = moment.duration(endMomentUTC.diff(startMomentUTC));

    return duration.asMinutes();
  }

  return '';
}



class ImportRecordsPage extends React.Component {
  render() {
    const importRecords = this.props.importRecords;
    return (
      <div>
        {importRecords.map((record) => this.renderImportRecord(record))}
      </div>
    );
  }

  renderImportRecord(record) {
    const timeStarted = moment.utc(record.time_started);
    const completed = record.time_ended != null;
    let duration;
  
    if(completed) {
      const timeEnded = moment.utc(record.time_ended);
      duration = moment.duration(timeEnded.diff(timeStarted));
    }
    
    const columns = [
      {label: 'Importer', key: 'importer'},
      {label: 'Status', key: 'status'},
      {label: 'Started At', key: 'time_started', cell: formatDate},
      {label: 'Duration (mins)', key: 'time_ended', cell: formatDuration},
      {group: 'Rows', label: 'Processed', key: 'rows_processed'},
      {group: 'Rows', label: 'Excluded', key: 'rows_excluded'},
      {group: 'Rows', label: 'Created', key: 'rows_created'},
      {group: 'Rows', label: 'Updated', key: 'rows_updated'},
      {group: 'Rows', label: 'Deleted', key: 'rows_deleted'},
      {group: 'Rows', label: 'Rejected', key: 'rows_rejected'},
      {label: 'Error Message', key: 'error_message'}
    ];
  
    const options = {
      sortable: false,
    };
      
    return (
      <div key={record.id} style={{border: "1px solid #eee", padding: "15px", margin: "15px"}}>
        <div style={{marginBottom: "15px", borderBottom: "1px solid #eee", fontSize: "18px"}}>
          {timeStarted.format('MM/DD/YYYY h:mm:ss a')}
        </div>
        <div>
          {completed &&
            <div>Completed in {duration.humanize()}</div>
          }
          {!completed &&
            <div>Process did not complete</div>
          }
        </div>
        {record.import_record_details.length > 0 && 
          <div>
            <FlexibleRoster rows={record.import_record_details}
              columns={columns}
              initialSortIndex={0}
              options={options}
            />
          </div>
        }
      </div>
    );
  }
}

ImportRecordsPage.propTypes = {
  importRecords: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      time_started: PropTypes.string.isRequired,
      time_ended: PropTypes.string,
      import_record_details: PropTypes.arrayOf(PropTypes.object),
    }).isRequired
  ),
};

export default ImportRecordsPage;