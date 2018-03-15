import React from 'react';


// See https://github.com/rails/jquery-ujs/blob/master/src/rails.js
// Up-to-date Cross-Site Request Forgery token
function readCsrfToken() {
  return $('meta[name=csrf-token]').attr('content');
}

// See https://github.com/rails/jquery-ujs/blob/master/src/rails.js
// URL param that must contain the CSRF token
function readCsrfParam() {
  return $('meta[name=csrf-param]').attr('content');
}

// See https://github.com/rails/jquery-ujs/blob/master/src/rails.js
// Determines if the request is a cross domain request.
function isCrossDomain(url) {
  const originAnchor = document.createElement('a');
  originAnchor.href = location.href;
  const urlAnchor = document.createElement('a');

  try {
    urlAnchor.href = url;
    // This is a workaround to a IE bug.
    urlAnchor.href = urlAnchor.href;

    // If URL protocol is false or is a string containing a single colon
    // *and* host are false, assume it is not a cross-domain request
    // (should only be the case for IE7 and IE compatibility mode).
    // Otherwise, evaluate protocol and host of the URL against the origin
    // protocol and host.
    return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) ||
      (originAnchor.protocol + '//' + originAnchor.host ===
        urlAnchor.protocol + '//' + urlAnchor.host));
  } catch (e) {
    // If there is an error parsing the URL, assume it is crossDomain.
    return true;
  }
}

// See https://github.com/rails/jquery-ujs/blob/master/src/rails.js#L212 for source.
class RailsLinkMethod extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick(event) {
    event.preventDefault();
    const {href, method, target} = this.props;
    const csrfToken = readCsrfToken();
    const csrfParam = readCsrfParam();
    const form = $('<form method="post" action="' + href + '"></form>');
    
    const includeCsrfParams = (csrfParam !== undefined && csrfToken !== undefined && !isCrossDomain(href));
    const metadataInput = [
      '<input name="_method" value="' + method + '" type="hidden" />',
      includeCsrfParams ? '<input name="' + csrfParam + '" value="' + csrfToken + '" type="hidden" />' : ''
    ].join('');
    if (target) { form.attr('target', target); }

    form.hide().append(metadataInput).appendTo('body');
    form.submit();
  }

  render() {
    const {href, children} = this.props;
    return <a
      rel="nofollow"
      onClick={this.onClick}
      href={href}>{children}</a>;
  }
}
RailsLinkMethod.propTypes = {
  href: React.PropTypes.string.isRequired,
  children: React.PropTypes.node.isRequired,
  method: React.PropTypes.string.isRequired,
  target: React.PropTypes.string
};


export default RailsLinkMethod;