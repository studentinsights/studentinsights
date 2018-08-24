import React from 'react';
import PropTypes from 'prop-types';


// Renders latest ACCESS score with subtests
export default class AccessPanel extends React.Component {
  render() {
    const {showTitle, access, style} = this.props;

    return (
      <div style={{...styles.root, ...style}}>
        {showTitle && <h4 style={styles.title}>ACCESS</h4>}
        <table>
          <thead>
            <tr>
              <th style={styles.tableHeader}>
                Subject
              </th>
              <th style={styles.tableHeader}>
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(access).map(subject => (
              <tr key={subject}>
                <td style={styles.accessLeftTableCell}>
                  {subject}
                </td>
                <td>
                  {access[subject] || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div />
        <div style={styles.accessTableFootnote}>
          Most recent ACCESS scores shown.
        </div>
      </div>
    );
  }
}
AccessPanel.propTypes = {
  access: PropTypes.object.isRequired,
  showTitle: PropTypes.bool,
  style: PropTypes.object
};

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  title: {
    borderBottom: '1px solid #333',
    color: 'black',
    padding: 10,
    paddingLeft: 0,
    marginBottom: 10
  },
  tableHeader: {
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10
  },
  accessLeftTableCell: {
    paddingRight: 25
  },
  accessTableFootnote: {
    fontStyle: 'italic',
    fontSize: 13,
    marginTop: 15,
    marginBottom: 20
  }
};
