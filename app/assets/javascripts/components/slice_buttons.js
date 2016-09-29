(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var styles = window.shared.styles;
  var colors = window.shared.colors;

  var SliceButtons = window.shared.SliceButtons = React.createClass({
    displayName: 'SliceButtons',

    propTypes: {
      students: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      filters: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      filtersHash: React.PropTypes.object.isRequired,
      activeFiltersIdentifier: React.PropTypes.object.isRequired,
      clearFilters: React.PropTypes.func.isRequired
    },

    // Key code 27 is the ESC key
    onKeyDown: function(e) {
      if (e.keyCode == 27) this.props.clearFilters();
    },

    componentDidMount: function() {
      $(document).on('keydown', this.onKeyDown);
    },

    componentWillUnmount: function() {
      $(document).off('keydown', this.onKeyDown);
    },

    render: function() {
      return dom.div({ className: 'sliceButtons' },
        dom.div({
          style: {
            backgroundColor: 'rgba(49, 119, 201, 0.75)',
            color: 'white',
            display: 'inline-block',
            width: '12em',
            padding: 5
          }
        },
          'Found: ' + this.props.students.length + ' students'
        ),
        dom.a({
          style: {
            marginLeft: 10,
            marginRight: 10,
            fontSize: styles.fontSize,
            display: 'inline-block',
            padding: 5,
            width: '10em',
            backgroundColor: (this.props.filters.length > 0) ? colors.selection : ''
          },
          onClick: this.props.clearFilters
        }, (this.props.filters.length === 0) ? 'No filters' : 'Clear filters (ESC)'),
        dom.a({
          href: this.props.filtersHash,
          target: '_blank', style: {
              fontSize: styles.fontSize
            }
          }, 'Share this view'),
        this.renderDownloadLink()
      );
    },

    renderDownloadLink: function() {
      var students = this.props.students;
      var header = [
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
      var rows = students.map(function(student) {
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
      var csvText = [header].concat(rows).join('\n');
      var dateText = moment.utc().format('YYYY-MM-DD');
      var filtersText = (this.props.activeFiltersIdentifier.length === 0) ? '' : ' (' + this.props.activeFiltersIdentifier + ')';
      var filename = 'Students on ' + dateText + filtersText + '.csv';

      return dom.a({
        href: 'data:attachment/csv,' + encodeURIComponent(csvText),
        target: '_blank',
        download: filename,
        style: {
          paddingLeft: 20,
          fontSize: styles.fontSize
        }
      }, 'Download for Excel');
    }
  });

})();
