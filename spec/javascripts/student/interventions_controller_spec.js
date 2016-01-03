describe("InterventionsController", function() {

  // These function generate data for testing.
  var Factory = {
    string: function(prefix) {
      return prefix + ':' + Math.random().toString(36).substring(2);
    },
    integer: function() {
      return Math.round(Math.random() * (Math.pow(2, 32) - 1));
    },
    educator: function(options) {
      return _.defaults(options || {}, {
        id: Factory.integer(),
        email: Factory.string('email')
      });
    },
    interventionTypes: function() {
      return [
        { id: 4, name: 'After School Tutoring (ATP)' },
        { id: 6, name: 'Math Tutor' },
        { id: 7, name: 'Other' }    // for testing custom intervention feature
      ];
    },
    intervention: function(options) {
      return _.defaults(options || {}, {
        id: Factory.integer(),
        name: Factory.string('name'),
        comment: Factory.string('comment'),
        goal: Factory.string('goal'),
        start_date: 'December 1, 2015',
        end_date: 'December 31, 2015',
        educator_email: Factory.string('email') + '@domain.com',
        progress_notes: [Factory.progressNote()]
      });
    },
    progressNote: function(options) {
      return _.defaults(options || {}, {
        id: Factory.integer(),
        educator_email: Factory.string('educator'),
        content: Factory.string('content'),
        created_date: 'December 1, 2015 3:39 PM'
      });
    }
  };


  // These functions perform setup or assertions for the tests below.
  var helpers = {
    // Create a controller for test, with some defaults.
    createController: function(options) {
      var controller = new window.InterventionsController(_.defaults(options || {}, {
        $el: $('<div />'),
        educators: [],
        interventionTypes: Factory.interventionTypes(),
        educatorId: 42,
        studentId: 17,
        interventions: []
      }));
      controller.bindListeners();
      return controller;
    },
    findInterventionNames: function($el) {
      return $el.find('.intervention-cell strong').toArray().map(function(el) {
        return $(el).text().trim();
      });
    },
    findSelectedInterventionName: function($el) {
      return $el.find('.intervention-cell.activated strong').text();
    },
    findProgressNotes: function($el) {
      return $el.find('.progress-note');
    },
    // Pull out the parameters that will be submitted with a form and
    // merge them into an object.
    extractFormParams: function($form) {
      return $form.serializeArray().reduce(function(params, pair) {
        params[pair.name] = pair.value;
        return params;
      }, {});
    },
    expectInterventionDetailsFor: function($el, intervention) {
      var detailText = $el.find('.intervention-detail').text();
      expect(detailText).toContain(intervention.name);
      expect(detailText).toContain(intervention.comment);
      expect(detailText).toContain(intervention.goal);
    },
    expectProgressNotes: function($el, progressNotes) {
      expect(helpers.findProgressNotes($el).length).toEqual(progressNotes.length);
      var progressNotesText = $el.find('.progress-notes-list').text();
      progressNotes.forEach(function(progressNote) {
        expect(progressNotesText).toContain(progressNote.content);
      });
    }
  };

  describe('interventions list', function() {
    it('happy path', function() {
      var interventions = [
        Factory.intervention({ name: 'intervention_one' }),
        Factory.intervention({ name: 'intervention_two' })
      ];
      var $el = helpers.createController({ interventions: interventions }).render();
      expect(helpers.findInterventionNames($el)).toEqual([
        'intervention_one',
        'intervention_two'
      ]);
      helpers.expectInterventionDetailsFor($el, _.first(interventions));
      helpers.expectProgressNotes($el, _.first(interventions).progress_notes);
    });

    it('renders when no interventions', function() {
      var $el = helpers.createController({ interventions: [] }).render();
      expect(helpers.findInterventionNames($el)).toEqual([]);
      expect($el.text()).toContain('No interventions.')
    });

    it('shows intervention details when clicked, including progress notes', function() {
      var interventions = [
        Factory.intervention({ name: 'intervention_one' }),
        Factory.intervention({ name: 'intervention_two' })
      ];
      var $el = helpers.createController({ interventions: interventions }).render();
      $el.find('.intervention-cell:last').click();
      expect(helpers.findSelectedInterventionName($el)).toEqual('intervention_two');
      helpers.expectInterventionDetailsFor($el, _.last(interventions));
      helpers.expectProgressNotes($el, _.last(interventions).progress_notes);
    });

    it('allows adding new progress notes', function() {
      var intervention = Factory.intervention({ id: 201, name: 'intervention_one' });
      var $el = helpers.createController({
        interventions: [intervention],
        educators: [
          Factory.educator({ id: 42 }),
          Factory.educator({ id: 55,  }),
        ]
      }).render();
      $el.find('.add-progress-note').click();
      $el.find('[name="progress_note[content]"]').val('new_content');
      $el.find('[name="progress_note[educator_id]"]').val(55);

      // not sure yet how to mock jquery-ujs form submit, so for now just verifying form
      expect(helpers.extractFormParams($el.find('form'))).toEqual({
        'utf8': '✓',
        'progress_note[content]': 'new_content',
        'progress_note[educator_id]': '55',
        'progress_note[intervention_id]': '201'
      });
      var serverResponse = Factory.progressNote({ content: 'new_content' });
      $el.find('form').trigger('ajax:success', serverResponse);

      expect(helpers.findProgressNotes($el).length).toEqual(2);
      expect($el.text()).toContain('new_content');
      expect($el.find('form').length).toEqual(0);
    });

    it('allows adding new interventions', function() {
      var controller = helpers.createController({ interventions: [] });
      var $el = controller.render();
      $el.find('.add-new-intervention').click();
      $el.find('[name="intervention[intervention_type_id]"]').val(6);
      $el.find('[name="intervention[comment]"]').val('new_intervention_comment');
      $el.find('[name="intervention[goal]"]').val('new_goal');
      $el.find('[name="intervention[end_date]"]').val('2015-12-19');

      // not sure yet how to mock jquery-ujs, so verifying serializing and triggering
      // ajax success event manually.
      expect(helpers.extractFormParams($el.find('form'))).toEqual({
        'utf8': '✓',
        'intervention[intervention_type_id]': '6',
        'intervention[comment]': 'new_intervention_comment',
        'intervention[goal]': 'new_goal',
        'intervention[end_date]': '2015-12-19',
        'intervention[educator_id]': '42',
        'intervention[student_id]': '17'
      });
      var serverResponse = Factory.intervention({ name: 'Math Tutor' });
      $el.find('form').trigger('ajax:success', serverResponse);

      expect(helpers.findInterventionNames($el)).toEqual(['Math Tutor']);
      expect($el.find('form').length).toEqual(0);
    });

    xit('allows adding intervention with a custom intervention name', function() {
      var controller = helpers.createController();
      var $el = controller.render();
      $el.find('.add-new-intervention').click();

      $el.find('option[data-name="Other"]').prop('selected', 'selected');
      $el.find('[name="intervention[intervention_type_id]"]').trigger('change');

      expect($el.text()).toContain('Custom intervention name');
      expect($el.html()).toContain('intervention[custom_intervention_name]');
    });

    describe('educator clicks delete intervention', function() {

      beforeEach(function() {
        var interventions = [Factory.intervention({ name: 'intervention_one' })];
        this.controller = helpers.createController({ interventions: interventions });
        this.intervention_id = this.controller.interventions[0].id;

        this.controller.bindListeners();
        this.$el = this.controller.render();
        spyOn(this.controller, 'deleteIntervention');
      });

      describe('confirms deletion', function() {
        beforeEach(function () { spyOn(window, 'confirm').and.returnValue(true); });

        it('calls deleteIntervention with the appropriate intervention id', function() {
          this.$el.find('.intervention-delete-button').click();
          expect(this.controller.deleteIntervention).toHaveBeenCalledWith(this.intervention_id);
        });
      });

      describe('cancels', function() {
        beforeEach(function () { spyOn(window, 'confirm').and.returnValue(false); });

        it('does not call deleteIntervention', function() {
          this.$el.find('.intervention-delete-button').click();
          expect(this.controller.deleteIntervention).not.toHaveBeenCalled();
        });
      });

    });

    describe('#deleteIntervention', function () {

      describe("success", function() {

        beforeEach(function() {
          this.intervention = Factory.intervention({ name: 'delete-me' });
          this.controller = helpers.createController({ interventions: [this.intervention] });
          spyOn(this.controller, 'removeDeletedIntervention').and.returnValue(function () { return true; });
        });

        it('sends the correct arguments to the AJAX call', function () {
          this.ajax = spyOn($, 'ajax');

          this.controller.deleteIntervention(this.intervention.id);

          this.request_args = $.ajax.calls.mostRecent()['args'][0];
          expect(this.request_args['url']).toEqual('/interventions/' + this.intervention.id);
          expect(this.request_args['type']).toEqual('DELETE');
          expect(this.request_args['data']).toEqual({ 'intervention' : { 'id' : String(this.intervention.id) }});
          expect(this.ajax).toHaveBeenCalledWith(this.request_args);
        });

        it('calls removeDeletedIntervention with the correct id', function () {
          this.ajax = spyOn($, "ajax").and.callFake(function(e) { e.success(); });

          this.controller.deleteIntervention(this.intervention.id);

          expect(this.controller.removeDeletedIntervention).toHaveBeenCalledWith(this.intervention.id);
        });
      });
    });

    describe('#removeDeletedIntervention', function () {
      it('removes the correct intervention and re-renders', function () {
        var intervention = Factory.intervention({ name: 'delete-me' });
        var controller = helpers.createController({ interventions: [intervention] });
        spyOn(controller, 'render');

        controller.removeDeletedIntervention(intervention.id);

        expect(controller.interventions).toEqual([]);
        expect(controller.render).toHaveBeenCalled();
      });
    });
  });
});
