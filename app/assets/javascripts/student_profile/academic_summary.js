(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  var PropTypes = window.shared.PropTypes;
  var HelpBubble = window.shared.HelpBubble;


  var styles = {
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
    gradeHeader: {
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

  var AcademicSummary = window.shared.AcademicSummary = React.createClass({
    displayName: 'AcademicSummary',

    propTypes: {
      caption: React.PropTypes.string.isRequired,
      value: PropTypes.nullable(React.PropTypes.number.isRequired),
      sparkline: React.PropTypes.element.isRequired
    },

    render: function() {
      return dom.div({ className: 'AcademicSummary' },
        dom.div({ style: styles.textContainer },
          dom.span({ style: styles.caption }, this.props.caption + ':'),
          dom.span({ style: styles.value }, (this.props.value === undefined) ? 'none' : this.props.value)
        ),
        dom.div({ style: styles.sparklineContainer }, this.props.sparkline)
      );
    }
  });

  var SummaryWithoutSparkline = window.shared.SummaryWithoutSparkline = React.createClass({
    displayName: 'SummaryWithoutSparkline',

    propTypes: {
      caption: React.PropTypes.string.isRequired,
      value: PropTypes.nullable(React.PropTypes.string.isRequired)
    },

    getDibelsHelpContent: function(){
      return dom.div({},
        dom.p({}, dom.b({}, 'What does CORE mean? '), 'A designation of CORE means a student is likely to need CORE (or basic) support to achieve subsequent early literacy goals.'),
        dom.br({}),
        dom.p({}, dom.b({}, 'What does STRATEGIC mean? '), 'A designation of STRATEGIC means a student is likely to need STRATEGIC (or intermediate-level) support to achieve subsequent early literacy goals.'),
        dom.br({}),
        dom.p({}, dom.b({}, 'What does INTENSIVE mean? '), 'A designation of INTENSIVE means a student is likely to need INTENSIVE (or high-level) support to achieve subsequent early literacy goals.'),
        dom.br({}),
        dom.h2({}, 'DIBELS BY GRADE:'),
        dom.table({ style: styles.table },
          dom.thead({},
            dom.tr({},
              dom.th({ style: styles.table, maxWidth: 30 }, 'Test'),
              dom.th({ style: styles.table, colSpan: 3 }, 'K - Beg'),
              dom.th({ style: styles.table, colSpan: 3 }, 'K - Mid'),
              dom.th({ style: styles.table, colSpan: 3 }, 'K - End'),
              dom.th({ style: styles.table, colSpan: 3 }, '1 - Beg'),
              dom.th({ style: styles.table, colSpan: 3 }, '1 - Mid'),
              dom.th({ style: styles.table, colSpan: 3 }, '1 - End')
              ),
            dom.tr({})
            ),
          dom.tbody({},
            dom.tr({},
              dom.td({}, 'First Sound Fluency'),
              dom.td({ style: styles.core }, '18'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '7'),
              dom.td({ style: styles.core }, '44'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '31')
              ),
            dom.tr({},
              dom.td({}, 'Letter Naming Fluency'),
              dom.td({ style: styles.core }, '22 '),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '10'),
              dom.td({ style: styles.core }, '42'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '19'),
              dom.td({ style: styles.core }, '52'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '38'),
              dom.td({ style: styles.core }, '50'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '36')
              ),
            dom.tr({},
              dom.td({}, 'Phoneme Segmentation Fluency'),
              dom.td({ style: styles.core }, ' '),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, ' '),
              dom.td({ style: styles.core }, '27'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '12'),
              dom.td({ style: styles.core }, '45'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '30')
              ),
            dom.tr({})
            )
          ) 
          ); 
    },

    render: function() {
      return dom.div({ className: 'AcademicSummary' },
        dom.div({ style: styles.textContainer },
          dom.span({ style: styles.caption }, this.props.caption + ':'),
          dom.br(),
          dom.br(),
          dom.span({ style: styles.value }, (this.props.value === undefined) ? 'none' : this.props.value),
          createEl(HelpBubble, {
            title: 'What do DIBELS levels mean?',
            teaserText: '(what is this?)',
            content: this.getDibelsHelpContent()
          })
        )
      );
    }
  });

})();
