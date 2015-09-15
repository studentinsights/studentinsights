$(function() {

  if ($('body').hasClass('homerooms') && $('body').hasClass('show')) {

    $('.bulk-intervention-checkbox').click(function() {
      var student_count = window.bulkInterventionStudents().length;
      if (student_count > 0) {
        $('#assign-bulk-interventions').html("+ " + student_count);
        $('#assign-bulk-interventions').show();
      } else {
        $('#assign-bulk-interventions').hide();
      }
    });

    window.bulkInterventionStudents = function () {
      return $('.bulk-intervention-checkbox').filter(function() {
        return this.checked;
      }).map(function() {
        return $(this).data('student-id');
      }).toArray();
    }

    $('#assign-bulk-interventions').click(function(e) {
      var url = $(this).attr('href');
      var dialog_form = $('<div id="dialog-form"><h1>Loading form...</h1></div>').dialog({
        autoOpen: false,
        hide: true,
        width: 520,
        modal: true,
        open: function() {
          return $(this).load(url + ' #content', function() {
            var student_ids_to_assign = window.bulkInterventionStudents();
            var number_of_students = String(student_ids_to_assign.length);
            if (student_ids_to_assign.length > 0) {
              var hidden_student_fields = student_ids_to_assign.map(function(id) {
                return '<input name="bulk_intervention_assignment[student_ids][]" ' +
                              'value="' + String(id) + '" type="hidden" />'
              }).join('');
            } else {
              var hidden_student_fields = '<input name="bulk_intervention_assignment[student_ids][]" ' +
                            'value="" type="hidden" />'
            }
            return $(this).find('#students-count').html(number_of_students).end()
                          .find('#student-ids').html(hidden_student_fields);
          });
        },
        close: function() {
          $('#dialog-form').remove();
        }
      });
      dialog_form.dialog('open');
      e.preventDefault();
    });

    // Make the 'cancel' button work
    $(document).on("click", "#dialog-form .btn.cancel-btn", function() {
      $('#dialog-form').dialog('close');
    });

  }

});
