import { authedFetch } from './authedFetch';

export async function getSignageStatus(lotId = null) {
  const url = lotId
    ? `/apiv1/signage/status/${lotId}`
    : '/apiv1/signage/status';
  return authedFetch(url);
}