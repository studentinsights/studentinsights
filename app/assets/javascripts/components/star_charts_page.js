$(function() {
  window.shared || (window.shared = {});
  var SlicePanels = window.shared.SlicePanels;
  var SliceButtons = window.shared.SliceButtons;
  var Routes = window.shared.Routes;
  var styles = window.shared.styles;
  var colors = window.shared.colors;
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  // page
  var StarChartsPage = React.createClass({
    displayName: 'StarChartsPage',

    propTypes: {
      serviceTypesIndex: React.PropTypes.object.isRequired,
      eventNoteTypesIndex: React.PropTypes.object.isRequired,
      initialFilters: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      dateNow: React.PropTypes.object.isRequired,
      recentThresholdInDays: React.PropTypes.number
    },

    getDefaultProps: function() {
      return {
        studentLimit: 12,
        recentThresholdInDays: 90
      };
    },

    getInitialState: function() {
      return {
        filters: this.props.initialFilters,
        hoverStudentIds: [],
        hoverText: null
      };
    },

    // sink-only
    componentDidUpdate: function() {
      window.history.pushState({}, null, this.filtersHash());
    },

    filtersHash: function() {
      return '#' + this.state.filters.map(function(filter) {
        return encodeURIComponent(filter.identifier);
      }).join('&');
    },

    activeFiltersIdentifier: function() {
      return this.state.filters.map(function(filter) { return filter.identifier; }).join('-');
    },

    setHoverNull: function() {
      this.setState({
        hoverStudentIds: [],
        hoverText: null
      });
    },

    onStudentHover: function(student, e) {
      if (student === null) return this.setHoverNull();
      var hover = {
        name: student.first_name + ' ' + student.last_name,
        student_id: student.id,
        scores: _.compact(_.pluck(student.star_results, 'percentile_rank')).join(', ')
      };
      this.setState({
        hoverStudentIds: [student.id],
        hoverText: JSON.stringify(hover, null, 2)
      });
    },

    clearFilters: function() {
      this.setState({ filters: [] });
    },

    onFilterToggled: function(toggledFilter) {
      var withoutToggledFilter = this.state.filters.filter(function(filter) {
        return filter.identifier !== toggledFilter.identifier;
      });
      var updatedFilters = (withoutToggledFilter.length === this.state.filters.length)
        ? this.state.filters.concat([toggledFilter])
        : withoutToggledFilter;
      this.setState({ filters: updatedFilters });
    },

    onResetClicked: function(e) {
      this.clearFilters();
    },

    filteredStudents: function() {
      return this.state.filters.reduce(function(filteredStudents, filter) {
        return filteredStudents.filter(filter.filterFn);
      }, this.props.students);
    },

    // find students who took an assessment in the last 90 days
    // and who had the greatest change since their last assessment
    studentsWithRecentAssessments: function() {
      var dateNow = this.props.dateNow;
      var recentThresholdInDays = this.props.recentThresholdInDays;

      return _.compact(this.filteredStudents().map(function(student) {
        // sort assessments by date taken, ascending
        var assessmentsByDate = _.sortBy(student.star_results, function(assessment) {
          return new Date(assessment.date_taken);
        });

        // only include students with recent assessments
        var recentAssessment = _.findLast(assessmentsByDate, function(assessment) {
          var takenDaysAgo = moment.utc(dateNow).diff(assessment.date_taken, 'days');
          return (takenDaysAgo < recentThresholdInDays && _.isNumber(assessment.percentile_rank));
        });
        if (recentAssessment === undefined) return null;

        // and that also have an assessment before that (however old it was)
        var previousAssessment = _.findLast(assessmentsByDate, function(assessment) {
          return (new Date(assessment.date_taken) < new Date(recentAssessment.date_taken) && _.isNumber(assessment.percentile_rank));
        });
        if (previousAssessment === undefined) return null;

        // compute the delta
        var delta = recentAssessment.percentile_rank - previousAssessment.percentile_rank;
        return merge(student, {
          star_results: [previousAssessment, recentAssessment],
          delta: delta
        });
      }));
    },

    flattenedAssessments: function(students) {
      return _.flatten(students.map(function(student) {
        var studentFields = _.omit(student, 'star_results');
        return student.star_results.filter(function(result) {
          return result.percentile_rank != null;
        }).map(function(result) { return merge(result, { student: studentFields }); });
      }));
    },

    isHoverStudent: function(student) {
      return (_.isEmpty(this.state.hoverStudentIds)) ? false : (this.state.hoverStudentIds.indexOf(student.id) !== -1);
    },

    isHoverBackground: function(student) {
      return (_.isEmpty(this.state.hoverStudentIds)) ? false : !this.isHoverStudent(student);
    },

    render: function() {
      var sizing = { width: 300, height: 250 };
      return dom.div({ className: 'StarChartsPage', style: { paddingBottom: 20 } },
        dom.div({ className: 'header', style: styles.header }, createEl(SlicePanels, {
          allStudents: this.props.students,
          students: this.filteredStudents(),
          serviceTypesIndex: this.props.serviceTypesIndex,
          eventNoteTypesIndex: this.props.eventNoteTypesIndex,
          filters: this.state.filters,
          onFilterToggled: this.onFilterToggled
        })),
	dom.div({ className: 'summary', style: styles.summary }, createEl(SliceButtons, {
	  students: this.filteredStudents(),
	  filters: this.state.filters,
	  filtersHash: this.filtersHash(),
	  activeFiltersIdentifier: this.activeFiltersIdentifier(),
	  clearFilters: this.clearFilters
	})),
        dom.div({
          style: {
            background: 'red',
            color: 'white',
            fontWeight: 'bold',
            padding: 20
          },
        },
          dom.span({}, 'This is an experimental prototype page!'),
          dom.span({ style: { marginLeft: 10 } }, 'Please try it out and share your feedback.')
        ),
        dom.div({ style: { position: 'relative' } },
          dom.div({ style: { flex: 1 } },
            dom.div({ style: { display: 'flex', justifyContent: 'space-around', padding: 20 } },
              this.renderRecentStarChanges(merge(sizing, { width: 500 })),
              this.renderDeltaHistogram(merge(sizing, { width: 400 }))
            ),
            dom.div({ style: { display: 'flex', justifyContent: 'space-around', padding: 20, paddingTop: 0 } },
              this.renderScatterplot(merge(sizing, { width: 1200, height: 300 }))
            )
          )
        )
      );
    },

    renderTitle: function(text) {
      return dom.h2({ style: { marginTop: 20 } }, text);
    },

    renderTitleWithSummary: function(props) {
      var dateRangeText = (_.isEqual(props.dateRange, [undefined, undefined]))
        ? 'None'
        : props.dateRange.map(function(date) {
          return date.toString().split(' ').slice(1, 4).join(' ');
        }).join(' - ');

      return dom.div({ style: { padding: 10, fontSize: styles.fontSize } },
        dom.h6({}, props.title),
        dom.div({}, props.description),
        dom.div({}, dateRangeText),
        dom.div({},
          dom.span({}, 'Students: ', props.students.length),
          dom.span({ style: { paddingLeft: 10 }}, 'Number of data points: ', (props.assessments || []).length)));
    },

    resultsDelta: function(student) {
      var results = student.star_results.filter(function(result) { return result.percentile_rank != null; });
      if (results.length < 2) return 0;
      return _.last(results).percentile_rank - _.first(results).percentile_rank;
    },

    renderPercentile: function(percentileRank) {
      var lastDigit = percentileRank % 10;
      if (percentileRank === 11) return '11th';
      if (percentileRank === 12) return '12th';
      if (percentileRank === 13) return '13th';
      if (lastDigit === 1) return percentileRank + 'st';
      if (lastDigit === 2) return percentileRank + 'nd';
      if (lastDigit === 3) return percentileRank + 'rd';
      return percentileRank + 'th';
    },

    greatestChanges: function(students, color) {
      return dom.div({ style: { paddingLeft: 5, fontSize: styles.fontSize } },
        dom.div({ style: { textDecoration: 'underline', paddingBottom: 5 } }, 'Greatest changes:'),
        dom.table({ style: { borderCollapse: 'collapse' } },
          dom.tbody({}, _.sortBy(students, _.compose(Math.abs, this.resultsDelta)).reverse().slice(0, this.props.studentLimit).map(function(student) {
            var delta = this.resultsDelta(student);
            return dom.tr({
              key: student.id,
              style: { backgroundColor: this.isHoverStudent(student) ? colors.selection : 'white' },
              onMouseEnter: this.onStudentHover.bind(this, student),
              onMouseLeave: this.onStudentHover.bind(this, null)
            },
              dom.td({ style: { textAlign: 'right', color: color(delta) } }, (delta > 0) ? '+' + delta : delta),
              dom.td({ style: { color: '#ccc' } }, ' → '),
              dom.td({}, this.renderPercentile(_.last(student.star_results).percentile_rank)),
              dom.td({ style: { paddingLeft: 10 } }, dom.a({ style: { fontSize: styles.fontSize }, href: Routes.studentProfile(student.id) }, student.first_name + ' ' + student.last_name))
            );
          }, this))
        )
      );
    },

    // find students who took an assessment in the last 90 days
    // and who had the greatest change since their last assessment
    renderRecentStarChanges: function(options) {
      var students = this.studentsWithRecentAssessments();
      var assessments = _.flatten(_.pluck(students, 'star_results'));
      return this.renderLineChartWithTable('Student progress, since last assessment', 'Change in percentile rank', students, assessments, options);
    },

    renderLineChartWithTable: function(title, description, students, assessments, options) {
      var width = options.width;
      var height = options.height;

      var dateRange = d3.extent(assessments, function(d) { return new Date(d.date_taken); });
      var x = d3.time.scale().domain(dateRange).range([0, width]);
      var y = d3.scale.linear().domain([0, 100]).range([height, 0]);
      var color = d3.scale.linear().domain([-25, 0, 25]).range(['red','#eee','blue']);
      var thickness = d3.scale.linear().domain([-50, 0, 50]).range([3, 0, 3]);

      var lineGenerator = d3.svg.line()
        .x(function(d) { return x(new Date(d.date_taken)); })
        .y(function(d) { return y(d.percentile_rank); })
        .interpolate('monotone');

      return dom.div({},
        this.renderTitleWithSummary({
          title: title,
          description: description,
          dateRange: d3.extent(assessments, function(result) { return new Date(result.date_taken); }),
          students: students,
          assessments: assessments
        }),
        dom.div({ style: { display: 'flex' } },
          dom.div({ style: { marginTop: 25 } },
            dom.svg( {width: width, height: height },
              dom.rect({
                x: 0,
                y: 0,
                width: width,
                height: height,
                stroke: '#eee',
                fill: 'none'
              }),
              students.map(function(student) {
                var results = student.star_results.filter(function(result) { return result.percentile_rank != null; });
                return dom.g({ key: student.id },
                  dom.path({
                    stroke: (this.isHoverStudent(student))
                      ? color.domain([-10, 0, 10])(this.resultsDelta(student))
                      : color(this.resultsDelta(student)),
                    strokeWidth: (this.isHoverStudent(student))
                      ? 2
                      : thickness(this.allTimeRange(student)),
                    opacity: this.isHoverBackground(student) ? 0.05 : 0.75,
                    fill: 'none',
                    d: lineGenerator(results),
                    onMouseEnter: this.onStudentHover.bind(this, student),
                    onMouseLeave: this.onStudentHover.bind(this, null)
                  })
                );
              }, this)
            )
          ),
          this.greatestChanges(students, color)
        )
      );
    },

    allTimeRange: function(student) {
      // largest variance all-time
      var scores = _.pluck(this.filteredResults(student), 'percentile_rank');
      return _.last(scores) - _.first(scores);
    },

    filteredResults: function(student) {
      return student.star_results.filter(function(result) { return result.percentile_rank != null; });
    },

    renderAllTimeStarTrends: function(options) {
      var width = options.width;
      var height = options.height;

      var filteredStudents = this.filteredStudents().filter(function(student) { return student.star_results.length > 0; });
      var students = _.sortBy(filteredStudents, this.allTimeRange);
      var assessments = _.flatten(students.map(function(student) {
        return student.star_results;
      }));

      return this.renderLineChartWithTable('Student scores, all-time', 'Percentile rank each assessment', students, assessments, options);
    },

    quarterDate: function(date) {
      var anchor = moment.utc('2000-09-01');
      var monthsAfter = moment.utc(date).diff(anchor, 'months');
      var quartersAfter = Math.floor(monthsAfter / 3);
      return anchor.add(quartersAfter * 3, 'months').toDate();
    },

    sortedScores: function(assessments) {
      return _.compact(_.pluck(assessments, 'percentile_rank')).sort(d3.ascending);
    },

    renderScatterplot: function(options) {
      var width = options.width;
      var height = options.height;

      var students = this.studentsWithRecentAssessments();
      var assessments = _.flatten(_.pluck(students, 'star_results'));

      var dateRange = d3.extent(assessments, function(d) { return new Date(d.date_taken); });
      var x = d3.scale.linear().domain([-50, 50]).range([0, width]);
      var y = d3.scale.linear().domain([0, 100]).range([height, 0]);
      var color = d3.scale.linear().domain([-50, 0, 50]).range(['red','#eee','blue']);
      var thickness = d3.scale.linear().domain([-50, 0, 50]).range([3, 0, 3]);

      var verticalTicks = [25, 50, 75, 100];
      var horizontalTicks = [-50, -25, 25, 50];

      var isStudentSelected = _.isEmpty(this.state.hoverStudentIds);

      var hoverElements = _.compact(this.state.hoverStudentIds.map(function(studentId) {
        if (_.isEmpty(students)) return null;
        var student = _.findWhere(students, { id: studentId });
        var percentile = _.last(student.star_results).percentile_rank;
        var delta = this.resultsDelta(student);
        var bubbleY = y(percentile);
        return dom.text({
          key: student.id,
          fontSize: 12,
          fontWeight: 'normal',
          x: x(delta),
          y: (bubbleY > height/2) ? bubbleY - 60 : bubbleY + 5, // flip orientation, to stay in bounds
          width: 100,
          height: 100,
          textAnchor: 'center',
          stroke: '#333'
        },
          dom.tspan({ x: x(delta), dy: '1.4em' }, student.first_name + ' ' + student.last_name),
          dom.tspan({ x: x(delta), dy: '1.4em', stroke: color(delta) }, (delta > 0) ? '+' + delta : delta),
          dom.tspan({ x: x(delta), dy: '1.4em' },  'Percentile: ' + percentile)
        );
      }, this));
      return dom.div({},
        this.renderTitleWithSummary({
          title: 'Performance compared to growth, last assessment',
          description: 'Percentile rank and change in percentile rank',
          dateRange: dateRange,
          students: students,
          assessments: assessments
        }),
        dom.div({},
          dom.svg( {width: width, height: height },
            dom.rect({
              x: 0,
              y: 0,
              width: width,
              height: height,
              stroke: '#eee',
              fill: 'none'
            }),
            dom.text({
              x: x(40),
              y: y(57),
              fontWeight: 'normal',
              fontSize: 10,
                opacity: 0.7,
              width: 100,
              height: 100,
              textAnchor: 'center',
              stroke: '#333'
            }, dom.tspan({ x: x(38), dy: '1.4em' }, 'Change in percentile rank')),
            horizontalTicks.map(function(percentile) {
              var opacity = isStudentSelected ? 0.7 : 0.3;
              var offset = percentile > 0 ? '-2.4em' : '1em';
               return dom.text({
                key: percentile,
                x: x(percentile),
                y: y(50),
                opacity: 0.7,
                fontWeight: 'normal',
                fontSize: 10,
                width: 100,
                height: 100,
                textAnchor: 'center',
                stroke: '#333'
              },
                dom.tspan({dx: offset, dy: '1.4em', opacity: opacity }, percentile + '%')
              );
            }, this),
            dom.text({
              x: x(1),
              y: y(100),
              fontWeight: 'normal',
              fontSize: 10,
              width: 100,
              height: 100,
              opacity: 0.7,
              textAnchor: 'center',
              stroke: '#333'
            }, dom.tspan({ x: x(-8), dy: '1.4em' }, 'Percentile Rank')),
            verticalTicks.map(function(percentile) {
              var opacity = isStudentSelected ? 0.7 : 0.3;
               return dom.text({
                key: percentile,
                x: x(1),
                y: y(percentile),
                fontWeight: 'normal',
                fontSize: 10,
                width: 100,
                height: 100,
                textAnchor: 'center',
                stroke: '#333'
              },
                dom.tspan({ x: x(1), dy: '1.4em', opacity: opacity }, percentile )
              );
            }, this),
            students.map(function(student) {
              var percentile = _.last(student.star_results).percentile_rank;
              var delta = this.resultsDelta(student);
              return dom.circle({
                key: student.id,
                cx: x(delta),
                cy: y(percentile),
                opacity: (this.isHoverStudent(student))
                  ? 1
                  : this.isHoverBackground(student) ? 0.02 : 0.75,
                r: 6,
                fill: color(delta),
                onMouseEnter: this.onStudentHover.bind(this, student),
                onMouseLeave: this.onStudentHover.bind(this, null)
              });
            }, this),
            // horizontal lines
            [25, 50, 75].map(function(percentile) {
              return dom.line({
                key: percentile,
                x1: 0,
                x2: width,
                y1: y(percentile),
                y2: y(percentile),
                stroke: (percentile === 50) ? '#ccc' : '#eee',
                strokeWidth: 1,
              });
            }),
            // vertical lines
            [-50, -25, 0, 25, 50].map(function(delta) {
              return dom.line({
                key: delta,
                x1: x(delta),
                x2: x(delta),
                y1: height,
                y2: 0,
                stroke: (delta === 0) ? '#666' : '#eee',
                strokeWidth: (delta === 0) ? 2 : 1
              });
            }),
            (_.isEmpty(this.state.hoverStudentIds)) ? null : hoverElements
          )
        )
      );
    },

    renderAllTimeQuartiles: function(options) {
      var width = options.width;
      var height = options.height;
      var minimumCount = 10; // don't show data points if less than n assessments during period

      var students = this.filteredStudents();
      var assessments = this.flattenedAssessments(students);

      // bucket by school quarters
      var anchorMoment = moment.utc('2000-09-01');
      var buckets = _.pairs(_.groupBy(assessments, function(result) {
        return this.quarterDate(new Date(result.date_taken)).getTime();
      }, this));

      var bucketWidth = width / (buckets.length - 1); // assumes dense

      var dateRange = d3.extent(buckets, function(bucket) {
        return new Date(parseFloat(bucket[0]));
      });
      var x = d3.time.scale().domain(dateRange).range([0, width]);
      var y = d3.scale.linear().domain([0, 100]).range([height, 0]);
      var color = d3.scale.linear().domain([0, 1, 8]).range(['white', 'white', 'green']);

      return dom.div({},
        this.renderTitleWithSummary({
          title: 'Group quartiles each period, all-time',
          description: 'Quartiles of percentile ranks each 3 months',
          dateRange: dateRange,
          students: students,
          assessments: assessments
        }),
        dom.div({},
          dom.svg( {width: width, height: height },
            dom.rect({
              x: 0,
              y: 0,
              width: width,
              height: height,
              stroke: '#eee',
              fill: 'none'
            }),
            // bubbles
            assessments.map(function(assessment) {
              return dom.circle({
                key: assessment.id,
                cx: x(new Date(assessment.date_taken)),
                cy: y(assessment.percentile_rank),
                opacity: (this.isHoverStudent(assessment.student))
                  ? 1
                  : this.isHoverBackground(assessment.student) ? 0.02 : 0.25,
                r: 4,
                fill: color(_.isNaN(assessment.student.grade) ? 0 : assessment.student.grade),
                onMouseEnter: this.onStudentHover.bind(this, assessment.student),
                onMouseLeave: this.onStudentHover.bind(this, null)
              })
            }, this),
            // ticks
            dom.g({}, buckets.map(function(bucket) {
              var scores = this.sortedScores(bucket[1]);
              var date = new Date(parseFloat(bucket[0]));
              var px = x(date);
              var tickLines = (bucket[1].length < minimumCount) ? [] : [
                this.drawLine(scores, bucket, bucketWidth, px, y(d3.quantile(scores, 0.25)), { key: 25 }),
                this.drawLine(scores, bucket, bucketWidth, px, y(d3.quantile(scores, 0.50)), { key: 50, height: 2, fill: '#666' }),
                this.drawLine(scores, bucket, bucketWidth, px, y(d3.quantile(scores, 0.75)), { key: 75 })
              ];
              return dom.g({ key: bucket[0] },
                dom.line({
                  x1: px,
                  x2: px,
                  y1: height,
                  y2: 0,
                  stroke: (date.getMonth() === 8) ? '#666' : '#eee',
                  strokeWidth: (date.getMonth() === 8) ? 2 : 1
                }),
                tickLines);
            }, this)),
            // trends
            dom.g({}, [0.25, 0.50, 0.75].map(function(p) {
              var sortedBuckets = _.sortBy(buckets, function(bucket) { return parseFloat(bucket[0]); });
              var quantiles = _.compact(sortedBuckets.map(function(bucket) {
                if (bucket[1].length < minimumCount) return null;
                return {
                  date: new Date(parseFloat(bucket[0])),
                  score: d3.quantile(this.sortedScores(bucket[1]), p)
                };
              }, this));
              var lineGenerator = d3.svg.line()
                .x(function(d) { return x(d.date) + bucketWidth/2; })
                .y(function(d) { return y(d.score); })
                .interpolate('monotone');

              return dom.path({
                key: p,
                d: lineGenerator(quantiles),
                stroke: 'orange',
                fill: 'none'
              });
            }, this))
          )
        )
      );
    },

    drawLine: function(scores, bucket, bucketWidth, px, py, options) {
      var tickWidth = 50;
      return dom.rect(merge({
        key: options.key,
        x: px - tickWidth/2 + bucketWidth/2,
        y: py,
        // onMouseEnter: function() {
        //   console.log(bucket, scores);
        //   console.log([0.25, 0.5, 0.75].map(d3.quantile.bind(d3, scores)));
        // },
        width: tickWidth,
        height: 1,
        fill: '#999'
      }, options));
    },

    clamp: function(domain, value) {
      return Math.min(Math.max(domain[0], value), domain[1]);
    },

    withSign: function(value) {
      return (value > 0) ? '+' + value : value;
    },

    renderDeltaHistogram: function(options) {
      var width = options.width;
      var height = options.height;

      var studentsWithDeltas = this.studentsWithRecentAssessments();
      var bucketSize = 5;
      var bucketDomain = [-40, 40];
      var buckets = _.pairs(_.groupBy(studentsWithDeltas, function(result) {
        return this.clamp(bucketDomain, Math.floor(result.delta / bucketSize) * bucketSize);
      }, this));
      var maxCount = d3.max(buckets, function(bucket) { return bucket[1].length; });
      var median = d3.median(_.pluck(studentsWithDeltas, 'delta')) || 0;

      var x = d3.time.scale().domain(bucketDomain).range([0, width]);
      var barHeight = d3.scale.linear().domain([0, maxCount]).range([0, height]);
      var barWidth = Math.ceil(width / ((x.domain()[1] - x.domain()[0]) / bucketSize));
      var color = d3.scale.linear().domain([-2, 0, 2]).range(['red','white','blue']);
      var ticks = _.range(bucketDomain[0] + bucketSize, bucketDomain[1] + bucketSize, bucketSize * 2);

      var assessments = _.flatten(_.pluck(studentsWithDeltas, 'star_results'));
      var dateRange = d3.extent(assessments, function(result) { return new Date(result.date_taken); });

      return dom.div({},
        this.renderTitleWithSummary({
          title: 'Group progress, since last assessment',
          description: 'Distribution of change in percentile rank',
          dateRange: dateRange,
          students: studentsWithDeltas,
          assessments: assessments
        }),
        dom.div({},
          dom.svg({width: width, height: height },
            dom.rect({
              x: 0,
              y: 0,
              width: width,
              height: height,
              stroke: '#eee',
              fill: 'none'
            }),
            buckets.map(function(bucket) {
              var percentileBucket = bucket[0];
              var count = bucket[1].length;
              return dom.rect({
                key: percentileBucket,
                x: x(percentileBucket),
                y: height - barHeight(count),
                width: barWidth,
                height: barHeight(count),
                fill: '#eee'
              });
            }, this),
            dom.line({ x1: x(median),
              y1: 0,
              x2: x(median),
              y2: height,
              style: {
                stroke: color(median),
                strokeWidth: 3
              }
            }),
            dom.line({
              x1: x(0),
              y1: 0,
              x2: x(0),
              y2: height,
              style: {
                stroke: '#666',
                strokeWidth: 1
              }
            }),
            dom.line({
              x1: 0,
              y1: height - 1,
              x2: width,
              y2: height - 1,
              style: {
                stroke: '#666',
                strokeWidth: 1
              }
            }),
            ticks.map(function(percentileBucket) {
              return dom.text({
                key: percentileBucket,
                x: x(percentileBucket),
                y: height - 6,
                fontSize: 10,
                fill: '#666',
                textAnchor: 'middle'
              }, this.withSign(percentileBucket));
            }, this)
          ),
          dom.div({ style: { textAlign: 'center', fontSize: styles.fontSize } }, 'Median change: ', this.withSign(median.toFixed(2)) + ' percentiles')
        )
      );
    }
  });

  window.shared.StarChartsPage = StarChartsPage;
});
