(function() {
  window.shared || (window.shared = {});

  var Api = window.shared.Api = function() {};
  Api.prototype = {
    saveNotes: function(studentId, eventNoteParams) {
      var url = '/students/' + studentId + '/event_note';
      return $.ajax({
        url: url,
        method: 'post',
        data: eventNoteParams
      });
    }
  };
})();