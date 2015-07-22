describe("ProfileController", function() {
  beforeEach(function() {
    this.profileController = new window.ProfileController();
  });

  describe("#show", function() {
    it("is defined", function() {
      expect(this.profileController.show).toBeDefined();
    });
  });

  describe("#prepareEventsForChart", function() {
    it("returns the value of each key in reverse order", function() {
      var events = { "2014": [ "7" ], "2017": [ "1" ] };
      var prepare_function = function(thing) { return thing; };
      expect(this.profileController.prepareEventsForChart(events, prepare_function)).toEqual([["1"], ["7"]]);
    });
  });
});
