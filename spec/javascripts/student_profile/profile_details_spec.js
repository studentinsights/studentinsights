describe('ProfileDetails', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var ProfileDetails = window.shared.ProfileDetails;
  var SpecSugar = window.shared.SpecSugar;

  var helpers = {
    renderInto: function(el, props) {
      var mergedProps = merge({
        student: {
          first_name: 'Test'
        },
        attendanceData: {
          absences: [{id: 991, occurred_at: "2016-02-21T18:35:03.757Z"}],
          tardies: [{id: 998, occurred_at: "2014-01-01T14:35:03.750Z"}],
          discipline_incidents: [{id: 9912, occurred_at: "2012-01-10T14:35Z"}]
        },
        chartData: {
          mcas_series_ela_scaled: [[2015, 2, 18, 63]],
          mcas_series_math_scaled: [[2014, 9, 18, 23]],
          star_series_reading_percentile: [[2016, 1, 18, 83]],
          star_series_math_percentile: [[2012, 11, 18, 43]],
        },
        feed: {
          deprecated: {
            interventions: [{id: 997, start_date_timestamp: "2010-10-1"}],
            notes: [{id: 945, created_at_timestamp: "2013-02-11T14:41:52.857Z"}]
          },
          event_notes: [{id: 992, recorded_at: "2010-10-17T00:00:00.000Z"}],
          services: {
            active: [{id: 996, date_started: "2010-02-09", service_type_id: 508}],
            discontinued: [{id: 945, date_started: "2010-10-08"}]
          }
        },
        dibels: [{id: 901, date_taken: "2012-05-15Z", performance_level: "Strategic"}],
        serviceTypesIndex: {
          "508": {name: "Math intervention", id: 508}
        }
      }, props || {});
      return ReactDOM.render(createEl(ProfileDetails, mergedProps), el);
    }
  };

  SpecSugar.withTestEl('', function() {
    it('renders everything in the right location', function() {
      var el = this.testEl;
      helpers.renderInto(el);

      // Is header here?
      expect("#full-case-history").toExist();
      // Are all the school years represented?
      _.each([2009, 2010, 2011, 2012, 2013, 2014, 2015], function(year){
        expect("#school-year-starting-" + year).toExist();
      });

      expect("#school-year-starting-2015 > #Absence-991").toExist();
      expect("#school-year-starting-2013 > #Tardy-998").toExist();
      expect("#school-year-starting-2011 > #Incident-9912").toExist();

      expect("#school-year-starting-2014 > #MCAS-ELA-02-18").toExist();
      expect("#school-year-starting-2014 > #MCAS-Math-09-18").toExist();
      expect("#school-year-starting-2015 > #STAR-Reading-01-18").toExist();
      expect("#school-year-starting-2012 > #STAR-Math-11-18").toExist();

      expect("#school-year-starting-2010 > #Note-997").toExist();
      expect("#school-year-starting-2012 > #Note-945").toExist();
      expect("#school-year-starting-2010 > #Note-992").toExist();
      expect("#school-year-starting-2009 > #Service-996").toExist();
      expect("#school-year-starting-2010 > #Service-945").toExist();

      expect("#school-year-starting-2011 > #DIBELS-901").toExist();
    });
  });
});