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

});
