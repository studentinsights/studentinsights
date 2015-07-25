describe("#checkZero", function() {
  var series_without_events = { series: [ {data: [0, 0, 0] } ] }
  var series_with_events = { series: [ {data: [0, 1, 0] } ] }

  it("returns true for a series with no events", function() {
    var result = checkZero(series_without_events)
    expect(result).toEqual(true)
  })
  it("returns false for a series with events", function() {
    var result = checkZero(series_with_events)
    expect(result).toEqual(false)
  })
})
