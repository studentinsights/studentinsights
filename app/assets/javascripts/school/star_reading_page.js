$(function() {

  if ($('body').hasClass('schools') && $('body').hasClass('star_reading')) {

    var SlicePanels = window.shared.SlicePanels;
    var Routes = window.shared.Routes;
    var styles = window.shared.styles;
    var colors = window.shared.colors;
    var dom = window.shared.ReactHelpers.dom;
    var createEl = window.shared.ReactHelpers.createEl;
    var merge = window.shared.ReactHelpers.merge;

    // page
    var StarReadingOverviewPage = React.createClass({
      displayName: 'StarReadingOverviewPage',

      getDefaultProps: function() {
        return {
          studentLimit: 12
        };
      },

      getInitialState: function() {
        return {
          filters: [],
          hoverStudentIds: [],
          hoverText: null
        };
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
          scores: _.compact(_.pluck(student.star_reading_results, 'percentile_rank')).join(', ')
        };
        this.setState({
          hoverStudentIds: [student.id],
          hoverText: JSON.stringify(hover, null, 2)
        });
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

      filteredStudents: function() {
        return this.state.filters.reduce(function(filteredStudents, filter) {
          return filteredStudents.filter(filter.filterFn);
        }, this.props.students);
      },

      studentsWithRecentAssessments: function() {
        return _.compact(this.filteredStudents().map(function(student) {
          var januaryResult = _.find(student.star_reading_results, function(result) {
            var date = new Date(result.date_taken).getTime();
            var start = new Date('2015-12-01T00:00:00.000Z').getTime();
            var end = new Date('2016-02-01T00:00:00.000Z').getTime();
            return date > start && date < end && result.percentile_rank;
          });

          var octoberResult = _.find(student.star_reading_results, function(result) {
            var date = new Date(result.date_taken).getTime();
            var start = new Date('2015-09-01T00:00:00.000Z').getTime();
            var end = new Date('2015-11-01T00:00:00.000Z').getTime();
            return date > start && date < end && result.percentile_rank;
          });

          if (!januaryResult || !octoberResult) return null;
          var delta = januaryResult.percentile_rank - octoberResult.percentile_rank;
          return merge(student, {
            star_reading_results: [octoberResult, januaryResult],
            delta: delta
          });
        }));
      },

      flattenedAssessments: function(students) {
        return _.flatten(students || this.filteredStudents().map(function(student) {
          var studentFields = _.omit(student, 'star_reading_results');
          return student.star_reading_results.filter(function(result) {
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
        return dom.div({ style: { padding: 10 } },
          dom.div({ className: 'header', style: styles.header }, createEl(SlicePanels, {
            allStudents: this.props.students,
            students: this.filteredStudents(),
            InterventionTypes: this.props.InterventionTypes,
            filters: this.state.filters,
            onFilterToggled: this.onFilterToggled
          })),
          dom.div({ style: { position: 'relative' } },
            dom.div({ style: { flex: 1 } },
              dom.div({ style: { display: 'flex', justifyContent: 'space-around', padding: 20 } },
                dom.div({ style: { width: 650 } }, this.renderAllTimeStarTrends(merge(sizing, { width: 320 }))),
                dom.div({ style: { width: 450 } }, this.renderRecentStarChanges(merge(sizing, { width: 180 }))),
                dom.div({ style: { width: 300 } }, this.renderDeltaHistogram(sizing))
                // dom.div({ style: { display: 'flex', flexDirection: 'column' } },
                //   this.renderRecentStarChanges(sizing),
                //   this.renderDeltaHistogram(sizing)
                // )
              ),
              this.renderHeatmap(),
              this.renderColoredGrades()
            ),
            dom.pre({
              style: {
                display: (this.state.hoverText === null) ? 'none' : 'block',
                position: 'absolute',
                top: 450,
                left: '45%',
                background: '#ffc',
                opacity: 0.95,
                padding: 20,
                border: '1px solid #ccc'
              }
            }, this.state.hoverText)
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
          dom.div({}, dateRangeText),
          dom.div({},
            dom.span({}, 'Students: ', props.students.length),
            dom.span({ style: { paddingLeft: 10 }}, 'Data points: ', (props.assessments || []).length)));
      },

      resultsDelta: function(student) {
        var results = student.star_reading_results.filter(function(result) { return result.percentile_rank != null; });
        if (results.length < 2) return 0;
        return _.last(results).percentile_rank - _.first(results).percentile_rank;
      },

      greatestChanges: function(students, color) {
        return dom.div({ style: { paddingLeft: 5, fontSize: styles.fontSize } },
          // dom.div({ style: { paddingBottom: 10 } }, 'Greatest changes:'),
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
                dom.td({}, + _.last(student.star_reading_results).percentile_rank),
                dom.td({}, dom.a({ style: { fontSize: styles.fontSize }, href: Routes.student(student.id) }, student.first_name + ' ' + student.last_name)),
                dom.td({}, student.grade),
                dom.td({}, dom.a({ href: Routes.homeroom(student.homeroom_id) }, student.homeroom_id))
              );
            }, this))
          )
        );
      },

      renderRecentStarChanges: function(options) {
        var students = this.studentsWithRecentAssessments();
        var assessments = _.flatten(_.pluck(students, 'star_reading_results'));
        return this.renderLineChartWithTable('Recent changes', students, assessments, options);
      },

      renderLineChartWithTable: function(title, students, assessments, options) {
        var width = options.width;
        var height = options.height;

        var dateRange = d3.extent(assessments, function(d) { return new Date(d.date_taken); });
        var x = d3.time.scale().domain(dateRange).range([0, width]);
        var y = d3.scale.linear().domain([0, 100]).range([height, 0]);
        var color = d3.scale.linear().domain([-50, 0, 50]).range(['red','#eee','blue']);
        var thickness = d3.scale.linear().domain([-50, 0, 50]).range([3, 0, 3]);

        var lineGenerator = d3.svg.line()
          .x(function(d) { return x(new Date(d.date_taken)); })
          .y(function(d) { return y(d.percentile_rank); })
          .interpolate('monotone');

        return dom.div({},
          this.renderTitleWithSummary({
            title: title,
            dateRange: d3.extent(assessments, function(result) { return new Date(result.date_taken); }),
            students: students,
            assessments: assessments
          }),
          dom.div({ style: { display: 'flex' } },
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
                students.map(function(student) {
                  var results = student.star_reading_results.filter(function(result) { return result.percentile_rank != null; });
                  return dom.g({ key: student.id },
                    dom.path({
                      stroke: (this.isHoverStudent(student))
                        ? color.domain([-10, 0, 10])(this.resultsDelta(student))
                        : color(this.resultsDelta(student)),
                      strokeWidth: (this.isHoverStudent(student))
                        ? 2
                        : thickness(this.allTimeRange(student)),
                      opacity: this.isHoverBackground(student) ? 0.05 : 1,
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
        // largest range in scores all-time
        // var extent = d3.extent(filteredResults(student), function(d) { return d.percentile_rank });
        // return extent[1] - extent[0];

        // largest change all-time
        var scores = _.pluck(this.filteredResults(student), 'percentile_rank');
        return _.last(scores) - _.first(scores);

        // alternately, largest single step
        // var results = filteredResults(student);
        // var largestStep = 0;
        // var lastValue = null;
        // for (var i = 0; i < results.length; i++) {
        //   var value = results[i].percentile_rank;
        //   if (lastValue) {
        //     var step = value - lastValue;
        //     if (step > largestStep) largestStep = step;
        //   }
        //   lastValue = value;
        // }
        // return largestStep;
      },

      filteredResults: function(student) {
        return student.star_reading_results.filter(function(result) { return result.percentile_rank != null; });
      },

      renderAllTimeStarTrends: function(options) {
        var width = options.width;
        var height = options.height;

        var filteredStudents = this.filteredStudents().filter(function(student) { return student.star_reading_results.length > 0; });
        var students = _.sortBy(filteredStudents, this.allTimeRange);
        var assessments = _.flatten(students.map(function(student) {
          return student.star_reading_results;
        }));

        return this.renderLineChartWithTable('All-time scores', students, assessments, options);



        var dateRange = d3.extent(assessments, function(d) { return new Date(d.date_taken); });
        var x = d3.time.scale().domain(dateRange).range([0, width]);
        var y = d3.scale.linear().domain([0, 100]).range([height, 0]);
        var color = d3.scale.linear().domain([-50, 0, 50]).range(['red','white','blue']);
        var thickness = d3.scale.linear().domain([-50, 0, 50]).range([3, 0, 3]);

        var lineGenerator = d3.svg.line()
          .x(function(d) { return x(new Date(d.date_taken)); })
          .y(function(d) { return y(d.percentile_rank); })
          .interpolate('basis');

        return dom.div({},
          this.renderTitleWithSummary({
            title: 'All-time scores',
            dateRange: dateRange,
            students: students,
            assessments: assessments
          }),
          dom.div({ style: { display: 'flex' } },
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
                students.map(function(student) {
                  var results = this.filteredResults(student);
                  if (results.length === 0) return null;
                  return dom.path({
                    key: student.id,
                    stroke: color(this.allTimeRange(student)),
                    strokeWidth: thickness(this.allTimeRange(student)),
                    fill: 'none',
                    d: lineGenerator(results),
                    onMouseEnter: this.onStudentHover.bind(this, student),
                    onMouseLeave: this.onStudentHover.bind(this, null)
                  })
                }, this)
              )
            ),
            this.greatestChanges(students, color)
          )
        );
      },

      renderColoredGrades: function() {
        // keep student record for tracking back
        var assessments = this.flattenedAssessments();

        var width = 400;
        var height = 400;

        var dateRange = d3.extent(assessments, function(d) { return new Date(d.date_taken); });
        var x = d3.time.scale().domain(dateRange).range([0, width]);
        var y = d3.scale.linear().domain([0, 100]).range([height, 0]);
        var color = d3.scale.linear().domain([0, 1, 8]).range(['white', 'white', 'green']);

        return dom.div({},
          this.renderTitle('All-time STAR math scores, color shows grade'),
          dom.div({}, 'Assessments: ', assessments.length),
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
              assessments.map(function(assessment) {
                return dom.circle({
                  key: assessment.id,
                  cx: x(new Date(assessment.date_taken)),
                  cy: y(assessment.percentile_rank),
                  r: 2,
                  fill: color(_.isNaN(assessment.student.grade) ? 0 : assessment.student.grade),
                  onMouseEnter: this.onStudentHover.bind(this, assessment.student),
                  onMouseLeave: this.onStudentHover.bind(this, null)
                })
              }, this)
            )
          )
        );
      },

      renderHeatmap: function() {
        var assessments = _.flatten(this.filteredStudents().map(function(student) {
          return student.star_reading_results.filter(function(result) {
            return result.percentile_rank != null;
          });
        }));

        var bucketSize = 10;
        var dateBucketSize = 1000 * 60 * 60 * 24 * 7;
        var buckets = _.pairs(_.groupBy(assessments, function(result) {
          return [
            Math.floor(new Date(result.date_taken).getTime() / dateBucketSize),
            Math.floor(result.percentile_rank / bucketSize)
          ].join(':');
        }));

        var width = 400;
        var height = 400;

        var dateRange = d3.extent(assessments, function(d) { return new Date(d.date_taken); });
        var x = d3.time.scale().domain(dateRange).range([0, width]);
        var y = d3.scale.linear().domain([0, 100 / bucketSize]).range([height, 0]);
        var color = d3.scale.linear().domain([0, 50]).range(['white', 'red']);

        return dom.div({},
          this.renderTitle('All-time STAR math scores, heatmap'),
          dom.div({}, 'Assessments: ', assessments.length),
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
              buckets.map(function(bucket) {
                var slots = bucket[0].split(':');
                var dateBucket = new Date(slots[0] * dateBucketSize);
                var percentileBucket = slots[1];
                return dom.rect({
                  key: bucket[0],
                  x: x(dateBucket),
                  y: y(percentileBucket),
                  width: Math.max(width / dateBucketSize, 5),
                  height: height / bucketSize,
                  fill: color(bucket[1].length)
                })
              }, this)
            )
          )
        );
      },

      mean: function(values) {
        return _.sum(values) / values.length;
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
        var mean = this.mean(_.pluck(studentsWithDeltas, 'delta'));

        var x = d3.time.scale().domain(bucketDomain).range([0, width]);
        var barHeight = d3.scale.linear().domain([0, maxCount]).range([0, height]);
        var barWidth = Math.ceil(width / ((x.domain()[1] - x.domain()[0]) / bucketSize));
        var color = d3.scale.linear().domain([-2, 0, 2]).range(['red','white','blue']);
        var ticks = _.range(bucketDomain[0] + bucketSize, bucketDomain[1] + bucketSize, bucketSize * 2);

        var assessments = _.flatten(_.pluck(studentsWithDeltas, 'star_reading_results'));
        var dateRange = d3.extent(assessments, function(result) { return new Date(result.date_taken); });

        return dom.div({},
          this.renderTitleWithSummary({
            title: 'Recent change overall',
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
              dom.line({ x1: x(mean),
                y1: 0,
                x2: x(mean),
                y2: height,
                style: {
                  stroke: color(mean),
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
            dom.div({ style: { textAlign: 'center', fontSize: styles.fontSize } }, 'Mean change: ', this.withSign(mean.toFixed(2)) + ' percentiles')
          )
        );
      }
    });



    function main() {
      var serializedData = $('#serialized-data').data();
      window.serializedData = serializedData;

      // index by intervention type id
      var InterventionTypes = serializedData.interventionTypes.reduce(function(map, interventionType) {
        map[interventionType.id] = interventionType;
        return map;
      }, {});

      ReactDOM.render(createEl(StarReadingOverviewPage, {
        students: serializedData.studentsWithStarReading,
        InterventionTypes: InterventionTypes
      }), document.getElementById('main'));
    }

    main();
  }
});
