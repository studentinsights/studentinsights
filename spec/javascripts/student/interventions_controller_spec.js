describe("InterventionsController", function() {
  var helpers = {
    testController: function(options) {
      return new window.InterventionsController(_.defaults(options || {}, {
        $el: $('<div />'),
        interventions: [],
        templates: {
          main: 'dummy',
          interventionCell: 'dummy',
          interventionDetails: 'dummy',
          newInterventionForm: 'dummy',
          progressNote: 'dummy',
          newProgressNote: 'dummy',
          errors: 'dummy'
        }
      }));
    },
    interventionsListText: function($el) {
      return $el.find('.intervention-cell').toArray().map(function(el) {
        return $(el).text().replace(/\s+/g, ' ');
      });
    }
  }

  describe('interventions list', function() {
    it('renders with echo templates', function() {
      var interventionsController = helpers.testController();
      interventionsController.render();
      // expect(helpers.interventionsListText(interventionsController)).toEqual([]);
    });
  });
});
