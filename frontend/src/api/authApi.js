const API_BASE_URL = '/apiv1/auth';

export async function login(username, password) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Đăng nhập thất bại');
  }

  return data;
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Đăng xuất thất bại');
  }

  return data;
}