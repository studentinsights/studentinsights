describe("ProfileController", function() {
  beforeEach(function() {
    this.profileController = new window.ProfileController()
  })

  describe("ProfileChartData", function() {
    beforeEach(function() {
      var data = [[2015, 1, 1, 500]];
      this.profileChartData = new window.ProfileChartData("tacos", data)
    })

    describe("#highChartDates", function() {
      it("returns the expected javascript date", function() {
        var result = this.profileChartData.highChartDates();
        expect(result).toEqual([ [ 1420070400000, 500 ] ])
      })
    })

    describe("#toChart", function() {
      it("returns an object named the same as the chart", function() {
        var result = this.profileChartData.toChart();
        expect(result.name).toEqual("tacos");
      });

      it("returns an object with the appropriate data", function() {
        var result = this.profileChartData.toChart();
        expect(result.data).toEqual([[2015, 1, 1, 500]]);
      });
    })

    describe("#toDateChart", function() {
      it("returns an object named the same as the chart", function() {
        var result = this.profileChartData.toDateChart();
        expect(result.name).toEqual("tacos");
      });

      it("returns an object where the ruby dates have been converted to epoch seconds", function() {
        var result = this.profileChartData.toDateChart();
        expect(result.data).toEqual([ [ 1420070400000, 500 ] ]);
      });
    })
  })

  describe("EmptyView", function(){
    describe("#render", function(){
      beforeEach(function() {
        var chart = $('<div id="chart">');
        var template = $('<script type="text/template" id="zero-case-template">name:{{name}} data_type:{{data_type}} happy_message:{{happy_message}}</script>');
        $(document.body).append(chart);
        $(document.body).append(template);
      })

      it("renders the student name", function(){
        new EmptyView("studenty student", "datums").render()
        expect($("#chart").html()).toContain("name:studenty student")
      });

      it("renders the data type", function() {
        new EmptyView("studenty student", "datums").render()
        expect($("#chart").html()).toContain("data_type:datums")
      });


      it("clears the old content", function() {
        $("#chart").html("i like waffles")
        new EmptyView("studenty student", "datums").render()
        expect($("#chart").html()).not.toContain("waffles")
      });

      describe("when the draw type is neither attendance nor behavior", function() {
        it("renders a false happy message", function() {
          new EmptyView("studenty student", "tacos").render()
          expect($("#chart").html()).toContain("happy_message:false")
        });
      });

      describe("when the draw type is attendance", function() {
        it("renders a true happy message", function() {
          new EmptyView("studenty student", "absences or tardies").render()
          expect($("#chart").html()).toContain("happy_message:true")
        });
      });

      describe("when the draw type is behavior", function() {
        it("renders a true happy message", function() {
          new EmptyView("studenty student", "behavior incidents").render()
          expect($("#chart").html()).toContain("happy_message:true")
        });
      });
    })

    describe(".canRender", function() {
      it("returns true for a series with no events", function() {
        var series_without_events = { series: [ {data: [0, 0, 0] } ] }
        var result = EmptyView.canRender(series_without_events)
        expect(result).toEqual(true)
      })

      it("returns false for a series with events", function() {
        var series_with_events = { series: [ {data: [0, 1, 0] } ] }
        var result = EmptyView.canRender(series_with_events)
        expect(result).toEqual(false)
      })
    })
  })

  describe("#show", function() {
    it("is defined", function() {
      expect(this.profileController.show).toBeDefined()
    })
  })
});
