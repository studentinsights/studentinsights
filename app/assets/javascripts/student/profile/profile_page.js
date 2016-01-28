$(function() {
  // only run if the correct page
  if (!($('body').hasClass('students') && $('body').hasClass('profile'))) return;

  // imports
  var Routes = window.shared.Routes;
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Sparkline = React.createClass({
    displayName: 'Sparkline',

    propTypes: {
      height: React.PropTypes.number.isRequired,
      width: React.PropTypes.number.isRequired,
      quads: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.number)).isRequired,
      dateRange: React.PropTypes.array.isRequired,
      valueRange: React.PropTypes.array.isRequired,
      thresholdValue: React.PropTypes.number.isRequired,
    },

    render: function() {
      var padding = 5;
      // var color = d3.scale.linear().domain([-50, 0, 50]).range(['red','#eee','blue']);
      // var thickness = d3.scale.linear().domain([-50, 0, 50]).range([3, 0, 3]);
      var x = d3.time.scale().domain(this.props.dateRange).range([padding, this.props.width - padding]);
      var y = d3.scale.linear().domain(this.props.valueRange).range([this.props.height - padding, padding]);
      var lineGenerator = d3.svg.line()
        .x(function(d) { return x(new Date(d[0], d[1] - 1, d[2])); })
        .y(function(d) { return y(d[3]); })
        .interpolate('monotone');

      return dom.div({ className: 'Sparkline' },
        dom.svg({
          height: this.props.height,
          width: this.props.width
        },
          dom.line({
            x1: padding,
            x2: this.props.width - padding,
            y1: y(this.props.thresholdValue),
            y2: y(this.props.thresholdValue),
            stroke: '#ccc',
            strokeDasharray: 5
          }),
          dom.path({
            d: lineGenerator(this.props.quads),
            stroke: 'red',
            strokeWidth: 3,
            fill: 'none'
          })
        )
      );
    }
  });
  

  var AcademicSummary = React.createClass({
    displayName: 'AcademicSummary',

    propTypes: {
      caption: React.PropTypes.string.isRequired,
      value: React.PropTypes.number.isRequired,
      sparkline: React.PropTypes.element.isRequired
    },

    // TODO(kr) statics?
    styles: {
      caption: {
        marginRight: 5
      },
      value: {
        fontWeight: 'bold'
      }
    },

    render: function() {
      var styles = this.styles;
      return dom.div({ className: 'AcademicSummary' },
        dom.span({ style: styles.caption }, this.props.caption + ':'),
        dom.span({ style: styles.value }, this.props.value),
        dom.div({}, this.props.sparkline)
      );
    }
  });

  // define page component
  var styles = {
    titleContainer: {
      fontSize: 16,
      padding: 20
    },
    nameTitle: {
      fontSize: 20,
      fontWeight: 'bold'
    },
    titleItem: {
      padding: 5
    },
    summaryContainer: {
      display: 'flex',
      flexDirection: 'row',
      background: '#eee'
    },
    column: {
      textAlign: 'center',
      flex: 1
    },
    academicSummaryWrapper: {
      padding: 20
    },
    sparklineWidth: 120,
    sparklineHeight: 50
  };

  var StudentProfilePage = React.createClass({
    displayName: 'StudentProfilePage',

    propTypes: {
      student: React.PropTypes.object.isRequired,
      dateRange: React.PropTypes.array.isRequired
    },

    getInitialState: function() {
      return {
        selectedSectionKey: 'notes'
      };
    },

    render: function() {
      return dom.div({ className: 'StudentProfilePage' },
        this.renderStudentName(),
        dom.div({ style: styles.summaryContainer },
          this.renderDemographicsColumn(),
          this.renderELAColumn(),
          this.renderMathColumn(),
          dom.div({ style: { flex: 1 }}, 'behavior'),
          dom.div({ style: { flex: 1 }}, 'interventions')
        )
      );
    },

    renderStudentName: function() {
      var student =  this.props.student;
      return dom.div({ style: styles.titleContainer },
        dom.a({
          href: Routes.student(student.id),
          style: styles.nameTitle
        }, student.first_name + ' ' + student.last_name),
        dom.a({
          href: Routes.school(student.school_id),
          style: styles.titleItem
        }, student.school_name),
        dom.span({
          style: styles.titleItem
        }, student.grade),
        dom.a({
          href: Routes.homeroom(student.homeroom_id),
          style: styles.titleItem
        }, student.homeroom_name)
      );
    },

    renderDemographicsColumn: function() {
      var student = this.props.student;

      return dom.div({ style: { flex: 1 }},
        this.renderTitle('Demographics'),
        dom.div({}, 'Disability: ' + student.sped_level_of_need),
        dom.div({}, 'Low income: ' + student.free_reduced_lunch),
        dom.div({}, 'Language: ' + student.limited_english_proficiency)
      );
    },

    renderELAColumn: function() {
      var student = this.props.student;
      var chartData = this.props.chartData;

      return dom.div({ className: 'ela-background', style: styles.column},
        this.wrapAcademicSummary({
          caption: 'STAR Reading',
          value: student.most_recent_star_reading_percentile,
          sparkline: this.renderSparkline(chartData.star_series_reading_percentile)
        }),
        this.wrapAcademicSummary({
          caption: 'MCAS ELA',
          value: student.most_recent_mcas_ela_scaled,
          sparkline: this.renderSparkline(chartData.mcas_series_ela_scaled, {
            valueRange: [200, 300],
            thresholdValue: 240
          })
        }),
        this.wrapAcademicSummary({
          caption: 'MCAS ELA Growth',
          value: student.most_recent_mcas_ela_growth,
          sparkline: this.renderSparkline(chartData.mcas_series_ela_growth)
        })
      );
    },

    renderMathColumn: function() {
      var student = this.props.student;
      var chartData = this.props.chartData;

      return dom.div({ className: 'math-background', style: styles.column},
        this.wrapAcademicSummary({
          caption: 'STAR Math',
          value: student.most_recent_star_math_percentile,
          sparkline: this.renderSparkline(chartData.star_series_math_percentile)
        }),
        this.wrapAcademicSummary({
          caption: 'MCAS Math',
          value: student.most_recent_mcas_ela_scaled,
          sparkline: this.renderSparkline(chartData.mcas_series_math_scaled, {
            valueRange: [200, 300],
            thresholdValue: 240
          })
        }),
        this.wrapAcademicSummary({
          caption: 'MCAS Math Growth',
          value: student.most_recent_mcas_math_growth,
          sparkline: this.renderSparkline(chartData.mcas_series_math_growth)
        })
      );
    },

    // quads format is: [[year, month, day, value]]
    renderSparkline: function(quads, props) {
      var dateRange = this.props.dateRange;
      return createEl(Sparkline, merge({
        height: styles.sparklineHeight,
        width: styles.sparklineWidth,
        quads: quads,
        dateRange: dateRange,
        valueRange: [0, 100],
        thresholdValue: 50
      }, props || {}));
    },

    // render with style wrapper
    wrapAcademicSummary: function(props) {      
      return dom.div({ style: styles.academicSummaryWrapper }, createEl(AcademicSummary, props));
    },

    renderTitle: function(text) {
      return dom.div({}, text);
    }
  });

  // entry point
  function main() {
    var serializedData = $('#serialized-data').data();
    window.serializedData = serializedData;

    //TODO(kr) fix mismatch between dev/prod here
    // serializedData.interventionTypes = [{"id":20,"name":"After-School Tutoring (ATP)","created_at":"2015-10-20T20:32:26.191Z","updated_at":"2015-10-20T20:32:26.191Z"},{"id":21,"name":"Attendance Officer","created_at":"2015-10-20T20:32:26.198Z","updated_at":"2015-10-20T20:32:26.198Z"},{"id":22,"name":"Attendance Contract","created_at":"2015-10-20T20:32:26.207Z","updated_at":"2015-10-20T20:32:26.207Z"},{"id":23,"name":"Behavior Contract","created_at":"2015-10-20T20:32:26.212Z","updated_at":"2015-10-20T20:32:26.212Z"},{"id":24,"name":"Behavior Plan","created_at":"2015-10-20T20:32:26.219Z","updated_at":"2015-10-20T20:32:26.219Z"},{"id":25,"name":"Boys \u0026 Girls Club","created_at":"2015-10-20T20:32:26.225Z","updated_at":"2015-10-20T20:32:26.225Z"},{"id":26,"name":"Classroom Academic Intervention","created_at":"2015-10-20T20:32:26.229Z","updated_at":"2015-10-20T20:32:26.229Z"},{"id":27,"name":"Classroom Behavior Intervention","created_at":"2015-10-20T20:32:26.234Z","updated_at":"2015-10-20T20:32:26.234Z"},{"id":28,"name":"Community Schools","created_at":"2015-10-20T20:32:26.241Z","updated_at":"2015-10-20T20:32:26.241Z"},{"id":29,"name":"Counseling: In-House","created_at":"2015-10-20T20:32:26.246Z","updated_at":"2015-10-20T20:32:26.246Z"},{"id":30,"name":"Counseling: Outside/Physician Referral","created_at":"2015-10-20T20:32:26.254Z","updated_at":"2015-10-20T20:32:26.254Z"},{"id":31,"name":"ER Referral (Mental Health)","created_at":"2015-10-20T20:32:26.265Z","updated_at":"2015-10-20T20:32:26.265Z"},{"id":32,"name":"Math Tutor","created_at":"2015-10-20T20:32:26.270Z","updated_at":"2015-10-20T20:32:26.270Z"},{"id":33,"name":"Mobile Crisis Referral","created_at":"2015-10-20T20:32:26.284Z","updated_at":"2015-10-20T20:32:26.284Z"},{"id":34,"name":"MTSS Referral","created_at":"2015-10-20T20:32:26.293Z","updated_at":"2015-10-20T20:32:26.293Z"},{"id":35,"name":"OT/PT Consult","created_at":"2015-10-20T20:32:26.297Z","updated_at":"2015-10-20T20:32:26.297Z"},{"id":36,"name":"Parent Communication","created_at":"2015-10-20T20:32:26.309Z","updated_at":"2015-10-20T20:32:26.309Z"},{"id":37,"name":"Parent Conference/Meeting","created_at":"2015-10-20T20:32:26.320Z","updated_at":"2015-10-20T20:32:26.320Z"},{"id":39,"name":"Peer Mediation","created_at":"2015-10-20T20:32:26.342Z","updated_at":"2015-10-20T20:32:26.342Z"},{"id":40,"name":"Reading Specialist","created_at":"2015-10-20T20:32:26.364Z","updated_at":"2015-10-20T20:32:26.364Z"},{"id":41,"name":"Reading Tutor","created_at":"2015-10-20T20:32:26.375Z","updated_at":"2015-10-20T20:32:26.375Z"},{"id":42,"name":"SST Referral","created_at":"2015-10-20T20:32:26.379Z","updated_at":"2015-10-20T20:32:26.379Z"},{"id":43,"name":"Weekly Call/Email Home","created_at":"2015-10-20T20:32:26.389Z","updated_at":"2015-10-20T20:32:26.389Z"},{"id":44,"name":"X Block Tutor","created_at":"2015-10-20T20:32:26.393Z","updated_at":"2015-10-20T20:32:26.393Z"},{"id":45,"name":"51a Filing","created_at":"2015-10-20T20:32:26.399Z","updated_at":"2015-10-20T20:32:26.399Z"},{"id":46,"name":"Other","created_at":"2015-10-20T20:32:26.405Z","updated_at":"2015-10-20T20:32:26.405Z"}];

    // index by intervention type id
    // var InterventionTypes = serializedData.interventionTypes.reduce(function(map, interventionType) {
    //   map[interventionType.id] = interventionType;
    //   return map;
    // }, {});

    var now = new Date();
    var dateRange = [now, moment(now).subtract(1, 'year').toDate()];
    // TODO(kr) hacking around for local data
    dateRange = [new Date(2010, 11, 19), new Date(2011, 11, 19)]
    ReactDOM.render(createEl(StudentProfilePage, {
      student: serializedData.student,
      chartData: serializedData.chartData,
      dateRange: dateRange
    }), document.getElementById('main'));
  }

  main();
});
