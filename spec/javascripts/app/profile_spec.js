describe("ProfileController", function() {
  beforeEach(function() {
    this.profileController = new window.ProfileController()
  })

  describe("#show", function() {
    it("is defined", function() {
      expect(this.profileController.show).toBeDefined()
    })
  })
})
