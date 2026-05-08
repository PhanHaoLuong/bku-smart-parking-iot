import { authedFetch } from './authedFetch';

export async function getUserInfo() {
  const response = await authedFetch('/apiv1/auth/user-info');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user info');
  }

  return data;
}
