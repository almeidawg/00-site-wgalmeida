// Product IDs originate from external catalog responses. Treat them as a single
// path segment, never as a router destination with slashes or dot segments.
export const getSafeProductDetailPath = (value) => {
  if (typeof value !== 'string' && typeof value !== 'number') return '/store';
  if (typeof value === 'number' && !Number.isSafeInteger(value)) return '/store';

  const id = String(value);
  if (
    !id ||
    id.length > 160 ||
    id.trim() !== id ||
    id === '.' ||
    id === '..' ||
    /[/?#%]/.test(id) ||
    id.includes('\\') ||
    [...id].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
  ) return '/store';

  return '/product/' + encodeURIComponent(id);
};
