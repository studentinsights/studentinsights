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

  xit('allows the educator to add a new student note', function() {
  });

});
