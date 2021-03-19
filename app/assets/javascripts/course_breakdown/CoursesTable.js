import React from 'react';
import PropTypes from 'prop-types';
import {Table, Column, AutoSizer} from 'react-virtualized';

export default class CoursesTable extends React.Component {

  describeColumns(options = {}) {
    const numericCellWidth = 100;
    const textCellWidth = 200;
    const {columnList} = this.props;

    const courseNameCell = [{
      dataKey: 'course_name',
      label: 'Course',
      width: textCellWidth,
      // cellRenderer: this.renderCourse
    }];
    const totalCell = [{
      dataKey: 'total_students',
      label: 'Total',
      width: numericCellWidth,
      // cellRenderer: this.renderDefault
    }];

    const variableColumns = this.describeVariableColumns(columnList);
    return courseNameCell.concat(variableColumns).concat(totalCell);
  }

  describeVariableColumns(columnList) {
    return columnList.map(column => {
      const label = column.replace('_count','').replace('_',' ');
      return {
        dataKey: column,
        label: label,
        width: 100,
        cellRenderer: this.renderDemographic.bind(null, column)
      };
    });
  }

  render() {
    const {filteredCoursesWithBreakdown} = this.props;
    const columns = this.describeColumns();
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
  renderDemographic(column, {rowData}) {
    const median = `${column.replace('_count','')}_median_grade`;
    return <span style={{textAlign: 'center'}}>{rowData[column]} | {rowData[median]}</span>;
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