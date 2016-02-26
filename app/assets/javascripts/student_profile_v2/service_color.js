(function() {
  window.shared || (window.shared = {});
  
  // Map service_type_id to a themed color.
  var serviceColor = window.shared.serviceColor = function(serviceTypeId) {
    var map = {
     507: '#ffe7d6',
     502: '#e8fce8',
     503: '#e8fce8',
     504: '#e8fce8',
     505: '#eee',
     506: '#eee',
     508: '#e8e9fc'
    };
    return map[serviceTypeId] || null;
  };
})();
