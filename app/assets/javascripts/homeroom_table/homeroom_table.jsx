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
        columnsDisplayed: this.getInitialColumnsDisplayed(),
        showColumnPicker: false
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

    columnNames () {
      return Object.values(this.columnKeysToNames());
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
          {this.renderColumnPickerArea()}
          <table id="roster-table" cellSpacing="0" cellPadding="10" className="sort-default">
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
        <td colSpan="1" className="star_math" key="star_math_header">
            <p className="smalltype">
              STAR: Math
            </p>
          </td>,
        <td colSpan="1" className="star_reading" key="star_reading_header">
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
        <th className="star_math" key="star_math_sub_header">
            <span className="table-header">Percentile</span>
          </th>,
        <th className="star_reading" key="star_reading_sub_header">
            <span className="table-header">Percentile</span>
          </th>
      ]
      );
    },

    renderMcasHeaders () {
      if (!this.props.showMcas) return null;

      return (
      [
        <td colSpan="2" className="mcas_math" key="mcas_math_header">
            <p className="smalltype">
              MCAS: Math
            </p>
          </td>,
        <td colSpan="2" className="mcas_ela" key="mcas_ela_header">
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
        <th className="mcas_math" key="mcas_math_sub_header_perf">
            <span className="table-header">Performance</span>
          </th>,
        <th className="mcas_math" key="mcas_math_sub_header_score">
            <span className="table-header">Score</span>
          </th>,
        <th className="mcas_ela" key="mcas_ela_sub_header_perf">
            <span className="table-header">Performance</span>
          </th>,
        <th className="mcas_ela" key="mcas_ela_sub_header_score">
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
      const fullName = `${row['first_name']} ${row['last_name']}`;
      const id = row["id"];

      return (
        <tr className="student-row"
            href={`/students/${id}`}
            key={id}>
          <td className="name">{fullName}</td>
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

      return (
        <tbody>
          {activeStudentRows.map(this.renderRow)}
        </tbody>
      );
    },

    renderMenu () {
      return (
        <svg width="24px" height="6px" viewBox="0 0 24 6" version="1.1" >
          <g id="Roster" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" >
            <g id="Roster---home---add-1" transform="translate(-930.000000, -416.000000)" fill="#555555">
              <g id="menu" transform="translate(930.000000, 416.000000)">
                <circle id="Oval-137" cx="3" cy="3" r="3"></circle>
                <path d="M12,6 C13.6568542,6 15,4.65685425 15,3 C15,1.34314575 13.6568542,0 12,0 C10.3431458,0 9,1.34314575 9,3 C9,4.65685425 10.3431458,6 12,6 Z" id="Oval-138"></path>
                <circle id="Oval-139" cx="21" cy="3" r="3"></circle>
              </g>
            </g>
          </g>
        </svg>
      );
    },

    toggleColumnPicker () {
      this.setState({ showColumnPicker: !this.state.showColumnPicker });
    },

    renderColumnPickerArea () {
      return (
        <div>
          <div onClick={this.toggleColumnPicker} id="column-picker-toggle">
            {this.renderMenu()}
          </div>
          {this.renderColumnPickerMenu()}
        </div>
      );
    },

    toggleColumn (columnKey) {
      const columnsDisplayed = Object.assign(this.state.columnsDisplayed, {});
      const isColumnDisplayed = (columnsDisplayed.indexOf(columnKey) > -1);

      if (isColumnDisplayed) {
        columnsDisplayed.unshift(columnKey);
      } else {
        columnsDisplayed.push(columnKey);
      }

      this.setState({ columnsDisplayed: columnsDisplayed });
    },

    renderColumnSelect (columnKey) {
      const columnKeysToNames = this.columnKeysToNames();
      const columnName = columnKeysToNames[columnKey];

      const columnsDisplayed = this.state.columnsDisplayed;
      const isColumnDisplayed = (columnsDisplayed.indexOf(columnKey) > -1);

      if (isColumnDisplayed) return (
        <div key={columnKey}>
          <input type="checkbox" defaultChecked onClick={this.toggleColumn.bind(null, columnKey)}/>
          <label>{columnName}</label>
        </div>
      );

      return (
        <div key={columnKey}>
          <input type="checkbox" onClick={this.toggleColumn.bind(null, columnKey)}/>
          <label>{columnName}</label>
        </div>
      );
    },

    renderColumnSelectors () {
      const columnKeys = this.columnKeys();

      return columnKeys.map((key) => { return this.renderColumnSelect(key) });
    },

    renderColumnPickerMenu () {
      if (this.state.showColumnPicker === false) return null;

      return (
        <div id="column-picker">
          <p>Select columns</p>
          <form id="column-listing">
            <div id="column-template">
              {this.renderColumnSelectors()}
            </div>
          </form>
        </div>
      );
    }

  });
})(window);
