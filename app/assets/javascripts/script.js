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

// Update tables 

function populateTables (data) {

  var categories = [ "Low", "Medium", "High" ]

  for (i = 0; i < categories.length; i++) {
    var category = categories[i]
    var students = data[category]
    var tables = $(".student-group[data-risk-level='" + category + "']").children("table")

    for (j = 0; j < tables.length; j++) {
      var table = $(tables[j]).children("tbody")
      var new_html = buildTable(data[category])
      table.html(new_html)      
    }
  }
}

function buildTable (data) {
  var template = $('#table-template').html()
  Mustache.parse(template)

  for (i = 0; i < data.length; i++) {
    var data_type = data[i][0]
    var type_short = data_type.type.short
    var type_full = data_type.type.full
    var rows = ""
    for (k = 0; k < data.length; k++) {
      var data_row = data[i][0].data
      var row = buildRow(data_row)
      rows += row
    }
  }
  
  var rendered = Mustache.render(template, { 
    rows: rows, 
    type_short: type_short,
    type_full: type_full
  })
  return rendered
}

function buildRow (data) {
  var template = $('#row-template').html()
  Mustache.parse(template)
  var parsed_data = parseRows(data)

  var cells = "" 
  for (m = 0; m < parsed_data.length; m++) {
    var data_point = parsed_data[m]
    var cell = buildCell(data_point)
    cells += cell
  }
  var rendered = Mustache.render(template, { cells: cells })
  return rendered
}

function buildCell (data) {
  var template = $('#cell-template').html()
  Mustache.parse(template)
  var rendered = Mustache.render(template, { value: data, header_status: "no" })
  return rendered
}

function parseRows (data) {

  var parsed_data = Object.keys(data).map(function (key) { 
    return data[key]
  });
  return parsed_data
}

