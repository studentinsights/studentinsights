(function(root) {
  window.shared || (window.shared = {});

  window.shared.HomeroomTable = React.createClass({
    displayName: 'HomeroomTable',

    propTypes: {
      showStar: React.PropTypes.bool.isRequired,
      showMcas: React.PropTypes.bool.isRequired,
      rows: React.PropTypes.array.isRequired
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

    renderHeaders () {
      return (
        <thead>
          <tr className="column-groups">
            {/*  TOP-LEVEL COLUMN GROUPS */}
            <td colSpan="1" className="name block"></td>
            <td colSpan="1" className="risk"></td>
            <td colSpan="1" className="program"></td>
            <td colSpan="3" className="sped"><p className="smalltype">SPED & Disability</p></td>
            <td colSpan="2" className="language"><p className="smalltype">Language</p></td>
            <td colSpan="1" className="free-reduced"></td>
            {this.renderStarHeaders()}
            {this.renderMcasHeaders()}
          </tr>
          <tr className="column-names">
            {/* COLUMN HEADERS */}
            <th className="name">
              <span id="first-column-header" className="table-header">
                Name
              </span>
            </th>
            <th className="risk">
              <span className="table-header">Risk</span>
            </th>
            <th className="program">
              <span className="table-header">Program Assigned</span>
            </th>
            <th className="sped">
              <span className="table-header">Disability</span>
            </th>
            <th className="sped">
              <span className="table-header">Level of Need</span>
            </th>
            <th className="sped">
              <span className="table-header">504 Plan</span>
            </th>
            <th className="language">
              <span className="table-header">Fluency</span>
            </th>
            <th className="language">
              <span className="table-header">Home Language</span>
            </th>
            <th className="free-reduced">
              <span className="table-header">Free/Reduced Lunch</span>
            </th>
            {this.renderStarSubHeaders()}
            {this.renderMcasSubHeaders()}
          </tr>
       </thead>
      );
    },

    renderRow (row) {
      return (
        <tr className="student-row" href={`/students/${row["id"]}`}>
          <td className="name">
            {`${row['first_name']} ${row['last_name']}`}
          </td>

          <td className="risk" data-student-id={row['id']}>
            <div className={this.warningBubbleClassName(row)}>
              {row['student_risk_level']['level'] || 'N/A'}
              <span className="tooltiptext">
                {row['student_risk_level']['explanation']}
              </span>
            </div>
          </td>

          <td className="program">
            {row['program_assigned']}
          </td>
          <td className="sped">
            {row['disability']}
          </td>
          <td className="sped">
            <div className={row['sped_data']['sped_bubble_class']}>
              {row['sped_data']['sped_level']}
              <span className="tooltiptext">
                {row['sped_data']['sped_tooltip_message']}
              </span>
            </div>
          </td>

          <td className="sped">
            {row['plan_504']}
          </td>
          <td className="language">
            {row['limited_english_proficiency']}
          </td>
          <td className="language">
            {row['home_language']}
          </td>
          <td className="free-reduced">
            {row['free_reduced_lunch']}
          </td>

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
