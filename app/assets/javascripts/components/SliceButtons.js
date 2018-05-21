import React from 'react';
import {styles, colors} from '../helpers/Theme';
import DownloadCsvLink from '../components/DownloadCsvLink';

// Show the buttons at the bottom of SlicePanels, for
// clearing the selection, downloading the output, etc.
class SliceButtons extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  componentDidMount() {
    $(document).on('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    $(document).off('keydown', this.onKeyDown);
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
          style={{ fontSize: styles.fontSize }}>
          Share this view
        </a>
        {this.renderDownloadLink()}
      </div>
    );
  }

  renderDownloadLink() {
    const {students, activeFiltersIdentifier} = this.props;
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
    const dateText = moment.utc().format('YYYY-MM-DD');
    const filtersText = (activeFiltersIdentifier.length === 0)
      ? ''
      : ' (' + activeFiltersIdentifier + ')';
    const filename = 'Students on ' + dateText + filtersText + '.csv';
    return (
      <DownloadCsvLink
        filename={filename}
        csvText={csvText}
        style={{paddingLeft: 20, fontSize: styles.fontSize}}>
        Download for Excel
      </DownloadCsvLink>
    );
  }
}
SliceButtons.propTypes = {
  students: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  filters: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  filtersHash: React.PropTypes.string.isRequired,
  clearFilters: React.PropTypes.func.isRequired,
  activeFiltersIdentifier: React.PropTypes.string.isRequired
};

export default SliceButtons;
