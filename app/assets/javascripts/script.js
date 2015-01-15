$(function() {

  // Show more button
  $("a").click(function() {
    $(".hidden").first().removeClass("hidden");
  });

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
      }
    }
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

