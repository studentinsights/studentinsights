function count(sessionTimeoutInSeconds) {
  setTimeout(show, sessionTimeoutInSeconds * 1000);
}

function show() {
  $('#renew-session').slideDown();
}

export default function sessionTimeoutWarning(Env) {
  count(Env.sessionTimeoutInSeconds);

  $("#renew-sesion-link").click(() => {
    $.ajax({
      url: '/educators/reset',
      success() {
        $('#renew-session').slideUp();
        count(Env.sessionTimeoutInSeconds);   // Resent timeout count
      }
    });
  });
}