export const classifyRemoteFallbackHealth = ({
  configured = false,
  reachable = false,
  status = 0,
  error = '',
} = {}) => {
  if (!configured) return 'retired';
  if (reachable) return 'reachable';
  if (Number(status) >= 400) return 'broken';
  if (error || Number(status) === 0) return 'unverified';
  return 'unverified';
};

export default classifyRemoteFallbackHealth;
