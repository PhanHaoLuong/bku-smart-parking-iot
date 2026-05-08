import { authedFetch } from './authedFetch';

export async function getMyParkingHistory(userId) {
  const endpoint = userId ? `/apiv1/parking-history/${userId}` : '/apiv1/parking-history';
  const response = await authedFetch(endpoint);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch parking history');
  }

  return Array.isArray(data) ? data : [];
}

export async function getAllParkingHistory() {
  const response = await authedFetch('/apiv1/parking-history');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch parking history');
  }

  return Array.isArray(data) ? data : [];
}
