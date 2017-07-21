(function() {
  var colors = ["#1F77B4", "#FF7F0E", "#2CA02C", "#D62728",
"#9467BD", "#8C564B", "#E377C2", "#7F7F7F", "#BCBD22",
"#17BECF"]

  var student_count_chart_margins = {top: 40, right:40, bottom:10, left:60};
  var student_count_chart_base_width = 330;
  var student_count_chart_base_height = 200;

  var stacked_chart_margins = {top: 20, right:100, bottom:60, left:0};
  var stacked_chart_base_width = 330;
  var stacked_chart_base_height = 200;

  function drawStudentCountChart(data, class_map, chart_title) {

    var margin = student_count_chart_margins,
      width = student_count_chart_base_width - margin.left - margin.right,
      height = student_count_chart_base_height - margin.top - margin.bottom;

    var y_scaler = d3.scaleBand()
            .range([height, 0])
            .domain(data.map(function(d) { return class_map[d.class]; } ))
            .padding(0.1);

    var x_scaler = d3.scaleLinear()
            .range([0, width])
            .domain([0, d3.max(data, function(d) { return d.num_of_students; })]);

    //var barWidth = width / data.length;

    var bar_chart = d3.select(".count_chart")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      bar_chart.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y_scaler));

      bar_chart.append("text")
              .attr("x", (width / 2))             
              .attr("y", 0 - (margin.top / 2))
              .attr("text-anchor", "middle")  
              .style("font", "12px sans-serif")
              .style("font-weight", "bold")
              .text(chart_title);

    var bars = bar_chart.selectAll(".bar")
        .data(data);

      bars.exit().remove();

      bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", function(d) { return y_scaler(class_map[d.class]); })
        .attr("height", y_scaler.bandwidth())
        .attr("width", function(d) { return x_scaler(d.num_of_students); })
        .style("fill", function(d) { if (d.class == 'no_class') { return colors[3]; } else { return colors[0]; } });

    var bar_labels = bar_chart.selectAll(".bar-label")
        .data(data);

      bar_labels.exit().remove();

      bar_labels.enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", function(d) { return x_scaler(d.num_of_students) + 10; })
        .attr("y", function(d) { return y_scaler(class_map[d.class]) + y_scaler.bandwidth() / 1.5; })
        .text(function(d) { return d.num_of_students; });
  }

  function updateStudentCountChart(data) {

    var margin = student_count_chart_margins,
      width = student_count_chart_base_width - margin.left - margin.right,
      height = student_count_chart_base_height - margin.top - margin.bottom;

    var x_scaler = d3.scaleLinear()
            .range([0, width])
            .domain([0, d3.max(data, function(d) { return d.num_of_students; })]);

    var bars = d3.selectAll(".bar")
      .data(data);

      bars.transition()
        .duration(200)
        .attr("width", function(d) { return x_scaler(d.num_of_students); });

    var bar_labels = d3.selectAll(".bar-label")
      .data(data);

      bar_labels.transition()
        .duration(200)
        .attr("x", function(d) { return x_scaler(d.num_of_students) + 10; })
        .text(function(d) { return d.num_of_students; });
  }

  function getRelevantStudents(student_info, field, field_value) {
    var students = [];
    if (field_value == 'None') {
      field_value = null;
    }
    for (classroom in student_info) {
      for (student in student_info[classroom]) {
        if (student_info[classroom][student][field] == field_value) {
          students.push(student);
        }
      }
    }
    return students;
  }

  function drawPercentageChart(class_data, field_info, field, class_map, chart_title, student_info) {

    data = class_data.filter( function(d) {
      return d.class != 'no_class';
    })


    for (classroom in data) {
      var chart_values = [];
      var y0 = 0;
      for (item in field_info[field]) {
        item = field_info[field][item];
        var y1 = y0 + data[classroom][field][item] / data[classroom].num_of_students * 100;
        if (isNaN(y1)) { y1 = 0; }
        var item_info = {class:data[classroom].class, item:item, y0:y0, y1:y1 };
        y0 = y1;
        chart_values.push(item_info);
      }
      data[classroom]['chart_data'] = chart_values;
    }

    var margin = stacked_chart_margins,
      width = stacked_chart_base_width - margin.left - margin.right,
      height = stacked_chart_base_height - margin.top - margin.bottom;

    var y_scaler = d3.scaleLinear()
            .domain([0, 100])
            .rangeRound([height, 0]);

    var x_scaler = d3.scaleBand()
            .domain(data.map(function(d) { return class_map[d.class]; } ))
            .rangeRound([0, width])
            .padding(0.1);

    var z_scaler = d3.scaleOrdinal(colors)
            .domain(field_info[field].sort());

    var tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

    var chart = d3.select("#" + field + "_chart")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      chart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x_scaler))
             .selectAll("text") 
               .style("text-anchor", "end")
                  .attr("dx", "-.5em")
                  .attr("dy", "-.5em")
                  .attr("transform", "rotate(-90)");

      chart.append("text")
              .attr("x", (width / 2))             
              .attr("y", 0 - (margin.top / 2))
              .attr("text-anchor", "middle")  
              .style("font", "12px sans-serif")
              .style("font-weight", "bold")
              .text(chart_title);

    var relevant_students = [];

    var stacked_bar = chart.selectAll(".stacked_bar")
              .data(data)
              .enter()
              .append("g")
              .attr("class", "stacked_bar");

      stacked_bar.selectAll("rect")
        .data(function(d) { return d.chart_data; })
        .enter()
        .append("rect")
        .attr("x", function(d) { return x_scaler(class_map[d.class]); })
        .attr("y", function(d) { return y_scaler(d.y1); })  
        .attr("height", function(d) { return y_scaler(d.y0) - y_scaler(d.y1); })
        .attr("width", x_scaler.bandwidth())
        .style("fill", function (d) { return z_scaler(d.item); })
        .on("mousemove", function(d) {
          d3.select(this).style("fill", "#c7c7c7");
          tooltip.html("<strong style='font-size:130%;color:" + z_scaler(d.item) + "'>" + d.item + "</strong>" + "</br>" + Math.round(d.y1 - d.y0) + "%")
                    .style("left", d3.event.pageX - 59 + "px")
                    .style("top", d3.event.pageY - 32 + "px")
                    .style("display", "inline-block")
                    .style("opacity", 0.9);
              relevant_students = getRelevantStudents(student_info, field, d.item);
              for (student in relevant_students) {
                d3.select("#s" + relevant_students[student]).style("background-color", z_scaler(d.item));
              }
            })
           .on("mouseout", function(d) {
            d3.select(this).style("fill", z_scaler(d.item));
          tooltip.style("display", "none")
              .style("opacity", 0);
          for (student in relevant_students) {
                d3.select("#s" + relevant_students[student]).style("background-color", "#d3d3d3");
              }
            });

    var legend = chart.selectAll(".legend")
              .data(field_info[field].reverse())
            .enter().append("g")
              .attr("class", "legend")
              .attr("transform", function(d, i) { return "translate(0," + i * 10 + ")"; });

        legend.append("rect")
            .attr("x", width)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", z_scaler);

      legend.append("text")
        .attr("x", width + 12)
        .attr("y", 5)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("font", "8px sans-serif")
        .text(function(d) { return d; });

  }

  function updatePercentageChart(data, field_info, field) {

    data = data.filter( function(d) {
      return d.class != 'no_class';
    })


    for (classroom in data) {
      var chart_values = [];
      var y0 = 0;
      for (item in field_info[field]) {
        item = field_info[field][item];
        var y1 = y0 + data[classroom][field][item] / data[classroom].num_of_students * 100;
        if (isNaN(y1)) { y1 = 0; }
        var item_info = {class:data[classroom].class, item:item, y0:y0, y1:y1 };
        y0 = y1;
        chart_values.push(item_info);
      }
      data[classroom]['chart_data'] = chart_values;
    }

    var margin = stacked_chart_margins,
      width = stacked_chart_base_width - margin.left - margin.right,
      height = stacked_chart_base_height - margin.top - margin.bottom;

    var y_scaler = d3.scaleLinear()
            .domain([0, 100])
            .rangeRound([height, 0]);

    var z_scaler = d3.scaleOrdinal(colors)
            .domain(field_info[field].sort());

    var stacked_bar = d3.select("#" + field + "_chart")
            .selectAll(".stacked_bar")
            .data(data)
            .selectAll("rect")
            .data(function(d) { return d.chart_data; });

      stacked_bar
        .transition()
        .duration(200)
        .attr("y", function(d) { return y_scaler(d.y1); })  
        .attr("height", function(d) { return y_scaler(d.y0) - y_scaler(d.y1); })
        .style("fill", function (d) { return z_scaler(d.item); })
  }

  function drawCharts(data, field_info, class_map, student_info) {
    drawStudentCountChart(data, class_map, "Student Count", student_info);
    drawPercentageChart(data, field_info, "hispanic_latino", class_map, "Hispanic/Latino", student_info);
    drawPercentageChart(data, field_info, "race", class_map, "Race", student_info);
    drawPercentageChart(data, field_info, "free_reduced_lunch", class_map, "Free Reduced Lunch", student_info);
    drawPercentageChart(data, field_info, "program_assigned", class_map, "Program Assigned", student_info);
    drawPercentageChart(data, field_info, "sped_level_of_need", class_map, "Sped Level of Need", student_info);
    drawPercentageChart(data, field_info, "plan_504", class_map, "Plan 504", student_info);
    drawPercentageChart(data, field_info, "limited_english_proficiency", class_map, "Limited English Proficiency", student_info);
    drawPercentageChart(data, field_info, "risk_level", class_map, "Risk Level", student_info);
  }

  function updateCharts(data, field_info) {
    updateStudentCountChart(data);
    updatePercentageChart(data, field_info, "hispanic_latino");
    updatePercentageChart(data, field_info, "race");
    updatePercentageChart(data, field_info, "free_reduced_lunch");
    updatePercentageChart(data, field_info, "program_assigned");
    updatePercentageChart(data, field_info, "sped_level_of_need");
    updatePercentageChart(data, field_info, "plan_504");
    updatePercentageChart(data, field_info, "limited_english_proficiency");
    updatePercentageChart(data, field_info, "risk_level");
  }

  window.drawCharts = drawCharts;
  window.updateCharts = updateCharts;
}());