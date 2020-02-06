import PropTypes from 'prop-types';
import React from 'react';
import ReactModal from 'react-modal';
import {styles, colors} from '../helpers/Theme';
import {modalFromRight} from '../components/HelpBubble';
import DownloadIcon from '../components/DownloadIcon';
import DownloadCsvLink from '../components/DownloadCsvLink';

// Show the buttons at the bottom of SlicePanels, for
// clearing the selection, downloading the output, etc.
export default class SliceButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDownloadOpen: false
    };
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onDownloadDialogToggled = this.onDownloadDialogToggled.bind(this);
  }

  UNSAFE_componentWillMount() {
    ReactModal.setAppElement(document.body);
  }

  componentDidMount() {
    $(document).on('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    $(document).off('keydown', this.onKeyDown);
  }

  onDownloadDialogToggled(e) {
    e.preventDefault();
    const {isDownloadOpen} = this.state;
    this.setState({isDownloadOpen: !isDownloadOpen});
  }

  // Key code 27 is the ESC key
  onKeyDown(e) {
    if (e.keyCode == 27) this.props.clearFilters();
  }

  render() {
    return (
      <div className="sliceButtons">
        <div
          style={{ backgroundColor: 'rgba(49, 119, 201, 0.75)', color: 'white', display: 'inline-block', width: '12em', padding: 5 }}>
          {'Found: ' + this.props.students.length + ' students'}
        </div>
        <a
          style={{
            marginLeft: 10,
            marginRight: 10,
            fontSize: styles.fontSize,
            display: 'inline-block',
            padding: 5,
            width: '10em',
            backgroundColor: (this.props.filters.length > 0) ? colors.selection : ''
          }}
          onClick={this.props.clearFilters}>
          {(this.props.filters.length === 0) ? 'No filters' : 'Clear filters (ESC)'}
        </a>
        <a
          href={this.props.filtersHash}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: styles.fontSize,
            marginRight: 20
          }}>
          Link to save these filters
        </a>
        {this.renderLocalDownloadLink()}
      </div>
    );
  }

  // This tracks the modal state on its own rather than using <HelpBubble /> so that it
  // can be lazy about rendering the actual download link (which is expensive) and defer that
  // until the user expresses intent to download.
  // This adds an extra UX step to the download to do that.
  renderLocalDownloadLink() {
    const {isDownloadOpen} = this.state;

    return (
      <span>
        <a
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            marginLeft: 20,
            fontSize: styles.fontSize
          }}
          href="#"
          onClick={this.onDownloadDialogToggled}>
          <span style={{verticalAlign: 'middle'}}>
            Download CSV <DownloadIcon style={{verticalAlign: 'middle'}}/>
          </span>
        </a>
        {isDownloadOpen && (
          <ReactModal
            isOpen={true}
            onRequestClose={this.onDownloadDialogToggled}
            style={modalFromRight}>
            {this.renderLinkWithCsvDataInline()}
          </ReactModal>
        )}
      </span>
    );
  }

  // This is expensive to render, since it unrolls the whole spreadsheet into a string
  // and writes it inline to the link.
  renderLinkWithCsvDataInline() {
    const {nowFn} = this.context;
    const {students, filters} = this.props;
    const isFiltered = (filters.length > 0);
    const {filename, csvText} = filenameAndCsvText(nowFn, students, isFiltered);

    return (
      <div style={{fontSize: 14}}>
        <h1 style={{
          borderBottom: '1px solid #333',
          paddingBottom: 10,
          marginBottom: 20
        }}>Export as CSV</h1>
        {this.renderFilterWarningMessage()}
        <DownloadCsvLink
          filename={filename}
          csvText={csvText}
          style={{
            paddingLeft: 20,
            fontSize: styles.fontSize,
            color: 'white'
          }}>
          Download CSV
        </DownloadCsvLink>
      </div>
    );
  }

  renderFilterWarningMessage() {
    const {students, filters} = this.props;
    const messageStyles = { marginBottom: 20};
    if (filters.length > 0) {
      return (
        <div style={{...messageStyles, fontWeight: 'bold', color: 'darkorange'}}>
          Filters are applied, so this only includes data for {students.length} students.
        </div>
      );
    } else {
      return (
        <div style={messageStyles}>
          This includes data for all {students.length} students.
        </div>
      );
    }
  }
}
SliceButtons.propTypes = {
  students: PropTypes.arrayOf(PropTypes.object).isRequired,
  filters: PropTypes.arrayOf(PropTypes.object).isRequired,
  filtersHash: PropTypes.string.isRequired,
  clearFilters: PropTypes.func.isRequired
};
SliceButtons.contextTypes = {
  nowFn: PropTypes.func.isRequired
};


function filenameAndCsvText(nowFn, students, isFiltered) {
  const header = [
    'First Name',
    'Last Name',
    'Grade',
    'SPED Level of Need',
    'Free/Reduced Lunch',
    'Limited English Proficient',
    'STAR Reading Percentile',
    'MCAS ELA Score',
    'MCAS ELA SGP',
    'STAR Math Percentile',
    'MCAS Math Score',
    'MCAS Math SGP',
    'Discipline Incidents',
    'Absences This Year',
    'Tardies This Year',
    'Active Services',
    'Program Assigned',
    'Homeroom Name',
  ];
  const rows = students.map(student => {
    return [
      student.first_name,
      student.last_name,
      student.grade,
      student.sped_level_of_need,
      student.free_reduced_lunch,
      student.limited_english_proficiency,
      student.most_recent_star_reading_percentile,
      student.most_recent_mcas_ela_scaled,
      student.most_recent_mcas_ela_growth,
      student.most_recent_star_math_percentile,
      student.most_recent_mcas_math_scaled,
      student.most_recent_mcas_math_growth,
      student.discipline_incidents_count,
      student.absences_count,
      student.tardies_count,
      student.active_services.length,
      student.program_assigned,
      student.homeroom_name,
    ].join(',');
  });
  const csvText = [header].concat(rows).join('\n');
  const now = nowFn();
  const filename = `SchoolRoster-${isFiltered ? 'filtered' : 'all'}-${now.format('YYYY-MM-DD')}.csv`;
  return {filename, csvText};
}