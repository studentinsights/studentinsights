$(function() {
  // This is the JS entry point for the student page.
  // It relies on some server-rendering and then passes control to the
  // ProfileController and InterventionsController, which own their respective tabs.
  if ($('body').hasClass('students') && $('body').hasClass('show')) {

    // Risk level tooltip
    var risk_level_tooltip = $('#risk-level-tooltip-template').html();
    var rendered = Mustache.render(risk_level_tooltip);
    $('#profile-risk-level').tooltipster({
      content: rendered,
      position: 'bottom-right',
      contentAsHTML: true
    });

    // Profile tab, start here
    var profileController = new window.ProfileController();
    profileController.show();
    
    // Read data for interventions tab
    // This is persistent for the life of the page right - the state is read in 
    // on initial page load and is then owned by the controller.
    var interventions = JSON.parse($('#interventions-data').html());
    var interventionsController = new window.InterventionsController({
      $el: $('#interventions-tab'),
      interventions: interventions,
      datepickerOptions: window.datepicker_options
    });

    // Switch between tabs
    $('.tab-select').click(function() {
      var tab = $(this).data('tab');
      $('.tab').hide();
      $('.tab-select').removeClass('selected');
      $(this).addClass('selected');
      
      if (tab === 'interventions-tab') {
        interventionsController.bindListeners();
        interventionsController.render();
        $('#' + tab).show();
        return;
      }

      $('#' + tab).show();
    });
  }
});
