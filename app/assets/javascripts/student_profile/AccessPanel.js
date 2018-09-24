import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';


// Renders latest ACCESS score with subtests
export default class AccessPanel extends React.Component {
  render() {
    const {showTitle, access, style} = this.props;

    const proficiencyText = proficiencyTextForScore(access['composite']);

    return (
      <div style={{...styles.root, ...style}}>
        {showTitle && <h4 style={styles.title}>ACCESS</h4>}
        <div style={{marginBottom: 30, fontSize: 14}}>
          <div><b>Overall English proficiency: {proficiencyText}</b></div>
          <div>
            This reflect the latest scores in each category across ACCESS, WIDA Model Test and WIDA Screener tests.
          </div>
          <div><a style={{fontSize: 14}} href="https://wida.wisc.edu/sites/default/files/resource/WIDA-Screener-Interpretive-Guide.pdf" target="_blank">WIDA interpretive guide</a></div>
        </div>
        <table style={{borderCollapse: 'collapse'}}>
          <tbody>
            {this.renderCompositeRow({
              label: 'Overall Score',
              dataPoint: access['composite']
            })}
            {this.renderCompositeRow({
              label: 'Oral Language',
              dataPoint: access['oral']
            })}
            {this.renderSubtestRow({
              label: 'Listening',
              dataPoint: access['listening']
            })}
            {this.renderSubtestRow({
              label: 'Speaking',
              dataPoint: access['speaking']
            })}
            {this.renderCompositeRow({
              label: 'Literacy',
              dataPoint: access['literacy']
            })}
            {this.renderSubtestRow({
              label: 'Reading',
              dataPoint: access['reading']
            })}
            {this.renderSubtestRow({
              label: 'Comprehension',
              dataPoint: access['comprehension']
            })}
            {this.renderSubtestRow({
              label: 'Writing',
              dataPoint: access['writing']
            })}
          </tbody>
        </table>
      </div>
    );
  }

  renderCompositeRow(options = {}) {
    return this.renderRow({
      ...options,
      label: <div>{options.label}</div>,
      shouldRenderFractions: true
    });
  }

  renderSubtestRow(options = {}) {
    return this.renderRow({
      ...options,
      label: <div style={{paddingLeft: 10}}>{options.label}</div>,
      shouldRenderFractions: false
    });
  }

  renderRow(options = {}) {
    const label = options.label;
    const dataPoint = options.dataPoint;
    const shouldRenderFractions = options.shouldRenderFractions || false;
    
    const {nowFn} = this.context;    
    const nDaysText = (dataPoint)
      ? moment.utc(dataPoint.date_taken).from(nowFn())
      : '-';
    const performanceLevel = dataPoint && dataPoint.performance_level;

    // See WIDA interpretive guide
    // https://wida.wisc.edu/sites/default/files/resource/WIDA-Screener-Interpretive-Guide.pdf
    const roundedScore = Math.round(performanceLevel*2)/2;
    const scores = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6];
    const cellWidth = 35;
    const cellHeight = 30;
    return (
      <tr>
        <td style={{width: 100, paddingRight: 20}}>{label}</td>
        {scores.map((score, index) => (
          <td
            key={score}
            style={{
              border: '1px solid #666',
              width: cellWidth,
              backgroundColor: (score === roundedScore)
                ? '#4A90E2'
                : shouldRenderFractions || score === Math.round(score) ? 'white' : '#eee'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: cellHeight,
              color: (score === roundedScore) ? 'white' : '#ccc',
              fontWeight: (score === roundedScore) ? true : false
            }}>
              {shouldRenderFractions || score === Math.round(score) ? score : null}
            </div>
          </td>
        ))}
        <td style={{paddingLeft: 20}}>{nDaysText}</td>
      </tr>
    );
  }
}
AccessPanel.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
const accessDataPointPropType = PropTypes.shape({
  date_taken: PropTypes.string.isRequired,
  performance_level: PropTypes.string.isRequired
});
AccessPanel.propTypes = {
  access: PropTypes.shape({
    composite: accessDataPointPropType,
    comprehension: accessDataPointPropType,
    listening: accessDataPointPropType,
    oral: accessDataPointPropType,
    literacy: accessDataPointPropType,
    reading: accessDataPointPropType,
    speaking: accessDataPointPropType,
    writing: accessDataPointPropType
  }).isRequired,
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


function proficiencyTextForScore(compositeDataPoint) {
  if (!compositeDataPoint || !compositeDataPoint.performance_level) return 'No data';
  
  const scoreNumber = parseFloat(compositeDataPoint.performance_level);
  if (!scoreNumber) return 'No data';
  if (scoreNumber < 2) return 'Entering (1)';
  if (scoreNumber < 3) return 'Emerging (2)';
  if (scoreNumber < 4) return 'Developing (3)';
  if (scoreNumber < 5) return 'Expanding (4)';
  if (scoreNumber < 6) return 'Bridging (5)';
  if (scoreNumber === 6) return 'Reaching (6)';

  return 'Unknown';
}