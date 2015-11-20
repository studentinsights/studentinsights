(function(root) {

  var ProfileChartData = function initializeProfileChartData (name, data, color) {
    this.name = name;
    this.data = data;
    this.color = color;
  };

  ProfileChartData.prototype.highChartDates = function profileHighChartDates() {
    return this.data.map(function(element) {
      return [
        Date.UTC(element[0],
                 element[1] - 1,   // JavaScript months start with 0, Ruby months start with 1
                 element[2]),
        element[3]
      ];
    });
  }

  ProfileChartData.prototype.toChart = function toChart() {
    return {
      name: this.name,
      data: this.data
    };
  };

  ProfileChartData.prototype.toDateChart = function toDateChart() {
    return {
      name: this.name,
      data: this.highChartDates()
    };
  }

  root.ProfileChartData = ProfileChartData;

})(window);