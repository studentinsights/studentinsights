$(() => {
  const Env = window.shared.Env;

  const SessionTimeoutWarning = function () {};

  SessionTimeoutWarning.prototype.count = function () {
    window.setTimeout(this.show, Env.sessionTimeoutInSeconds * 1000);
  };

  SessionTimeoutWarning.prototype.show = function () {
    $('#renew-session').slideDown();
  };

  if ($('body').hasClass('educator-signed-in')) {
    const warning = new SessionTimeoutWarning();
    warning.count();

    $('#renew-sesion-link').click(() => {
      $.ajax({
        url: '/educators/reset',
        success() {
          $('#renew-session').slideUp();
          warning.count();   // Resent timeout count
        }
      });
    });
  }
});
