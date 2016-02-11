(function() {
  window.shared || (window.shared = {});

  var Api = window.shared.Api = function() {};
  Api.prototype = {
    saveNotes: function(studentId, eventNoteParams) {
      var url = '/students/' + studentId + '/event_note.json';
      var body = {
        event_note: {
          event_note_type_id: eventNoteParams.eventNoteTypeId,
          text: eventNoteParams.text,
          student_id: studentId
        }
      };
      return this._post(url, body);
    },
    _post: function(url, body) {
      return $.ajax({
        url: url,
        method: 'POST',
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json',
        data: JSON.stringify(body)
      });
    }
  };
})();