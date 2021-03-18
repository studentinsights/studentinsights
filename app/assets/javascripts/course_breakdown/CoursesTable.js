import React from 'react';
import PropTypes from 'prop-types';
import {Table, Column, AutoSizer} from 'react-virtualized';

export default class CoursesTable extends React.Component {

  filteredColumns(dataKeys) {
    const columns = this.describeColumns();
    return columns.filter(column => dataKeys.includes(column.dataKey));
  }

  describeColumns(options = {}) {
    const gradeCellWidth = 200;
    const numericCellWidth = 200;
    const textCellWidth = 200;
    //
    return [{
      dataKey: 'course_name',
      label: 'Course',
      width: textCellWidth,
      // cellRenderer: this.renderCourse
    },
    {
      dataKey: 'race_asian_count',
      label: 'Asian/Pacific Islander',
      width: gradeCellWidth,
      // cellRenderer: this.renderAsianPacificIslander
    }, {
      dataKey: 'race_black_count',
      label: 'Black',
      width: gradeCellWidth,
      // cellRenderer: this.renderBlack
    }, {
      dataKey: 'race_latinx_count',
      label: 'Latinx',
      width: gradeCellWidth,
      // cellRenderer: this.renderLatinx
    }, {
      dataKey: 'race_white_count',
      label: 'White',
      width: gradeCellWidth,
      // cellRenderer: this.renderWhite
    }, {
      dataKey: 'gender_f_count',
      label: 'Female',
      width: gradeCellWidth,
      // cellRenderer: this.renderFemale
    }, {
      dataKey: 'gender_m_count',
      label: 'Male',
      width: gradeCellWidth,
      // cellRenderer: this.renderMale
    },
    {
      dataKey: 'total_students',
      label: 'Total',
      width: numericCellWidth,
      // cellRenderer: this.renderDefault
    }];
  }

  render() {
    const {filteredCoursesWithBreakdown, columnList} = this.props;
    const columns = this.filteredColumns(columnList);
    const rowHeight = 40;

    return (
      <div className="CoursesTable" style={styles.root}>
        <AutoSizer>
          {({height, width}) => (
            <Table
              ref={el => this.tableEl = el}
              width={width || 1024} /* for test, since sizing doesn't work in jsdom */
              height={height || 768} /* for test, since sizing doesn't work in jsdom */
              headerHeight={rowHeight}
              headerStyle={styles.tableHeaderStyle}
              rowCount={filteredCoursesWithBreakdown.length}
              rowGetter={({index}) => filteredCoursesWithBreakdown[index]}
              rowHeight={rowHeight}
              rowStyle={{display: 'flex', alignItems: 'center'}}
            >{columns.map(column => <Column key={column.dataKey} {...column} />)}
            </Table>
          )}
        </AutoSizer>
      </div>
    );
  }

  // Rules for rendering particular cells within the columns
  renderCourse({rowData}) {
    return <span style={{textAlign: 'center'}}>{rowData.course_name}</span>;
  }
  // renderHouse({rowData}) {
  //   return <span style={{textAlign: 'center'}}>{rowData.data.house_data.house}</span>;
  // }
  renderFemale({rowData}) {
    return <span style={{textAlign: 'center'}}>{rowData.gender_f_count}</span>;
  }
  renderMale({rowData}) {
    return <span style={{textAlign: 'center'}}>{rowData.gender_m_count}</span>;
  }
  renderAsianPacificIslander({rowData}) {
    return <span style={{textAlign: 'center'}}>{rowData.race_asian_count}</span>;
  }
  renderBlack({rowData}) {
    return <span style={{textAlign: 'center'}}>{rowData.race_black_count}</span>;
  }
  renderLatinx({rowData}) {
    return <span style={{textAlign: 'center'}}>{rowData.race_latinx_count}</span>;
  }
  renderWhite({rowData}) {
    return <span style={{textAlign: 'center'}}>{rowData.race_white_count}</span>;
  }
}

CoursesTable.propTypes = {
  filteredCoursesWithBreakdown: PropTypes.array.isRequired,
  columnList: PropTypes.array.isRequired,
  year: PropTypes.string.isRequired
};

const warningColor = 'rgb(255, 231, 214)';

const styles = {
  root: {
    flex: 1,
    display: 'block',
    flexDirection: 'column'
  },
  tableHeaderStyle: {
    fontSize: 12,
    fontWeight: 'normal',
    borderBottom: '1px solid #aaa',
    paddingBottom: 3,
    height: '100%',
    cursor: 'pointer'
  },
  warn: {
    display: 'inline-block',
    backgroundColor: warningColor,
    padding: 8
  },
  plain: {
    display: 'inline-block',
    padding: 8
  }
};