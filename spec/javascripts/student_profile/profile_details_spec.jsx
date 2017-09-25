import _ from 'lodash';
import SpecSugar from '../support/spec_sugar.jsx';

describe('ProfileDetails', function() {
  const merge = window.shared.ReactHelpers.merge;
  const ReactDOM = window.ReactDOM;
  const ProfileDetails = window.shared.ProfileDetails;

  const helpers = {
    renderInto: function(el, props) {
      const mergedProps = merge({
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
        iepDocuments: [],
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
      ReactDOM.render(<ProfileDetails {...mergedProps} />, el);
    }
  };

  SpecSugar.withTestEl('', function() {
    it('renders everything in the right location', function() {
      const el = this.testEl;
      helpers.renderInto(el);

      // Is header here?
      expect($(el).find("#full-case-history").length).toEqual(1);
      // Are all the school years represented?
      _.each([2009, 2010, 2011, 2012, 2013, 2014, 2015], function(year){
        expect($(el).find("#school-year-starting-" + year).length).toEqual(1);
      });

      expect($("#school-year-starting-2015 > #Absence-991", el).text()).toEqual(
        'February 21st, 2016:Absence'
      );

      expect($("#school-year-starting-2013 > #Tardy-998", el).text()).toEqual(
        'January 1st, 2014:Tardy'
      );

      expect($("#school-year-starting-2011 > #Incident-9912", el).text()).toEqual(
        'January 10th, 2012:Incidentundefined in the undefined'   // We could make this better
      );

      expect($("#school-year-starting-2014 > #MCAS-ELA-02-18", el).text()).toEqual(
        'February 18th, 2015:MCAS ELATest scored a 63 on the ELA section of the MCAS.'
      );

      expect($("#school-year-starting-2014 > #MCAS-Math-09-18", el).text()).toEqual(
        'September 18th, 2014:MCAS MathTest scored a 23 on the Math section of the MCAS.'
      );

      expect($("#school-year-starting-2015 > #STAR-Reading-01-18", el).text()).toEqual(
        'January 18th, 2016:STAR ReadingTest scored in the 83th percentile on the Reading section of STAR.'
      );

      expect($("#school-year-starting-2012 > #STAR-Math-11-18", el).text()).toEqual(
        'November 18th, 2012:STAR MathTest scored in the 43th percentile on the Math section of STAR.'
      );

      expect($("#school-year-starting-2010 > #Note-997", el).text()).toEqual(
        'October 1st, 2010:Noteundefined(Goal: undefined)'    // We could make this better
      );

      expect($("#school-year-starting-2012 > #Note-945", el).text()).toEqual(
        'February 11th, 2013:Note'
      );

      expect($("#school-year-starting-2010 > #Note-992", el).text()).toEqual(
        'October 17th, 2010:Note'
      );

      expect($("#school-year-starting-2009 > #Service-996", el).text()).toEqual(
        'February 9th, 2010:ServiceMath intervention'
      );

      expect($("#school-year-starting-2010 > #Service-945", el).text()).toEqual(
        'October 8th, 2010:ServiceDescription not found for code: undefined'    // We could make this better
      );

      expect($("#school-year-starting-2011 > #DIBELS-901", el).text()).toEqual(
        'May 15th, 2012:DIBELSTest scored STRATEGIC in DIBELS.'
      );

    });
  });
});
