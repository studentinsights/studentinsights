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

  var parsed_data = Object.keys(data).map(function (key) { 
    return data[key]
  });

  var rows = buildRows(parsed_data)
  var rendered = Mustache.render(template, { rows: rows, category: "MCAS" })
  return rendered
}

function buildRows (data) {
  var template = $('#row-template').html()
  Mustache.parse(template)

  var parsed_data = Object.keys(data).map(function (key) { 
    return data[key]
  });

  var cells = "" 
  for (m = 0; m < parsed_data.length; m++) {
    var data_point = parsed_data[m]
    var cell = buildCell(data_point)
    cells += cell
  }

  var rendered = Mustache.render(template, { cells: cells, category: "MCAS" })
  return rendered
}

function buildCell (data) {

  var parsed_data = Object.keys(data).map(function (key) { 
    return data[key]
  });

  console.log(parsed_data)
  var template = $('#cell-template').html()
  Mustache.parse(template)
  var rendered = Mustache.render(template, { value: parsed_data, cell_type: "" })
  return rendered
}



//     var new_headers = buildHeaders(data[category])
//     var new_rows = buildRows(data[category])
// function buildHeaders (data) {
//   var headers = Object.keys(data[0])
//   var html = "<tr>"
//   for (k = 0; k < headers.length; k++) {
//     html += "<td class='header'>" + headers[k] + "</td>"
//   }
//   html += "</tr>"
//   return html
// }

// function buildRows (data) {
//   return ""
// }

// [{"id":55474,"new_id":4004,"grade":"7","hispanic_latino":false,"race":"White","limited_english":"Fluent","low_income":true,"created_at":"2015-01-16T06:05:52.505Z","updated_at":"2015-01-16T18:50:28.213Z","ela_scaled":218,"ela_performance":"W","ela_growth":55,"math_scaled":218,"math_performance":"W","math_growth":36,"sped":true,"room_id":2840},{"id":55861,"new_id":4498,"grade":"9","hispanic_latino":true,"race":"White","limited_english":"Formerly Limited","low_income":false,"created_at":"2015-01-16T06:05:57.523Z","updated_at":"2015-01-16T18:50:28.196Z","ela_scaled":214,"ela_performance":"W","ela_growth":58,"math_scaled":208,"math_performance":"W","math_growth":33,"sped":true,"room_id":2840},{"id":55860,"new_id":4497,"grade":"9","hispanic_latino":false,"race":"White","limited_english":"Fluent","low_income":true,"created_at":"2015-01-16T06:05:57.511Z","updated_at":"2015-01-16T18:50:28.185Z","ela_scaled":224,"ela_performance":"NI","ela_growth":30,"math_scaled":214,"math_performance":"W","math_growth":28,"sped":true,"room_id":2840}]}

//           <tr>
//             <td class="header" class="radius">New ID</td>
//             <td class="header">Grade</td> 
//             <td class="header">Hispanic/Latino</td>
//             <td class="header">Race</td>
//             <td class="header">Limited English</td>
//             <td class="header">Low Income</td>
//           </tr>
//             <tr>
//               <td>4004</td>
//               <td>7</td>
//               <td>false</td>
//               <td>White</td>
//               <td>Fluent</td>
//               <td>true</td>
//             </tr>
//             <tr>
//               <td>4498</td>
//               <td>9</td>
//               <td>true</td>
//               <td>White</td>
//               <td>Formerly Limited</td>
//               <td>false</td>
//             </tr>
//             <tr>
//               <td>4497</td>
//               <td>9</td>
//               <td>false</td>
//               <td>White</td>
//               <td>Fluent</td>
//               <td>true</td>
//             </tr>


//       // for (k = 0; k < rows.length; k++) {
//       //   var row = $(rows[k])
//       //   var cells = row.children("td")
        
//       //   for (m = 0; m < cells.length; m++) {
//       //     var cell = $(cells[m])
//       //     cell.text("HELLO");

//       //   }
//       // }