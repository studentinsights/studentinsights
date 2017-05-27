(function(root) {
  window.shared || (window.shared = {});
  const Cookies = window.Cookies;

  window.shared.HomeroomTable = React.createClass({
    displayName: 'HomeroomTable',

    propTypes: {
      showStar: React.PropTypes.bool.isRequired,
      showMcas: React.PropTypes.bool.isRequired,
      rows: React.PropTypes.array.isRequired
    },

    getInitialState () {
      return {
        columnsDisplayed: this.getInitialColumnsDisplayed()
      };
    },

    columnKeysToNames () {
      return {
        'name': 'Name',
        'risk': 'Risk',
        'program': 'Program',
        'sped': 'SPED & Disability',
        'language': 'Language',
        'free-reduced': 'Free/Reduced Lunch',
        'star_math': 'STAR Math',
        'star_reading': 'STAR Reading',
        'mcas_math': 'MCAS Math',
        'mcas_ela': 'MCAS ELA',
      };
    },

    columnKeys () {
      return Object.keys(this.columnKeysToNames());
    },

    getInitialColumnsDisplayed () {
      return (
        Cookies.getJSON("columns_selected") || this.columnKeys()
      );
    },

    activeStudentRowFilter (row) {
      return row.enrollment_status === 'Active';
    },

    activeStudentRows () {
      return this.props.rows.filter(this.activeStudentRowFilter);
    },

    warningBubbleClassName (row) {
      const riskLevel = row['student_risk_level']['level'] || 'na';

      return `warning-bubble risk-${riskLevel} tooltip`;
    },

    render () {
      return (
        <div id="roster-table-wrapper">
          {this.renderColumnPicker()}
          <table id="roster-table" border="0" cellSpacing="0" cellPadding="10" className="sort-default">
            {this.renderHeaders()}
            {this.renderRows()}
          </table>
        </div>
      );
    },

    renderStarHeaders () {
      if (!this.props.showStar) return null;

      return (
      [
        <td colSpan="1" className="star_math">
            <p className="smalltype">
              STAR: Math
            </p>
          </td>,
        <td colSpan="1" className="star_reading">
            <p className="smalltype">
              STAR: Reading
            </p>
          </td>
      ]
      );
    },

    renderStarSubHeaders () {
      if (!this.props.showStar) return null;

      return (
      [
        <th className="star_math">
            <span className="table-header">Percentile</span>
          </th>,
        <th className="star_reading">
            <span className="table-header">Percentile</span>
          </th>
      ]
      );
    },

    renderMcasHeaders () {
      if (!this.props.showMcas) return null;

      return (
      [
        <td colSpan="2" className="mcas_math">
            <p className="smalltype">
              MCAS: Math
            </p>
          </td>,
        <td colSpan="2" className="mcas_ela">
            <p className="smalltype">
              MCAS: ELA
            </p>
          </td>
      ]
      );
    },

    renderMcasSubHeaders () {
      if (!this.props.showMcas) return null;

      return (
      [
        <th className="mcas_math">
            <span className="table-header">Performance</span>
          </th>,
        <th className="mcas_math">
            <span className="table-header">Score</span>
          </th>,
        <th className="mcas_ela">
            <span className="table-header">Performance</span>
          </th>,
        <th className="mcas_ela">
            <span className="table-header">Score</span>
          </th>
      ]
      );
    },

    renderStarData (row) {
      if (!this.props.showStar) return null;

      return (
      [
        <td className="star_math percentile_rank">
            {row['most_recent_star_math_percentile']}
          </td>,
        <td className="star_reading percentile_rank">
            {row['most_recent_star_reading_percentile']}
          </td>
      ]
      );
    },

    renderMcasData (row) {
      if (!this.props.showMcas) return null;

      return (
      [
        <td className="mcas_math performance_level">
            {row['most_recent_mcas_math_performance']}
          </td>,
        <td className="mcas_math">
            {row['most_recent_mcas_math_scaled']}
          </td>,
        <td className="mcas_ela performance_level">
            {row['most_recent_mcas_ela_performance']}
          </td>,
        <td className="mcas_ela">
            {row['most_recent_mcas_ela_scaled']}
          </td>
      ]
      );
    },

    renderSubHeader (columnKey, label) {
      const columnsDisplayed = this.state.columnsDisplayed;

      if (columnsDisplayed.indexOf(columnKey) === -1) return null;

      return (
        <th>
          <span className="table-header">{label}</span>
        </th>
      );
    },

    renderSuperHeader (columnKey, columnSpan, label) {
      const columnsDisplayed = this.state.columnsDisplayed;

      if (columnsDisplayed.indexOf(columnKey) === -1) return null;

      if (!label) return (
        <td colSpan={columnSpan}></td>
      );

      return (
        <td colSpan={columnSpan}>
          <p className="smalltype">
            {label}
          </p>
        </td>
      );
    },

    renderSubHeaders () {
      return (
        <tr className="column-names">
          {/* COLUMN HEADERS */}
          <th className="name">
            <span id="first-column-header" className="table-header">
              Name
            </span>
          </th>
          {this.renderSubHeader('risk', 'Risk')}
          {this.renderSubHeader('program', 'Program Assigned')}
          {this.renderSubHeader('sped', 'Disability')}
          {this.renderSubHeader('sped', 'Level of Need')}
          {this.renderSubHeader('sped', '504 Plan')}
          {this.renderSubHeader('language', 'Fluency')}
          {this.renderSubHeader('language', 'Home Language')}
          {this.renderSubHeader('free-reduced', 'Free/Reduced Lunch')}
          {this.renderStarSubHeaders()}
          {this.renderMcasSubHeaders()}
        </tr>
      );
    },

    renderHeaders () {
      return (
        <thead>
          <tr className="column-groups">
            {/*  TOP-LEVEL COLUMN GROUPS */}
            {this.renderSuperHeader ('name', '1')}
            {this.renderSuperHeader ('risk', '1')}
            {this.renderSuperHeader ('program', '1')}
            {this.renderSuperHeader ('sped', '3', 'SPED & Disability')}
            {this.renderSuperHeader ('language', '2', 'Language')}
            {this.renderSuperHeader ('free-reduced', '1')}
            {this.renderStarHeaders()}
            {this.renderMcasHeaders()}
          </tr>
          {this.renderSubHeaders()}
        </thead>
      );
    },

    renderDataCell (columnKey, data) {
      const columnsDisplayed = this.state.columnsDisplayed;

      if (columnsDisplayed.indexOf(columnKey) === -1) return null;

      return (
        <td>{data}</td>
      );
    },

    renderWarningBubble (row) {
      return (
        <div className={this.warningBubbleClassName(row)}>
          {row['student_risk_level']['level'] || 'N/A'}
          <span className="tooltiptext">
            {row['student_risk_level']['explanation']}
          </span>
        </div>
      );
    },

    renderDataWithSpedTooltip (row) {
      return (
        <div className={row['sped_data']['sped_bubble_class']}>
          {row['sped_data']['sped_level']}
          <span className="tooltiptext">
            {row['sped_data']['sped_tooltip_message']}
          </span>
        </div>
      );
    },

    renderRow (row) {
      return (
        <tr className="student-row" href={`/students/${row["id"]}`}>
          <td className="name">
            {`${row['first_name']} ${row['last_name']}`}
          </td>

          {this.renderDataCell('risk', this.renderWarningBubble(row))}
          {this.renderDataCell('program', row['program_assigned'])}
          {this.renderDataCell('sped', row['disability'])}
          {this.renderDataCell('sped', this.renderDataWithSpedTooltip(row))}
          {this.renderDataCell('sped', row['plan_504'])}
          {this.renderDataCell('language', row['limited_english_proficiency'])}
          {this.renderDataCell('language', row['home_language'])}
          {this.renderDataCell('free-reduced', row['free_reduced_lunch'])}
          {this.renderStarData(row)}
          {this.renderMcasData(row)}
        </tr>
      );
    },

    renderRows () {
      if (!this.props.rows) return null;

      const activeStudentRows = this.activeStudentRows();

      return activeStudentRows.map(this.renderRow);
    },

    renderColumnPicker () {
      return (
        <div>
          <div id="column-picker-toggle">
            <img src="menu.svg" /* TODO: update */ />
          </div>
          <div id="column-picker">
            <p>Select columns</p>
            <form id="column-listing">
              <div id="column-template">
                <input type="checkbox" name="" value="" />
                <label></label>
              </div>
            </form>
          </div>
        </div>
      );
    },

  });
})(window);
