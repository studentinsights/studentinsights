(function(root) {

  var ProfileInterventionsController = function () {
    $('#new_intervention').hide();                     // form initializes hidden
    $('.intervention-detail').hide();                  // so do all but first intervention detail
    $('.intervention-detail').first().show();
    if ($('.intervention-cell').length === 0) {
      $('#interventions-tab .right-panel').hide();     // nothing to see here
      $('#open-intervention-form').addClass('solo');
    } else {
      $('.intervention-cell').first().addClass('activated');
    }
  }

  ProfileInterventionsController.prototype.showInterventionForm = function () {
    $('#new_intervention').show();
    $('#interventions-tab .right-panel').show();
    $('#open-intervention-form').addClass('selected');
    $('.intervention-detail').hide();
    $('.intervention-cell').removeClass('activated');
  }

  ProfileInterventionsController.prototype.hideInterventionForm = function () {
    $('#new_intervention').hide();
    $('#open-intervention-form').removeClass('selected');
    $('.intervention-detail').first().show();
    $('.intervention-cell').first().addClass('activated');
    this.clearInterventionForm();
  }

  ProfileInterventionsController.prototype.clearInterventionForm = function () {
    $('#new_intervention').hide();
    $('#interventions-tab form textarea').val('');
    $('#interventions-tab form .datepicker').val('');
    $('#intervention_intervention_type_id :nth-child(1)').prop('selected', true);
  };

  ProfileInterventionsController.prototype.selectIntervention = function (intervention) {
    $('#open-intervention-form').removeClass('selected');
    $('#new_intervention').hide();
    $('.intervention-cell').removeClass('activated');
    intervention.addClass('activated');
    $('.intervention-detail').hide();
    var detail = $('.intervention-detail[data-id="' + intervention.data('id') + '"]');
    detail.show();
  }

  root.ProfileInterventionsController = ProfileInterventionsController;

})(window)
