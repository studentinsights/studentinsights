// Fetch with common headers
export function apiFetchJson(url, options = {}) {
  const fetchOptions = {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    ...options
  };
  return fetch(url, fetchOptions)
    .then(response => response.json());
}