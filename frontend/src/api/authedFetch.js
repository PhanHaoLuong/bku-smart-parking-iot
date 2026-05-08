export async function authedFetch(url, options = {}) {
  const { headers, ...rest } = options;

  return fetch(url, {
    credentials: 'include',
    ...rest,
    headers: {
      ...headers,
    },
  });
}

export async function authedJsonFetch(url, options = {}) {
  const { headers, body, ...rest } = options;

  return authedFetch(url, {
    ...rest,
    body,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}