import { authedFetch } from './authedFetch';

async function readJsonResponse(response, fallbackMessage) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
}

export async function getMonitoringSummary(lotId) {
  const query = lotId ? `?lotId=${encodeURIComponent(lotId)}` : '';
  const response = await authedFetch(`/apiv1/monitoring/summary${query}`);
  return readJsonResponse(response, 'Failed to fetch monitoring summary');
}

export async function getSlots({ lotId, status, limit = 300 } = {}) {
  const params = new URLSearchParams();

  if (lotId) params.set('lotId', lotId);
  if (status) params.set('status', status);
  if (limit) params.set('limit', String(limit));

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await authedFetch(`/apiv1/monitoring/slots${query}`);
  const data = await readJsonResponse(response, 'Failed to fetch slot states');

  return Array.isArray(data) ? data : [];
}

export async function getActiveVehicles({ lotId, limit = 200 } = {}) {
  const params = new URLSearchParams();

  if (lotId) params.set('lotId', lotId);
  if (limit) params.set('limit', String(limit));

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await authedFetch(`/apiv1/monitoring/active-vehicles${query}`);
  const data = await readJsonResponse(response, 'Failed to fetch active vehicles');

  return Array.isArray(data) ? data : [];
}
