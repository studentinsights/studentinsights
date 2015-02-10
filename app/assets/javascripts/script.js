$(function() {

  window.room_id = parseInt($("#init-room-id").attr("data-room-id"))

  // Select room
  $('#homeroom-select').change(function() {
      var val = $("#homeroom-select option:selected").text()
      window.location.href = "/home?room=" + val
  });

  // Tabbing
  $(".tab-toggle").click(function() {
    var this_toggle = $(this)
    var type = this_toggle.attr("data-type")
    var index = this_toggle.attr("data-index")
    var this_list = this_toggle.parent()
    this_list.children("li").removeClass("activetab").addClass("hidden")
    this_toggle.addClass("activetab").removeClass("hidden")

    $(".tab[data-index='" + index + "']").hide()
    $(".tab[data-type='" + type + "'][data-index='" + index + "']").show()
  });

});