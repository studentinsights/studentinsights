(function(root) {

  var NotesController = function (options) {
    this.initialize(options);
  };

  _.extend(NotesController.prototype, {
    // Expects: {
    //   $el
    //  }
    // Optional: {datepickerOptions}
    initialize: function (options) {
      this.options = options;
      this.$el = this.options.$el;

      // state
      this.studentId = this.options.studentId;
      this.studentNotes = this.options.studentNotes;
    },

    onNewStudentNoteSaveSucceeded: function (e, data, status, xhr) {
      this.studentNotes = [data].concat(this.studentNotes);
      this.render();
    },

    // This inserts the errors into the form to preserve the DOM state on the form,
    // rather than doing a full render that would lose that.
    insertErrorMessages: function($targetEl, errors) {
      var html = this.renderTemplate('errors', { errors: errors });
      $targetEl.html(html);
    },

    onNewStudentNoteSaveFailed: function (e, data, status, xhr) {
      var $errorsEl = $(e.currentTarget).parent().find('.alert.errors');
      this.insertErrorMessages($errorsEl, xhr.responseJSON.errors);
    },

    // This binds event listeners for user actions, and for events fired by the jquery-ujs
    // Rails code that is adding behavior to HTML generated with `form_for` server rendering.
    bindListeners: function () {
      this.$el.on('ajax:success',
        '.new-student-note-form',
        this.onNewStudentNoteSaveSucceeded.bind(this)
      );
      this.$el.on('ajax:error',
        '.new-student-note-form',
        this.onNewStudentNoteSaveFailed.bind(this)
      );
    },

    // This pulls of compiled Handlebars templates off the window object (the handlebars_assets gem
    // compiles them as part of the asset pipeline and puts them there), and then renders them.
    // This controller class keeps all the template pieces it needs in a single template file
    // (to keep them colocated for development), and this method only calls the piece that's
    // requested.
    renderTemplate: function (templatePiece, data) {
      var templateData = {}
      templateData[templatePiece] = data;
      return window.HandlebarsTemplates['student_notes_controller_templates'](templateData);
    },

    renderStudentNotesList: function () {
      var self = this;
      if (this.studentNotes.length === 0) return '<div class="zero-student-notes">No student notes.</div>';
      return this.studentNotes.map(function(note) {
        return self.renderTemplate('studentNote', note);
      });
    },

    render: function () {
      this.$el.html(this.renderTemplate('main', { studentId: this.studentId }));
      this.$el.find('#student-notes-list').html(this.renderStudentNotesList());
    }

  });

  root.NotesController = NotesController;

})(window)
