import { authedFetch } from './authedFetch';

export async function getLatestEvents(limit = 50) {
  const response = await authedFetch(`/apiv1/iot/events?limit=${encodeURIComponent(limit)}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch latest events');
  }

  return Array.isArray(data) ? data : [];
}
