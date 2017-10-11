$(function() {
  let Env = window.shared.Env;

  let SessionTimeoutWarning = function () {};

  SessionTimeoutWarning.prototype.count = function () {
    window.setTimeout(this.show, Env.sessionTimeoutInSeconds * 1000);
  };

  SessionTimeoutWarning.prototype.show = function () {
    $('#renew-session').slideDown();
  };

  if ($('body').hasClass('educator-signed-in')) {
    const warning = new SessionTimeoutWarning;
    warning.count();
  }

  $("#renew-sesion-link").click(function () {
    $.ajax({
      url: '/educators/reset',
      success: function () {
        $('#renew-session').slideUp();
        warning.count();   // Resent timeout count
      }
    });
  });
});
