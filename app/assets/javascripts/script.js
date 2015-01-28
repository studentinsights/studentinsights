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
    this_list.children("li").removeClass("activetab")
    this_toggle.addClass("activetab")

    $(".tab[data-index='" + index + "']").hide()
    $(".tab[data-type='" + type + "'][data-index='" + index + "']").show()
  });

  // Init tabs
  $(".tab[data-type='mcas']").hide()

  // Highlight risk factors red
  $(".risk-factor").each(function() {

    this_cell = $(this)

    if (this_cell.attr("id") === "limited-english") {

      if (this_cell.text() === "Limited" || this_cell.text() === "Formerly Limited") {
        this_cell.attr("style", "color: red;")
      }
        
    } else if (this_cell.attr("id") === "low-income" || this_cell.attr("id") === "sped") {

      if (this_cell.text() === "Yes") {
        this_cell.attr("style", "color: red;")
      }
    } else if (this_cell.attr("id") === "ela-perf" || this_cell.attr("id") === "math-perf") {

      if (this_cell.text() === "NI" || this_cell.text() === "W") {
        this_cell.attr("style", "color: red;")
      }
    }
  });

});