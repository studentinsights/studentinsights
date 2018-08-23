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
export function apiPostJson(url, body, options = {}) {
  const csrfToken = options.csrfToken || $('meta[name="csrf-token"]').attr('content');
  return apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    }
  });
}
