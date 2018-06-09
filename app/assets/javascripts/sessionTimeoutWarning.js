export default function sessionTimeoutWarning(Env) {
  const SessionTimeoutWarning = function() {};

  SessionTimeoutWarning.prototype.count = () => {
    setTimeout(this.show, Env.sessionTimeoutInSeconds * 1000);
  };

  SessionTimeoutWarning.prototype.show = () => {
    $('#renew-session').slideDown();
  };

  const warning = new SessionTimeoutWarning;
  warning.count();

  $("#renew-sesion-link").click(() => {
    $.ajax({
      url: '/educators/reset',
      success() {
        $('#renew-session').slideUp();
        warning.count();   // Resent timeout count
      }
    });
  });
}