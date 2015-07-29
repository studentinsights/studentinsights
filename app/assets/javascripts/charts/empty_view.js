(function(root) {

  var EmptyView = function initializeEmptyView(studentName, dataType) {
    this.studentName = studentName;
    this.dataType = dataType;
  };

  EmptyView.canRender = function(data) {
    return data.series.every(function(element) {
      return element.data.every(function(el) {
        return el == 0;
      });
    });
  };

  EmptyView.prototype.render = function() {
    var view = {
      name: this.studentName,
      data_type: this.dataType
    }

    view.happy_message = this.dataType === 'absences or tardies' || this.dataType === 'behavior incidents';

    var zero_case_template = $('#zero-case-template').html();
    var zeroHtml = Mustache.render(zero_case_template, view);
    $('#chart').html(zeroHtml);
  };

  root.EmptyView = EmptyView;

})(window)
