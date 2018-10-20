// Fetch with common headers
function apiFetch(url, options = {}) {
  const fetchOptions = {
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json'
    },
    ...options
  };
  return fetch(url, fetchOptions)
    .then(response => response.json());
}


export function apiFetchJson(url) {
  return apiFetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });
}

// This relies on a Rails CSRF token being rendered on the page
function readCsrfFromPage() {
  return $('meta[name="csrf-token"]').attr('content');
}

// This relies on a Rails CSRF token being rendered on the page
export function apiPostJson(url, body, options = {}) {
  const csrfToken = options.csrfToken || readCsrfFromPage();
  return apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    ...(options.fetchOptions || {})
  });
}

// This relies on a Rails CSRF token being rendered on the page
export function apiPatchJson(url, body, options = {}) {
  return apiPostJson(url, body, {
    ...options,
    fetchOptions: {
      ...(options.fetchOptions || {}),
      method: 'PATCH'
    }
  });
}

// This relies on a Rails CSRF token being rendered on the page, and
// this adds in query params like Rails' jquery_ujs would.
export function apiDeleteJson(url, options = {}) {
  const csrfToken = options.csrfToken || readCsrfFromPage();
  return fetch(url, {
    method: 'DELETE',
    credentials: 'same-origin',
    body: JSON.stringify({
      _method: 'delete',
      authenticity_token: csrfToken,
      ...(options.body || {})
    }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      ...(options.headers || {})
    },
    ...options
  }).then(response => response.json());
}
