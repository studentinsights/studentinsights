$(function() {

  window.room_id = parseInt($("#init-room-id").attr("data-room-id"))

  // Select room
  $('#homeroom-select').change(function() {
      var val = $("#homeroom-select option:selected").text()
      window.location.href = "/students?room=" + val
  });

});