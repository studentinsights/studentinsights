function checkZero (options) {
  return options.series.every(function(element) {
    return element.data.every(function(el) {
      return el == 0
    })
  })
}

function convertRubyDatesToJsDates (series) {
  return series.map(function(element) {
    return [
      Date.UTC(element[0],
               element[1] - 1,   // JavaScript months start with 0, Ruby months start with 1
               element[2]),
      element[3]
    ]
  })
}

