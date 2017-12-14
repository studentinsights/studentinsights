import HelpBubble from './help_bubble.js';

(function() {
  window.shared || (window.shared = {});

  const styles = {
    caption: {
      marginRight: 5
    },
    value: {
      fontWeight: 'bold'
    },
    sparklineContainer: {
      paddingLeft: 15,
      paddingRight: 15
    },
    textContainer: {
      paddingBottom: 5
    },
    table: {
      border: 1,
      borderStyle: 'solid',
      borderColor: 'black',
      paddingLeft: 5,
      paddingRight: 5
    },
    core: {
      backgroundColor: '#b3ffb3'
    },
    strategic: {
      backgroundColor: '#ffffb3'
    },
    intensive: {
      backgroundColor: '#ff9999'
    }
  };

  window.shared.AcademicSummary = React.createClass({
    displayName: 'AcademicSummary',

    propTypes: {
      caption: React.PropTypes.string.isRequired,
      sparkline: React.PropTypes.element.isRequired,
      value: React.PropTypes.number // value or null
    },

    render: function() {
      return (
        <div className="AcademicSummary">
          <div style={styles.textContainer}>
            <span style={styles.caption}>
              {this.props.caption + ':'}
            </span>
            <span style={styles.value}>
              {(this.props.value === undefined) ? 'none' : this.props.value}
            </span>
          </div>
          <div style={styles.sparklineContainer}>
            {this.props.sparkline}
          </div>
        </div>
      );
    }
  });

  window.shared.SummaryWithoutSparkline = React.createClass({
    displayName: 'SummaryWithoutSparkline',

    propTypes: {
      caption: React.PropTypes.string.isRequired,
      value: React.PropTypes.string // or null
    },

    getDibelsHelpContent: function(){
      return (
        <div>
          <p>
            <b style={styles.core}>
              CORE:
            </b>
            {' Student needs CORE (or basic) support to reach literacy goals.'}
          </p>
          <br />
          <p>
            <b style={styles.strategic}>
              STRATEGIC:
            </b>
            {' Student needs  STRATEGIC (or intermediate-level) support to reach literacy goals.'}
          </p>
          <br />
          <p>
            <b style={styles.intensive}>
              INTENSIVE:
            </b>
            {' Student needs INTENSIVE (or high-level) support to reach literacy goals.'}
          </p>
          <br />
          <h2>
            DIBELS LEVELS BY GRADE:
          </h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.table} maxWidth={30}>
                  Assessment
                </th>
                <th style={styles.table} colSpan={3}>
                  K - Beg
                </th>
                <th style={styles.table} colSpan={3}>
                  K - Mid
                </th>
                <th style={styles.table} colSpan={3}>
                  K - End
                </th>
                <th style={styles.table} colSpan={3}>
                  1 - Beg
                </th>
                <th style={styles.table} colSpan={3}>
                  1 - Mid
                </th>
                <th style={styles.table} colSpan={3}>
                  1 - End
                </th>
                <th style={styles.table} colSpan={3}>
                  2 - Beg
                </th>
                <th style={styles.table} colSpan={3}>
                  2 - Mid
                </th>
                <th style={styles.table} colSpan={3}>
                  2 - End
                </th>
                <th style={styles.table} colSpan={3}>
                  3 - Beg
                </th>
                <th style={styles.table} colSpan={3}>
                  3 - Mid
                </th>
                <th style={styles.table} colSpan={3}>
                  3 - End
                </th>
              </tr>
              <tr />
            </thead>
            <tbody>
              <tr>
                <td>
                  First Sound Fluency
                </td>
                <td style={styles.core}>
                  18
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  7
                </td>
                <td style={styles.core}>
                  44
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  31
                </td>
              </tr>
              <tr>
                <td>
                  Letter Naming Fluency
                </td>
                <td style={styles.core}>
                  {'22 '}
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  10
                </td>
                <td style={styles.core}>
                  42
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  19
                </td>
                <td style={styles.core}>
                  52
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  38
                </td>
                <td style={styles.core}>
                  50
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  36
                </td>
              </tr>
              <tr>
                <td>
                  Phoneme Segmentation Fluency
                </td>
                <td colSpan={3}>
                  {' '}
                </td>
                <td style={styles.core}>
                  27
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  12
                </td>
                <td style={styles.core}>
                  45
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  30
                </td>
              </tr>
              <tr />
              <tr>
                <td>
                  Nonsense Word Fluency-Correct Sounds
                </td>
                <td colSpan={3}>
                  {' '}
                </td>
                <td style={styles.core}>
                  25
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  15
                </td>
                <td style={styles.core}>
                  37
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  27
                </td>
                <td style={styles.core}>
                  33
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  19
                </td>
                <td style={styles.core}>
                  50
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  30
                </td>
                <td style={styles.core}>
                  78
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  42
                </td>
                <td style={styles.core}>
                  62
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  45
                </td>
              </tr>
              <tr>
                <td>
                  Nonsense Word Fluency-Whole Words
                </td>
                <td colSpan={6}>
                  {' '}
                </td>
                <td style={styles.core}>
                  4
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  0
                </td>
                <td style={styles.core}>
                  4
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  1
                </td>
                <td style={styles.core}>
                  12
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  5
                </td>
                <td style={styles.core}>
                  18
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  9
                </td>
                <td style={styles.core}>
                  18
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  9
                </td>
              </tr>
              <tr />
              <tr>
                <td>
                  Developing Reading Fluency
                </td>
                <td colSpan={12}>
                  {' '}
                </td>
                <td style={styles.core}>
                  30
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  18
                </td>
                <td style={styles.core}>
                  63
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  36
                </td>
                <td style={styles.core}>
                  68
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  46
                </td>
                <td style={styles.core}>
                  84
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  67
                </td>
                <td style={styles.core}>
                  100
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  82
                </td>
                <td style={styles.core}>
                  93
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  72
                </td>
                <td style={styles.core}>
                  108
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  88
                </td>
                <td style={styles.core}>
                  123
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  100
                </td>
              </tr>
              <tr>
                <td>
                  Developing Reading Fluency - Percentage
                </td>
                <td colSpan={12}>
                  {' '}
                </td>
                <td style={styles.core}>
                  85%
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  73%
                </td>
                <td style={styles.core}>
                  92%
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  84%
                </td>
                <td style={styles.core}>
                  93%
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  84%
                </td>
                <td style={styles.core}>
                  95%
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  91%
                </td>
                <td style={styles.core}>
                  97%
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  93%
                </td>
                <td style={styles.core}>
                  96%
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  91%
                </td>
                <td style={styles.core}>
                  97%
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  93%
                </td>
                <td style={styles.core}>
                  98%
                </td>
                <td style={styles.strategic}>
                  {' '}
                </td>
                <td style={styles.intensive}>
                  95%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    },

    render: function() {
      return (
        <div className="AcademicSummary">
          <div style={styles.textContainer}>
            <span style={styles.caption}>
              {this.props.caption + ':'}
            </span>
            <br />
            <br />
            <span style={styles.value}>
              {(this.props.value === undefined) ? 'none' : this.props.value}
            </span>
            <HelpBubble
              title="What do DIBELS levels mean?"
              teaserText="(what is this?)"
              content={this.getDibelsHelpContent()} />
          </div>
        </div>
      );
    }
  });

})();
