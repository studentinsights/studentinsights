$(function() {

  window.room_id = parseInt($("#init-room-id").attr("data-room-id"))

  // Risk category sliders
  $(".risk-slider").slider({
    range: true,
    min: 1,
    max: 4,
    step: 1,
    values: [2, 3],
    slide: function (ev, ui) {
      if (ui.values[1] === 1 || ui.values[1] === 4 || ui.values[0] === 1 || ui.values[0] === 4) {
        return false
      } else {
        $.ajax({
          url: "/sort_by_risk",
          data: { 
            sort: { 
              subject: "math", 
              lower_cutoff: ui.values[0], 
              upper_cutoff: ui.values[1],
              room_id: window.room_id
            }
          },
          success: function (data) {
            populateTables(data);
          }
        });
      }
    }
  });

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

});

function populateTables (data) {

  var high_risk_cells = d3.selectAll("table[data-index='High'] td")
  var data_high_risk = data["High"].map(function(d) { return getValues(d) })[0]
  high_risk_cells.data(data_high_risk)
    .text(function(d, i) { return d })

  var table_medium_risk = d3.select("table[data-index='Medium']")
  var data_high_risk = data["Medium"]

  var table_low_risk = d3.select("table[data-index='Low']")
  var data_high_risk = data["Low"]

}

function getValues (data_point) {

  var vals = Object.keys(data_point).map(function (key) {
      return data_point[key];
  });

  return vals
}