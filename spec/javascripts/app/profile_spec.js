describe("ProfileController", function() {
  beforeEach(function() {
    this.profileController = new window.ProfileController()
  })

  describe("ProfileChart", function() {
    beforeEach(function() {
      var data = [[2015, 1, 1, 500]];
      this.profileChart = new window.ProfileChart("tacos", data)
    })

    describe("#highChartDates", function() {
      it("returns the expected javascript date", function() {
        var result = this.profileChart.highChartDates();
        expect(result).toEqual([ [ 1420070400000, 500 ] ])
      })
    })

    describe("#toChart", function() {
      it("returns an object named the same as the chart", function() {
        var result = this.profileChart.toChart();
        expect(result.name).toEqual("tacos");
      });

      it("returns an object with the appropriate data", function() {
        var result = this.profileChart.toChart();
        expect(result.data).toEqual([[2015, 1, 1, 500]]);
      });
    })

    describe("#toDateChart", function() {
      it("returns an object named the same as the chart", function() {
        var result = this.profileChart.toDateChart();
        expect(result.name).toEqual("tacos");
      });

      it("returns an object where the ruby dates have been converted to epoch seconds", function() {
        var result = this.profileChart.toDateChart();
        expect(result.data).toEqual([ [ 1420070400000, 500 ] ]);
      });
    })
  })

  describe("#zeroDraw", function(){
    beforeEach(function() {
      var chart = $('<div id="chart">');
      var template = $('<script type="text/template" id="zero-case-template">name:{{name}} data_type:{{data_type}} happy_message:{{happy_message}}</script>');
      $(document.body).append(chart);
      $(document.body).append(template);
    })

    it("renders the student name", function(){
      this.profileController.zeroDraw("studenty student", "datums")
      expect($("#chart").html()).toContain("name:studenty student")
    });

    it("renders the data type", function() {
      this.profileController.zeroDraw("studenty student", "datums")
      expect($("#chart").html()).toContain("data_type:datums")
    });


    it("clears the old content", function() {
      $("#chart").html("i like waffles")
      this.profileController.zeroDraw("studenty student", "datums")
      expect($("#chart").html()).not.toContain("waffles")
    });

    describe("when the draw type is neither attendance nor behavior", function() {
      it("renders a false happy message", function() {
        this.profileController.zeroDraw("studenty student", "tacos")
        expect($("#chart").html()).toContain("happy_message:false")
      });
    });

    describe("when the draw type is attendance", function() {
      it("renders a true happy message", function() {
        this.profileController.zeroDraw("studenty student", "absences or tardies")
        expect($("#chart").html()).toContain("happy_message:true")
      });
    });

    describe("when the draw type is behavior", function() {
      it("renders a true happy message", function() {
        this.profileController.zeroDraw("studenty student", "behavior incidents")
        expect($("#chart").html()).toContain("happy_message:true")
      });
    });
  })

  describe("#checkZero", function() {
    it("returns true for a series with no events", function() {
      var series_without_events = { series: [ {data: [0, 0, 0] } ] }
      var result = this.profileController.checkZero(series_without_events)
      expect(result).toEqual(true)
    })

    it("returns false for a series with events", function() {
      var series_with_events = { series: [ {data: [0, 1, 0] } ] }
      var result = this.profileController.checkZero(series_with_events)
      expect(result).toEqual(false)
    })
  })

  describe("#show", function() {
    it("is defined", function() {
      expect(this.profileController.show).toBeDefined()
    })
  })
})
