(function() {
  window.shared || (window.shared = {});

  var Api = window.shared.Api = function() {};
  Api.prototype = {
    saveNotes: function(studentId, eventNoteParams) {
      var url = '/students/' + studentId + '/event_note.json';
      return $.ajax({
        url: url,
        method: 'POST',
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json',
        data: JSON.stringify({
          event_note: {
            event_note_type_id: eventNoteParams.eventNoteTypeId,
            text: eventNoteParams.text,
            student_id: studentId
          }
        })
      });
    }
  };
})();