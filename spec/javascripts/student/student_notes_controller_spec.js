describe("StudentNotesController", function() {

  var helpers = {
    // Create a controller for test, with some defaults.
    createController: function(options) {
      var controller = new window.StudentNotesController(options || {
        $el: $('<div />'),
        studentNotes: []
      });
      controller.bindListeners();
      return controller;
    },

    extractFormParams: function($form) {
      return $form.serializeArray().reduce(function(params, pair) {
        params[pair.name] = pair.value;
        return params;
      }, {});
    }
  };

  it('renders "No student notes" when there are no student notes', function() {
    var $el = helpers.createController().render();
    expect($el.text()).toContain('No student notes.');
  });

  it('renders student notes correctly when there are student notes', function() {
    var $el = helpers.createController({
      $el: $('<div />'),
      studentNotes: [{
        content: 'Alejandra is doing great at algebra!',
        student_id: 2
      }]
    }).render();
    expect($el.text()).toContain('Alejandra is doing great at algebra!');
  });

  it('allows educator to fill out new student note form', function() {
    var $el = helpers.createController().render();
    $el.find('[name="student_note[content]"]').val('George is doing great in geometry!');
    $el.find('[name="student_note[student_id]"]').val(1);
    var form_params = helpers.extractFormParams($el.find('form'));
    expect(form_params).toEqual({
       'utf8': '✓',
       'student_note[content]': 'George is doing great in geometry!',
       'student_note[student_id]': '1'
    });
  });

  it('allows educator to create new student note', function () {
    // Setup controller and server fixture data
    var $el = helpers.createController().render();
    var serverResponse = {
      content: 'George is doing great in geometry!',
      student_id: 1
    };

    // No student notes before ajax:success trigger
    expect($('.student-note-content').length).toEqual(0);

    // Happy path!
    $el.find('form').trigger('ajax:success', serverResponse);
    expect($el.find('.student-note-content').length).toEqual(1);
    expect($el.html()).toContain('George is doing great in geometry!');
  });


    // onNewStudentNoteSaveFailed: function (e, data, status, xhr) {
    //   var $errorsEl = $(e.currentTarget).parent().find('.alert.errors');
    //   this.insertErrorMessages($errorsEl, xhr.responseJSON.errors);
    // },

  describe('#onNewStudentNoteSaveFailed', function() {

    it('displays errors if controller can\'t create new student note', function () {
      // Setup controller and server fixture data
      var controller = helpers.createController();
      var $el = controller.render();
      var form = $el.find('form');
      var xhr = {
        responseJSON: {
          errors: ["Content can't be blank"]
        }
      };
      var result = controller.onNewStudentNoteSaveFailed(form, null, null, xhr);
      expect(result).toEqual([ "Content can't be blank" ]);
    });
  });
});
