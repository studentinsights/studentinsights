function count(sessionTimeoutInSeconds) {
  setTimeout(show, sessionTimeoutInSeconds * 1000);
}

function show() {
  $('#renew-session').slideDown();
}

// Show a warning that the user's session is likely to timeout shortly.
// This will be reset by Ajax calls or single-page navigation, so isn't entirely
// accurate and will warn a bit too aggressively.  But it will work well for full-page
// loads without other interactions.
export default function sessionTimeoutWarning(sessionTimeoutInSeconds) {
  const showWarningTimeoutInSeconds = sessionTimeoutInSeconds * 0.85;
  count(showWarningTimeoutInSeconds);

  $("#renew-sesion-link").click(() => {
    $.ajax({
      url: '/educators/reset',
      success() {
        $('#renew-session').slideUp();
        count(showWarningTimeoutInSeconds);   // Resent timeout count
      }
    });
  });
}