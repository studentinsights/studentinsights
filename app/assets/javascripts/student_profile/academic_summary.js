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
      sparkline: React.PropTypes.element.isRequired,
      value: React.PropTypes.number // value or null
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
      value: React.PropTypes.string // or null
    },

    getDibelsHelpContent: function(){
      return dom.div({},
        dom.p({}, dom.b({ style: styles.core }, 'CORE:'), ' Student needs CORE (or basic) support to reach literacy goals.'),
        dom.br({}),
        dom.p({}, dom.b({ style: styles.strategic }, 'STRATEGIC:'), ' Student needs  STRATEGIC (or intermediate-level) support to reach literacy goals.'),
        dom.br({}),
        dom.p({}, dom.b({ style: styles.intensive }, 'INTENSIVE:'), ' Student needs INTENSIVE (or high-level) support to reach literacy goals.'),
        dom.br({}),
        dom.h2({}, 'DIBELS LEVELS BY GRADE:'),
        dom.table({ style: styles.table },
          dom.thead({},
            dom.tr({},
              dom.th({ style: styles.table, maxWidth: 30 }, 'Assessment'),
              dom.th({ style: styles.table, colSpan: 3 }, 'K - Beg'),
              dom.th({ style: styles.table, colSpan: 3 }, 'K - Mid'),
              dom.th({ style: styles.table, colSpan: 3 }, 'K - End'),
              dom.th({ style: styles.table, colSpan: 3 }, '1 - Beg'),
              dom.th({ style: styles.table, colSpan: 3 }, '1 - Mid'),
              dom.th({ style: styles.table, colSpan: 3 }, '1 - End'),
              dom.th({ style: styles.table, colSpan: 3 }, '2 - Beg'),
              dom.th({ style: styles.table, colSpan: 3 }, '2 - Mid'),
              dom.th({ style: styles.table, colSpan: 3 }, '2 - End'),
              dom.th({ style: styles.table, colSpan: 3 }, '3 - Beg'),
              dom.th({ style: styles.table, colSpan: 3 }, '3 - Mid'),
              dom.th({ style: styles.table, colSpan: 3 }, '3 - End')
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
              dom.td({ colSpan: 3 }, ' '),
              dom.td({ style: styles.core }, '27'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '12'),
              dom.td({ style: styles.core }, '45'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '30')
              ),
            dom.tr({}),
            dom.tr({},
              dom.td({}, 'Nonsense Word Fluency-Correct Sounds'),
              dom.td({ colSpan: 3 }, ' '),
              dom.td({ style: styles.core }, '25'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '15'),
              dom.td({ style: styles.core }, '37'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '27'),
              dom.td({ style: styles.core }, '33'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '19'),
              dom.td({ style: styles.core }, '50'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '30'),
              dom.td({ style: styles.core }, '78'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '42'),
              dom.td({ style: styles.core }, '62'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '45')
            ),
            dom.tr({},
              dom.td({}, 'Nonsense Word Fluency-Whole Words'),
              dom.td({ colSpan: 6 }, ' '),
              dom.td({ style: styles.core }, '4'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '0'),
              dom.td({ style: styles.core }, '4'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '1'),
              dom.td({ style: styles.core }, '12'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '5'),
              dom.td({ style: styles.core }, '18'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '9'),
              dom.td({ style: styles.core }, '18'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '9')
            ),
            dom.tr({}),
            dom.tr({},
              dom.td({}, 'Developing Reading Fluency'),
              dom.td({ colSpan: 12 }, ' '),
              dom.td({ style: styles.core }, '30'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '18'),
              dom.td({ style: styles.core }, '63'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '36'),
              dom.td({ style: styles.core }, '68'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '46'),
              dom.td({ style: styles.core }, '84'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '67'),
              dom.td({ style: styles.core }, '100'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '82'),
              dom.td({ style: styles.core }, '93'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '72'),
              dom.td({ style: styles.core }, '108'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '88'),
              dom.td({ style: styles.core }, '123'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '100') 
              ),
            dom.tr({},
              dom.td({}, 'Developing Reading Fluency - Percentage'),
              dom.td({ colSpan: 12 }, ' '),
              dom.td({ style: styles.core }, '85%'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '73%'),
              dom.td({ style: styles.core }, '92%'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '84%'),
              dom.td({ style: styles.core }, '93%'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '84%'),
              dom.td({ style: styles.core }, '95%'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '91%'),
              dom.td({ style: styles.core }, '97%'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '93%'),
              dom.td({ style: styles.core }, '96%'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '91%'),
              dom.td({ style: styles.core }, '97%'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '93%'),
              dom.td({ style: styles.core }, '98%'),
              dom.td({ style: styles.strategic }, ' '),
              dom.td({ style: styles.intensive }, '95%') 
              )
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
