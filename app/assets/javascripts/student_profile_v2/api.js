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

    saveService: function(studentId, serviceParams) {
      var url = '/students/' + studentId + '/service.json';
      var body = {
        service: {
          service_type_id: serviceParams.serviceTypeId,
          date_started: serviceParams.momentStarted.format('YYYY-MM-DD'),
          provided_by_educator_id: serviceParams.providedByEducatorId,
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