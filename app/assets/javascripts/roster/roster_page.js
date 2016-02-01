$(function() {

  if ($('body').hasClass('homerooms') && $('body').hasClass('show')) {
    // track user for mixpanel
    var currentEducator = $('#current-educator-data').data().currentEducator;
    var homeroom = $('#homeroom-data').data().homeroom;
    var MixpanelUtils = window.shared.MixpanelUtils;
    MixpanelUtils.registerUser(currentEducator);
    window.mixpanel.track('PAGE_VISIT', {
      page_key: 'ROSTER_PAGE',
      homeroom_id: homeroom.id,
      homeroom_slug: homeroom.slug,
      homeroom_grade: homeroom.grade
    });

    // Initialize table sort on roster table
    var table = document.getElementById('roster-table');
    new Tablesort(table, { descending: false });

    // Initialize table sort on roster table
    $('#homeroom-select').bind('change', function() {
      window.location.pathname = '/homerooms/' + $(this).val();
    });

    function updateColumns () {
      columns_selected_inputs = $("#column-listing").find("input:checked");
      columns_selected = $.map(columns_selected_inputs, function(c) {
        return c.name;
      });
      for (var column in roster_columns) {
        if (columns_selected.indexOf(column) === -1) {
          $('.' + column).hide();
        } else {
          $('.' + column).show();
        }
      }
    }
    updateColumns();

    function updateCookies () {
      Cookies.set("columns_selected", columns_selected);
    }

    // Show/hide column groups
    var roster_columns = {
        'name': 'Name',
        'risk': 'Risk',
        'program': 'Program',
        'sped': 'SPED & Disability',
        'language': 'Language',
        'free-reduced': 'Free/Reduced Lunch',
        'star_math': 'STAR Math',
        'star_reading': 'STAR Reading',
        'mcas_math': 'MCAS Math',
        'mcas_ela': 'MCAS ELA',
        'access': 'Access',
        'dibels': 'DIBELS',
        'interventions': 'Interventions'
        // 'attendance': 'Attendance',
        // 'discipline': 'Discipline',
    };

    var columns_selected = Cookies.getJSON("columns_selected");
    var columnTemplate = $("#column-template").remove();

    $.each(roster_columns, function(key, column){
      var newColumnTemplate = columnTemplate.clone(),
      isselected = columns_selected.indexOf(key) !== -1;
      newColumnTemplate
        .find("input")
          .attr("name", key)
          .attr("checked", isselected)
          .on("click", function(event) {
            event.stopPropagation();
            updateColumns();
          }).on("change", updateCookies)
        .end()
        .find("label")
          .text(column)
        .end()
        .appendTo("#column-listing")
    });

    // "Click off" for column select
    $("body").click(function() {
      $('#column-picker').hide();
    });

    $("#column-picker").click(function() {
      event.stopPropagation();
    });

    $('#column-picker-toggle').click(function(event) {
      event.stopPropagation();
      $('#column-picker').show();
    });

    // Risk level tooltip for overall roster table
    var roster_rooltip_template = $('#roster-tooltip-template').html();
    var rendered = Mustache.render(roster_rooltip_template);

    $('#roster-tooltip').tooltipster({
      content: rendered,
      position: 'bottom-right',
      contentAsHTML: true
    });

    // Tooltips for individual student risk levels

    function getRiskLevelToolTip (studentId) {
      var tooltip = $(".risk-level-tooltip[data-student-id='" + studentId + "']").html();
      var mustache_rendered = Mustache.render(tooltip);
      return mustache_rendered;
    }

    $.each($('.risk-tooltip-circle'), function() {
      $this = $(this)
      var student_id = parseInt($this.data('student-id'))
      var tooltip = getRiskLevelToolTip(student_id)
      $this.tooltipster({
        content: tooltip,
        position: 'bottom',
        contentAsHTML: true
      });
    });

    // Turn table rows into links to student profiles
    $('tbody td').click(function () {
      if (!$(this).hasClass('bulk-intervention')) {
        location.href = $(this).attr('href');
      }
    });

    // Make Risk Level summary chart

    var chartData = $('#chart-data');
    RosterChart.fromChartData(chartData).render();

  }

});
